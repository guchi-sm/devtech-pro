import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { useInView } from 'react-intersection-observer'
import { useCountUp } from '../hooks/useCountUp'
import Footer from '../components/Footer'
import { useTypewriter } from '../hooks/useAnimations'

// ─── THEME: xtratheme corporate color override ─────────────────
// Injects CSS variable overrides to match https://xtratheme.com/elementor/corporate/
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
    --navy:        #1c2d3f;
    --navy-light:  #2a3f57;
  }

  /* Slide-in text animation used inside carousel */
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .hero-tag    { animation: slideInUp .55s .1s both; }
  .hero-title  { animation: slideInUp .65s .25s both; }
  .hero-sub    { animation: slideInUp .65s .4s  both; }
  .hero-btns   { animation: slideInUp .65s .55s both; }

  /* Progress bar on thumbs */
  .thumb-bar {
    position: absolute; bottom: 0; left: 0;
    height: 3px; background: #f5a623;
    transition: width .05s linear;
  }
`

// ─── FRAMER VARIANTS ───────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1], delay },
})

// ─── CAROUSEL DATA ─────────────────────────────────────────────
const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=85&fit=crop',
    tag: 'Welcome to DevTech Pro',
    title: 'ICT Technician &\nSoftware Developer',
    sub: 'Helping businesses build reliable and secure IT systems — from basic network setup to custom software solutions.',
    cta: { label: 'Request a Quote →', to: '/contact', primary: true },
    cta2: { label: 'View My Work', to: '/portfolio' },
  },
  {
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=85&fit=crop',
    tag: 'Network Infrastructure',
    title: 'Enterprise Networks\nBuilt to Last',
    sub: 'Router setup, WiFi optimization, firewall hardening and LAN/WAN deployments — secure and reliable.',
    cta: { label: 'Our Services →', to: '/services', primary: true },
    cta2: { label: 'Learn More', to: '/about' },
  },
  {
    img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&q=85&fit=crop',
    tag: 'Software Development',
    title: 'Custom Software\nThat Drives Results',
    sub: 'Web applications, business systems and automation tools built for real-world efficiency.',
    cta: { label: 'Start a Project →', to: '/contact', primary: true },
    cta2: { label: 'Portfolio', to: '/portfolio' },
  },
  {
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=85&fit=crop',
    tag: 'IT Support & Repair',
    title: 'Always-On IT Support\nYou Can Count On',
    sub: 'Fast diagnosis, hardware repair, OS installs and ongoing maintenance to keep your business running.',
    cta: { label: 'Get Support →', to: '/contact', primary: true },
    cta2: { label: 'All Services', to: '/services' },
  },
]

const SLIDE_DURATION = 5000 // ms — matches xtratheme corporate timing

// ─── HERO CAROUSEL ─────────────────────────────────────────────
// Slides RIGHT → LEFT exactly like xtratheme/elementor/corporate
function HeroCarousel() {
  const [current, setCurrent]   = useState(0)
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const [progress, setProgress] = useState(0)
  const elapsed = useRef(0)

  const goTo = useCallback((idx, dir = 1) => {
    setDirection(dir)
    setCurrent(idx)
    elapsed.current = 0
    setProgress(0)
  }, [])

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length, 1)
  }, [current, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, -1)
  }, [current, goTo])

  // Auto-advance timer with smooth progress bar
  useEffect(() => {
    const TICK = 50
    const id = setInterval(() => {
      elapsed.current += TICK
      setProgress(Math.min((elapsed.current / SLIDE_DURATION) * 100, 100))
      if (elapsed.current >= SLIDE_DURATION) {
        setCurrent(c => (c + 1) % SLIDES.length)
        setDirection(1)
        elapsed.current = 0
        setProgress(0)
      }
    }, TICK)
    return () => clearInterval(id)
  }, [])

  // Right-to-left slide variants (matching xtratheme)
  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  const slide = SLIDES[current]

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>

      {/* ── Main viewport ─────────────────────────────── */}
      <div style={{
        position: 'relative',
        height: 'clamp(440px, 58vw, 700px)',
        overflow: 'hidden',
      }}>
        <AnimatePresence initial={false} custom={direction} mode="sync">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.75, ease: [0.77, 0, 0.175, 1] }}
            style={{ position: 'absolute', inset: 0 }}
          >
            {/* Background image */}
            <img
              src={slide.img}
              alt={slide.tag}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Dark gradient overlay — navy tint like xtratheme */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(90deg, rgba(28,45,63,.82) 0%, rgba(28,45,63,.55) 55%, rgba(28,45,63,.15) 100%)',
            }} />

            {/* ── Slide text content ────────────────────── */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 10,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: 'clamp(2rem, 6vw, 6rem)',
              maxWidth: 680,
            }}>
              {/* Tag pill */}
              <div className="hero-tag" style={{
                display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                background: '#f5a623', color: '#1c2d3f',
                fontSize: '.72rem', fontWeight: 800,
                letterSpacing: '.12em', textTransform: 'uppercase',
                padding: '.35rem 1rem', borderRadius: 2,
                marginBottom: '1.4rem', width: 'fit-content',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#1c2d3f', display: 'inline-block',
                }} />
                {slide.tag}
              </div>

              {/* Headline */}
              <h1 className="hero-title" style={{
                fontSize: 'clamp(2.2rem, 4.8vw, 3.8rem)',
                fontWeight: 900, color: '#ffffff', lineHeight: 1.1,
                marginBottom: '1.25rem', whiteSpace: 'pre-line',
                fontFamily: 'inherit',
              }}>
                {slide.title}
              </h1>

              {/* Subtext */}
              <p className="hero-sub" style={{
                fontSize: '1.05rem', color: 'rgba(255,255,255,.85)',
                lineHeight: 1.75, marginBottom: '2.2rem', maxWidth: 480,
              }}>
                {slide.sub}
              </p>

              {/* CTAs */}
              <div className="hero-btns" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to={slide.cta.to} style={{
                  background: '#f5a623', color: '#1c2d3f',
                  fontWeight: 700, fontSize: '.88rem',
                  padding: '.8rem 2rem', borderRadius: 2,
                  textDecoration: 'none', border: '2px solid #f5a623',
                  transition: 'all .25s', display: 'inline-block',
                  letterSpacing: '.02em',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f5a623'; e.currentTarget.style.color = '#1c2d3f' }}
                >
                  {slide.cta.label}
                </Link>
                <Link to={slide.cta2.to} style={{
                  background: 'transparent', color: '#ffffff',
                  fontWeight: 600, fontSize: '.88rem',
                  padding: '.8rem 2rem', borderRadius: 2,
                  textDecoration: 'none', border: '2px solid rgba(255,255,255,.55)',
                  transition: 'all .25s', display: 'inline-block',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.55)'; e.currentTarget.style.background = 'transparent' }}
                >
                  {slide.cta2.label}
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev arrow */}
        <button onClick={prev} aria-label="Previous slide" style={{
          position: 'absolute', left: '1.5rem', top: '50%',
          transform: 'translateY(-50%)', zIndex: 30,
          width: 48, height: 48, borderRadius: 2,
          background: 'rgba(28,45,63,.55)', backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,.2)', color: '#fff',
          fontSize: '1.4rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .25s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f5a623'; e.currentTarget.style.color = '#1c2d3f'; e.currentTarget.style.borderColor = '#f5a623' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(28,45,63,.55)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)' }}
        >‹</button>

        {/* Next arrow */}
        <button onClick={next} aria-label="Next slide" style={{
          position: 'absolute', right: '1.5rem', top: '50%',
          transform: 'translateY(-50%)', zIndex: 30,
          width: 48, height: 48, borderRadius: 2,
          background: 'rgba(28,45,63,.55)', backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255,255,255,.2)', color: '#fff',
          fontSize: '1.4rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .25s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f5a623'; e.currentTarget.style.color = '#1c2d3f'; e.currentTarget.style.borderColor = '#f5a623' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(28,45,63,.55)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)' }}
        >›</button>

        {/* Slide counter — bottom right */}
        <div style={{
          position: 'absolute', bottom: '1.5rem', right: '2rem', zIndex: 30,
          display: 'flex', alignItems: 'center', gap: '.5rem',
        }}>
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i, i > current ? 1 : -1)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: i === current ? 28 : 8, height: 8, padding: 0,
                borderRadius: 99, border: 'none', cursor: 'pointer',
                background: i === current ? '#f5a623' : 'rgba(255,255,255,.45)',
                transition: 'all .35s',
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Thumbnail strip (exactly like xtratheme) ───── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        gap: 0, background: '#1c2d3f',
      }}>
        {SLIDES.map((s, i) => (
          <button key={i} onClick={() => goTo(i, i > current ? 1 : -1)}
            style={{
              position: 'relative', height: 80, padding: 0,
              border: 'none', cursor: 'pointer', overflow: 'hidden',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,.1)' : 'none',
              outline: i === current ? '2px solid #f5a623' : 'none',
              outlineOffset: -2,
            }}
            aria-label={s.tag}
          >
            <img src={s.img} alt={s.tag} loading="lazy" style={{
              width: '100%', height: '100%', objectFit: 'cover',
              filter: i === current ? 'brightness(.9)' : 'brightness(.4)',
              transition: 'filter .3s',
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: i === current ? 'rgba(245,166,35,.18)' : 'transparent',
              transition: 'background .3s',
            }} />
            <span style={{
              position: 'absolute', bottom: 6, left: 8,
              fontSize: '.6rem', fontWeight: 700, color: '#fff',
              letterSpacing: '.08em', textTransform: 'uppercase',
              textShadow: '0 1px 4px rgba(0,0,0,.8)',
            }}>{s.tag}</span>
            {/* Progress bar on active thumb */}
            {i === current && (
              <div className="thumb-bar" style={{ width: `${progress}%` }} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

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
            style={{ background: 'var(--accent-glow)', border: '1px solid rgba(245,166,35,0.25)', color: 'var(--accent)' }}
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

// ─── STAT COUNTER ────────────────────────────────────────────────
const STATS = [
  { num: 5,  suffix: '+', label: 'Years Experience' },
  { num: 30, suffix: '+', label: 'Projects Delivered' },
  { num: 15, suffix: '+', label: 'Happy Clients' },
  { num: 99, suffix: '%', label: 'Uptime SLA' },
]

function StatCounter({ target, suffix, label, delay }) {
  const { ref: inViewRef, inView } = useInView({ threshold: 0.5, triggerOnce: true })
  const numRef = useCountUp(target, 1800, inView)
  return (
    <motion.div
      ref={inViewRef}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className="pr-8 mr-8 border-r last:border-r-0 last:mr-0 last:pr-0"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="font-display text-5xl leading-none" style={{ color: 'var(--text)' }}>
        <span ref={numRef}>0</span>
        <span style={{ color: 'var(--accent)' }}>{suffix}</span>
      </div>
      <div className="font-mono text-[0.62rem] tracking-[0.15em] uppercase mt-1" style={{ color: 'var(--text-muted)' }}>
        {label}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════
export default function Home() {
  const role = useTypewriter([
    'ICT Technician',
    'Software Developer',
    'Network Specialist',
    'Full-Stack Engineer',
    'Problem Solver',
  ])

  return (
    <>
      {/* Inject xtratheme corporate color palette */}
      <style>{THEME_OVERRIDE}</style>

      {/* ─── HERO CAROUSEL ────────────────────────────────────── */}
      <HeroCarousel />

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
                style={{ background: 'linear-gradient(135deg, rgba(245,166,35,0.15) 0%, transparent 60%)' }}
              />
            </div>
            {/* Floating badge */}
            <div
              className="absolute -bottom-4 -right-4 rounded-lg text-white text-center px-5 py-4"
              style={{ background: 'var(--accent)', color: '#1c2d3f' }}
            >
              <div className="font-display text-3xl leading-none" style={{ color: '#1c2d3f' }}>5+</div>
              <div className="font-mono text-[0.58rem] tracking-[0.15em] uppercase mt-0.5" style={{ color: '#1c2d3f', opacity: .85 }}>Yrs Exp.</div>
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

      {/* ─── STATS ────────────────────────────────────────────── */}
      <section
        className="py-16"
        style={{ background: '#1c2d3f', borderTop: '1px solid rgba(255,255,255,.08)' }}
      >
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">
          <div className="flex flex-wrap gap-0 justify-center">
            {STATS.map((s, i) => (
              <StatCounter
                key={s.label}
                target={s.num}
                suffix={s.suffix}
                label={s.label}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ──────────────────────────────────────── */}
      <section
        className="py-28 text-center relative overflow-hidden"
        style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(245,166,35,0.08) 0%, transparent 70%)'
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

