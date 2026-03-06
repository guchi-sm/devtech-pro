import AIChatbox from './components/AIChatbox'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Navbar from './components/Navbar'
import CustomCursor from './components/CustomCursor'
import ScrollProgress from './components/ScrollProgress'
import Preloader from './components/Preloader'
import WhatsAppButton from './components/WhatsAppButton'
import MobileCTA from './components/MobileCTA'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Portfolio from './pages/Portfolio'
import Contact from './pages/Contact'
import Demo from './pages/Demo'
import Blog from './pages/Blog'
import ScrollToTop from './components/ScrollToTop'
import { useReveal } from './hooks/useAnimations'
import './styles/animations.css'

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function App() {
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  useReveal()

  return (
    <>
      {/* ── Preloader ── */}
      <AnimatePresence>
        {loading && <Preloader onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {/* ── Main App ── */}
      <div
        className="noise-overlay min-h-screen"
        style={{
          background: 'var(--bg)',
          overflow: 'visible',
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.4s ease',
          /* Extra bottom padding on mobile so content isn't hidden behind sticky CTA bar */
          paddingBottom: 0,
        }}
      >
        <CustomCursor />
        <ScrollProgress />
        <Navbar />

        <main className="relative z-10">
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/"          element={<PageTransition><Home /></PageTransition>} />
              <Route path="/about"     element={<PageTransition><About /></PageTransition>} />
              <Route path="/services"  element={<PageTransition><Services /></PageTransition>} />
              <Route path="/portfolio" element={<PageTransition><Portfolio /></PageTransition>} />
              <Route path="/contact"   element={<PageTransition><Contact /></PageTransition>} />
              <Route path="/demo"      element={<PageTransition><Demo /></PageTransition>} />
              <Route path="/blog"      element={<PageTransition><Blog /></PageTransition>} />
              <Route path="*" element={
                <PageTransition>
                  <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)', paddingTop: '72px' }}>
                    <div className="text-center">
                      <div className="font-display text-[10rem] leading-none" style={{ color: 'var(--border)' }}>404</div>
                      <p className="font-mono text-xs tracking-[0.2em] uppercase mb-8" style={{ color: 'var(--text-muted)' }}>Page not found</p>
                      <a href="/" className="btn btn-primary">Back Home →</a>
                    </div>
                  </div>
                </PageTransition>
              } />
            </Routes>
          </AnimatePresence>
        </main>

        <ScrollToTop />
        <WhatsAppButton />
        <AIChatbox />

        {/* ── Mobile sticky CTA (WhatsApp + Get Quote) ── */}
        <MobileCTA />
      </div>
    </>
  )
}
