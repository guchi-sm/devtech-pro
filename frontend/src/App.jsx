import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import CustomCursor from './components/CustomCursor'
import ScrollProgress from './components/ScrollProgress'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Portfolio from './pages/Portfolio'
import Contact from './pages/Contact'

// Page transition wrapper
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <div className="noise-overlay min-h-screen" style={{ background: 'var(--bg)' }}>
      <CustomCursor />
      <ScrollProgress />
      <Navbar />

      <main className="relative z-10">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
            <Route path="/portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
            {/* 404 */}
            <Route path="*" element={
              <PageTransition>
                <div className="min-h-screen pt-[68px] flex items-center justify-center" style={{ background: 'var(--bg)' }}>
                  <div className="text-center">
                    <div className="font-display text-[12rem] leading-none" style={{ color: 'var(--border)' }}>404</div>
                    <p className="font-mono text-xs tracking-[0.2em] uppercase mb-8" style={{ color: 'var(--text-muted)' }}>
                      Page not found
                    </p>
                    <a href="/" className="btn btn-primary">Back Home →</a>
                  </div>
                </div>
              </PageTransition>
            } />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  )
}
