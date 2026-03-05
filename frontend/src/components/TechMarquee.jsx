import { useRef } from 'react'

const TECH_ITEMS = [
  { label: 'React',          icon: '⚛️' },
  { label: 'Python',         icon: '🐍' },
  { label: 'PHP',            icon: '🐘' },
  { label: 'MySQL',          icon: '🗄️' },
  { label: 'JavaScript',     icon: '🟨' },
  { label: 'Node.js',        icon: '🟢' },
  { label: 'Cisco',          icon: '📡' },
  { label: 'MikroTik',       icon: '🔴' },
  { label: 'Ubiquiti UniFi', icon: '📶' },
  { label: 'Windows Server', icon: '🖥️' },
  { label: 'Linux',          icon: '🐧' },
  { label: 'Active Directory',icon: '🔐' },
  { label: 'VLANs',          icon: '🗂️' },
  { label: 'Tailwind CSS',   icon: '🎨' },
  { label: 'PostgreSQL',     icon: '🐘' },
  { label: 'Cloud Backup',   icon: '☁️' },
  { label: 'HTML5 / CSS3',   icon: '🌐' },
  { label: 'Figma',          icon: '🎯' },
  { label: 'Git',            icon: '🔀' },
  { label: 'WiFi Planning',  icon: '📻' },
]

function MarqueeRow({ items, direction = 'left', speed = 35 }) {
  // Duplicate for seamless loop
  const doubled = [...items, ...items]
  const duration = `${items.length * speed}s`

  return (
    <div style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
      {/* Fade edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to right, var(--marquee-bg, #0a1128), transparent)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: 'linear-gradient(to left, var(--marquee-bg, #0a1128), transparent)', zIndex: 2, pointerEvents: 'none' }} />

      <div
        style={{
          display: 'flex',
          gap: '0px',
          width: 'max-content',
          animation: `marquee-${direction} ${duration} linear infinite`,
        }}
        className="marquee-track"
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.4rem',
              borderRight: '1px solid rgba(255,255,255,0.07)',
              whiteSpace: 'nowrap',
              transition: 'background 0.2s',
              cursor: 'default',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(245,166,35,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
            <span style={{
              fontFamily: 'monospace',
              fontSize: '0.68rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.55)',
              fontWeight: 500,
            }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function TechMarquee() {
  // Split into two rows, second row reversed order + slower speed
  const row1 = TECH_ITEMS.slice(0, 10)
  const row2 = [...TECH_ITEMS.slice(10), ...TECH_ITEMS.slice(0, 3)]

  return (
    <section
      style={{
        background: '#0a1128',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0',
        overflow: 'hidden',
        '--marquee-bg': '#0a1128',
      }}
    >
      {/* Top label bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        padding: '0.75rem 2rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <span style={{ display: 'block', height: 1, width: 32, background: '#f5a623', opacity: 0.6 }} />
        <span style={{
          fontFamily: 'monospace',
          fontSize: '0.58rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(245,166,35,0.7)',
          fontWeight: 700,
        }}>
          Tech Stack &amp; Tools
        </span>
        <span style={{ display: 'block', height: 1, width: 32, background: '#f5a623', opacity: 0.6 }} />
      </div>

      {/* Row 1 — scrolls left */}
      <div style={{ padding: '0.6rem 0' }}>
        <MarqueeRow items={row1} direction="left" speed={4} />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0' }} />

      {/* Row 2 — scrolls right */}
      <div style={{ padding: '0.6rem 0' }}>
        <MarqueeRow items={row2} direction="right" speed={5} />
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes marquee-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .marquee-track:hover {
          animation-play-state: paused !important;
        }
      `}</style>
    </section>
  )
}
