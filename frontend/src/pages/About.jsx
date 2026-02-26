import { motion } from 'framer-motion'
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

// ─── SKILL BAR ─────────────────────────────────────────────────
function SkillBar({ name, pct, delay = 0 }) {
  const [ref, visible] = useScrollReveal(0.2)
  return (
    <div className="mb-4" ref={ref}>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{name}</span>
        <span className="font-mono text-[0.68rem]" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
      </div>
      <div className="skill-bar-track">
        <motion.div
          className="skill-bar-fill"
          initial={{ width: 0 }}
          animate={visible ? { width: `${pct}%` } : {}}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay }}
        />
      </div>
    </div>
  )
}

const SKILLS = {
  development: [
    { name: 'HTML / CSS',   pct: 92 },
    { name: 'JavaScript',   pct: 80 },
    { name: 'Python',       pct: 75 },
    { name: 'PHP / MySQL',  pct: 70 },
    { name: 'React',        pct: 68 },
  ],
  networking: [
    { name: 'Router Config',  pct: 88 },
    { name: 'LAN / WAN Setup',pct: 85 },
    { name: 'Network Security',pct:78 },
    { name: 'WiFi Planning',  pct: 90 },
    { name: 'VLANs',          pct: 74 },
  ],
  support: [
    { name: 'Windows / Linux', pct: 95 },
    { name: 'Hardware Repair', pct: 82 },
    { name: 'System Maint.',   pct: 88 },
    { name: 'Troubleshooting', pct: 93 },
    { name: 'Cloud (Basic)',   pct: 65 },
  ],
}

const TIMELINE = [
  { year: '2024', role: 'Senior IT Consultant', place: 'Freelance — Nairobi' },
  { year: '2022', role: 'Systems Developer',    place: 'TechSolutions Ltd.' },
  { year: '2020', role: 'IT Support Engineer',  place: 'NetConnect Africa' },
  { year: '2019', role: 'Diploma — ICT',        place: 'Kenya National Polytechnic' },
]

export default function About() {
  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="pt-[68px]" style={{ background: 'var(--bg)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10 py-20 border-b" style={{ borderColor: 'var(--border)' }}>
          <motion.div {...fadeUp(0.1)}><div className="section-label">Who I Am</div></motion.div>
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
                <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,85,255,0.12) 0%, transparent 55%)' }} />
              </div>
              {/* Badge */}
              <div
                className="absolute -bottom-4 -right-4 rounded-lg text-white text-center px-5 py-4"
                style={{ background: 'var(--accent)' }}
              >
                <span className="font-display text-3xl leading-none block">5+</span>
                <span className="font-mono text-[0.58rem] tracking-[0.15em] uppercase opacity-85">Yrs Exp.</span>
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
            <Reveal><div className="section-label">Professional Bio</div></Reveal>
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

            {/* Mission quote */}
            <Reveal delay={0.3}>
              <blockquote
                className="border-l-[3px] pl-5 my-7 italic text-[1.02rem] leading-relaxed"
                style={{ borderColor: 'var(--accent)', color: 'var(--text)' }}
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
          <Reveal><div className="section-label">Capabilities</div></Reveal>
          <Reveal delay={0.1}>
            <div className="text-display-md font-display mb-2" style={{ color: 'var(--text)' }}>Skills &amp; Expertise</div>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-sm max-w-md mb-14" style={{ color: 'var(--text-muted)' }}>
              A full-stack skillset covering development, networking, and IT support.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <Reveal>
                <h3 className="font-display text-2xl tracking-wide mb-6" style={{ color: 'var(--text)' }}>Development</h3>
              </Reveal>
              {SKILLS.development.map((s, i) => (
                <SkillBar key={s.name} {...s} delay={i * 0.1} />
              ))}
            </div>
            <div>
              <Reveal>
                <h3 className="font-display text-2xl tracking-wide mb-6" style={{ color: 'var(--text)' }}>Networking</h3>
              </Reveal>
              {SKILLS.networking.map((s, i) => (
                <SkillBar key={s.name} {...s} delay={i * 0.1} />
              ))}
            </div>
            <div>
              <Reveal>
                <h3 className="font-display text-2xl tracking-wide mb-6" style={{ color: 'var(--text)' }}>IT Support</h3>
              </Reveal>
              {SKILLS.support.map((s, i) => (
                <SkillBar key={s.name} {...s} delay={i * 0.1} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TIMELINE ─────────────────────────────────────────── */}
      <section className="py-20 border-b" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">
          <Reveal><div className="section-label">Experience</div></Reveal>
          <Reveal delay={0.1}>
            <div className="text-display-md font-display mb-14" style={{ color: 'var(--text)' }}>Career Path</div>
          </Reveal>

          <div className="relative border-l-2 pl-10 space-y-10" style={{ borderColor: 'var(--border)' }}>
            {TIMELINE.map((item, i) => (
              <Reveal key={item.year} delay={i * 0.12}>
                <div className="relative">
                  {/* Dot */}
                  <div
                    className="absolute -left-[2.85rem] w-4 h-4 rounded-full border-2 border-accent"
                    style={{ background: 'var(--bg)', borderColor: 'var(--accent)' }}
                  />
                  <div className="font-mono text-[0.65rem] tracking-[0.2em] uppercase mb-1" style={{ color: 'var(--accent)' }}>
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
          <Reveal><div className="section-label mb-10">In The Lab</div></Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { src: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&q=80&fit=crop', alt: 'Code on monitors' },
              { src: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80&fit=crop', alt: 'Server rack' },
              { src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80&fit=crop', alt: 'Circuit board closeup' },
              { src: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=500&q=80&fit=crop', alt: 'Network cables' },
            ].map((img, i) => (
              <Reveal key={img.src} delay={i * 0.1}>
                <div className="aspect-square overflow-hidden rounded-lg">
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

      <Footer />
    </>
  )
}
