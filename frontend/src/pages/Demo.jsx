// src/pages/Demo.jsx
// Replaces the old NetworkTopologyVisualizer demo
// Route: /demo  (already set in App.jsx — no changes needed there)

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import NetworkTopology from '../components/NetworkTopologyVisualizer'

export default function Demo() {
  const navigate = useNavigate()

  // Hide the site Navbar & ScrollProgress while on this page
  useEffect(() => {
    const navbar  = document.querySelector('nav, header:not(.nvp-topbar)')
    const scroll  = document.getElementById('scroll-progress')

    if (navbar) navbar.style.display = 'none'
    if (scroll) scroll.style.display = 'none'

    return () => {
      if (navbar) navbar.style.display = ''
      if (scroll) scroll.style.display = ''
    }
  }, [])

  return (
    <>
      {/* Back-to-site button — sits above the NetViz canvas */}
      <button
        onClick={() => navigate(-1)}
        style={{
          position:   'fixed',
          top:        '68px',        // below nvp-topbar (54px) + gap
          left:       '16px',
          zIndex:     9000,
          display:    'flex',
          alignItems: 'center',
          gap:        '7px',
          padding:    '6px 14px',
          background: 'rgba(5,14,28,0.92)',
          border:     '1px solid rgba(0,229,255,0.2)',
          borderRadius: '7px',
          color:      'rgba(255,255,255,0.55)',
          fontFamily: "'Share Tech Mono', monospace",
          fontSize:   '10px',
          letterSpacing: '1px',
          cursor:     'pointer',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color       = '#00e5ff'
          e.currentTarget.style.borderColor = 'rgba(0,229,255,0.45)'
          e.currentTarget.style.background  = 'rgba(0,229,255,0.08)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color       = 'rgba(255,255,255,0.55)'
          e.currentTarget.style.borderColor = 'rgba(0,229,255,0.2)'
          e.currentTarget.style.background  = 'rgba(5,14,28,0.92)'
        }}
      >
        ← BACK TO SITE
      </button>

      <NetworkTopology />
    </>
  )
}
