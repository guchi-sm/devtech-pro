import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WA_NUMBER = '254790078363'
const WA_MESSAGE = encodeURIComponent("Hi! I found you on DevTech Pro. I'd like to discuss a project.")

export default function WhatsAppButton() {
  const [visible, setVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [showBubble, setShowBubble] = useState(false)

  // Show button after 2s, pop chat bubble at 5s, hide bubble at 10s
  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 2000)
    const t2 = setTimeout(() => setShowBubble(true), 5000)
    const t3 = setTimeout(() => setShowBubble(false), 10000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <>
      <style>{`
        @keyframes waPulse1 {
          0%   { transform: scale(1); opacity: 0.55; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes waPulse2 {
          0%   { transform: scale(1); opacity: 0.35; }
          100% { transform: scale(3.0); opacity: 0; }
        }
      `}</style>

      {/* Fixed container — right side, above AI chatbox (which is at bottom:80px) and scroll arrow (bottom:32px) */}
      {/* AI chatbox toggle is at bottom:80px right:24px — so we go bottom:170px */}
      <div style={{
        position: 'fixed',
        bottom: '170px',
        right: '24px',
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.6rem',
      }}>

        {/* Chat bubble — pops to the LEFT of the button */}
        <AnimatePresence>
          {showBubble && (
            <motion.div
              initial={{ opacity: 0, x: 16, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px 12px 0 12px',
                padding: '0.75rem 1rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.14)',
                maxWidth: 190,
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowBubble(false)}
                style={{ position: 'absolute', top: 5, right: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#9eaab8', fontSize: 14, lineHeight: 1 }}
              >×</button>
              <p style={{ fontSize: '0.78rem', color: '#1c2d3f', lineHeight: 1.5, margin: 0, paddingRight: 10 }}>
                👋 <strong>Hey!</strong> Need IT help or a quote? Chat now!
              </p>
              <p style={{ fontSize: '0.62rem', color: '#25D366', margin: '0.4rem 0 0', fontFamily: 'monospace', fontWeight: 600 }}>
                ● Online — replies in minutes
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WhatsApp button */}
        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              style={{ position: 'relative' }}
            >
              {/* Pulse rings */}
              <span style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: '#25D366',
                animation: 'waPulse1 2.2s ease-out infinite',
                zIndex: -1,
              }} />
              <span style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: '#25D366',
                animation: 'waPulse2 2.2s ease-out infinite 0.5s',
                zIndex: -1,
              }} />

              <a
                href={`https://wa.me/${WA_NUMBER}?text=${WA_MESSAGE}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                onMouseEnter={() => { setShowTooltip(true); setShowBubble(false) }}
                onMouseLeave={() => setShowTooltip(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: '#25D366',
                  boxShadow: '0 4px 20px rgba(37,211,102,0.5)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  textDecoration: 'none',
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'scale(1.12)'
                  e.currentTarget.style.boxShadow = '0 6px 28px rgba(37,211,102,0.65)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.5)'
                }}
              >
                <svg viewBox="0 0 24 24" fill="white" style={{ width: 28, height: 28 }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>

              {/* Tooltip — appears to the left */}
              <AnimatePresence>
                {showTooltip && (
                  <motion.div
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      position: 'absolute',
                      right: 'calc(100% + 12px)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: '#1c2d3f',
                      color: '#fff',
                      fontSize: '0.68rem',
                      fontFamily: 'monospace',
                      letterSpacing: '0.08em',
                      whiteSpace: 'nowrap',
                      padding: '0.4rem 0.8rem',
                      borderRadius: 4,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    }}
                  >
                    Chat on WhatsApp
                    {/* Arrow pointing right */}
                    <span style={{
                      position: 'absolute', right: -5, top: '50%',
                      transform: 'translateY(-50%)',
                      width: 0, height: 0,
                      borderTop: '5px solid transparent',
                      borderBottom: '5px solid transparent',
                      borderLeft: '5px solid #1c2d3f',
                    }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
