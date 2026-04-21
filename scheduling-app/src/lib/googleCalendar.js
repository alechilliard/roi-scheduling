// Google Calendar integration — follows The ROI Guys Calendar SOP.
// Uses Google Identity Services (browser OAuth) + Calendar API v3.
//
// Setup: copy .env.example to .env and fill in your credentials.

// ─── Calendar IDs ──────────────────────────────────────────────
// Find these in Google Calendar → Settings → [Calendar name] → Calendar ID
// Usually looks like: abc123@group.calendar.google.com
// Your primary calendar is your Gmail address.
export const CALENDAR_IDS = {
  showings:  import.meta.env.VITE_GCAL_SHOWINGS  || '',   // Showings – Team
  main:      import.meta.env.VITE_GCAL_MAIN       || '',   // Main – ROI Guys
  closings:  import.meta.env.VITE_GCAL_CLOSINGS   || '',   // Closings – Team
  timeOff:   import.meta.env.VITE_GCAL_TIMEOFF    || '',   // Time Off
};

// ─── Team member Google emails ─────────────────────────────────
// Used to send calendar invites to the assigned agent.
export const TEAM_EMAILS = {
  james: import.meta.env.VITE_EMAIL_JAMES || '',
  ben:   import.meta.env.VITE_EMAIL_BEN   || '',
  davis: import.meta.env.VITE_EMAIL_DAVIS || '',
};

// ─── Appointment type → calendar mapping ──────────────────────
function calendarForType(apptType) {
  switch (apptType) {
    case 'walkthrough':
    case 'followup':
      return CALENDAR_IDS.showings;
    case 'internal':
      return CALENDAR_IDS.main;
    case 'blocked':
      return CALENDAR_IDS.timeOff;
    default:
      return CALENDAR_IDS.main;
  }
}

// ─── Event title SOP ──────────────────────────────────────────
// Format: "[Agent Name] – [Type of Event] in [City or Virtual]"
function buildTitle(appt, agentName) {
  const typeLabel = {
    walkthrough: 'Seller Walk-through',
    followup:    'Follow-up Visit',
    internal:    'Internal Meeting',
    blocked:     'Time Off',
  }[appt.type] || 'Appointment';

  const location = appt.address || '';
  // Try to extract city from address (last word before zip/state, or just use it directly)
  const city = extractCity(location) || location || 'TBD';

  return `${agentName} – ${typeLabel} in ${city}`;
}

function extractCity(address) {
  if (!address) return null;
  // Simple heuristic: split by comma, take second-to-last segment (city before state)
  const parts = address.split(',').map(s => s.trim());
  if (parts.length >= 2) return parts[parts.length - 2];
  // Fall back: just take the whole address if no commas
  return null;
}

// ─── Time helpers ─────────────────────────────────────────────
// Convert { dayKey: '2026-04-22', start: 540 (minutes from midnight) }
// to an RFC3339 ISO datetime string in local time.
function toRFC3339(dayKey, minutesFromMidnight) {
  const [y, m, d] = dayKey.split('-').map(Number);
  const h = Math.floor(minutesFromMidnight / 60);
  const min = minutesFromMidnight % 60;
  const dt = new Date(y, m - 1, d, h, min, 0);
  // Return ISO string with timezone offset included
  const offset = -dt.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  const oh = String(Math.floor(abs / 60)).padStart(2, '0');
  const om = String(abs % 60).padStart(2, '0');
  const pad = (n) => String(n).padStart(2, '0');
  return `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}:00${sign}${oh}:${om}`;
}

// ─── Build Google Calendar Event object from appointment ──────
export function buildGCalEvent(appt, agentName) {
  const title = appt.title
    ? buildTitle(appt, agentName)
    : `${agentName} – Appointment`;

  const email = TEAM_EMAILS[appt.personId];
  const attendees = email ? [{ email }] : [];

  return {
    summary: title,
    location: appt.address || '',
    description: appt.address
      ? `Property: ${appt.title}\nAddress: ${appt.address}`
      : appt.title || '',
    start: {
      dateTime: toRFC3339(appt.dayKey, appt.start),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: toRFC3339(appt.dayKey, appt.end),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    attendees,
    reminders: {
      useDefault: false,
      overrides: [{ method: 'popup', minutes: 15 }],
    },
    // Busy = blocks time, Free = informational only (time off)
    transparency: appt.type === 'blocked' ? 'transparent' : 'opaque',
    // Store our internal ID in extendedProperties so we can update later
    extendedProperties: { private: { roiApptId: appt.id || '' } },
  };
}

// ─── Token management ─────────────────────────────────────────
let _accessToken = null;
let _tokenExpiry = 0;

export function setAccessToken(token, expiresIn) {
  _accessToken = token;
  _tokenExpiry = Date.now() + expiresIn * 1000 - 60_000; // 1-min buffer
}

export function getAccessToken() { return _accessToken; }
export function isTokenValid() { return !!_accessToken && Date.now() < _tokenExpiry; }
export function clearToken() { _accessToken = null; _tokenExpiry = 0; }

// ─── API calls ────────────────────────────────────────────────
async function gcalFetch(path, options = {}) {
  if (!isTokenValid()) throw new Error('Not authenticated. Please sign in first.');
  const res = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${_accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Calendar API error: ${res.status}`);
  }
  return res.json();
}

// Create a new event. Returns the created event (includes .id).
export async function createEvent(appt, agentName) {
  const calId = calendarForType(appt.type);
  if (!calId) throw new Error(`No calendar ID configured for type "${appt.type}". Check your .env file.`);
  const body = buildGCalEvent(appt, agentName);
  return gcalFetch(`/calendars/${encodeURIComponent(calId)}/events`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// Update an existing event (pass the Google event ID stored on the appt).
export async function updateEvent(appt, agentName, gcalEventId) {
  const calId = calendarForType(appt.type);
  if (!calId) throw new Error(`No calendar ID configured for type "${appt.type}".`);
  const body = buildGCalEvent(appt, agentName);
  return gcalFetch(`/calendars/${encodeURIComponent(calId)}/events/${gcalEventId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

// Delete an event.
export async function deleteEvent(appt, gcalEventId) {
  const calId = calendarForType(appt.type);
  if (!calId) return;
  await gcalFetch(`/calendars/${encodeURIComponent(calId)}/events/${gcalEventId}`, {
    method: 'DELETE',
  });
}
