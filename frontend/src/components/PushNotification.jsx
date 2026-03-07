import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API = `${import.meta.env.VITE_API_URL || 'https://devtech-pro-api-production.up.railway.app'}/api/push`
const PUSH_KEY = 'devtech_push_asked'

// ── VAPID public key — replace with yours from web-push ────────
// Run: npx web-push generate-vapid-keys  then set in Railway env
const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

export default function PushNotification() {
  const [show, setShow]       = useState(false)
  const [state, setState]     = useState('idle')  // idle | loading | success | error | unsupported

  useEffect(() => {
    // Only show if: browser supports it, not asked before, has VAPID key
    const asked = localStorage.getItem(PUSH_KEY)
    if (asked || !('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (!VAPID_PUBLIC) return  // no VAPID key configured

    // Show after 15 seconds — user is engaged by then
    const t = setTimeout(() => setShow(true), 15000)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    localStorage.setItem(PUSH_KEY, 'dismissed')
    setShow(false)
  }

  async function subscribe() {
    setState('loading')
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      })
      await fetch(`${API}/subscribe`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(sub),
      })
      setState('success')
      localStorage.setItem(PUSH_KEY, 'subscribed')
      setTimeout(() => setShow(false), 2500)
    } catch (err) {
      console.error('Push subscribe error:', err)
      setState('error')
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 120, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          style={{
            position: 'fixed', bottom: '5.5rem', right: '1.5rem',
            zIndex: 8500, width: '300px',
          }}
        >
          <div style={{
            background: 'rgba(10, 22, 40, 0.95)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(245, 166, 35, 0.3)',
            borderRadius: '16px',
            padding: '1.25rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(245,166,35,0.08)',
          }}>
            {/* Close */}
            <button
              onClick={dismiss}
              style={{
                position: 'absolute', top: '10px', right: '12px',
                background: 'none', border: 'none', color: 'rgba(226,232,245,.4)',
                cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '4px',
              }}
            >✕</button>

            {state === 'success' ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ textAlign: 'center', padding: '.5rem 0' }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>🎉</div>
                <p style={{ color: '#22c55e', fontWeight: 700, fontSize: '.95rem', margin: 0 }}>You're subscribed!</p>
                <p style={{ color: 'rgba(226,232,245,.6)', fontSize: '.78rem', marginTop: '.3rem' }}>We'll notify you of new resources & tips.</p>
              </motion.div>
            ) : state === 'error' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '.5rem' }}>😕</div>
                <p style={{ color: '#ef4444', fontSize: '.85rem', margin: 0 }}>Couldn't enable notifications.</p>
                <p style={{ color: 'rgba(226,232,245,.5)', fontSize: '.75rem', marginTop: '.25rem' }}>Check your browser settings and try again.</p>
                <button onClick={dismiss} style={{ marginTop: '.75rem', color: 'rgba(226,232,245,.5)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '.8rem', textDecoration: 'underline' }}>Dismiss</button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.85rem' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                    background: 'linear-gradient(135deg, rgba(245,166,35,.2), rgba(245,166,35,.05))',
                    border: '1px solid rgba(245,166,35,.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                  }}>🔔</div>
                  <div>
                    <p style={{ color: '#e2e8f5', fontWeight: 700, fontSize: '.9rem', margin: 0 }}>Stay in the loop</p>
                    <p style={{ color: 'rgba(226,232,245,.55)', fontSize: '.72rem', margin: 0, marginTop: '.15rem' }}>New resources, IT tips & updates</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '.5rem' }}>
                  <button
                    onClick={dismiss}
                    style={{
                      flex: 1, padding: '.5rem', background: 'rgba(255,255,255,.06)',
                      border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px',
                      color: 'rgba(226,232,245,.6)', fontSize: '.78rem', cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >Not now</button>
                  <button
                    onClick={subscribe}
                    disabled={state === 'loading'}
                    style={{
                      flex: 2, padding: '.5rem',
                      background: 'linear-gradient(135deg, #f5a623, #e8940f)',
                      border: 'none', borderRadius: '8px',
                      color: '#1c2d3f', fontSize: '.82rem', cursor: 'pointer',
                      fontWeight: 800, boxShadow: '0 4px 15px rgba(245,166,35,.3)',
                      opacity: state === 'loading' ? .7 : 1,
                    }}
                  >
                    {state === 'loading' ? '...' : '🔔 Enable'}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
