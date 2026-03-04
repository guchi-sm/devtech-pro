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

  const navHeight = scrolled ? '60px' : '72px'  // was 54px / 66px

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[1000] border-b transition-all duration-300"
        style={{
          background: 'var(--bg-nav)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderColor: 'var(--border)',
          height: navHeight,
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 h-full flex items-center justify-between gap-6">

          {/* ── Logo ── */}
          <NavLink to="/" aria-label="DevTech Home" className="flex-shrink-0">
            <img
              src={logo}
              alt="DevTech"
              style={{
  height: scrolled ? '48px' : '56px',   // was 36px / 44px
  width: 'auto',
  objectFit: 'contain',
  transition: 'height 0.3s ease',
}}
            />
          </NavLink>

          {/* ── Desktop Nav Links ── */}
          <ul className="hidden lg:flex items-center gap-0.5 list-none flex-1 justify-center">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `relative font-mono text-[0.75rem] tracking-[0.12em] uppercase px-3.5 py-2 rounded transition-colors duration-200 whitespace-nowrap ` +
                    (isActive ? '' : 'text-muted-custom hover:text-custom')
                  }
                  style={({ isActive }) =>
                    isActive ? { color: 'var(--accent)' } : {}
                  }
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute bottom-0 left-3.5 right-3.5 h-px"
                          style={{ background: 'var(--accent)' }}
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
              className="btn btn-primary !text-[0.68rem] !py-2 !px-4"
            >
              Hire Me →
            </NavLink>
          </div>

          {/* ── Mobile Controls ── */}
          <div className="flex lg:hidden items-center gap-3">
            <ThemeToggle showLabel={false} />
            <button
              onClick={() => setMenuOpen(p => !p)}
              className="flex flex-col gap-1.5 p-1.5 rounded"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span
                className={`block w-6 h-px transition-transform duration-300 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`}
                style={{ background: 'var(--text)' }}
              />
              <span
                className={`block w-6 h-px transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`}
                style={{ background: 'var(--text)' }}
              />
              <span
                className={`block w-6 h-px transition-transform duration-300 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
                style={{ background: 'var(--text)' }}
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
            className="fixed left-0 right-0 z-[999] flex flex-col py-4 px-6 border-b lg:hidden"
            style={{
              top: navHeight,
              background: 'var(--bg-nav)',
              backdropFilter: 'blur(20px)',
              borderColor: 'var(--border)',
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
                  className={({ isActive }) =>
                    `block font-mono text-[0.75rem] tracking-[0.14em] uppercase py-3 border-b transition-colors ` +
                    (isActive ? '' : 'text-muted-custom hover:text-custom')
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { color: 'var(--accent)', borderColor: 'var(--border)' }
                      : { borderColor: 'var(--border)' }
                  }
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
                className="btn btn-primary w-full justify-center !text-[0.72rem]"
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
