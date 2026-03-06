import logo from '../assets/devtech-logo.png'
import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from './ThemeToggle'

const NAV_LINKS = [
  { to: '/',          label: 'Home' },
  { to: '/about',     label: 'About' },
  { to: '/services',  label: 'Services' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/demo',      label: 'Demo ⬡' },
  { to: '/contact',   label: 'Contact' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  // Close menu on route change
  useEffect(() => setMenuOpen(false), [location])

  // Close menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMenuOpen(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navHeight = scrolled ? '58px' : '70px'

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[1000] border-b transition-all duration-300"
        style={{
          background: '#0a1128',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderColor: 'rgba(255,255,255,0.08)',
          height: navHeight,
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <NavLink to="/" aria-label="DevTech Home" className="flex-shrink-0">
            <img
              src={logo}
              alt="DevTech"
              style={{
                height: scrolled ? '38px' : '48px',
                width: 'auto',
                objectFit: 'contain',
                transition: 'height 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </NavLink>

          {/* ── Desktop Nav Links — lg and above (1024px+) only ── */}
          <ul className="hidden lg:flex items-center gap-0 list-none flex-1 justify-center">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `relative font-mono text-[0.72rem] tracking-[0.1em] uppercase px-3.5 py-2 transition-colors duration-200 whitespace-nowrap ` +
                    (isActive ? '' : 'hover:text-white')
                  }
                  style={({ isActive }) =>
                    isActive ? { color: '#f5a623' } : { color: 'rgba(255,255,255,0.65)' }
                  }
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute bottom-0 left-3.5 right-3.5 h-px"
                          style={{ background: '#f5a623' }}
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* ── Desktop Right: Theme + CTA ── */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />
            <NavLink
              to="/contact"
              style={{
                background: '#f5a623',
                color: '#1c2d3f',
                fontWeight: 700,
                fontSize: '0.68rem',
                padding: '0.5rem 1.2rem',
                borderRadius: 4,
                textDecoration: 'none',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e09510' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f5a623' }}
            >
              Hire Me →
            </NavLink>
          </div>

          {/* ── Mobile Controls — below lg (everything under 1024px) ── */}
          <div className="flex lg:hidden items-center gap-2 flex-shrink-0">
            <ThemeToggle showLabel={false} />

            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(p => !p)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '5px',
                width: '44px',
                height: '44px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: menuOpen ? 'rgba(245,166,35,0.12)' : 'rgba(255,255,255,0.06)',
                cursor: 'pointer',
                transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <span style={{
                display: 'block', width: '20px', height: '2px',
                background: menuOpen ? '#f5a623' : '#ffffff',
                borderRadius: '2px',
                transition: 'transform 0.3s, background 0.2s',
                transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
              }} />
              <span style={{
                display: 'block', width: '20px', height: '2px',
                background: '#ffffff',
                borderRadius: '2px',
                transition: 'opacity 0.3s',
                opacity: menuOpen ? 0 : 1,
              }} />
              <span style={{
                display: 'block', width: '20px', height: '2px',
                background: menuOpen ? '#f5a623' : '#ffffff',
                borderRadius: '2px',
                transition: 'transform 0.3s, background 0.2s',
                transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
              }} />
            </button>
          </div>

        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Dark backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.55)',
                zIndex: 998,
              }}
            />

            {/* Slide-down panel */}
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden"
              style={{
                position: 'fixed',
                top: navHeight,
                left: 0,
                right: 0,
                zIndex: 999,
                background: '#0a1128',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.45)',
              }}
            >
              {/* Links list */}
              <nav style={{ padding: '0.5rem 0' }}>
                {NAV_LINKS.map(({ to, label }, i) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.055, duration: 0.22 }}
                  >
                    <NavLink
                      to={to}
                      end={to === '/'}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.5rem',
                        fontFamily: 'monospace',
                        fontSize: '0.8rem',
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#f5a623' : 'rgba(255,255,255,0.75)',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        textDecoration: 'none',
                        background: isActive ? 'rgba(245,166,35,0.06)' : 'transparent',
                        transition: 'background 0.2s',
                      })}
                    >
                      {({ isActive }) => (
                        <>
                          <span>{label}</span>
                          {isActive
                            ? <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f5a623' }} />
                            : <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>›</span>
                          }
                        </>
                      )}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>

              {/* CTA button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.38 }}
                style={{ padding: '1rem 1.5rem 1.5rem' }}
              >
                <NavLink
                  to="/contact"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    background: '#f5a623',
                    color: '#1c2d3f',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    padding: '1rem',
                    borderRadius: 6,
                    textDecoration: 'none',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}
                >
                  Hire Me →
                </NavLink>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
