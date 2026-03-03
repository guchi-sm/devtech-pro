export default function DevTechLogo({ height = 36 }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 52"
      height={height}
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="nOrange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffb347"/>
          <stop offset="100%" stopColor="#e8830a"/>
        </linearGradient>
        <linearGradient id="nIconBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#161e2e"/>
          <stop offset="100%" stopColor="#0e1520"/>
        </linearGradient>
        <filter id="nGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* ── Icon box ── */}
      <rect width="48" height="48" rx="11" fill="url(#nIconBg)"/>
      <rect width="48" height="48" rx="11" fill="none" stroke="url(#nOrange)" strokeWidth="1" opacity="0.4"/>

      {/* ── D mark ── */}
      {/* Vertical stem */}
      <rect x="11" y="11" width="5" height="30" rx="2.5" fill="url(#nOrange)"/>
      {/* Top arm */}
      <rect x="11" y="11" width="17" height="5" rx="2.5" fill="url(#nOrange)"/>
      {/* Bottom arm */}
      <rect x="11" y="36" width="17" height="5" rx="2.5" fill="url(#nOrange)"/>
      {/* Curve */}
      <path d="M 25 16 Q 39 16 39 26 Q 39 36 25 36"
        fill="none" stroke="url(#nOrange)" strokeWidth="5" strokeLinecap="round"/>

      {/* ── Nodes ── */}
      <circle cx="39" cy="16" r="3.5" fill="#f5a623" filter="url(#nGlow)"/>
      <circle cx="39" cy="16" r="1.5" fill="#fff" opacity="0.7"/>

      <circle cx="39" cy="36" r="3.5" fill="#f5a623" filter="url(#nGlow)"/>
      <circle cx="39" cy="36" r="1.5" fill="#fff" opacity="0.7"/>

      <circle cx="39" cy="26" r="2.5" fill="#22d3ee" filter="url(#nGlow)" opacity="0.95"/>

      <circle cx="11" cy="11" r="2.5" fill="#22d3ee" opacity="0.8"/>

      {/* ── Wordmark ── */}
      <text x="58" y="34"
        fontFamily="'Arial Black', 'Helvetica Neue', sans-serif"
        fontSize="26"
        fontWeight="900"
        letterSpacing="-1"
        fill="var(--text, #ffffff)">DEV</text>
      <text x="120" y="34"
        fontFamily="'Arial Black', 'Helvetica Neue', sans-serif"
        fontSize="26"
        fontWeight="900"
        letterSpacing="-1"
        fill="url(#nOrange)">TECH</text>
    </svg>
  )
}
