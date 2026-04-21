import { useState, useMemo } from 'react';
import { TEAM, APPT_TYPE, DAY_START, DAY_END, fmtTime, fmtRange, buildWeek, seedAppointments, findFreeSlots, busyFor } from '../data/index.js';
import { RoiButton, Eyebrow, Avatar, AvatarStack, RoiLogo, RoiIconMark, Icon, useIsMobile } from '../components/ui.jsx';
import { BookingModal } from '../components/BookingModal.jsx';

export function FindTime() {
  const isMobile = useIsMobile();
  const week = useMemo(() => buildWeek(new Date('2026-04-22')), []);
  const todayKey = week[2].key;
  const [appts, setAppts] = useState(() => seedAppointments(week.map(w => w.key)));
  const [selected, setSelected] = useState(() => new Set(TEAM.map(p => p.id)));
  const [dayKey, setDayKey] = useState(todayKey);
  const [duration, setDuration] = useState(90);
  const [modal, setModal] = useState({ open: false, draft: null });
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [mode, setMode] = useState('all');

  const selectedIds = Array.from(selected);

  const resultsAll = useMemo(() => findFreeSlots(appts, dayKey, selectedIds, duration),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appts, dayKey, selectedIds.join(','), duration]);

  const anySlots = useMemo(() => {
    const out = [];
    for (let t = DAY_START; t + duration <= DAY_END; t += 30) {
      const free = selectedIds.filter(pid => {
        const busy = busyFor(appts, dayKey, pid);
        return !busy.some(([s, e]) => t < e && (t + duration) > s);
      });
      if (free.length > 0) out.push({ start: t, end: t + duration, free });
    }
    const merged = [];
    for (const s of out) {
      const last = merged[merged.length - 1];
      if (last && last.end >= s.start && last.free.join(',') === s.free.join(',')) {
        last.end = Math.max(last.end, s.end);
      } else merged.push({ ...s });
    }
    return merged;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appts, dayKey, selectedIds.join(','), duration]);

  const openBook = (start, personId) => setModal({
    open: true,
    draft: { dayKey, start, end: start + duration, personId: personId || selectedIds[0], type: 'walkthrough' },
  });
  const save = (draft) => {
    setAppts(prev => draft.id ? prev.map(a => a.id === draft.id ? draft : a) : [...prev, { ...draft, id: 'n' + Date.now() }]);
    setModal({ open: false, draft: null });
  };

  const activeWindows = mode === 'all' ? resultsAll.windows : anySlots;
  const dayObj = week.find(w => w.key === dayKey);

  return (
    <div style={{ minHeight: '100vh', background: '#F1F1F1', fontFamily: "'Plus Jakarta Sans', sans-serif", color: '#111' }}>
      <header style={{
        background: 'linear-gradient(135deg, #009EE9 0%, #0054D4 100%)',
        color: '#fff', padding: isMobile ? '14px 16px 20px' : '20px 32px 48px', position: 'relative', overflow: 'hidden',
      }}>
        {!isMobile && (
          <div style={{ position: 'absolute', right: -80, top: -40, opacity: 0.08, pointerEvents: 'none' }}>
            <RoiIconMark color="#fff" size={420} />
          </div>
        )}
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
          <RoiLogo color="#fff" size={isMobile ? 14 : 18} />
          <div style={{ flex: 1 }} />
          {!isMobile && <button style={{ background: 'rgba(255,255,255,0.18)', border: 0, padding: '8px 14px', borderRadius: 999, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 13 }}>Schedule</button>}
          <Avatar person={TEAM[0]} size={isMobile ? 30 : 36} style={{ boxShadow: '0 0 0 2px rgba(255,255,255,0.4)' }} />
        </div>

        <div style={{ maxWidth: 1200, margin: isMobile ? '12px auto 0' : '36px auto 0', position: 'relative' }}>
          <Eyebrow color="rgba(255,255,255,0.85)">Find a Time · The ROI Guys</Eyebrow>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontStyle: 'italic',
            fontSize: isMobile ? 32 : 72, letterSpacing: '-0.03em', lineHeight: 1, margin: '6px 0 0', color: '#fff',
          }}>
            {isMobile ? 'When is the team ' : 'When is the team\n'}
            <span style={{ color: '#F7A521' }}>actually free?</span>
          </h1>
          {!isMobile && (
            <p style={{ marginTop: 14, fontSize: 17, maxWidth: 620, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
              Pick agents, pick a day, pick a duration. We&apos;ll show every window that works.
            </p>
          )}
        </div>

        {/* Search card */}
        <div style={{
          maxWidth: 1200, margin: isMobile ? '16px auto 0' : '36px auto 0', background: '#fff', borderRadius: isMobile ? 16 : 20,
          boxShadow: '0 20px 60px rgba(0, 32, 76, 0.25)', padding: isMobile ? 16 : 24, position: 'relative', zIndex: 5,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr 0.8fr auto', gap: isMobile ? 14 : 20, alignItems: 'flex-end' }}>
            <div>
              <FieldLabel>Who</FieldLabel>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {TEAM.map(p => {
                  const on = selected.has(p.id);
                  return (
                    <button key={p.id} onClick={() => {
                      const n = new Set(selected);
                      on ? n.delete(p.id) : n.add(p.id);
                      if (n.size === 0) return;
                      setSelected(n);
                    }} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 10,
                      padding: '6px 14px 6px 6px', borderRadius: 999, cursor: 'pointer',
                      background: on ? '#0054D4' : '#fff', color: on ? '#fff' : '#111',
                      border: `1.5px solid ${on ? '#0054D4' : '#E9E9E9'}`,
                      fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
                    }}>
                      <Avatar person={p} size={26} />
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <FieldLabel>Match</FieldLabel>
              <div style={{ display: 'flex', gap: 6, padding: 4, background: '#F1F1F1', borderRadius: 10 }}>
                <button onClick={() => setMode('all')} style={toggleBtn(mode === 'all')}>All free</button>
                <button onClick={() => setMode('any')} style={toggleBtn(mode === 'any')}>Any free</button>
              </div>
            </div>

            <div>
              <FieldLabel>Duration</FieldLabel>
              <div style={{ display: 'flex', gap: 6 }}>
                {[30, 60, 90, 120].map(m => (
                  <button key={m} onClick={() => setDuration(m)} style={{
                    flex: 1, padding: '10px 0', borderRadius: 10,
                    border: `1.5px solid ${duration === m ? '#0054D4' : '#E9E9E9'}`,
                    background: duration === m ? '#0054D4' : '#fff',
                    color: duration === m ? '#fff' : '#3A3A3A',
                    cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
                  }}>{m >= 60 ? `${m/60}h` : `${m}m`}</button>
                ))}
              </div>
            </div>

            {isMobile
              ? <RoiButton variant="gold" icon={<Icon name="sparkle" size={14} />} size="sm" style={{ width: '100%', justifyContent: 'center' }}>Find Windows</RoiButton>
              : <RoiButton variant="gold" icon={<Icon name="sparkle" size={16} />} size="lg">Search</RoiButton>
            }
          </div>

          <div style={{ display: 'flex', gap: isMobile ? 6 : 8, marginTop: isMobile ? 12 : 18, overflowX: isMobile ? 'auto' : 'visible' }}>
            {week.map(d => {
              const active = d.key === dayKey;
              const count = appts.filter(a => a.dayKey === d.key && selected.has(a.personId)).length;
              return (
                <button key={d.key} onClick={() => setDayKey(d.key)} style={{
                  flex: isMobile ? '0 0 auto' : 1, padding: isMobile ? '8px 10px' : '12px 10px', borderRadius: 12,
                  border: `1.5px solid ${active ? '#0054D4' : '#F1F1F1'}`,
                  background: active ? '#E6F0FC' : '#fff',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', minWidth: isMobile ? 56 : undefined,
                }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.12em', fontWeight: 600, textTransform: 'uppercase', color: active ? '#0054D4' : '#6B6B6B' }}>
                    {d.dow}{!isMobile && d.key === todayKey ? ' · today' : ''}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontStyle: 'italic', fontSize: isMobile ? 18 : 26, letterSpacing: '-0.02em', color: active ? '#0054D4' : '#111' }}>{d.dayNum}</div>
                    {!isMobile && <div style={{ fontSize: 11, color: '#6B6B6B', fontWeight: 600 }}>{count} booked</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: isMobile ? '16px auto 0' : '32px auto 0', padding: isMobile ? '0 12px 80px' : '0 32px 80px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Eyebrow>Free windows · {dayObj.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Eyebrow>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontStyle: 'italic',
              fontSize: 36, letterSpacing: '-0.02em', margin: '6px 0 0',
            }}>
              {activeWindows.length} window{activeWindows.length !== 1 ? 's' : ''} available
              <span style={{ color: '#0054D4' }}> · {duration >= 60 ? `${duration/60}h` : `${duration}m`}</span>
            </h2>
          </div>
          <div style={{ fontSize: 13, color: '#6B6B6B', maxWidth: 360 }}>
            Showing {mode === 'all' ? 'times when every selected agent is free' : 'times when at least one selected agent is free'}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 6px rgba(17,17,17,0.06)' }}>
          <TimelineRibbon
            appts={appts.filter(a => a.dayKey === dayKey && selected.has(a.personId))}
            people={TEAM.filter(p => selected.has(p.id))}
            windows={activeWindows}
            duration={duration}
            hovered={hoveredSlot}
            setHovered={setHoveredSlot}
          />
        </div>

        <div style={{ marginTop: 24 }}>
          <Eyebrow>Suggested slots</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, marginTop: 12 }}>
            {activeWindows.length === 0 && (
              <div style={{ padding: 24, background: '#fff', borderRadius: 12, color: '#6B6B6B', gridColumn: '1 / -1', textAlign: 'center' }}>
                No free windows for this combination. Try a shorter duration or a different day.
              </div>
            )}
            {activeWindows.slice(0, 12).map((w, i) => {
              const free = mode === 'any' ? w.free : selectedIds;
              const freePeople = TEAM.filter(p => free && free.includes(p.id));
              return (
                <button key={i}
                  onMouseEnter={() => setHoveredSlot(i)}
                  onMouseLeave={() => setHoveredSlot(null)}
                  onClick={() => openBook(w.start, freePeople[0]?.id)}
                  style={{
                    background: '#fff', border: `1.5px solid ${hoveredSlot === i ? '#0054D4' : '#E9E9E9'}`,
                    borderRadius: 12, padding: 16, cursor: 'pointer', textAlign: 'left',
                    boxShadow: hoveredSlot === i ? '0 10px 30px rgba(0,84,212,0.18)' : 'none',
                    transition: 'box-shadow 160ms ease, border-color 160ms ease, transform 160ms ease',
                    transform: hoveredSlot === i ? 'translateY(-2px)' : 'none',
                    fontFamily: 'inherit',
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontStyle: 'italic',
                        fontSize: 26, letterSpacing: '-0.02em', color: '#0054D4',
                      }}>{fmtTime(w.start)}</div>
                      <div style={{ fontSize: 11, color: '#6B6B6B', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{fmtRange(w.start, w.end)}</div>
                    </div>
                    <div style={{ fontSize: 11, color: '#6B6B6B', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{((w.end - w.start) / 60).toFixed(1)}h open</div>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <AvatarStack people={freePeople} size={26} />
                    <div style={{ fontSize: 12, color: '#111', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Book →</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <BookingModal open={modal.open} draft={modal.draft} week={week} team={TEAM} appts={appts}
        onClose={() => setModal({ open: false, draft: null })}
        onSave={save} />
    </div>
  );
}

function FieldLabel({ children, style }) {
  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 700,
      letterSpacing: '0.12em', textTransform: 'uppercase', color: '#3A3A3A',
      marginBottom: 8, ...style,
    }}>{children}</div>
  );
}

const toggleBtn = (active) => ({
  flex: 1, padding: '8px 10px', borderRadius: 8, border: 0, cursor: 'pointer',
  background: active ? '#fff' : 'transparent',
  color: active ? '#0054D4' : '#6B6B6B',
  fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 12,
  letterSpacing: '0.06em', textTransform: 'uppercase',
  boxShadow: active ? '0 1px 3px rgba(17,17,17,0.12)' : 'none',
});

function TimelineRibbon({ appts, people, windows, duration, hovered, setHovered }) {
  const HOUR_PX = 64;
  const totalWidth = ((DAY_END - DAY_START) / 60) * HOUR_PX;

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ width: totalWidth, position: 'relative' }}>
        {/* Hour labels */}
        <div style={{ display: 'flex', height: 28 }}>
          {Array.from({ length: (DAY_END - DAY_START) / 60 }, (_, i) => (
            <div key={i} style={{
              width: HOUR_PX, borderLeft: i === 0 ? 'none' : '1px solid #F1F1F1',
              fontSize: 11, fontWeight: 600, color: '#6B6B6B', padding: '6px 0 0 6px',
              fontVariantNumeric: 'tabular-nums',
            }}>{fmtTime(DAY_START + i * 60)}</div>
          ))}
        </div>

        {/* Free windows band */}
        <div style={{ height: 40, position: 'relative', marginBottom: 6 }}>
          <div style={{ position: 'absolute', inset: 0, background: '#F1F1F1', borderRadius: 8 }} />
          {windows.map((w, i) => {
            const left = ((w.start - DAY_START) / 60) * HOUR_PX;
            const width = ((w.end - w.start) / 60) * HOUR_PX;
            return (
              <div key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  position: 'absolute', top: 0, bottom: 0, left, width,
                  background: hovered === i ? '#0054D4' : 'linear-gradient(135deg, #009EE9 0%, #0054D4 100%)',
                  borderRadius: 8, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', padding: '0 10px',
                  color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 12,
                  transition: 'all 160ms ease',
                }}>
                <div style={{ fontSize: 11, letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  FREE · {fmtRange(w.start, w.end)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Per-person rows */}
        {people.map(p => {
          const mine = appts.filter(a => a.personId === p.id);
          return (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ width: 110, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Avatar person={p} size={26} />
                <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
              </div>
              <div style={{ flex: 1, height: 36, position: 'relative', background: '#F7F8FA', borderRadius: 8 }}>
                {mine.map(a => {
                  const meta = APPT_TYPE[a.type];
                  const widthPct = ((a.end - a.start) / (DAY_END - DAY_START)) * 100;
                  const leftPct = ((a.start - DAY_START) / (DAY_END - DAY_START)) * 100;
                  return (
                    <div key={a.id} title={`${a.title} · ${fmtRange(a.start, a.end)}`} style={{
                      position: 'absolute', top: 4, bottom: 4,
                      left: `${leftPct}%`, width: `${widthPct}%`,
                      background: meta.soft, borderLeft: `3px solid ${meta.color}`, borderRadius: 6,
                      padding: '0 8px', display: 'flex', alignItems: 'center',
                      fontSize: 11, fontWeight: 700, color: meta.color,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{a.title}</div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
