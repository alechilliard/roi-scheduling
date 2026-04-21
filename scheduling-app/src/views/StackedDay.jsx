import { useState, useMemo, useRef } from 'react';
import { TEAM, APPT_TYPE, DAY_START, DAY_END, fmtTime, fmtRange, buildWeek, seedAppointments } from '../data/index.js';
import { RoiButton, Eyebrow, Avatar, RoiLogo, Icon } from '../components/ui.jsx';
import { BookingModal } from '../components/BookingModal.jsx';

const HOUR_PX = 96;

export function StackedDay() {
  const week = useMemo(() => buildWeek(new Date('2026-04-22')), []);
  const todayKey = week[2].key;
  const [dayKey, setDayKey] = useState(todayKey);
  const [appts, setAppts] = useState(() => seedAppointments(week.map(w => w.key)));
  const [visible, setVisible] = useState(() => new Set(TEAM.map(p => p.id)));
  const [modal, setModal] = useState({ open: false, draft: null });

  const dayAppts = appts.filter(a => a.dayKey === dayKey && visible.has(a.personId));
  const dayObj = week.find(w => w.key === dayKey);
  const totalHeight = ((DAY_END - DAY_START) / 60) * HOUR_PX;

  const openNew = (dayK, startMin) => setModal({
    open: true, draft: { dayKey: dayK, start: startMin, end: startMin + 60, personId: TEAM[0].id, type: 'walkthrough' },
  });
  const openEdit = (a) => setModal({ open: true, draft: { ...a } });
  const save = (draft) => {
    setAppts(prev => draft.id
      ? prev.map(a => a.id === draft.id ? draft : a)
      : [...prev, { ...draft, id: 'n' + Date.now() }]);
    setModal({ open: false, draft: null });
  };
  const del = (id) => { setAppts(prev => prev.filter(a => a.id !== id)); setModal({ open: false, draft: null }); };

  const cols = TEAM.filter(p => visible.has(p.id));

  return (
    <div style={{ minHeight: '100vh', background: '#F1F1F1', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#111' }}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <aside style={{
          width: 240, background: '#fff', borderRight: '1px solid #E9E9E9',
          padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24, flexShrink: 0,
        }}>
          <RoiLogo color="#0054D4" size={16} />

          <div>
            <Eyebrow>Navigation</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 10, gap: 2 }}>
              {[
                { icon: 'calendar', label: 'Schedule', active: true },
                { icon: 'users',    label: 'Team' },
                { icon: 'home',     label: 'Properties' },
                { icon: 'sparkle',  label: 'Reports' },
              ].map(n => (
                <button key={n.label} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                  borderRadius: 10, border: 0, cursor: 'pointer',
                  background: n.active ? '#E6F0FC' : 'transparent',
                  color: n.active ? '#0054D4' : '#3A3A3A',
                  fontFamily: 'inherit', fontWeight: 600, fontSize: 14, textAlign: 'left',
                }}>
                  <Icon name={n.icon} size={18} />{n.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Eyebrow>Agents</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 10, gap: 6 }}>
              {TEAM.map(p => {
                const on = visible.has(p.id);
                return (
                  <button key={p.id} onClick={() => {
                    const next = new Set(visible);
                    on ? next.delete(p.id) : next.add(p.id);
                    if (next.size === 0) return;
                    setVisible(next);
                  }} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '8px 10px',
                    borderRadius: 10, border: 0, cursor: 'pointer',
                    background: 'transparent', opacity: on ? 1 : 0.4,
                    fontFamily: 'inherit', textAlign: 'left',
                  }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: 4,
                      background: on ? `hsl(${p.hue}, 68%, 55%)` : '#fff',
                      border: `2px solid hsl(${p.hue}, 68%, 55%)`,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    }}>{on && <Icon name="check" size={10} color="#fff" />}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111' }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: '#6B6B6B', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>{p.role}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ flex: 1 }} />
          <RoiButton variant="primary" icon={<Icon name="plus" size={16} />}
            onClick={() => openNew(dayKey, 10 * 60)}>New appt</RoiButton>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Topbar */}
          <div style={{
            padding: '22px 32px', background: '#fff', borderBottom: '1px solid #E9E9E9',
            display: 'flex', alignItems: 'flex-end', gap: 28, justifyContent: 'space-between',
          }}>
            <div>
              <Eyebrow>{dayObj.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Eyebrow>
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontStyle: 'italic',
                fontSize: 44, letterSpacing: '-0.03em', lineHeight: 1, margin: '6px 0 0',
              }}>
                {dayObj.date.toLocaleDateString('en-US', { weekday: 'long' })},
                <span style={{ color: '#0054D4' }}> {dayObj.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </h1>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button onClick={() => {
                const i = week.findIndex(w => w.key === dayKey);
                if (i > 0) setDayKey(week[i - 1].key);
              }} style={navBtnStyle}><Icon name="chevron-left" size={18} /></button>
              <button onClick={() => setDayKey(todayKey)} style={{
                padding: '10px 16px', borderRadius: 10, border: '1px solid #E9E9E9',
                background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700,
                fontSize: 13, color: '#111', letterSpacing: '0.04em',
              }}>Today</button>
              <button onClick={() => {
                const i = week.findIndex(w => w.key === dayKey);
                if (i < week.length - 1) setDayKey(week[i + 1].key);
              }} style={navBtnStyle}><Icon name="chevron-right" size={18} /></button>
            </div>
          </div>

          {/* Week strip */}
          <div style={{ padding: '12px 32px', background: '#fff', borderBottom: '1px solid #F1F1F1' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {week.map(d => {
                const active = d.key === dayKey;
                const dayCount = appts.filter(a => a.dayKey === d.key && visible.has(a.personId)).length;
                return (
                  <button key={d.key} onClick={() => setDayKey(d.key)} style={{
                    flex: 1, padding: '10px 14px', borderRadius: 12,
                    border: `1.5px solid ${active ? '#0054D4' : '#F1F1F1'}`,
                    background: active ? '#0054D4' : '#fff', color: active ? '#fff' : '#111',
                    cursor: 'pointer', fontFamily: 'inherit',
                    display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between',
                  }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: 10, letterSpacing: '0.14em', fontWeight: 600, textTransform: 'uppercase', opacity: 0.8 }}>{d.dow}</div>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontStyle: 'italic', fontSize: 22, letterSpacing: '-0.02em' }}>{d.dayNum}</div>
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 700,
                      color: active ? '#fff' : '#0054D4',
                      background: active ? 'rgba(255,255,255,0.2)' : '#E6F0FC',
                      borderRadius: 999, padding: '3px 8px',
                    }}>{dayCount}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day calendar */}
          <div style={{ flex: 1, overflow: 'auto', padding: '20px 32px 64px' }}>
            <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 6px rgba(17,17,17,0.06)', overflow: 'hidden' }}>
              {/* Column headers */}
              <div style={{ display: 'flex', borderBottom: '1px solid #F1F1F1' }}>
                <div style={{ width: 72, flexShrink: 0 }} />
                {cols.map(p => (
                  <div key={p.id} style={{ flex: 1, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, borderLeft: '1px solid #F1F1F1' }}>
                    <Avatar person={p} size={32} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{p.role}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div style={{ display: 'flex', position: 'relative' }}>
                {/* Hours rail */}
                <div style={{ width: 72, flexShrink: 0 }}>
                  {Array.from({ length: (DAY_END - DAY_START) / 60 }, (_, i) => (
                    <div key={i} style={{
                      height: HOUR_PX, padding: '6px 10px', textAlign: 'right',
                      fontSize: 11, fontWeight: 600, color: '#6B6B6B', letterSpacing: '0.04em',
                      fontVariantNumeric: 'tabular-nums', borderTop: i === 0 ? 'none' : '1px solid #F1F1F1',
                    }}>{fmtTime(DAY_START + i * 60)}</div>
                  ))}
                </div>

                {/* Per-person columns */}
                {cols.map(p => (
                  <DayColumn key={p.id} person={p} hourPx={HOUR_PX} totalHeight={totalHeight}
                    appts={dayAppts.filter(a => a.personId === p.id)}
                    onEdit={openEdit} onEmpty={t => openNew(dayKey, t)} />
                ))}
              </div>
            </div>

            {/* Summary footer */}
            <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {cols.map(p => {
                const mine = dayAppts.filter(a => a.personId === p.id);
                const hours = mine.reduce((s, a) => s + (a.end - a.start), 0) / 60;
                return (
                  <div key={p.id} style={{
                    padding: '14px 18px', background: '#fff', borderRadius: 12, flex: '1 1 220px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    borderLeft: `4px solid hsl(${p.hue}, 68%, 55%)`,
                  }}>
                    <Avatar person={p} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: '#6B6B6B', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{mine.length} appts · {hours.toFixed(1)}h</div>
                    </div>
                    <div style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontStyle: 'italic',
                      fontSize: 28, color: '#0054D4', letterSpacing: '-0.02em',
                    }}>{mine.filter(a => a.type === 'walkthrough').length}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      <BookingModal open={modal.open} draft={modal.draft} week={week} team={TEAM} appts={appts}
        onClose={() => setModal({ open: false, draft: null })}
        onSave={save} onDelete={del} />
    </div>
  );
}

const navBtnStyle = {
  width: 38, height: 38, borderRadius: 10, border: '1px solid #E9E9E9', background: '#fff',
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#3A3A3A',
};

function DayColumn({ person, hourPx, totalHeight, appts, onEdit, onEmpty }) {
  const ref = useRef(null);
  const onBg = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const mins = Math.floor(y / hourPx * 60 / 30) * 30;
    const t = DAY_START + mins;
    onEmpty(t);
  };
  return (
    <div ref={ref} onClick={onBg} style={{
      flex: 1, position: 'relative', height: totalHeight, borderLeft: '1px solid #F1F1F1', cursor: 'crosshair',
    }}>
      {Array.from({ length: (DAY_END - DAY_START) / 60 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute', left: 0, right: 0, top: i * hourPx,
          height: 1, background: i === 0 ? 'transparent' : '#F1F1F1',
        }} />
      ))}
      {Array.from({ length: (DAY_END - DAY_START) / 60 }, (_, i) => (
        <div key={'h'+i} style={{
          position: 'absolute', left: 0, right: 0, top: i * hourPx + hourPx/2,
          height: 0, borderTop: '1px dashed #F7F8FA',
        }} />
      ))}
      {appts.map(a => {
        const meta = APPT_TYPE[a.type];
        const top = (a.start - DAY_START) / 60 * hourPx;
        const height = (a.end - a.start) / 60 * hourPx - 4;
        return (
          <div key={a.id} onClick={e => { e.stopPropagation(); onEdit(a); }}
            style={{
              position: 'absolute', left: 8, right: 8, top: top + 2, height,
              background: meta.soft, borderLeft: `4px solid ${meta.color}`,
              borderRadius: 8, padding: '8px 10px', cursor: 'pointer', overflow: 'hidden',
              transition: 'box-shadow 160ms ease, transform 160ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(17,17,17,0.12)'; e.currentTarget.style.transform = 'translateX(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = ''; }}
          >
            <div style={{ fontWeight: 700, fontSize: 13, color: meta.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
            <div style={{ fontSize: 11, color: '#3A3A3A', fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{fmtRange(a.start, a.end)}</div>
            {height > 60 && (
              <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="pin" size={11} color="#6B6B6B" /> {a.address}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
