import { useState, useMemo, useRef, useEffect } from 'react';
import { TEAM, APPT_TYPES, APPT_TYPE, DAY_START, DAY_END, SLOT, fmtTime, fmtRange, buildWeek } from '../data/index.js';
import { fetchWeekEvents } from '../lib/googleCalendar.js';
import { RoiButton, Eyebrow, Avatar, RoiLogo, Icon, useIsMobile } from '../components/ui.jsx';
import { BookingModal } from '../components/BookingModal.jsx';

const SLOT_PX = 72;

export function TeamRows({ auth }) {
  const isMobile = useIsMobile();
  const week = useMemo(() => buildWeek(new Date()), []);
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const todayKey = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
  const [dayKey, setDayKey] = useState(todayKey);
  const [appts, setAppts] = useState([]);
  const [modal, setModal] = useState({ open: false, draft: null });

  useEffect(() => {
    if (!auth?.signedIn) return;
    fetchWeekEvents(week.map(w => w.key)).then(setAppts).catch(console.error);
  }, [auth?.signedIn, week]);

  const dayAppts = appts.filter(a => a.dayKey === dayKey);
  const dayObj = week.find(w => w.key === dayKey);

  const slots = [];
  for (let t = DAY_START; t < DAY_END; t += SLOT) slots.push(t);
  const totalWidth = slots.length * SLOT_PX;

  const openNew = (personId, start) => setModal({
    open: true, draft: { dayKey, personId, start, end: start + 60, type: 'walkthrough' },
  });
  const openEdit = (a) => setModal({ open: true, draft: { ...a } });
  const save = (draft) => {
    setAppts(prev => draft.id
      ? prev.map(a => a.id === draft.id ? draft : a)
      : [...prev, { ...draft, id: 'n' + Date.now() }]);
    setModal({ open: false, draft: null });
  };
  const del = (id) => { setAppts(prev => prev.filter(a => a.id !== id)); setModal({ open: false, draft: null }); };

  const bookedCount = dayAppts.filter(a => a.type === 'walkthrough' || a.type === 'followup').length;

  return (
    <div style={{ minHeight: '100vh', background: '#F7F8FA', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#111' }}>
      {/* Header */}
      <header style={{ background: 'linear-gradient(135deg, #009EE9 0%, #0054D4 100%)', color: '#fff', padding: isMobile ? '14px 16px 18px' : '18px 32px 22px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20 }}>
          <RoiLogo color="#fff" size={isMobile ? 14 : 18} />
          <div style={{ flex: 1 }} />
          {auth?.profile?.picture ? (
            <img src={auth.profile.picture} alt={auth.profile.name || 'User'}
              style={{ width: isMobile ? 30 : 36, height: isMobile ? 30 : 36, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 0 2px rgba(255,255,255,0.5)' }} />
          ) : (
            <Avatar person={TEAM[0]} size={isMobile ? 30 : 36} style={{ boxShadow: '0 0 0 2px rgba(255,255,255,0.5)' }} />
          )}
        </div>

        <div style={{ maxWidth: 1440, margin: isMobile ? '14px auto 0' : '28px auto 0', display: 'flex', alignItems: 'flex-end', gap: 16, justifyContent: 'space-between' }}>
          <div>
            <Eyebrow color="rgba(255,255,255,0.8)">Team Schedule · {dayObj.date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Eyebrow>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontStyle: 'italic',
              fontSize: isMobile ? 30 : 64, letterSpacing: '-0.03em', lineHeight: 1, margin: '4px 0 0', color: '#fff',
            }}>
              {dayObj.date.toLocaleDateString('en-US', { weekday: isMobile ? 'short' : 'long' })},{' '}
              <span style={{ color: '#F7A521' }}>{dayObj.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.</span>
            </h1>
            {!isMobile && (
              <div style={{ marginTop: 10, fontSize: 15, fontWeight: 500, opacity: 0.9 }}>
                {bookedCount} walk-throughs booked across the team · {TEAM.length} agents active
              </div>
            )}
          </div>
          <RoiButton variant="gold" size={isMobile ? 'sm' : 'lg'} icon={<Icon name="plus" size={isMobile ? 14 : 18} />}
            onClick={() => openNew(TEAM[0].id, 10*60)}>
            {isMobile ? 'Book' : 'Book Walk-through'}
          </RoiButton>
        </div>
      </header>

      {/* Day strip */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E9E9E9', padding: isMobile ? '10px 16px' : '16px 32px', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 14 }}>
          <button onClick={() => {
            const i = week.findIndex(w => w.key === dayKey);
            if (i > 0) setDayKey(week[i-1].key);
          }} style={dayNavBtn}><Icon name="chevron-left" size={18} /></button>
          <div style={{ display: 'flex', gap: isMobile ? 4 : 8, flex: 1, overflowX: isMobile ? 'auto' : 'visible' }}>
            {week.map(d => {
              const active = d.key === dayKey;
              return (
                <button key={d.key} onClick={() => setDayKey(d.key)} style={{
                  padding: isMobile ? '6px 10px' : '8px 18px', borderRadius: 12, border: 0, cursor: 'pointer',
                  background: active ? '#0054D4' : 'transparent', color: active ? '#fff' : '#111',
                  fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 10,
                  transition: 'background 160ms ease', flexShrink: 0,
                }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, opacity: active ? 0.9 : 0.6 }}>{d.dow}</div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontStyle: 'italic', fontSize: isMobile ? 16 : 22, letterSpacing: '-0.02em' }}>{d.dayNum}</div>
                  {d.key === todayKey && <div style={{ width: 6, height: 6, borderRadius: 3, background: active ? '#F7A521' : '#0054D4' }} />}
                </button>
              );
            })}
          </div>
          <button onClick={() => {
            const i = week.findIndex(w => w.key === dayKey);
            if (i < week.length - 1) setDayKey(week[i+1].key);
          }} style={dayNavBtn}><Icon name="chevron-right" size={18} /></button>
          {!isMobile && <>
            <div style={{ width: 1, height: 24, background: '#E9E9E9' }} />
            <button style={{ ...dayNavBtn, width: 'auto', padding: '0 14px', gap: 8, fontSize: 13, fontWeight: 600 }}>
              <Icon name="filter" size={16} color="#6B6B6B" /> All types
            </button>
          </>}
        </div>
      </div>

      {/* Timeline */}
      <main style={{ maxWidth: 1440, margin: '0 auto', padding: isMobile ? '12px 12px 80px' : '24px 32px 80px' }}>
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 6px rgba(17,17,17,0.06)', overflow: 'hidden' }}>
          {/* Time header */}
          <div style={{ display: 'flex' }}>
            <div style={{ width: isMobile ? 120 : 200, padding: '16px 20px', borderBottom: '1px solid #F1F1F1', flexShrink: 0 }}>
              <Eyebrow>Team</Eyebrow>
            </div>
            <div style={{ flex: 1, overflowX: 'auto', borderBottom: '1px solid #F1F1F1' }}>
              <div style={{ width: totalWidth, display: 'flex', height: 44, alignItems: 'flex-end' }}>
                {slots.map((t, i) => (
                  <div key={t} style={{
                    width: SLOT_PX, borderLeft: i === 0 ? 'none' : (t % 60 === 0 ? '1px solid #E9E9E9' : '1px dashed #F1F1F1'),
                    paddingLeft: 8, paddingBottom: 8, fontSize: 11, fontWeight: 600,
                    color: t % 60 === 0 ? '#3A3A3A' : '#B5B5B5', letterSpacing: '0.05em', fontVariantNumeric: 'tabular-nums',
                  }}>{t % 60 === 0 ? fmtTime(t) : ''}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Rows */}
          {TEAM.map((p, pi) => {
            const mine = dayAppts.filter(a => a.personId === p.id);
            const busyMin = mine.reduce((s, a) => s + (a.end - a.start), 0);
            return (
              <div key={p.id} style={{ display: 'flex', borderBottom: pi === TEAM.length - 1 ? 'none' : '1px solid #F1F1F1' }}>
                <div style={{ width: isMobile ? 120 : 200, padding: isMobile ? '12px 10px' : '18px 20px', display: 'flex', gap: isMobile ? 8 : 12, alignItems: 'center', flexShrink: 0 }}>
                  <Avatar person={p} size={isMobile ? 32 : 44} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: isMobile ? 13 : 15, color: '#111' }}>{p.name}</div>
                    {!isMobile && <div style={{ fontSize: 11, color: '#6B6B6B', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>{p.role}</div>}
                    <div style={{ marginTop: 2, fontSize: 11, color: '#0054D4', fontWeight: 600 }}>
                      {Math.round(busyMin / 60 * 10) / 10}h
                    </div>
                  </div>
                </div>
                <div style={{ flex: 1, overflowX: 'auto' }}>
                  <TimelineRow slots={slots} slotPx={SLOT_PX} totalWidth={totalWidth}
                    appts={mine} onEdit={openEdit} onEmptyClick={t => openNew(p.id, t)} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ marginTop: 24, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          <Eyebrow>Legend</Eyebrow>
          {APPT_TYPES.map(t => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#3A3A3A' }}>
              <span style={{ width: 10, height: 10, borderRadius: 5, background: t.color }} />
              {t.label}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ fontSize: 12, color: '#6B6B6B' }}>Click any empty slot to book · Click a block to edit</div>
        </div>
      </main>

      <BookingModal open={modal.open} draft={modal.draft} week={week} team={TEAM} appts={appts}
        onClose={() => setModal({ open: false, draft: null })}
        onSave={save} onDelete={del} />
    </div>
  );
}

const dayNavBtn = {
  width: 36, height: 36, borderRadius: 18, border: '1px solid #E9E9E9', background: '#fff',
  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#3A3A3A',
};

function TimelineRow({ slots, slotPx, totalWidth, appts, onEdit, onEmptyClick }) {
  const rowRef = useRef(null);
  const onBgClick = (e) => {
    const rect = rowRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + rowRef.current.scrollLeft;
    const idx = Math.floor(x / slotPx);
    const t = DAY_START + idx * 30;
    onEmptyClick(t);
  };
  return (
    <div ref={rowRef} onClick={onBgClick} style={{ width: totalWidth, minHeight: 96, position: 'relative', cursor: 'crosshair' }}>
      {slots.map((t, i) => (
        <div key={t} style={{
          position: 'absolute', top: 0, bottom: 0, left: i * slotPx, width: slotPx,
          borderLeft: i === 0 ? 'none' : (t % 60 === 0 ? '1px solid #F1F1F1' : '1px dashed #F7F8FA'),
        }} />
      ))}
      {appts.map(a => {
        const meta = APPT_TYPE[a.type];
        const left = ((a.start - DAY_START) / 30) * slotPx;
        const width = ((a.end - a.start) / 30) * slotPx - 4;
        return (
          <div key={a.id} onClick={e => { e.stopPropagation(); onEdit(a); }}
            style={{
              position: 'absolute', top: 10, bottom: 10, left: left + 2, width,
              background: meta.soft, borderLeft: `4px solid ${meta.color}`, borderRadius: 8,
              padding: '8px 10px', cursor: 'pointer', overflow: 'hidden',
              transition: 'transform 160ms ease, box-shadow 160ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 18px rgba(17,17,17,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = ''; }}
          >
            <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, color: meta.color, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {a.title}
            </div>
            <div style={{ fontSize: 11, color: '#3A3A3A', fontWeight: 600, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
              {fmtRange(a.start, a.end)}
            </div>
            {width > 140 && (
              <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {a.address}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
