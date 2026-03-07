import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COOKIE_KEY = 'devtech_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible]         = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [isMobile, setIsMobile]       = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY)
    if (!consent) {
      const t = setTimeout(() => setVisible(true), 2500)
      return () => clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  function accept() {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ analytics: true, ts: Date.now() }))
    setVisible(false)
  }
  function decline() {
    localStorage.setItem(COOKIE_KEY, JSON.stringify({ analytics: false, ts: Date.now() }))
    setVisible(false)
  }

  // MobileCTA bar is 58px tall — cookie banner sits directly above it
  const MOBILE_CTA_HEIGHT = 58

  return (
    <AnimatePresence>
      {visible && (
        <>
          {isMobile ? (
            /* ── MOBILE: full-width bar sitting above the WhatsApp/CTA bar ── */
            <motion.div
              key="cookie-mobile"
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              style={{
                position: 'fixed',
                bottom: MOBILE_CTA_HEIGHT,   // sits on top of MobileCTA bar
                left: 0, right: 0,
                zIndex: 8800,
                background: 'rgba(7, 14, 30, 0.98)',
                borderTop: '2px solid rgba(245,166,35,0.4)',
                padding: '0.9rem 1rem 1rem',
                boxShadow: '0 -6px 30px rgba(0,0,0,0.5)',
              }}
            >
              {/* Message row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '1.2rem', flexShrink: 0, lineHeight: 1.3 }}>🍪</span>
                <p style={{ color: '#d1dce8', fontSize: '0.8rem', lineHeight: 1.55, margin: 0, flex: 1 }}>
                  We use cookies to analyse site traffic and improve your experience.{' '}
                  <button
                    onClick={() => setShowDetails(v => !v)}
                    style={{ color: '#f5a623', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline', padding: 0, display: 'inline' }}
                  >
                    {showDetails ? 'Less' : 'More info'}
                  </button>
                </p>
              </div>

              {/* Details — collapsible */}
              {showDetails && (
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem',
                  marginBottom: '0.85rem',
                }}>
                  {[
                    { icon: '✅', label: 'Essential', desc: 'Site functionality', always: true },
                    { icon: '📊', label: 'Analytics', desc: 'Traffic & device data', always: false },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: 'rgba(255,255,255,0.06)', borderRadius: '8px',
                      padding: '0.55rem 0.7rem',
                      border: '1px solid rgba(255,255,255,0.09)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                        <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>{item.icon} {item.label}</span>
                        <span style={{
                          fontSize: '0.52rem', fontFamily: 'monospace',
                          color: item.always ? '#22c55e' : '#f5a623',
                          background: item.always ? 'rgba(34,197,94,0.15)' : 'rgba(245,166,35,0.15)',
                          padding: '0.1rem 0.35rem', borderRadius: '10px',
                        }}>
                          {item.always ? 'ON' : 'OPT'}
                        </span>
                      </div>
                      <p style={{ color: 'rgba(209,220,232,0.55)', fontSize: '0.68rem', margin: 0 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons — full width, easy tap targets */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
                <button
                  onClick={decline}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(209,220,232,0.8)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '0.75rem 0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                    minHeight: '44px',  // accessible touch target
                  }}
                >
                  Decline
                </button>
                <button
                  onClick={accept}
                  style={{
                    background: 'linear-gradient(135deg, #f5a623, #e8940f)',
                    color: '#1c2d3f',
                    border: 'none',
                    padding: '0.75rem 0.5rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    fontWeight: 800,
                    minHeight: '44px',  // accessible touch target
                    boxShadow: '0 4px 16px rgba(245,166,35,0.4)',
                  }}
                >
                  Accept All 🍪
                </button>
              </div>
            </motion.div>
          ) : (
            /* ── DESKTOP: floating pill centred above viewport bottom ── */
            <motion.div
              key="cookie-desktop"
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed', bottom: '1.75rem', left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9000,
                width: '100%', maxWidth: '680px',
                padding: '0 1.5rem',
              }}
            >
              <div style={{
                background: 'rgba(8, 16, 34, 0.94)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(245,166,35,0.28)',
                borderRadius: '16px',
                padding: '1.25rem 1.5rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
              }}>
                {/* Row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: showDetails ? '1rem' : 0 }}>
                  <span style={{ fontSize: '1.5rem', flexShrink: 0, marginTop: '2px' }}>🍪</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#e2e8f5', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                      We use cookies to analyse site traffic and improve your experience.
                      {' '}<button
                        onClick={() => setShowDetails(v => !v)}
                        style={{ color: '#f5a623', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.88rem', textDecoration: 'underline', padding: 0 }}
                      >
                        {showDetails ? 'Hide details' : 'Learn more'}
                      </button>
                    </p>
                  </div>
                </div>

                {/* Details */}
                <AnimatePresence>
                  {showDetails && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        paddingTop: '1rem', marginBottom: '1rem',
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
                      }}>
                        {[
                          { icon: '✅', label: 'Essential', desc: 'Required for the site to work', always: true },
                          { icon: '📊', label: 'Analytics', desc: 'Page views, device & country data', always: false },
                        ].map(item => (
                          <div key={item.label} style={{
                            background: 'rgba(255,255,255,0.05)', borderRadius: '8px',
                            padding: '0.75rem', border: '1px solid rgba(255,255,255,0.08)',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                              <span style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}>{item.icon} {item.label}</span>
                              <span style={{
                                fontSize: '0.6rem', fontFamily: 'monospace', letterSpacing: '0.1em',
                                color: item.always ? '#22c55e' : '#f5a623',
                                background: item.always ? 'rgba(34,197,94,0.15)' : 'rgba(245,166,35,0.15)',
                                padding: '0.15rem 0.5rem', borderRadius: '20px',
                              }}>
                                {item.always ? 'ALWAYS ON' : 'OPTIONAL'}
                              </span>
                            </div>
                            <p style={{ color: 'rgba(226,232,245,0.65)', fontSize: '0.75rem', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: showDetails ? 0 : '1rem' }}>
                  <button
                    onClick={decline}
                    style={{
                      background: 'transparent', color: 'rgba(226,232,245,0.65)',
                      border: '1px solid rgba(255,255,255,0.18)', padding: '0.5rem 1.2rem',
                      borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600,
                    }}
                  >Decline</button>
                  <button
                    onClick={accept}
                    style={{
                      background: 'linear-gradient(135deg, #f5a623, #e8940f)',
                      color: '#1c2d3f', border: 'none', padding: '0.5rem 1.4rem',
                      borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer',
                      fontWeight: 800, boxShadow: '0 4px 15px rgba(245,166,35,0.35)',
                    }}
                  >Accept All 🍪</button>
                </div>
              </div>
            </motion.div>
          )}
        </>
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
