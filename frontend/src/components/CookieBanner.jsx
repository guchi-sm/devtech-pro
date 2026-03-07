import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COOKIE_KEY = 'devtech_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY)
    if (!consent) {
      // Delay 2s so it doesn't fight with page load animations
      const t = setTimeout(() => setVisible(true), 2000)
      return () => clearTimeout(t)
    }
  }, [])

  function accept() {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ analytics: true, ts: Date.now() }))
    setVisible(false)
  }

  function decline() {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ analytics: false, ts: Date.now() }))
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed', bottom: '1.5rem', left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9000, width: '100%', maxWidth: '680px', padding: '0 1rem',
          }}
        >
          <div style={{
            background: 'rgba(28, 45, 63, 0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(245, 166, 35, 0.25)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)',
          }}>
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: showDetails ? '1rem' : 0 }}>
              <span style={{ fontSize: '1.5rem', flexShrink: 0, marginTop: '2px' }}>🍪</span>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#e2e8f5', fontSize: '.88rem', lineHeight: 1.6, margin: 0 }}>
                  We use cookies to analyse site traffic and improve your experience.
                  {' '}<button
                    onClick={() => setShowDetails(v => !v)}
                    style={{ color: '#f5a623', background: 'none', border: 'none', cursor: 'pointer', fontSize: '.88rem', textDecoration: 'underline', padding: 0 }}
                  >
                    {showDetails ? 'Hide details' : 'Learn more'}
                  </button>
                </p>
              </div>
            </div>

            {/* Details panel */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: '1rem',
                    marginBottom: '1rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '.75rem',
                  }}>
                    {[
                      { icon: '✅', label: 'Essential', desc: 'Required for the site to work', always: true },
                      { icon: '📊', label: 'Analytics', desc: 'Page views, device & country data', always: false },
                    ].map(item => (
                      <div key={item.label} style={{
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '8px', padding: '.75rem',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.3rem' }}>
                          <span style={{ color: '#fff', fontSize: '.82rem', fontWeight: 700 }}>{item.icon} {item.label}</span>
                          <span style={{
                            fontSize: '.6rem', fontFamily: 'monospace', letterSpacing: '.1em',
                            color: item.always ? '#22c55e' : '#f5a623',
                            background: item.always ? 'rgba(34,197,94,.15)' : 'rgba(245,166,35,.15)',
                            padding: '.15rem .5rem', borderRadius: '20px',
                          }}>
                            {item.always ? 'ALWAYS ON' : 'OPTIONAL'}
                          </span>
                        </div>
                        <p style={{ color: 'rgba(226,232,245,.65)', fontSize: '.75rem', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: showDetails ? 0 : '1rem' }}>
              <button
                onClick={decline}
                style={{
                  background: 'transparent', color: 'rgba(226,232,245,.65)',
                  border: '1px solid rgba(255,255,255,.15)', padding: '.5rem 1.1rem',
                  borderRadius: '8px', fontSize: '.82rem', cursor: 'pointer',
                  transition: 'all .2s', fontWeight: 600,
                }}
                onMouseOver={e => e.target.style.borderColor = 'rgba(255,255,255,.4)'}
                onMouseOut={e => e.target.style.borderColor = 'rgba(255,255,255,.15)'}
              >
                Decline
              </button>
              <button
                onClick={accept}
                style={{
                  background: 'linear-gradient(135deg, #f5a623, #e8940f)',
                  color: '#1c2d3f', border: 'none', padding: '.5rem 1.4rem',
                  borderRadius: '8px', fontSize: '.82rem', cursor: 'pointer',
                  fontWeight: 800, transition: 'all .2s',
                  boxShadow: '0 4px 15px rgba(245,166,35,.35)',
                }}
                onMouseOver={e => e.target.style.transform = 'translateY(-1px)'}
                onMouseOut={e => e.target.style.transform = 'translateY(0)'}
              >
                Accept All 🍪
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── Helper export — check if user consented ────────────────────
export function hasAnalyticsConsent() {
  try {
    const c = JSON.parse(localStorage.getItem(COOKIE_KEY) || '{}')
    return c.analytics === true
  } catch { return false }
}
