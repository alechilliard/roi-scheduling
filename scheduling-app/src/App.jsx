import { useState } from 'react';
import { TeamRows } from './views/TeamRows.jsx';
import { StackedDay } from './views/StackedDay.jsx';
import { FindTime } from './views/FindTime.jsx';
import { useGoogleAuth, GoogleAuthButton } from './components/GoogleAuth.jsx';
import { useIsMobile } from './components/ui.jsx';

const VIEWS = [
  { id: 'rows',    label: 'A · Team Rows',   short: 'Team' },
  { id: 'stacked', label: 'B · Stacked Day',  short: 'Day' },
  { id: 'find',    label: 'C · Find a Time',  short: 'Find' },
];

const PILL_STYLE = {
  background: 'rgba(17, 17, 17, 0.88)', backdropFilter: 'blur(12px)',
  borderRadius: 999, boxShadow: '0 8px 32px rgba(0,0,0,0.32)',
};

export default function App() {
  const [view, setView] = useState('rows');
  const auth = useGoogleAuth();
  const isMobile = useIsMobile();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Bottom bar — view switcher + Google auth side by side */}
      <div style={{
        position: 'fixed', bottom: isMobile ? 12 : 20,
        left: '50%', transform: 'translateX(-50%)',
        zIndex: 200, display: 'flex', alignItems: 'center', gap: 6,
        maxWidth: isMobile ? 'calc(100vw - 24px)' : undefined,
      }}>
        {/* View switcher pill */}
        <div style={{ ...PILL_STYLE, display: 'flex', gap: isMobile ? 1 : 4, padding: isMobile ? '4px 6px' : '6px 8px' }}>
          {VIEWS.map(v => {
            const active = view === v.id;
            return (
              <button key={v.id} onClick={() => setView(v.id)} style={{
                padding: isMobile ? '7px 12px' : '8px 18px', borderRadius: 999, border: 0, cursor: 'pointer',
                background: active ? '#fff' : 'transparent',
                color: active ? '#111' : 'rgba(255,255,255,0.65)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: active ? 700 : 500, fontSize: isMobile ? 12 : 13,
                transition: 'background 180ms ease, color 180ms ease',
                whiteSpace: 'nowrap',
              }}>
                {isMobile ? v.short : v.label}
              </button>
            );
          })}
        </div>

        {/* Google Calendar auth pill */}
        <div style={{ ...PILL_STYLE, padding: isMobile ? '6px 10px' : '6px 14px' }}>
          <GoogleAuthButton
            signedIn={auth.signedIn}
            loading={auth.loading}
            error={auth.error}
            onSignIn={auth.signIn}
            onSignOut={auth.signOut}
            compact={isMobile}
          />
        </div>
      </div>

      {/* Active view */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {view === 'rows'    && <TeamRows />}
        {view === 'stacked' && <StackedDay />}
        {view === 'find'    && <FindTime />}
      </div>
    </div>
  );
}
