import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'
import Footer from '../components/Footer'

// ─── FRAMER VARIANTS ───────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1], delay },
})

// ─── TECH PHOTOS (Unsplash) ────────────────────────────────────
const TECH_BG = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&fit=crop'

const SERVICES_DATA = [
  {
    num: '01',
    title: 'Software Development',
    desc: 'Custom web applications, business systems, and digital tools built for real-world efficiency.',
    img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80&fit=crop',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Basic Networking',
    desc: 'Router setup, WiFi configuration, and small office LAN deployments — reliable and secure.',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80&fit=crop',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'IT Support',
    desc: 'Troubleshooting, system installation, and ongoing maintenance to keep your business running.',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80&fit=crop',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z"/>
      </svg>
    ),
  },
]

const STATS = [
  { num: '5+', label: 'Years Experience' },
  { num: '30+', label: 'Projects Delivered' },
  { num: '15+', label: 'Happy Clients' },
  { num: '99%', label: 'Uptime SLA' },
]

// ─── REVEAL WRAPPER ─────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }) {
  const [ref, visible] = useScrollReveal()
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 36 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

// ─── SERVICE CARD ────────────────────────────────────────────────
function ServiceCard({ item, delay }) {
  return (
    <Reveal delay={delay}>
      <div
        className="group relative overflow-hidden border cursor-pointer"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        {/* Photo */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={item.img}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-4 left-5 font-display text-4xl text-white/20 leading-none">{item.num}</div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-500" style={{ background: 'var(--accent)' }} />

        {/* Content */}
        <div className="p-7">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
            style={{ background: 'var(--accent-glow)', border: '1px solid rgba(0,85,255,0.2)', color: 'var(--accent)' }}
          >
            {item.icon}
          </div>
          <h3 className="font-display text-2xl tracking-wide mb-2.5" style={{ color: 'var(--text)' }}>{item.title}</h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
        </div>
      </div>
    </Reveal>
  )
}

// ═══════════════════════════════════════════════════════════════
export default function Home() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen pt-[68px] overflow-hidden flex flex-col"
        style={{ background: 'var(--bg)' }}
      >
        {/* Hero background image with overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <img
            src={TECH_BG}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-[0.06] dark:opacity-[0.12]"
          />
          <div className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 70% 60% at 60% 50%, var(--accent-glow) 0%, transparent 65%)' }}
          />
        </div>

        {/* Ghost number */}
        <div
          aria-hidden="true"
          className="absolute right-[-0.02em] top-1/2 -translate-y-[55%] font-display leading-none pointer-events-none select-none"
          style={{ fontSize: 'clamp(14rem, 32vw, 32rem)', color: 'var(--border)' }}
        >
          01
        </div>

        <div className="relative z-10 flex-1 flex flex-col max-w-[1280px] mx-auto px-8 md:px-10 py-20">

          {/* Eyebrow */}
          <motion.div {...fadeUp(0.1)} className="flex items-center gap-3 mb-10">
            <div className="avail-dot" />
            <span className="font-mono text-[0.68rem] tracking-[0.18em] uppercase" style={{ color: 'var(--text-muted)' }}>
              Available for new projects
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div {...fadeUp(0.2)} className="mb-7">
            <div className="text-display-xl font-display" style={{ color: 'var(--text)' }}>ICT</div>
            <div className="text-display-xl font-display" style={{ color: 'var(--accent)' }}>Technician</div>
            <div className="text-display-xl font-display" style={{ color: 'var(--text)' }}>
              &amp; Developer<span className="typed-cursor" />
            </div>
          </motion.div>

          {/* Sub */}
          <motion.p {...fadeUp(0.35)} className="text-lg leading-relaxed mb-10 max-w-md" style={{ color: 'var(--text-muted)' }}>
            Helping small businesses build reliable and secure IT systems — from basic network setup to custom software solutions.
          </motion.p>

          {/* Actions */}
          <motion.div {...fadeUp(0.45)} className="flex flex-wrap gap-4 mb-16">
            <Link to="/contact" className="btn btn-primary">
              Request a Quote →
            </Link>
            <Link to="/portfolio" className="btn btn-outline">
              View My Work
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            {...fadeUp(0.55)}
            className="flex flex-wrap gap-0 border-t pt-8"
            style={{ borderColor: 'var(--border)' }}
          >
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className="pr-8 mr-8 border-r last:border-r-0 last:mr-0 last:pr-0"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="font-display text-5xl leading-none" style={{ color: 'var(--text)' }}>
                  {s.num.replace('+', '')}<span style={{ color: 'var(--accent)' }}>{s.num.includes('+') ? '+' : ''}</span>
                </div>
                <div className="font-mono text-[0.62rem] tracking-[0.15em] uppercase mt-1" style={{ color: 'var(--text-muted)' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="relative z-10 flex justify-center pb-8"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="font-mono text-[0.58rem] tracking-[0.2em] uppercase" style={{ color: 'var(--text-muted)' }}>Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
              className="w-px h-8"
              style={{ background: 'var(--accent)' }}
            />
          </div>
        </motion.div>
      </section>

      {/* ─── SERVICES PREVIEW ─────────────────────────────────── */}
      <section style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)' }} className="py-24">
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
            <div>
              <Reveal><div className="section-label">What I Do</div></Reveal>
              <Reveal delay={0.1}><div className="text-display-md font-display" style={{ color: 'var(--text)' }}>Core Services</div></Reveal>
            </div>
            <Reveal delay={0.2}>
              <Link to="/services" className="btn btn-outline self-start">All Services →</Link>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: 'var(--border)' }}>
            {SERVICES_DATA.map((item, i) => (
              <ServiceCard key={item.num} item={item} delay={i * 0.12} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT TEASER ─────────────────────────────────────── */}
      <section className="py-24" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Photo */}
          <Reveal className="relative">
            <div className="relative overflow-hidden rounded-lg aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1607705703571-c5a8695f18f6?w=800&q=80&fit=crop"
                alt="Developer workspace"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, rgba(0,85,255,0.15) 0%, transparent 60%)' }}
              />
            </div>
            {/* Floating badge */}
            <div
              className="absolute -bottom-4 -right-4 rounded-lg text-white text-center px-5 py-4"
              style={{ background: 'var(--accent)' }}
            >
              <div className="font-display text-3xl leading-none">5+</div>
              <div className="font-mono text-[0.58rem] tracking-[0.15em] uppercase opacity-85 mt-0.5">Yrs Exp.</div>
            </div>
          </Reveal>

          {/* Content */}
          <div>
            <Reveal><div className="section-label">Who I Am</div></Reveal>
            <Reveal delay={0.1}>
              <div className="text-display-md font-display mb-5" style={{ color: 'var(--text)' }}>
                Building reliable tech for <span style={{ color: 'var(--accent)' }}>real business</span>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-[0.95rem] leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                I'm an ICT Technician and Software Developer with 5+ years of hands-on experience helping small businesses build reliable, secure, and scalable technology systems.
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="text-[0.95rem] leading-relaxed mb-8" style={{ color: 'var(--text-muted)' }}>
                From configuring your first office network to building a custom inventory system — I bridge physical infrastructure and digital software to deliver real-world results.
              </p>
            </Reveal>
            <Reveal delay={0.4}>
              <Link to="/about" className="btn btn-outline">Learn More About Me →</Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ──────────────────────────────────────── */}
      <section
        className="py-28 text-center relative overflow-hidden"
        style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, var(--accent-glow) 0%, transparent 70%)'
        }} />

        <div className="relative z-10 max-w-[1280px] mx-auto px-8 md:px-10">
          <Reveal><div className="section-label justify-center">Let's Work Together</div></Reveal>
          <Reveal delay={0.1}>
            <div className="text-display-lg font-display mb-4" style={{ color: 'var(--text)' }}>
              Ready to <span style={{ color: 'var(--accent)' }}>level up</span><br />your IT?
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-[1.05rem] mb-10 max-w-md mx-auto" style={{ color: 'var(--text-muted)' }}>
              Have a project in mind? Let's discuss how I can help your business grow with reliable technology.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <Link to="/contact" className="btn btn-primary mx-auto">Start a Conversation →</Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  )
}
