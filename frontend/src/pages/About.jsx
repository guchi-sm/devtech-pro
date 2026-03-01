import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'
import Footer from '../components/Footer'

// ─── xtratheme corporate palette (matches Home.jsx) ────────────
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

// ─── SKILL BAR ─────────────────────────────────────────────────
function SkillBar({ name, pct, icon = '⚙️', color = 'var(--accent)', delay = 0 }) {
  const [ref, visible] = useScrollReveal(0.2)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="mb-3 rounded-lg px-4 py-3 transition-all duration-300"
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--bg-card)' : 'transparent',
        border: `1px solid ${hovered ? color : 'transparent'}`,
        boxShadow: hovered ? `0 0 16px ${color}22` : 'none',
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text)' }}>
          <span>{icon}</span>
          {name}
        </span>
        <span
          className="font-mono text-[0.68rem] font-bold transition-colors duration-300"
          style={{ color: hovered ? color : 'var(--text-muted)' }}
        >
          {pct}%
        </span>
      </div>
      <div className="skill-bar-track" style={{ background: 'var(--border)', borderRadius: 4, height: 5 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={visible ? { width: `${pct}%` } : {}}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay }}
          style={{
            height: '100%',
            borderRadius: 4,
            background: `linear-gradient(to right, ${color}88, ${color})`,
            boxShadow: hovered ? `0 0 8px ${color}` : 'none',
            transition: 'box-shadow 0.3s ease',
          }}
        />
      </div>
    </div>
  )
}

const SKILLS = {
  development: {
    color: '#1c2d3f',
    items: [
      { name: 'HTML / CSS',  pct: 92, icon: '🎨' },
      { name: 'JavaScript',  pct: 80, icon: '🟨' },
      { name: 'Python',      pct: 75, icon: '🐍' },
      { name: 'PHP / MySQL', pct: 70, icon: '🐘' },
      { name: 'React',       pct: 68, icon: '⚛️' },
    ],
  },
  networking: {
    color: '#f5a623',
    items: [
      { name: 'Router Config',    pct: 88, icon: '📡' },
      { name: 'LAN / WAN Setup',  pct: 85, icon: '🔌' },
      { name: 'Network Security', pct: 78, icon: '🔒' },
      { name: 'WiFi Planning',    pct: 90, icon: '📶' },
      { name: 'VLANs',            pct: 74, icon: '🗂️' },
    ],
  },
  support: {
    color: '#2a3f57',
    items: [
      { name: 'Windows / Linux', pct: 95, icon: '🖥️' },
      { name: 'Hardware Repair',  pct: 82, icon: '🔧' },
      { name: 'System Maint.',    pct: 88, icon: '⚙️' },
      { name: 'Troubleshooting',  pct: 93, icon: '🛠️' },
      { name: 'Cloud (Basic)',    pct: 65, icon: '☁️' },
    ],
  },
}

const TIMELINE = [
  { year: '2024', role: 'Senior IT Consultant', place: 'Freelance — Nairobi' },
  { year: '2022', role: 'Systems Developer',    place: 'TechSolutions Ltd.' },
  { year: '2020', role: 'IT Support Engineer',  place: 'NetConnect Africa' },
  { year: '2019', role: 'Diploma — ICT',        place: 'K Technical training Institute (KTTI)' },
]

export default function About() {
  return (
    <>
      {/* Inject matching color palette */}
      <style>{THEME_OVERRIDE}</style>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="pt-[68px]" style={{ background: 'var(--bg)' }}>
        <div
          className="max-w-[1280px] mx-auto px-8 md:px-10 py-20 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Orange top accent line — matches xtratheme section headers */}
          <div style={{
            width: 48, height: 4, background: '#f5a623',
            borderRadius: 2, marginBottom: '1.2rem',
          }} />
          <motion.div {...fadeUp(0.1)}>
            <div className="section-label">Who I Am</div>
          </motion.div>
          <motion.div {...fadeUp(0.2)}>
            <div className="text-display-lg font-display" style={{ color: 'var(--text)' }}>
              Building <span style={{ color: 'var(--accent)' }}>reliable</span><br />tech systems
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── BIO + PHOTO ──────────────────────────────────────── */}
      <section className="py-20 border-b" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

          {/* Photo */}
          <Reveal>
            <div className="relative">
              <div className="relative overflow-hidden rounded-lg aspect-[4/5] max-w-[400px]">
                <img
                  src="https://images.unsplash.com/photo-1607705703571-c5a8695f18f6?w=800&q=80&fit=crop"
                  alt="Professional developer at workstation"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(135deg, rgba(245,166,35,0.12) 0%, transparent 55%)' }}
                />
              </div>
              {/* Badge — navy bg, orange text */}
              <div
                className="absolute -bottom-4 -right-4 rounded-lg text-center px-5 py-4"
                style={{ background: '#1c2d3f' }}
              >
                <span className="font-display text-3xl leading-none block" style={{ color: '#f5a623' }}>5+</span>
                <span className="font-mono text-[0.58rem] tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,.75)' }}>
                  Yrs Exp.
                </span>
              </div>

              {/* Second accent photo */}
              <div
                className="absolute -bottom-14 -left-6 w-28 h-28 rounded-lg overflow-hidden border-4"
                style={{ borderColor: 'var(--bg)' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=200&q=80&fit=crop"
                  alt="Network cables"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Reveal>

          {/* Bio */}
          <div className="pt-2">
            <Reveal>
              <div style={{ width: 36, height: 3, background: '#f5a623', borderRadius: 2, marginBottom: '1rem' }} />
              <div className="section-label">Professional Bio</div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="text-display-md font-display mb-5" style={{ color: 'var(--text)' }}>About Me</div>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="text-sm leading-[1.85] mb-4" style={{ color: 'var(--text-muted)' }}>
                I'm an ICT Technician and Software Developer with over 5 years of hands-on experience helping small businesses and startups build reliable, secure, and scalable technology systems.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-sm leading-[1.85] mb-4" style={{ color: 'var(--text-muted)' }}>
                My work bridges two worlds: the physical infrastructure of networks and hardware, and the digital world of software and applications. I approach every project with precision, clarity, and a commitment to long-term results.
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="text-sm leading-[1.85] mb-8" style={{ color: 'var(--text-muted)' }}>
                I believe good technology should be invisible — it just works. Whether it's setting up a secure office network or building a custom inventory system, I ensure everything runs reliably in the background so clients can focus on their business.
              </p>
            </Reveal>

            {/* Mission quote — orange left border */}
            <Reveal delay={0.3}>
              <blockquote
                className="border-l-[3px] pl-5 my-7 italic text-[1.02rem] leading-relaxed"
                style={{ borderColor: '#f5a623', color: 'var(--text)', background: 'rgba(245,166,35,0.05)', padding: '1rem 1.25rem', borderRadius: '0 6px 6px 0' }}
              >
                "I help small businesses build reliable IT systems — from basic network setup to custom software solutions."
              </blockquote>
            </Reveal>

            <Reveal delay={0.4}>
              <Link to="/contact" className="btn btn-primary">Work With Me →</Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── SKILLS ───────────────────────────────────────────── */}
      <section className="py-20 border-b" style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">
          <Reveal>
            <div style={{ width: 36, height: 3, background: '#f5a623', borderRadius: 2, marginBottom: '1rem' }} />
            <div className="section-label">Capabilities</div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="text-display-md font-display mb-2" style={{ color: 'var(--text)' }}>
              Skills &amp; Expertise
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-sm max-w-md mb-14" style={{ color: 'var(--text-muted)' }}>
              A full-stack skillset covering development, networking, and IT support.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Development */}
            <div>
              <Reveal>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: 4, height: 28, background: '#1c2d3f', borderRadius: 2 }} />
                  <h3 className="font-display text-2xl tracking-wide" style={{ color: 'var(--text)' }}>Development</h3>
                </div>
              </Reveal>
              {SKILLS.development.items.map((s, i) => (
                <SkillBar key={s.name} {...s} color={SKILLS.development.color} delay={i * 0.1} />
              ))}
            </div>

            {/* Networking */}
            <div>
              <Reveal>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: 4, height: 28, background: '#f5a623', borderRadius: 2 }} />
                  <h3 className="font-display text-2xl tracking-wide" style={{ color: 'var(--text)' }}>Networking</h3>
                </div>
              </Reveal>
              {SKILLS.networking.items.map((s, i) => (
                <SkillBar key={s.name} {...s} color={SKILLS.networking.color} delay={i * 0.1} />
              ))}
            </div>

            {/* IT Support */}
            <div>
              <Reveal>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: 4, height: 28, background: '#2a3f57', borderRadius: 2 }} />
                  <h3 className="font-display text-2xl tracking-wide" style={{ color: 'var(--text)' }}>IT Support</h3>
                </div>
              </Reveal>
              {SKILLS.support.items.map((s, i) => (
                <SkillBar key={s.name} {...s} color={SKILLS.support.color} delay={i * 0.1} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TIMELINE ─────────────────────────────────────────── */}
      <section className="py-20 border-b" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">
          <Reveal>
            <div style={{ width: 36, height: 3, background: '#f5a623', borderRadius: 2, marginBottom: '1rem' }} />
            <div className="section-label">Experience</div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="text-display-md font-display mb-14" style={{ color: 'var(--text)' }}>Career Path</div>
          </Reveal>

          <div className="relative border-l-2 pl-10 space-y-10" style={{ borderColor: '#e2e8f0' }}>
            {TIMELINE.map((item, i) => (
              <Reveal key={item.year} delay={i * 0.12}>
                <div className="relative">
                  {/* Dot — orange fill, navy border */}
                  <div
                    className="absolute -left-[2.85rem] w-4 h-4 rounded-full border-2"
                    style={{ background: '#f5a623', borderColor: '#1c2d3f' }}
                  />
                  <div
                    className="font-mono text-[0.65rem] tracking-[0.2em] uppercase mb-1"
                    style={{ color: '#f5a623' }}
                  >
                    {item.year}
                  </div>
                  <div className="font-display text-2xl tracking-wide mb-1" style={{ color: 'var(--text)' }}>
                    {item.role}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.place}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TECH PHOTO STRIP ─────────────────────────────────── */}
      <section className="py-20" style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">
          <Reveal>
            <div style={{ width: 36, height: 3, background: '#f5a623', borderRadius: 2, marginBottom: '1rem' }} />
            <div className="section-label mb-10">In The Lab</div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { src: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&q=80&fit=crop', alt: 'Code on monitors' },
              { src: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80&fit=crop', alt: 'Server rack' },
              { src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80&fit=crop', alt: 'Circuit board closeup' },
              { src: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=500&q=80&fit=crop', alt: 'Network cables' },
            ].map((img, i) => (
              <Reveal key={img.src} delay={i * 0.1}>
                <div
                  className="aspect-square overflow-hidden rounded-lg"
                  style={{ border: '2px solid var(--border)', transition: 'border-color .3s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#f5a623'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BAND ─────────────────────────────────────────── */}
      <section style={{ background: '#1c2d3f', padding: '3.5rem 0' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <Reveal>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '.4rem' }}>
                Ready to work together?
              </div>
              <div style={{ fontSize: '.95rem', color: 'rgba(255,255,255,.65)' }}>
                Let's build something reliable for your business.
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <Link to="/contact" style={{
              background: '#f5a623', color: '#1c2d3f',
              fontWeight: 700, fontSize: '.9rem', padding: '.85rem 2.2rem',
              borderRadius: 2, textDecoration: 'none', border: '2px solid #f5a623',
              transition: 'all .25s', whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f5a623'; e.currentTarget.style.color = '#1c2d3f' }}
            >
              Get In Touch →
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  )
}
