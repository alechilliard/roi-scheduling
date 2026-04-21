import { useState } from 'react';
import { TeamRows } from './views/TeamRows.jsx';
import { StackedDay } from './views/StackedDay.jsx';
import { FindTime } from './views/FindTime.jsx';
import { useGoogleAuth, GoogleAuthButton } from './components/GoogleAuth.jsx';

const VIEWS = [
  { id: 'rows',    label: 'A · Team Rows' },
  { id: 'stacked', label: 'B · Stacked Day' },
  { id: 'find',    label: 'C · Find a Time' },
];

const PILL_STYLE = {
  background: 'rgba(17, 17, 17, 0.88)', backdropFilter: 'blur(12px)',
  borderRadius: 999, boxShadow: '0 8px 32px rgba(0,0,0,0.32)',
};

export default function App() {
  const [view, setView] = useState('rows');
  const auth = useGoogleAuth();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Bottom bar — view switcher + Google auth side by side */}
      <div style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 200, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {/* View switcher pill */}
        <div style={{ ...PILL_STYLE, display: 'flex', gap: 4, padding: '6px 8px' }}>
          {VIEWS.map(v => {
            const active = view === v.id;
            return (
              <button key={v.id} onClick={() => setView(v.id)} style={{
                padding: '8px 18px', borderRadius: 999, border: 0, cursor: 'pointer',
                background: active ? '#fff' : 'transparent',
                color: active ? '#111' : 'rgba(255,255,255,0.65)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: active ? 700 : 500, fontSize: 13,
                transition: 'background 180ms ease, color 180ms ease',
                whiteSpace: 'nowrap',
              }}>
                {v.label}
              </button>
            );
          })}
        </div>

        {/* Google Calendar auth pill */}
        <div style={{ ...PILL_STYLE, padding: '6px 14px' }}>
          <GoogleAuthButton
            signedIn={auth.signedIn}
            loading={auth.loading}
            error={auth.error}
            onSignIn={auth.signIn}
            onSignOut={auth.signOut}
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
