// Shared mock data + helpers for ROI Guys scheduling prototypes.
// Three teammates, seller walk-throughs as the main appointment type.

const TEAM = [
  { id: 'james', name: 'James',  role: 'Lead Manager',      initials: 'J', hue: 210 }, // blue-leaning
  { id: 'ben',   name: 'Ben',    role: 'Acquisition Agent', initials: 'B', hue: 195 }, // cyan
  { id: 'davis', name: 'Davis',  role: 'Acquisition Agent', initials: 'D', hue: 38  }, // gold
];

// Appointment types — all in-person seller walk-throughs per the brief,
// but with a couple of realistic adjacent types so the color-code setting matters.
const APPT_TYPES = [
  { id: 'walkthrough', label: 'Seller Walk-through', color: '#0054D4', soft: '#E6F0FC' },
  { id: 'followup',    label: 'Follow-up Visit',     color: '#009EE9', soft: '#E5F6FD' },
  { id: 'internal',    label: 'Internal',            color: '#111111', soft: '#E9E9E9' },
  { id: 'blocked',     label: 'Blocked / OOO',       color: '#6B6B6B', soft: '#F1F1F1' },
];
const APPT_TYPE = Object.fromEntries(APPT_TYPES.map(t => [t.id, t]));

// Time helpers — everything stored as minutes-from-midnight for simplicity.
const DAY_START = 8 * 60;   // 8:00 AM
const DAY_END   = 19 * 60;  // 7:00 PM
const SLOT      = 30;       // 30-min slots

function fmtTime(min) {
  let h = Math.floor(min / 60), m = min % 60;
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12; if (h === 0) h = 12;
  return m === 0 ? `${h}${ap}` : `${h}:${String(m).padStart(2,'0')}${ap}`;
}
function fmtRange(s, e) { return `${fmtTime(s)}–${fmtTime(e)}`; }

// Build a weekday list from a base date. Mon–Fri, current week default.
function buildWeek(base = new Date()) {
  const d = new Date(base); d.setHours(0,0,0,0);
  const dow = d.getDay();                       // 0=Sun
  const monday = new Date(d); monday.setDate(d.getDate() - ((dow + 6) % 7));
  const out = [];
  for (let i = 0; i < 5; i++) {
    const x = new Date(monday); x.setDate(monday.getDate() + i);
    out.push({
      date: x,
      dow: ['Mon','Tue','Wed','Thu','Fri'][i],
      dayNum: x.getDate(),
      key: x.toISOString().slice(0,10),
    });
  }
  return out;
}

// Seed a week's worth of plausible appointments per person.
// Reference day is Wednesday (index 2) so the default "today" feels mid-week.
function seedAppointments(weekKeys) {
  // rows: [dayIdx, personId, start, end, type, title, address]
  const rows = [
    // Monday
    [0, 'james', 9*60,      10*60+30, 'walkthrough', 'Vasquez Residence',     '412 Pine Ridge Rd'],
    [0, 'ben',   10*60,     11*60,    'walkthrough', 'Okafor Residence',      '88 Juniper Ln'],
    [0, 'davis', 13*60,     14*60+30, 'walkthrough', 'Henderson Estate',      '221 Summit Ct'],
    [0, 'james', 15*60,     16*60,    'internal',    'Team sync',             'Office'],
    [0, 'ben',   15*60,     16*60,    'internal',    'Team sync',             'Office'],
    [0, 'davis', 15*60,     16*60,    'internal',    'Team sync',             'Office'],

    // Tuesday
    [1, 'james', 8*60+30,   10*60,    'walkthrough', 'Delgado Property',      '905 Birchwood Ave'],
    [1, 'james', 11*60,     12*60+30, 'followup',    'Delgado follow-up',     '905 Birchwood Ave'],
    [1, 'ben',   9*60,      10*60+30, 'walkthrough', 'Marino Home',           '17 Oak Meadow Dr'],
    [1, 'ben',   14*60,     15*60+30, 'walkthrough', 'Cheng Residence',       '3302 Lakeview Blvd'],
    [1, 'davis', 10*60,     12*60,    'blocked',     'Drive to county',       'Travel'],
    [1, 'davis', 13*60,     14*60+30, 'walkthrough', 'Bartlett Estate',       '61 Harvest Hill Rd'],

    // Wednesday  (today)
    [2, 'james', 9*60,      10*60+30, 'walkthrough', 'Patel Residence',       '1208 Cedar Creek Dr'],
    [2, 'james', 14*60,     15*60+30, 'walkthrough', 'Chen Property',         '77 Lakefront Ln'],
    [2, 'ben',   10*60,     11*60+30, 'walkthrough', 'Sullivan Home',         '44 Linden Ct'],
    [2, 'ben',   13*60,     14*60,    'followup',    'Marino check-in',       '17 Oak Meadow Dr'],
    [2, 'davis', 11*60,     12*60+30, 'walkthrough', 'Ramirez Estate',        '502 Pinecrest Way'],
    [2, 'davis', 15*60,     16*60+30, 'walkthrough', 'Kowalski Home',         '930 Riverbend Rd'],

    // Thursday
    [3, 'james', 10*60,     11*60+30, 'walkthrough', 'Washington Residence',  '219 Ashcroft Ln'],
    [3, 'james', 13*60,     14*60,    'internal',    '1:1 with Ben',          'Office'],
    [3, 'ben',   13*60,     14*60,    'internal',    '1:1 with James',        'Office'],
    [3, 'ben',   14*60+30,  16*60,    'walkthrough', 'Torres Property',       '12 Highland Gate'],
    [3, 'davis', 9*60,      10*60+30, 'walkthrough', 'Goldberg Estate',       '1704 Silvermaple Dr'],
    [3, 'davis', 14*60,     15*60+30, 'walkthrough', 'Albright Home',         '88 Foxhollow Rd'],

    // Friday
    [4, 'james', 9*60+30,   11*60,    'walkthrough', 'Chen Property pt.2',    '77 Lakefront Ln'],
    [4, 'james', 13*60,     14*60+30, 'followup',    'Patel follow-up',       '1208 Cedar Creek Dr'],
    [4, 'ben',   10*60,     11*60+30, 'walkthrough', 'Nguyen Residence',      '2 Willow Brook Ct'],
    [4, 'davis', 11*60,     12*60,    'blocked',     'Lunch meeting',         'Downtown'],
    [4, 'davis', 14*60,     15*60+30, 'walkthrough', 'Ellis Estate',          '650 Copper Creek Rd'],
  ];
  let id = 1;
  return rows.map(([dayIdx, personId, start, end, type, title, addr]) => ({
    id: `a${id++}`,
    dayKey: weekKeys[dayIdx],
    personId, start, end, type,
    title, address: addr,
  }));
}

// Busy intervals for a given personId on a given dayKey from the appointment
// list (used by the "find a time" finder).
function busyFor(appts, dayKey, personId) {
  return appts.filter(a => a.dayKey === dayKey && a.personId === personId)
              .map(a => [a.start, a.end]);
}

// Given a set of personIds and a dayKey + a desired duration (minutes),
// return array of {start,end} slots where ALL selected people are free.
function findFreeSlots(appts, dayKey, personIds, durationMin, slotStep = 30) {
  const busies = personIds.map(pid => busyFor(appts, dayKey, pid));
  const isBusy = (who, t) => who.some(([s, e]) => t >= s && t < e);
  const results = [];
  for (let t = DAY_START; t + durationMin <= DAY_END; t += slotStep) {
    const end = t + durationMin;
    let ok = true;
    for (let i = 0; i < busies.length; i++) {
      // any minute overlap?
      for (const [s, e] of busies[i]) {
        if (t < e && end > s) { ok = false; break; }
      }
      if (!ok) break;
    }
    if (ok) results.push({ start: t, end });
  }
  // Merge contiguous slots into windows
  const merged = [];
  for (const s of results) {
    const last = merged[merged.length - 1];
    if (last && last.end >= s.start) last.end = Math.max(last.end, s.end);
    else merged.push({ ...s });
  }
  return { slots: results, windows: merged };
}

// Detect conflicts with a tentative new appt.
function detectConflicts(appts, draft) {
  return appts.filter(a =>
    a.dayKey === draft.dayKey &&
    a.personId === draft.personId &&
    a.start < draft.end && a.end > draft.start
  );
}

Object.assign(window, {
  TEAM, APPT_TYPES, APPT_TYPE,
  DAY_START, DAY_END, SLOT,
  fmtTime, fmtRange, buildWeek, seedAppointments,
  busyFor, findFreeSlots, detectConflicts,
});
