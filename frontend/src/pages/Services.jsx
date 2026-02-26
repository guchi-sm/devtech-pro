import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'
import Footer from '../components/Footer'

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
      {
        title: 'Business Systems',
        desc: 'Inventory management, POS, CRM, and HR systems tailored to your exact workflow.',
        icon: '🗂️',
      },
      {
        title: 'Web Applications',
        desc: 'Responsive websites, company portals, and dashboards with modern UI.',
        icon: '🌐',
      },
      {
        title: 'Custom Tools',
        desc: 'Automation scripts, data pipelines, and internal utilities to cut time and cost.',
        icon: '🔧',
      },
    ],
  },
  {
    id: 'net',
    index: '02',
    title: 'Basic Networking',
    tagline: 'Reliable, secure connectivity for your office',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&q=80&fit=crop',
    items: [
      {
        title: 'Router Configuration',
        desc: 'Secure setup of routers, firewall rules, NAT, port forwarding and DNS.',
        icon: '📡',
      },
      {
        title: 'WiFi Setup',
        desc: 'Full-coverage wireless design with proper channel planning and security.',
        icon: '📶',
      },
      {
        title: 'Small Office LAN',
        desc: 'Structured cabling, managed switch setup, IP addressing, and VLAN segmentation.',
        icon: '🔌',
      },
    ],
  },
  {
    id: 'it',
    index: '03',
    title: 'IT Support',
    tagline: 'Responsive tech support that keeps you running',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=900&q=80&fit=crop',
    items: [
      {
        title: 'Troubleshooting',
        desc: 'Fast diagnosis of hardware, software, and network issues with documented resolution.',
        icon: '🔍',
      },
      {
        title: 'System Installation',
        desc: 'OS setup, driver management, software deployment and environment configuration.',
        icon: '💿',
      },
      {
        title: 'Maintenance',
        desc: 'Scheduled health-checks, updates, backups, and performance monitoring.',
        icon: '⚙️',
      },
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
      {/* Header */}
      <button
        className="w-full flex items-center py-8 gap-6 text-left group cursor-pointer service-block-header"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="font-mono text-[0.65rem] tracking-[0.22em] uppercase min-w-[44px]" style={{ color: 'var(--text-muted)' }}>
          {service.index}
        </span>

        <span
          className="font-display flex-1 transition-colors duration-300"
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 3.2rem)',
            color: isOpen ? 'var(--accent)' : 'var(--text)',
          }}
        >
          {service.title}
        </span>

        <span
          className="hidden md:block text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          {service.tagline}
        </span>

        {/* Toggle icon */}
        <div
          className="w-11 h-11 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{
            borderColor: isOpen ? 'var(--accent)' : 'var(--border)',
            background: isOpen ? 'var(--accent)' : 'transparent',
          }}
        >
          <svg
            className="w-4 h-4 transition-transform duration-300"
            style={{
              color: isOpen ? '#fff' : 'var(--text-muted)',
              transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            }}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pb-10 pl-0 md:pl-[80px]">
              {/* Photo */}
              <div className="relative h-52 md:h-64 rounded-lg overflow-hidden mb-8">
                <img
                  src={service.img}
                  alt={service.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                <div className="absolute inset-0 flex items-center pl-8">
                  <div className="font-display text-5xl text-white/30 leading-none">{service.index}</div>
                </div>
              </div>

              {/* Items grid */}
              <div
                className="grid grid-cols-1 md:grid-cols-3 gap-px"
                style={{ background: 'var(--border)' }}
              >
                {service.items.map((item) => (
                  <div
                    key={item.title}
                    className="p-6 group/item transition-colors duration-200"
                    style={{ background: 'var(--bg-card)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-card)')}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                        style={{ background: 'var(--accent)' }}
                      />
                      <div>
                        <div
                          className="flex items-center gap-2 text-sm font-medium mb-1.5"
                          style={{ color: 'var(--text)' }}
                        >
                          <span>{item.icon}</span>
                          {item.title}
                        </div>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                          {item.desc}
                        </p>
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
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="pt-[68px]" style={{ background: 'var(--bg)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10 py-20 border-b" style={{ borderColor: 'var(--border)' }}>
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
            <ServiceBlock
              key={service.id}
              service={service}
              isOpen={openId === service.id}
              onToggle={() => toggle(service.id)}
            />
          ))}
          <div className="border-t" style={{ borderColor: 'var(--border)' }} />
        </div>
      </section>

      {/* ─── WHY ME SECTION ───────────────────────────────────── */}
      <section className="py-20 border-t" style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">
          <Reveal><div className="section-label">Why Choose Me</div></Reveal>
          <Reveal delay={0.1}>
            <div className="text-display-md font-display mb-14" style={{ color: 'var(--text)' }}>
              What Sets Me Apart
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px" style={{ background: 'var(--border)' }}>
            {[
              { icon: '⚡', label: 'Fast Delivery', desc: 'I prioritize turnaround without cutting corners.' },
              { icon: '🔒', label: 'Security First', desc: 'Every deployment is hardened by default.' },
              { icon: '📞', label: 'Always Available', desc: 'Responsive support via WhatsApp or email.' },
              { icon: '💡', label: 'Tailored Solutions', desc: 'No templates. Built specifically for your needs.' },
            ].map((item, i) => (
              <Reveal key={item.label} delay={i * 0.1}>
                <div
                  className="p-8 transition-colors duration-200"
                  style={{ background: 'var(--bg-card)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-card)')}
                >
                  <div className="text-3xl mb-4">{item.icon}</div>
                  <div className="font-display text-xl tracking-wide mb-2" style={{ color: 'var(--text)' }}>{item.label}</div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 text-center" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">
          <Reveal>
            <div className="text-display-md font-display mb-4" style={{ color: 'var(--text)' }}>
              Ready to get <span style={{ color: 'var(--accent)' }}>started?</span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
              Request a free consultation and I'll put together a tailored plan for your business.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <Link to="/contact" className="btn btn-primary mx-auto">Get a Free Quote →</Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  )
}
