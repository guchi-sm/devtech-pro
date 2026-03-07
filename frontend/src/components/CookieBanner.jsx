import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COOKIE_KEY = 'devtech_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible]         = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isMobile, setIsMobile]       = useState(false)
  const [ctaHeight, setCtaHeight]     = useState(0)

  // Measure the actual MobileCTA bar height so we sit perfectly above it
  useEffect(() => {
    function measureCTA() {
      const bar = document.querySelector('.mobile-cta-bar')
      if (bar) {
        const h = bar.getBoundingClientRect().height
        setCtaHeight(h > 0 ? h : 0)
      }
    }
    measureCTA()
    // Re-measure after a short delay (bar may animate in)
    const t = setTimeout(measureCTA, 600)
    window.addEventListener('resize', measureCTA)
    return () => { clearTimeout(t); window.removeEventListener('resize', measureCTA) }
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY)
    if (!consent) {
      const t = setTimeout(() => setVisible(true), 2500)
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
        isMobile ? (
          /* ── MOBILE: full-width, sits directly above MobileCTA bar ── */
          <motion.div
            key="cookie-mobile"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'fixed',
              bottom: ctaHeight,        // measured real height of .mobile-cta-bar
              left: 0,
              right: 0,
              zIndex: 950,              // higher than MobileCTA's z-index: 900
              background: '#070e1e',
              borderTop: '2px solid rgba(245,166,35,0.5)',
              padding: '0.85rem 1rem 0.9rem',
              boxShadow: '0 -4px 24px rgba(0,0,0,0.6)',
            }}
          >
            {/* Text */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.8rem' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '1px' }}>🍪</span>
              <p style={{ color: '#c8d8ec', fontSize: '0.79rem', lineHeight: 1.5, margin: 0, flex: 1 }}>
                We use cookies to analyse traffic &amp; improve your experience.{' '}
                <button
                  onClick={() => setShowDetails(v => !v)}
                  style={{ color: '#f5a623', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.79rem', textDecoration: 'underline', padding: 0 }}
                >
                  {showDetails ? 'Less' : 'More info'}
                </button>
              </p>
            </div>

            {/* Collapsible details */}
            {showDetails && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem', marginBottom: '0.8rem' }}>
                {[
                  { icon: '✅', label: 'Essential', desc: 'Site functionality', always: true },
                  { icon: '📊', label: 'Analytics', desc: 'Traffic & device data', always: false },
                ].map(item => (
                  <div key={item.label} style={{
                    background: 'rgba(255,255,255,0.06)', borderRadius: '7px',
                    padding: '0.5rem 0.65rem', border: '1px solid rgba(255,255,255,0.09)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.1rem' }}>
                      <span style={{ color: '#fff', fontSize: '0.73rem', fontWeight: 700 }}>{item.icon} {item.label}</span>
                      <span style={{
                        fontSize: '0.5rem', fontFamily: 'monospace',
                        color: item.always ? '#22c55e' : '#f5a623',
                        background: item.always ? 'rgba(34,197,94,0.15)' : 'rgba(245,166,35,0.15)',
                        padding: '0.08rem 0.3rem', borderRadius: '8px',
                      }}>
                        {item.always ? 'ON' : 'OPT'}
                      </span>
                    </div>
                    <p style={{ color: 'rgba(200,216,236,0.5)', fontSize: '0.65rem', margin: 0 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Buttons — 44px min height for easy tapping */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
              <button
                onClick={decline}
                style={{
                  minHeight: '44px', background: 'rgba(255,255,255,0.07)',
                  color: 'rgba(200,216,236,0.75)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600,
                  cursor: 'pointer', padding: '0.7rem 0.4rem',
                }}
              >Decline</button>
              <button
                onClick={accept}
                style={{
                  minHeight: '44px',
                  background: 'linear-gradient(135deg, #f5a623 0%, #e8940f 100%)',
                  color: '#1a2640', border: 'none', borderRadius: '8px',
                  fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                  padding: '0.7rem 0.5rem',
                  boxShadow: '0 4px 18px rgba(245,166,35,0.45)',
                  letterSpacing: '0.02em',
                }}
              >Accept All 🍪</button>
            </div>
          </motion.div>
        ) : (
          /* ── DESKTOP: floating pill ── */
          <motion.div
            key="cookie-desktop"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed', bottom: '1.75rem', left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9000, width: '100%', maxWidth: '680px', padding: '0 1.5rem',
            }}
          >
            <div style={{
              background: 'rgba(7, 14, 34, 0.95)',
              backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(245,166,35,0.28)', borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: showDetails ? '1rem' : 0 }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0, marginTop: '2px' }}>🍪</span>
                <p style={{ color: '#e2e8f5', fontSize: '0.88rem', lineHeight: 1.6, margin: 0, flex: 1 }}>
                  We use cookies to analyse site traffic and improve your experience.{' '}
                  <button onClick={() => setShowDetails(v => !v)}
                    style={{ color: '#f5a623', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.88rem', textDecoration: 'underline', padding: 0 }}>
                    {showDetails ? 'Hide details' : 'Learn more'}
                  </button>
                </p>
              </div>

              <AnimatePresence>
                {showDetails && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: 'hidden' }}>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginBottom: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {[
                        { icon: '✅', label: 'Essential', desc: 'Required for the site to work', always: true },
                        { icon: '📊', label: 'Analytics', desc: 'Page views, device & country data', always: false },
                      ].map(item => (
                        <div key={item.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                            <span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}>{item.icon} {item.label}</span>
                            <span style={{ fontSize: '0.6rem', fontFamily: 'monospace', color: item.always ? '#22c55e' : '#f5a623', background: item.always ? 'rgba(34,197,94,0.15)' : 'rgba(245,166,35,0.15)', padding: '0.15rem 0.5rem', borderRadius: '20px' }}>
                              {item.always ? 'ALWAYS ON' : 'OPTIONAL'}
                            </span>
                          </div>
                          <p style={{ color: 'rgba(226,232,245,0.6)', fontSize: '0.75rem', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: showDetails ? 0 : '1rem' }}>
                <button onClick={decline} style={{ background: 'transparent', color: 'rgba(226,232,245,0.65)', border: '1px solid rgba(255,255,255,0.18)', padding: '0.5rem 1.2rem', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600 }}>
                  Decline
                </button>
                <button onClick={accept} style={{ background: 'linear-gradient(135deg, #f5a623, #e8940f)', color: '#1c2d3f', border: 'none', padding: '0.5rem 1.4rem', borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 800, boxShadow: '0 4px 15px rgba(245,166,35,0.35)' }}>
                  Accept All 🍪
                </button>
              </div>
            </div>
          </motion.div>
        )
      )}
    </AnimatePresence>
  )
}

export function hasAnalyticsConsent() {
  try {
    const c = JSON.parse(localStorage.getItem(COOKIE_KEY) || '{}')
    return c.analytics === true
  } catch { return false }
}
