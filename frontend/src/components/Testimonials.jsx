import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API = `${import.meta.env.VITE_API_URL || 'https://devtech-pro-api-production.up.railway.app'}/api/testimonials`

// ── Fallback demo testimonials while API populates ─────────────
const DEMO = [
  {
    _id: '1', name: 'James Mwangi', role: 'Business Owner',
    company: 'Mwangi Electronics, Meru',
    text: 'Guchi set up our entire office network from scratch. Fast, reliable, and he explained everything clearly. Our team is now 3× more productive.',
    rating: 5, service: 'Network Setup', avatar: '',
  },
  {
    _id: '2', name: 'Sarah Njeri', role: 'IT Manager',
    company: 'Fahari Schools Group',
    text: 'The school management system he built is exactly what we needed. Parent portals, fee tracking, report cards — all in one place. Outstanding work!',
    rating: 5, service: 'Custom Software', avatar: '',
  },
  {
    _id: '3', name: 'David Kamau', role: 'CEO',
    company: 'Kamau Logistics Ltd',
    text: 'Our old IT infrastructure was a mess. Guchi came in, diagnosed every issue, and had us running smoothly within 2 days. Highly recommend.',
    rating: 5, service: 'IT Support', avatar: '',
  },
  {
    _id: '4', name: 'Grace Wanjiru', role: 'Shop Owner',
    company: 'GW Fashion Boutique',
    text: 'I needed a website and POS system. He delivered both on time, within budget, and even trained my staff. 10/10 would hire again.',
    rating: 5, service: 'Web Development', avatar: '',
  },
  {
    _id: '5', name: 'Peter Ochieng', role: 'Network Engineer',
    company: 'TeleCom Kenya',
    text: 'Downloaded the MikroTik config guide — saved me 3 hours of troubleshooting on a live network. Absolutely essential resource.',
    rating: 5, service: 'Resources', avatar: '',
  },
]

function Stars({ n = 5 }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: '.85rem', color: i <= n ? '#f5a623' : 'rgba(255,255,255,.2)' }}>★</span>
      ))}
    </div>
  )
}

function Avatar({ name = '', src = '' }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const colors   = ['#f5a623', '#3b82f6', '#22c55e', '#a855f7', '#ef4444']
  const color    = colors[name.charCodeAt(0) % colors.length]

  if (src) return (
    <img src={src} alt={name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,.15)' }} />
  )
  return (
    <div style={{
      width: '48px', height: '48px', borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}33, ${color}11)`,
      border: `2px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, fontWeight: 800, fontSize: '.95rem', flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

export default function Testimonials() {
  const [items, setItems]     = useState([])
  const [active, setActive]   = useState(0)
  const [paused, setPaused]   = useState(false)
  const intervalRef           = useRef(null)

  useEffect(() => {
    fetch(API)
      .then(r => r.json())
      .then(d => setItems(d.data?.length ? d.data : DEMO))
      .catch(() => setItems(DEMO))
  }, [])

  // Auto-advance carousel every 5s
  useEffect(() => {
    if (!items.length) return
    if (paused) { clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(() => {
      setActive(a => (a + 1) % items.length)
    }, 5000)
    return () => clearInterval(intervalRef.current)
  }, [items.length, paused])

  if (!items.length) return null

  // Show 3 cards on desktop, 1 on mobile — calculated from active index
  const visible = [0, 1, 2].map(offset => items[(active + offset) % items.length])

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        padding: '6rem 0',
        background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%)',
        borderTop: '1px solid var(--border)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Background glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(245,166,35,0.05) 0%, transparent 70%)',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 2rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '.5rem',
            background: 'var(--accent-glow)', border: '1px solid rgba(245,166,35,.25)',
            borderRadius: '20px', padding: '.3rem .9rem',
            fontSize: '.65rem', fontFamily: 'monospace', letterSpacing: '.18em',
            textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '1.25rem',
          }}>⭐ Client Testimonials</div>
          <h2 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900,
            color: 'var(--text)', lineHeight: 1.15, marginBottom: '.75rem',
          }}>
            What clients <span style={{ color: 'var(--accent)' }}>say</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '480px', margin: '0 auto' }}>
            Real feedback from businesses and individuals across Kenya.
          </p>
        </div>

        {/* Cards — 3-column desktop, stacked mobile */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}>
          <AnimatePresence mode="wait">
            {visible.map((item, idx) => (
              <motion.div
                key={item._id + '-' + idx}
                initial={{ opacity: 0, y: 30, scale: .97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: .97 }}
                transition={{ duration: .45, delay: idx * .08, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  background: 'rgba(255,255,255,0.55)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(245,166,35,0.15)',
                  borderRadius: '16px',
                  padding: '1.75rem',
                  boxShadow: '0 4px 30px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Quote mark */}
                <div style={{
                  position: 'absolute', top: '1rem', right: '1.25rem',
                  fontSize: '3.5rem', lineHeight: 1, color: 'rgba(245,166,35,.12)',
                  fontFamily: 'Georgia, serif', fontWeight: 900, userSelect: 'none',
                }}>❝</div>

                {/* Stars */}
                <div style={{ marginBottom: '1rem' }}>
                  <Stars n={item.rating} />
                </div>

                {/* Text */}
                <p style={{
                  color: 'var(--text)', fontSize: '.9rem', lineHeight: 1.7,
                  marginBottom: '1.5rem', position: 'relative',
                }}>
                  "{item.text}"
                </p>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
                  <Avatar name={item.name} src={item.avatar} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.role}{item.company ? ` · ${item.company}` : ''}
                    </div>
                  </div>
                  {item.service && (
                    <span style={{
                      fontSize: '.58rem', fontFamily: 'monospace', letterSpacing: '.1em',
                      textTransform: 'uppercase', background: 'rgba(245,166,35,.12)',
                      color: 'var(--accent)', border: '1px solid rgba(245,166,35,.2)',
                      padding: '.2rem .5rem', borderRadius: '6px', whiteSpace: 'nowrap',
                    }}>{item.service}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Dot navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem' }}>
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); setPaused(true) }}
              style={{
                width: i === active ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: i === active ? 'var(--accent)' : 'var(--border)',
                border: 'none', cursor: 'pointer',
                transition: 'all .3s ease',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Summary stats */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '2.5rem', marginTop: '2.5rem', flexWrap: 'wrap',
        }}>
          {[
            { n: '50+', label: 'Happy Clients' },
            { n: '5.0', label: 'Average Rating' },
            { n: '100%', label: 'Satisfaction Rate' },
          ].map(({ n, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--accent)', lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: '.12em', textTransform: 'uppercase', marginTop: '.25rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
