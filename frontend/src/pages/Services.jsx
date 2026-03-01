import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'
import Footer from '../components/Footer'

// ─── FLOATING NETWORK DOTS CANVAS ──────────────────────────────
function NetworkCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COUNT = 55
    const nodes = Array.from({ length: COUNT }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      r:  Math.random() * 2.5 + 1.5,
    }))

    const CONNECT_DIST = 130
    let raf

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      nodes.forEach(n => {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1
      })
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx   = nodes[i].x - nodes[j].x
          const dy   = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.45
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(245,166,35,${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }
      nodes.forEach(n => {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(245,166,35,0.7)'
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 3,
      }}
    />
  )
}

// ─── xtratheme corporate palette ───────────────────────────────
const THEME_OVERRIDE = `
  :root {
    --bg:          #ffffff;
    --bg-2:        #f4f6f9;
    --bg-card:     #ffffff;
    --accent:      #f5a623;
    --accent-glow: rgba(245,166,35,0.12);
    --text:        #1c2d3f;
    --text-muted:  #6b7a8d;
    --border:      #e2e8f0;
  }
`

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 36 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1], delay },
})

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, visible] = useScrollReveal()
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

const SERVICES = [
  {
    id: 'dev',
    index: '01',
    title: 'Software Development',
    tagline: 'Custom digital tools built for your workflow',
    img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&q=80&fit=crop',
    items: [
      { title: 'Business Systems', desc: 'Inventory management, POS, CRM, and HR systems tailored to your exact workflow.', icon: '🗂️' },
      { title: 'Web Applications', desc: 'Responsive websites, company portals, and dashboards with modern UI.', icon: '🌐' },
      { title: 'Custom Tools', desc: 'Automation scripts, data pipelines, and internal utilities to cut time and cost.', icon: '🔧' },
    ],
  },
  {
    id: 'net',
    index: '02',
    title: 'Basic Networking',
    tagline: 'Reliable, secure connectivity for your office',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&q=80&fit=crop',
    items: [
      { title: 'Router Configuration', desc: 'Secure setup of routers, firewall rules, NAT, port forwarding and DNS.', icon: '📡' },
      { title: 'WiFi Setup', desc: 'Full-coverage wireless design with proper channel planning and security.', icon: '📶' },
      { title: 'Small Office LAN', desc: 'Structured cabling, managed switch setup, IP addressing, and VLAN segmentation.', icon: '🔌' },
    ],
  },
  {
    id: 'it',
    index: '03',
    title: 'IT Support',
    tagline: 'Responsive tech support that keeps you running',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&q=80&fit=crop',
    items: [
      { title: 'Troubleshooting', desc: 'Fast diagnosis of hardware, software, and network issues with documented resolution.', icon: '🔍' },
      { title: 'System Installation', desc: 'OS setup, driver management, software deployment and environment configuration.', icon: '💿' },
      { title: 'Maintenance', desc: 'Scheduled health-checks, updates, backups, and performance monitoring.', icon: '⚙️' },
    ],
  },
]

function ServiceBlock({ service, isOpen, onToggle }) {
  const [ref, visible] = useScrollReveal()
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={visible ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
      className="border-t"
      style={{ borderColor: 'var(--border)' }}
    >
      <button
        className="w-full flex items-center py-8 gap-6 text-left group cursor-pointer"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="font-mono text-[0.65rem] tracking-[0.22em] uppercase min-w-[44px]"
          style={{ color: isOpen ? '#f5a623' : 'var(--text-muted)' }}>
          {service.index}
        </span>
        <span className="font-display flex-1 transition-colors duration-300"
          style={{ fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', color: isOpen ? '#f5a623' : 'var(--text)' }}>
          {service.title}
        </span>
        <span className="hidden md:block text-sm" style={{ color: 'var(--text-muted)' }}>
          {service.tagline}
        </span>
        <div className="w-11 h-11 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{ borderColor: isOpen ? '#f5a623' : 'var(--border)', background: isOpen ? '#f5a623' : 'transparent' }}>
          <svg className="w-4 h-4 transition-transform duration-300"
            style={{ color: isOpen ? '#1c2d3f' : 'var(--text-muted)', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}>
            <div className="pb-10 pl-0 md:pl-[80px]">
              <div className="relative h-52 md:h-64 rounded-lg overflow-hidden mb-8">
                <img src={service.img} alt={service.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(28,45,63,.75) 0%, rgba(28,45,63,.3) 60%, transparent 100%)' }} />
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: '#f5a623' }} />
                <div className="absolute inset-0 flex items-center pl-10">
                  <div className="font-display text-5xl leading-none" style={{ color: 'rgba(245,166,35,.3)' }}>{service.index}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: 'var(--border)' }}>
                {service.items.map((item) => (
                  <div key={item.title} className="p-6 transition-colors duration-200" style={{ background: 'var(--bg-card)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f4f6f9'; e.currentTarget.style.borderLeft = '3px solid #f5a623' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderLeft = 'none' }}>
                    <div className="flex items-start gap-4">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2" style={{ background: '#f5a623' }} />
                      <div>
                        <div className="flex items-center gap-2 text-sm font-medium mb-1.5" style={{ color: 'var(--text)' }}>
                          <span>{item.icon}</span>{item.title}
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Services() {
  const [openId, setOpenId] = useState('dev')
  const toggle = (id) => setOpenId(prev => (prev === id ? null : id))

  return (
    <>
      <style>{THEME_OVERRIDE}</style>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="pt-[68px]" style={{ background: 'var(--bg)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10 py-20 border-b" style={{ borderColor: 'var(--border)' }}>
          <div style={{ width: 48, height: 4, background: '#f5a623', borderRadius: 2, marginBottom: '1.2rem' }} />
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <motion.div {...fadeUp(0.1)}><div className="section-label">What I Offer</div></motion.div>
              <motion.div {...fadeUp(0.2)}>
                <div className="text-display-lg font-display" style={{ color: 'var(--text)' }}>Services</div>
              </motion.div>
            </div>
            <motion.p {...fadeUp(0.3)} className="text-sm leading-relaxed max-w-sm md:text-right" style={{ color: 'var(--text-muted)' }}>
              End-to-end ICT services tailored for small businesses and startups that need reliable, no-nonsense technology.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ─── SERVICE BLOCKS ───────────────────────────────────── */}
      <section className="py-8 pb-24" style={{ background: 'var(--bg)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">
          {SERVICES.map(service => (
            <ServiceBlock key={service.id} service={service} isOpen={openId === service.id} onToggle={() => toggle(service.id)} />
          ))}
          <div className="border-t" style={{ borderColor: 'var(--border)' }} />
        </div>
      </section>

      {/* ─── WHY ME — image overlay + network animation + dark cards ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '7rem 0' }}>
        <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1800&q=80&fit=crop"
          alt="" aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(8,12,22,.93) 0%, rgba(20,33,52,.90) 100%)', zIndex: 2 }} />
        <NetworkCanvas />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#f5a623', zIndex: 4 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: '#f5a623', zIndex: 4 }} />

        <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
          <Reveal>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', fontSize: '.68rem', fontFamily: 'monospace', letterSpacing: '.22em', textTransform: 'uppercase', color: '#f5a623', fontWeight: 700, marginBottom: '1rem' }}>
                <span style={{ width: 28, height: 1, background: '#f5a623', display: 'inline-block' }} />
                Why Choose Me
                <span style={{ width: 28, height: 1, background: '#f5a623', display: 'inline-block' }} />
              </div>
              <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, color: '#ffffff', lineHeight: 1.1, letterSpacing: '.04em', textTransform: 'uppercase', fontFamily: 'inherit' }}>
                What Sets Me <span style={{ color: '#f5a623' }}>Apart</span>
              </h2>
            </div>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: '⚡', label: 'Fast Delivery', desc: 'I prioritize turnaround without cutting corners on quality or security.' },
              { icon: '🔒', label: 'Security First', desc: 'Every deployment is hardened by default — firewalls, updates, and access controls.' },
              { icon: '📞', label: 'Always Available', desc: 'Responsive support via WhatsApp or email. Critical issues handled same day.' },
              { icon: '💡', label: 'Tailored Solutions', desc: 'No templates. Every solution is scoped and built specifically for your business.' },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 0.1}>
                <div
                  style={{ background: 'rgba(18,26,42,.85)', border: '1px solid rgba(255,255,255,.07)', borderTop: '3px solid transparent', padding: '2rem 1.75rem', cursor: 'default', transition: 'all .3s', backdropFilter: 'blur(8px)', height: '100%' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(28,40,62,.95)'; e.currentTarget.style.borderTopColor = '#f5a623'; e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,.4)'; e.currentTarget.style.borderColor = 'rgba(245,166,35,.25)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(18,26,42,.85)'; e.currentTarget.style.borderTopColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)' }}
                >
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(28,45,63,.9)', border: '1px solid rgba(245,166,35,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,.3)' }}>
                    {item.icon}
                  </div>
                  <div style={{ fontSize: '.85rem', fontWeight: 800, color: '#ffffff', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: '.75rem' }}>
                    {item.label}
                  </div>
                  <p style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.75 }}>{item.desc}</p>
                  <div style={{ width: 28, height: 2, background: '#f5a623', borderRadius: 2, marginTop: '1.25rem', opacity: .6 }} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BAND ─────────────────────────────────────────── */}
      <section style={{ background: '#1c2d3f', padding: '4rem 0' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <Reveal>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '.5rem', lineHeight: 1.2 }}>
                Ready to get <span style={{ color: '#f5a623' }}>started?</span>
              </div>
              <p style={{ fontSize: '.95rem', color: 'rgba(255,255,255,.65)' }}>
                Request a free consultation and I'll put together a tailored plan for your business.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <Link to="/contact"
              style={{ background: '#f5a623', color: '#1c2d3f', fontWeight: 700, fontSize: '.9rem', padding: '.85rem 2.4rem', borderRadius: 2, textDecoration: 'none', border: '2px solid #f5a623', transition: 'all .25s', whiteSpace: 'nowrap', display: 'inline-block' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f5a623'; e.currentTarget.style.color = '#1c2d3f' }}
            >
              Get a Free Quote →
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  )
}