import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../assets/devtech-logo.png'

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // Animate progress bar from 0 to 100
    const duration = 1800 // ms
    const interval = 18
    const steps = duration / interval
    let current = 0

    const timer = setInterval(() => {
      current += 1
      const eased = Math.min(100, Math.round((current / steps) * 100))
      setProgress(eased)

      if (current >= steps) {
        clearInterval(timer)
        // Small pause at 100% before exiting
        setTimeout(() => {
          setDone(true)
          setTimeout(() => onComplete?.(), 600)
        }, 300)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: '#070810',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
          }}
        >
          {/* Animated background glow */}
          <div style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,166,35,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <img
              src={logo}
              alt="DevTech"
              style={{ height: 72, width: 'auto', objectFit: 'contain' }}
            />
          </motion.div>

          {/* LOADING text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              fontFamily: 'monospace',
              fontSize: '0.62rem',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            {'LOADING...'.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0.2 }}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, delay: i * 0.08, repeat: Infinity, ease: 'easeInOut' }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={{
              width: 220,
              height: 2,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 2,
              overflow: 'hidden',
              transformOrigin: 'left',
            }}
          >
            <motion.div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #f5a623, #ffcc70)',
                borderRadius: 2,
                width: `${progress}%`,
                transition: 'width 0.05s linear',
                boxShadow: '0 0 10px rgba(245,166,35,0.6)',
              }}
            />
          </motion.div>

          {/* Progress number */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              fontFamily: 'monospace',
              fontSize: '0.7rem',
              color: '#f5a623',
              letterSpacing: '0.1em',
              marginTop: '-1rem',
            }}
          >
            {progress}%
          </motion.div>

          {/* Corner decorations */}
          {[
            { top: 24, left: 24, borderTop: '2px solid', borderLeft: '2px solid' },
            { top: 24, right: 24, borderTop: '2px solid', borderRight: '2px solid' },
            { bottom: 24, left: 24, borderBottom: '2px solid', borderLeft: '2px solid' },
            { bottom: 24, right: 24, borderBottom: '2px solid', borderRight: '2px solid' },
          ].map((style, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
              style={{
                position: 'absolute',
                width: 20,
                height: 20,
                borderColor: 'rgba(245,166,35,0.4)',
                ...style,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
