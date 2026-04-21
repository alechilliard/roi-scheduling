import { useEffect, useState } from 'react';
import { setAccessToken, clearToken, isTokenValid } from '../lib/googleCalendar.js';
import { RoiButton, Icon } from './ui.jsx';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let _tokenClient = null;

function loadGIS() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.defer = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(s);
  });
}

export function useGoogleAuth() {
  const [signedIn, setSignedIn] = useState(isTokenValid());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signIn = async () => {
    setLoading(true); setError(null);
    try {
      await loadGIS();
      if (!CLIENT_ID) {
        setError('VITE_GOOGLE_CLIENT_ID is not set. See SETUP.md for instructions.');
        setLoading(false); return;
      }
      if (!_tokenClient) {
        _tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (res) => {
            if (res.error) {
              setError(res.error);
            } else {
              setAccessToken(res.access_token, res.expires_in);
              setSignedIn(true);
            }
            setLoading(false);
          },
        });
      }
      _tokenClient.requestAccessToken();
    } catch (e) {
      setError(e.message);
      setLoading(false);
    }
  };

  const signOut = () => {
    clearToken();
    setSignedIn(false);
  };

  return { signedIn, loading, error, signIn, signOut };
}

export function GoogleAuthButton({ signedIn, loading, error, onSignIn, onSignOut, compact = false }) {
  if (signedIn) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 6 : 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: '#1BA86B', display: 'inline-block' }} />
          {!compact && <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13, fontWeight: 600,
            color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap',
          }}>Calendar syncing</span>}
        </div>
        <button onClick={onSignOut} style={{
          fontSize: 12, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none',
          cursor: 'pointer', fontFamily: 'inherit', padding: 0,
        }}>✕</button>
      </div>
    );
  }
  return (
    <div>
      <button onClick={onSignIn} disabled={loading} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 0',
        background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: compact ? 11 : 13,
        color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', opacity: loading ? 0.6 : 1,
      }}>
        <GoogleIcon size={compact ? 12 : 14} />
        {compact ? 'Connect' : (loading ? 'Connecting…' : 'Connect Google Calendar')}
      </button>
      {error && !compact && <div style={{ fontSize: 11, color: '#F7A521', marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function GoogleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}
