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

  useEffect(() => setMenuOpen(false), [location])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navHeight = scrolled ? '58px' : '72px'

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
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 h-full flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <NavLink to="/" aria-label="DevTech Home" className="flex-shrink-0">
            <img
              src={logo}
              alt="DevTech"
              style={{
                height: scrolled ? '42px' : '54px',
                width: 'auto',
                objectFit: 'contain',
                transition: 'height 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          </NavLink>

          {/* ── Desktop Nav Links (show from md=768px) ── */}
          <ul className="hidden md:flex items-center gap-0 list-none flex-1 justify-center">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `relative font-mono text-[0.72rem] tracking-[0.12em] uppercase px-3 py-2 rounded transition-colors duration-200 whitespace-nowrap ` +
                    (isActive ? '' : 'hover:text-white')
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { color: '#f5a623' }
                      : { color: 'rgba(255,255,255,0.65)' }
                  }
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute bottom-0 left-3 right-3 h-px"
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
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <ThemeToggle />
            <NavLink
              to="/contact"
              style={{
                background: '#f5a623',
                color: '#1c2d3f',
                fontWeight: 700,
                fontSize: '0.68rem',
                padding: '0.5rem 1.1rem',
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

          {/* ── Mobile Controls ── */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeToggle showLabel={false} />
            <button
              onClick={() => setMenuOpen(p => !p)}
              className="flex flex-col gap-1.5 p-2 rounded"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <span
                className={`block w-5 h-0.5 transition-transform duration-300 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`}
                style={{ background: '#ffffff' }}
              />
              <span
                className={`block w-5 h-0.5 transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`}
                style={{ background: '#ffffff' }}
              />
              <span
                className={`block w-5 h-0.5 transition-transform duration-300 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
                style={{ background: '#ffffff' }}
              />
            </button>
          </div>

        </div>
      </nav>

      {/* ── Mobile Dropdown Menu ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-0 right-0 z-[999] flex flex-col py-4 px-6 border-b md:hidden"
            style={{
              top: navHeight,
              background: '#0a1128',
              backdropFilter: 'blur(20px)',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            {NAV_LINKS.map(({ to, label }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <NavLink
                  to={to}
                  end={to === '/'}
                  className="block font-mono text-[0.75rem] tracking-[0.14em] uppercase py-3.5 border-b transition-colors"
                  style={({ isActive }) => ({
                    color: isActive ? '#f5a623' : 'rgba(255,255,255,0.7)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  })}
                >
                  {label}
                </NavLink>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="pt-4"
            >
              <NavLink
                to="/contact"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: '#f5a623',
                  color: '#1c2d3f',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  padding: '0.85rem',
                  borderRadius: 4,
                  textDecoration: 'none',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Hire Me →
              </NavLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
