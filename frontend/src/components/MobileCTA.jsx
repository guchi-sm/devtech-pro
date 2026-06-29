import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function MobileCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 200)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="mobile-cta-bar"
      style={{
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Single CTA — Get a Quote only */}
      <Link
        to="/contact"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.6rem', padding: '1rem',
          background: '#f5a623',
          color: '#1c2d3f',
          fontFamily: 'monospace', fontSize: '0.72rem',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          fontWeight: 800, textDecoration: 'none',
          width: '100%',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#e09510'}
        onMouseLeave={e => e.currentTarget.style.background = '#f5a623'}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        Get a Free Quote
      </Link>
    </div>
  )
}
