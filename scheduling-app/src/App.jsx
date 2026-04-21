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

export default function App() {
  const [view, setView] = useState('rows');
  const auth = useGoogleAuth();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Google Calendar auth bar — top-right corner */}
      <div style={{
        position: 'fixed', top: 12, right: 16, zIndex: 300,
      }}>
        <GoogleAuthButton
          signedIn={auth.signedIn}
          loading={auth.loading}
          error={auth.error}
          onSignIn={auth.signIn}
          onSignOut={auth.signOut}
        />
      </div>

      {/* Floating view switcher */}
      <div style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 200, display: 'flex', gap: 4,
        background: 'rgba(17, 17, 17, 0.88)', backdropFilter: 'blur(12px)',
        borderRadius: 999, padding: '6px 8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.32)',
      }}>
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

      {/* Active view */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {view === 'rows'    && <TeamRows />}
        {view === 'stacked' && <StackedDay />}
        {view === 'find'    && <FindTime />}
      </div>
    </div>
  );
}
