// Booking modal — shared across all three prototype variants.
// Feels fast: compact, smart defaults, conflict-aware, color-coded.
//
// Props:
//   open          : boolean
//   onClose       : fn
//   onSave        : (draft) => void
//   onDelete      : optional (id) => void  — shows delete for existing appts
//   draft         : partial Appointment { id?, dayKey, start, end, personId, type, title, address }
//   week          : week array (for day picker)
//   team          : TEAM array
//   appts         : existing appointments (for conflict detection)

function BookingModal({ open, onClose, onSave, onDelete, draft, week, team, appts }) {
  const [local, setLocal] = useState(draft || {});
  useEffect(() => { setLocal(draft || {}); }, [draft, open]);
  if (!open) return null;

  const update = (patch) => setLocal(l => ({ ...l, ...patch }));
  const durationMin = (local.end || 0) - (local.start || 0);
  const setDuration = (m) => update({ end: (local.start || 0) + m });

  const conflicts = local.dayKey && local.personId && local.start != null && local.end != null
    ? detectConflicts(appts.filter(a => a.id !== local.id), local)
    : [];

  const isEdit = !!local.id;
  const typeMeta = APPT_TYPE[local.type || 'walkthrough'];

  // Time step controls
  const stepStart = (delta) => update({
    start: Math.max(DAY_START, Math.min(DAY_END - 30, (local.start || DAY_START) + delta)),
    end:   Math.max(DAY_START + 30, Math.min(DAY_END, (local.end || DAY_START + 60) + delta)),
  });

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0, 32, 76, 0.48)', backdropFilter: 'blur(8px)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      animation: 'roiFade 180ms ease',
    }}>
      <style>{`@keyframes roiFade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes roiSlideUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }`}</style>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 560,
        boxShadow: '0 30px 80px rgba(0, 32, 76, 0.35)',
        overflow: 'hidden', animation: 'roiSlideUp 220ms cubic-bezier(.2,.7,.2,1)',
        maxHeight: '92vh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Header — gradient accent */}
        <div style={{
          background: 'linear-gradient(135deg, #009EE9 0%, #0054D4 100%)',
          padding: '22px 28px 18px', color: '#fff', position: 'relative',
        }}>
          <Eyebrow color="rgba(255,255,255,0.8)">{isEdit ? 'Edit Appointment' : 'New Appointment'}</Eyebrow>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontStyle: 'italic',
            fontSize: 30, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 4,
          }}>{isEdit ? 'Update the details.' : 'Book a walk-through.'}</div>
          <button onClick={onClose} aria-label="Close" style={{
            position: 'absolute', top: 18, right: 18, width: 32, height: 32, borderRadius: 16,
            background: 'rgba(255,255,255,0.15)', color: '#fff', border: 0, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon name="close" size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 28px', overflowY: 'auto' }}>
          {/* Appointment type pills — color code */}
          <FieldLabel>Type</FieldLabel>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
            {APPT_TYPES.map(t => (
              <button key={t.id} onClick={() => update({ type: t.id })} style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 12,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
                border: `1.5px solid ${local.type === t.id ? t.color : '#E9E9E9'}`,
                background: local.type === t.id ? t.soft : '#fff',
                color: local.type === t.id ? t.color : '#6B6B6B',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: t.color }} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Title */}
          <FieldLabel>Seller / Title</FieldLabel>
          <RoiInput placeholder="e.g. Patel Residence"
            value={local.title || ''} onChange={(e) => update({ title: e.target.value })} autoFocus />

          {/* Address */}
          <FieldLabel style={{ marginTop: 16 }}>Address</FieldLabel>
          <RoiInput icon={<Icon name="pin" size={16} color="#6B6B6B" />}
            placeholder="1208 Cedar Creek Dr"
            value={local.address || ''} onChange={(e) => update({ address: e.target.value })} />

          {/* Assigned agent */}
          <FieldLabel style={{ marginTop: 16 }}>Assigned agent</FieldLabel>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {team.map(p => {
              const active = local.personId === p.id;
              return (
                <button key={p.id} onClick={() => update({ personId: p.id })} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '8px 14px 8px 8px', borderRadius: 999, cursor: 'pointer',
                  background: active ? '#0054D4' : '#fff', color: active ? '#fff' : '#111',
                  border: `1.5px solid ${active ? '#0054D4' : '#E9E9E9'}`,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14,
                }}>
                  <Avatar person={p} size={28} />
                  {p.name}
                  <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.7, marginLeft: 2 }}>· {p.role.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Day + Time */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <div>
              <FieldLabel>Day</FieldLabel>
              <div style={{ display: 'flex', gap: 6 }}>
                {week.map(d => {
                  const active = local.dayKey === d.key;
                  return (
                    <button key={d.key} onClick={() => update({ dayKey: d.key })} style={{
                      flex: 1, padding: '8px 4px', borderRadius: 10, cursor: 'pointer',
                      border: `1.5px solid ${active ? '#0054D4' : '#E9E9E9'}`,
                      background: active ? '#0054D4' : '#fff',
                      color: active ? '#fff' : '#111',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    }}>
                      <div style={{ fontSize: 10, letterSpacing: '0.1em', opacity: 0.8, textTransform: 'uppercase', fontWeight: 600 }}>{d.dow}</div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontStyle: 'italic', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>{d.dayNum}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <FieldLabel>Time</FieldLabel>
              <div style={{
                display: 'flex', alignItems: 'center', border: '1.5px solid #E9E9E9', borderRadius: 12,
                padding: 4,
              }}>
                <TimeStepper value={local.start} onChange={(v) => update({ start: v, end: Math.max(v + 30, local.end || v + 60) })} />
                <span style={{ color: '#B5B5B5', fontWeight: 600, margin: '0 6px' }}>→</span>
                <TimeStepper value={local.end} onChange={(v) => update({ end: v })} minValue={(local.start || DAY_START) + 30} />
              </div>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                {[30, 60, 90, 120].map(m => (
                  <button key={m} onClick={() => setDuration(m)} style={{
                    flex: 1, padding: '6px 0', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${durationMin === m ? '#0054D4' : '#E9E9E9'}`,
                    background: durationMin === m ? '#E6F0FC' : '#fff',
                    color: durationMin === m ? '#0054D4' : '#6B6B6B',
                    fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 11,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                  }}>{m >= 60 ? `${m/60}h` : `${m}m`}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Conflicts */}
          {conflicts.length > 0 && (
            <div style={{
              marginTop: 18, padding: 14, borderRadius: 12, background: '#FEF5E4',
              border: '1.5px solid #F7A521', display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <div style={{ color: '#B87207', display: 'flex', alignItems: 'center', marginTop: 2 }}>
                <Icon name="warn" size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <Eyebrow color="#8F5805">Conflict</Eyebrow>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: '#111', marginTop: 2 }}>
                  {team.find(p => p.id === local.personId)?.name} already has {conflicts.length} appointment{conflicts.length > 1 ? 's' : ''} in that window.
                </div>
                <ul style={{ margin: '6px 0 0', padding: 0, listStyle: 'none', fontSize: 13, color: '#3A3A3A' }}>
                  {conflicts.map(c => (
                    <li key={c.id}>• {fmtRange(c.start, c.end)} — {c.title}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 28px', borderTop: '1px solid #F1F1F1',
          display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between',
        }}>
          {isEdit && onDelete ? (
            <RoiButton variant="plain" onClick={() => onDelete(local.id)} style={{ color: '#E23B3B' }}>Delete</RoiButton>
          ) : <div />}
          <div style={{ display: 'flex', gap: 10 }}>
            <RoiButton variant="ghost" onClick={onClose}>Cancel</RoiButton>
            <RoiButton variant="primary"
              disabled={!local.title || !local.personId || !local.dayKey || local.start == null || local.end == null}
              onClick={() => onSave(local)}>
              {isEdit ? 'Save changes' : 'Book appointment'}
            </RoiButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldLabel({ children, style }) {
  return <div style={{
    fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700,
    letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3A3A3A',
    marginBottom: 8, ...style,
  }}>{children}</div>;
}

function RoiInput({ icon, style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '11px 14px', border: `1.5px solid ${focused ? '#0054D4' : '#E9E9E9'}`,
      borderRadius: 10, background: '#fff',
      boxShadow: focused ? '0 0 0 4px rgba(0,84,212,0.12)' : 'none',
      transition: 'box-shadow 160ms ease, border-color 160ms ease',
      ...style,
    }}>
      {icon}
      <input {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        style={{
          flex: 1, border: 0, outline: 0, background: 'transparent',
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 15,
          color: '#111',
        }} />
    </div>
  );
}

function TimeStepper({ value, onChange, minValue = DAY_START }) {
  const safe = value == null ? DAY_START : value;
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <button onClick={() => onChange(Math.max(minValue, safe - 30))} style={stepBtn}><Icon name="chevron-left" size={14} /></button>
      <span style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15, color: '#111',
        fontVariantNumeric: 'tabular-nums',
      }}>{fmtTime(safe)}</span>
      <button onClick={() => onChange(Math.min(DAY_END, safe + 30))} style={stepBtn}><Icon name="chevron-right" size={14} /></button>
    </div>
  );
}
const stepBtn = {
  width: 26, height: 26, borderRadius: 6, border: 0, background: 'transparent', cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#6B6B6B',
};

Object.assign(window, { BookingModal, FieldLabel, RoiInput });
