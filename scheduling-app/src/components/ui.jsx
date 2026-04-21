export function RoiButton({ children, variant = 'primary', size = 'md', onClick, icon, disabled, style = {}, type = 'button' }) {
  const bases = {
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    border: 0, borderRadius: 999, cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'filter 180ms ease, transform 120ms ease, box-shadow 180ms ease',
    opacity: disabled ? 0.55 : 1,
  };
  const sizes = {
    sm: { fontSize: 11, padding: '8px 14px' },
    md: { fontSize: 12, padding: '12px 20px' },
    lg: { fontSize: 13, padding: '14px 26px' },
  };
  const variants = {
    primary:    { background: '#0054D4', color: '#fff', boxShadow: '0 6px 18px rgba(0,84,212,0.28)' },
    gold:       { background: '#F7A521', color: '#111' },
    ghost:      { background: 'transparent', color: '#0054D4', border: '1.5px solid #0054D4' },
    'ghost-dark': { background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,0.5)' },
    dark:       { background: '#111', color: '#fff' },
    plain:      { background: 'transparent', color: '#0054D4', padding: 0 },
    danger:     { background: '#E23B3B', color: '#fff' },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      style={{ ...bases, ...sizes[size], ...variants[variant], ...style }}
      onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'translateY(1px)')}
      onMouseUp={e => (e.currentTarget.style.transform = '')}
      onMouseLeave={e => (e.currentTarget.style.transform = '')}
    >
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
    </button>
  );
}

export function Eyebrow({ children, color = '#6B6B6B', style }) {
  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fontWeight: 400,
      letterSpacing: '0.24em', textTransform: 'uppercase', color, ...style,
    }}>{children}</div>
  );
}

export function Avatar({ person, size = 32, style = {} }) {
  const bg = `hsl(${person.hue}, 68%, 55%)`;
  return (
    <div title={person.name} style={{
      width: size, height: size, borderRadius: '50%', background: bg, color: '#fff',
      fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontStyle: 'italic',
      fontSize: size * 0.42, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      letterSpacing: '-0.02em', flexShrink: 0, ...style,
    }}>{person.initials}</div>
  );
}

export function AvatarStack({ people, size = 28, overlap = 8 }) {
  return (
    <div style={{ display: 'inline-flex' }}>
      {people.map((p, i) => (
        <div key={p.id} style={{ marginLeft: i === 0 ? 0 : -overlap }}>
          <Avatar person={p} size={size} style={{ boxShadow: '0 0 0 2px #fff' }} />
        </div>
      ))}
    </div>
  );
}

export function RoiLogo({ color = '#fff', size = 18 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color }}>
      <RoiIconMark color={color} size={size * 1.4} />
      <span style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontStyle: 'italic',
        fontSize: size, letterSpacing: '-0.02em', lineHeight: 1, color,
      }}>The ROI Guys</span>
    </span>
  );
}

export function RoiIconMark({ color = '#fff', size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d="M4 18 L16 4 L28 18" stroke={color} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 26 L25 26" stroke={color} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M11 22 L21 22" stroke={color} strokeWidth="3.2" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

export function Icon({ name, size = 18, color = 'currentColor', style }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  switch (name) {
    case 'plus':         return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case 'search':       return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>;
    case 'chevron-left': return <svg {...props}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'chevron-right':return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevron-down': return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>;
    case 'close':        return <svg {...props}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'pin':          return <svg {...props}><path d="M12 21s-7-7.58-7-12a7 7 0 0114 0c0 4.42-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>;
    case 'clock':        return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'calendar':     return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    case 'users':        return <svg {...props}><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7"/><circle cx="18" cy="8" r="3"/><path d="M22 19c0-2.5-2-5-5-5"/></svg>;
    case 'home':         return <svg {...props}><path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1z"/></svg>;
    case 'check':        return <svg {...props}><path d="M5 12l5 5 9-11"/></svg>;
    case 'warn':         return <svg {...props}><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/></svg>;
    case 'arrow-right':  return <svg {...props}><path d="M5 12h14M13 5l7 7-7 7"/></svg>;
    case 'grid':         return <svg {...props}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
    case 'list':         return <svg {...props}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>;
    case 'sparkle':      return <svg {...props}><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>;
    case 'bell':         return <svg {...props}><path d="M18 16v-5a6 6 0 00-12 0v5l-2 2h16z"/><path d="M10 21a2 2 0 004 0"/></svg>;
    case 'filter':       return <svg {...props}><path d="M3 5h18l-7 9v5l-4 2v-7z"/></svg>;
    default:             return null;
  }
}
