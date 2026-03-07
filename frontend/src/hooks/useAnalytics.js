import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

const API = `${import.meta.env.VITE_API_URL || 'https://devtech-pro-api-production.up.railway.app'}/api/analytics`

// ── Generate or retrieve anonymous session ID ──────────────────
function getSessionId() {
  let id = sessionStorage.getItem('_dts')
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('_dts', id)
  }
  return id
}

// ── Page title map ─────────────────────────────────────────────
const PAGE_TITLES = {
  '/':          'Home',
  '/about':     'About',
  '/services':  'Services',
  '/portfolio': 'Portfolio',
  '/blog':      'Blog',
  '/resources': 'Resources',
  '/contact':   'Contact',
}

export function useAnalytics() {
  const location   = useLocation()
  const entryTime  = useRef(Date.now())
  const lastPage   = useRef(null)

  useEffect(() => {
    const page      = location.pathname
    const sessionId = getSessionId()
    const title     = PAGE_TITLES[page] || page

    // Track time spent on previous page before navigating away
    if (lastPage.current && lastPage.current !== page) {
      const duration = Math.round((Date.now() - entryTime.current) / 1000)
      navigator.sendBeacon?.(API, JSON.stringify({
        page: lastPage.current, duration, sessionId,
      }))
    }

    entryTime.current = Date.now()
    lastPage.current  = page

    // Track this page view
    fetch(API, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page, title,
        referrer:  document.referrer,
        sessionId,
      }),
    }).catch(() => {}) // silent fail — never break the UX

    // Track duration when user leaves
    const handleUnload = () => {
      const duration = Math.round((Date.now() - entryTime.current) / 1000)
      navigator.sendBeacon?.(API, JSON.stringify({ page, duration, sessionId }))
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [location.pathname])
}
