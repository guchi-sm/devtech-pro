import { motion } from 'framer-motion'
import NetworkTopologyVisualizer from '../components/NetworkTopologyVisualizer'
import Footer from '../components/Footer'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1], delay },
})

export default function Demo() {
  return (
    <>
      <section
        className="relative min-h-screen pt-[68px]"
        style={{ background: 'var(--bg)' }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 20%, var(--accent-glow) 0%, transparent 65%)',
          }}
        />

        <div className="relative z-10 max-w-[1280px] mx-auto px-8 md:px-10 py-20">

          {/* Label */}
          <motion.div {...fadeUp(0.1)} className="flex items-center gap-3 mb-6">
            <div className="avail-dot" />
            <span
              className="font-mono text-[0.68rem] tracking-[0.18em] uppercase"
              style={{ color: 'var(--text-muted)' }}
            >
              Live Interactive Demo
            </span>
          </motion.div>

          {/* Title */}
          <motion.div {...fadeUp(0.2)} className="mb-4">
            <div className="text-display-md font-display" style={{ color: 'var(--text)' }}>
              Network Topology
            </div>
            <div className="text-display-md font-display" style={{ color: 'var(--accent)' }}>
              Visualizer
            </div>
          </motion.div>

          {/* Description */}
          <motion.p
            {...fadeUp(0.3)}
            className="text-[0.95rem] leading-relaxed mb-12 max-w-xl"
            style={{ color: 'var(--text-muted)' }}
          >
            A real-time interactive network map built with D3.js and React.
            Drag devices, inspect nodes, add/remove equipment, and watch live
            data packets flow across your infrastructure — all in the browser.
          </motion.p>

          {/* Feature badges */}
          <motion.div {...fadeUp(0.35)} className="flex flex-wrap gap-3 mb-12">
            {[
              'D3.js Force Simulation',
              'Live Packet Animation',
              'Drag & Drop Nodes',
              'Real-time Status',
              'Add / Remove Devices',
              'Zoom & Pan',
            ].map((f) => (
              <span
                key={f}
                className="font-mono text-[0.65rem] tracking-[0.12em] uppercase px-3 py-1.5 rounded-full border"
                style={{
                  color: 'var(--accent)',
                  borderColor: 'var(--accent)',
                  background: 'var(--accent-glow)',
                }}
              >
                {f}
              </span>
            ))}
          </motion.div>

          {/* Visualizer */}
          <motion.div {...fadeUp(0.45)}>
            <NetworkTopologyVisualizer />
          </motion.div>

          {/* Bottom note */}
          <motion.p
            {...fadeUp(0.5)}
            className="text-center font-mono text-[0.65rem] tracking-[0.15em] uppercase mt-8"
            style={{ color: 'var(--text-muted)' }}
          >
            Built by DevTech Pro · D3.js + React + Vite
          </motion.p>

        </div>
      </section>
      <Footer />
    </>
  )
}