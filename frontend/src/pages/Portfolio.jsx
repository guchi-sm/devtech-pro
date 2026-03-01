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

  /* tech tag matching orange palette */
  .tech-tag {
    font-family: monospace;
    font-size: 0.6rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.25rem 0.6rem;
    border-radius: 2px;
    background: rgba(245,166,35,0.1);
    color: #1c2d3f;
    border: 1px solid rgba(245,166,35,0.3);
    display: inline-block;
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

const PROJECTS = [
  {
    id: 1,
    index: '001',
    category: 'Software Dev',
    title: 'Inventory Management System',
    desc: 'A full-featured stock management system built for a local retail business. Features barcode scanning, low-stock alerts, supplier tracking, automated reorder, and detailed sales reporting.',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&fit=crop',
    tags: ['PHP', 'MySQL', 'Bootstrap', 'JavaScript', 'Chart.js'],
    year: '2024',
    duration: '8 weeks',
    outcome: 'Reduced stockout incidents by 60%',
  },
  {
    id: 2,
    index: '002',
    category: 'Web Dev',
    title: 'Business Website',
    desc: 'A modern, mobile-first website for a logistics company. Includes service showcase, team section, interactive contact form, Google Maps integration, and full SEO optimization.',
    img: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80&fit=crop',
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Figma', 'SEO'],
    year: '2024',
    duration: '3 weeks',
    outcome: '40% increase in online inquiries',
  },
  {
    id: 3,
    index: '003',
    category: 'Networking',
    title: 'Small Office Network Setup',
    desc: 'Full LAN deployment for a 20-person office including structured cabling, managed switch, router configuration, WiFi access points, VLAN segmentation, and network documentation.',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80&fit=crop',
    tags: ['Cisco', 'MikroTik', 'Cat6 Cabling', 'VLAN', 'Ubiquiti'],
    year: '2023',
    duration: '2 weeks',
    outcome: '99.8% uptime in first 6 months',
  },
  {
    id: 4,
    index: '004',
    category: 'IT Support',
    title: 'IT Infrastructure Overhaul',
    desc: 'Complete IT overhaul for an NGO — migrated from legacy desktop systems to cloud-ready workstations, deployed centralized backup, and established IT support procedures.',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80&fit=crop',
    tags: ['Windows Server', 'Active Directory', 'Cloud Backup', 'IT Policy'],
    year: '2023',
    duration: '6 weeks',
    outcome: 'Zero data loss incidents post-migration',
  },
  {
    id: 5,
    index: '005',
    category: 'Software Dev',
    title: 'HR Management Portal',
    desc: 'Web-based HR portal for a 50-employee company — leave management, attendance tracking, payroll calculations, and employee self-service portal.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&fit=crop',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    year: '2024',
    duration: '10 weeks',
    outcome: 'Cut HR admin time by 35%',
  },
  {
    id: 6,
    index: '006',
    category: 'Networking',
    title: 'Retail Chain WiFi Deployment',
    desc: 'Multi-site WiFi deployment across 4 retail branches with centralized management, captive portal for customers, and secure staff VLAN.',
    img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80&fit=crop',
    tags: ['Ubiquiti UniFi', 'VLAN', 'Captive Portal', 'Site Survey'],
    year: '2023',
    duration: '4 weeks',
    outcome: 'Full coverage across all 4 sites',
  },
]

const CATEGORIES = ['All', 'Software Dev', 'Web Dev', 'Networking', 'IT Support']

// ─── PROJECT CARD ───────────────────────────────────────────────
function ProjectCard({ proj, delay }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Reveal delay={delay}>
      <div
        className="group cursor-pointer overflow-hidden"
        style={{
          background: '#fff',
          border: `1px solid ${hovered ? '#f5a623' : 'var(--border)'}`,
          transition: 'border-color .3s, box-shadow .3s, transform .3s',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: hovered ? '0 16px 40px rgba(28,45,63,.12)' : 'none',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* ── Photo section ─────────────────────────────── */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={proj.img}
            alt={proj.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          {/* Category badge — orange */}
          <div
            className="absolute top-3 right-3 font-mono text-[0.58rem] tracking-[0.15em] uppercase px-2.5 py-1"
            style={{ background: '#f5a623', color: '#1c2d3f', fontWeight: 700 }}
          >
            {proj.category}
          </div>

          {/* Ghost index */}
          <div className="absolute bottom-4 left-5 font-display text-5xl leading-none" style={{ color: 'rgba(255,255,255,.15)' }}>
            {proj.index}
          </div>

          {/* Outcome slide-up on hover */}
          <div
            className="absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300"
            style={{
              background: '#1c2d3f',
              transform: hovered ? 'translateY(0)' : 'translateY(100%)',
              borderTop: '3px solid #f5a623',
            }}
          >
            <p style={{ color: '#f5a623', fontSize: '.75rem', fontWeight: 700 }}>
              ✓ {proj.outcome}
            </p>
          </div>
        </div>

        {/* ── Card footer — body with image overlay ─────── */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>

          {/* Background image bleed from project photo — the image overlay */}
          <img
            src={proj.img}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover',
              opacity: hovered ? 0.07 : 0.04,
              filter: 'blur(2px) saturate(0.5)',
              transition: 'opacity .4s',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />

          {/* Navy-tinted overlay so text stays readable */}
          <div style={{
            position: 'absolute', inset: 0,
            background: hovered
              ? 'linear-gradient(135deg, rgba(28,45,63,.06) 0%, rgba(245,166,35,.04) 100%)'
              : 'rgba(255,255,255,.92)',
            transition: 'background .4s',
            pointerEvents: 'none',
          }} />

          {/* Left orange accent bar */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: hovered ? 3 : 0,
            background: '#f5a623',
            transition: 'width .3s',
          }} />

          {/* Content — sits above overlay */}
          <div className="p-6" style={{ position: 'relative', zIndex: 1 }}>
            {/* Year / duration — orange */}
            <div
              className="font-mono text-[0.6rem] tracking-[0.2em] uppercase mb-2"
              style={{ color: '#f5a623', fontWeight: 700 }}
            >
              {proj.year} · {proj.duration}
            </div>

            {/* Title — navy */}
            <h3
              className="font-display text-xl tracking-wide mb-2.5"
              style={{ color: '#1c2d3f' }}
            >
              {proj.title}
            </h3>

            {/* Description */}
            <p
              className="text-xs leading-relaxed mb-4"
              style={{ color: 'var(--text-muted)' }}
            >
              {proj.desc}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {proj.tags.map(tag => (
                <span key={tag} className="tech-tag">{tag}</span>
              ))}
            </div>

            {/* View link — orange on hover */}
            <a
              href="#"
              onClick={e => e.preventDefault()}
              className="inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.12em] uppercase transition-colors duration-200"
              style={{ color: hovered ? '#f5a623' : 'var(--text-muted)', fontWeight: 600 }}
            >
              View Case Study
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

// ═══════════════════════════════════════════════════════════════
export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [query, setQuery] = useState('')

  const filtered = PROJECTS.filter(p => {
    const matchCat = activeFilter === 'All' || p.category === activeFilter
    const q = query.toLowerCase()
    const matchQuery = !q ||
      p.title.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    return matchCat && matchQuery
  })

  return (
    <>
      <style>{THEME_OVERRIDE}</style>

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="pt-[68px]" style={{ background: 'var(--bg)' }}>
        <div
          className="max-w-[1280px] mx-auto px-8 md:px-10 py-20 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Orange accent bar */}
          <div style={{ width: 48, height: 4, background: '#f5a623', borderRadius: 2, marginBottom: '1.2rem' }} />
          <motion.div {...fadeUp(0.1)}><div className="section-label">Selected Work</div></motion.div>
          <motion.div {...fadeUp(0.2)}>
            <div className="text-display-lg font-display" style={{ color: 'var(--text)' }}>Portfolio</div>
          </motion.div>
          <motion.p
            {...fadeUp(0.3)}
            className="text-sm leading-relaxed max-w-md mt-4"
            style={{ color: 'var(--text-muted)' }}
          >
            A selection of projects spanning software development, networking, and IT deployments.
          </motion.p>
        </div>
      </section>

      {/* ─── FILTER + SEARCH ──────────────────────────────────── */}
      <section style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">
          <div className="flex flex-col gap-3 py-5">

            {/* Search */}
            <div className="relative max-w-sm">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
                fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Search projects, tags, tech..."
                value={query}
                onChange={e => { setQuery(e.target.value); setActiveFilter('All') }}
                className="w-full font-mono text-[0.68rem] tracking-wide pl-9 pr-4 py-2 rounded outline-none transition-all duration-200"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
                onFocus={e => (e.target.style.borderColor = '#f5a623')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>

            {/* Category filters — orange active state */}
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className="font-mono text-[0.65rem] tracking-[0.14em] uppercase px-4 py-2 transition-all duration-200"
                  style={{
                    background: activeFilter === cat ? '#f5a623' : 'transparent',
                    color:      activeFilter === cat ? '#1c2d3f' : 'var(--text-muted)',
                    border:     `1px solid ${activeFilter === cat ? '#f5a623' : 'var(--border)'}`,
                    fontWeight: activeFilter === cat ? 700 : 400,
                    borderRadius: 2,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROJECTS GRID ────────────────────────────────────── */}
      <section className="py-10 pb-24" style={{ background: '#f4f6f9' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.length === 0 && (
              <div
                className="col-span-3 py-24 text-center font-mono text-[0.72rem] tracking-widest uppercase"
                style={{ color: 'var(--text-muted)', background: 'var(--bg-card)' }}
              >
                No projects found for "{query}" — try a different search.
              </div>
            )}
            {filtered.map((proj, i) => (
              <ProjectCard key={proj.id} proj={proj} delay={i * 0.08} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA BAND ─────────────────────────────────────────── */}
      <section style={{ background: '#1c2d3f', padding: '4rem 0' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <Reveal>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '.5rem', lineHeight: 1.2 }}>
                Have a project in mind?
              </div>
              <p style={{ fontSize: '.95rem', color: 'rgba(255,255,255,.65)' }}>
                Let's discuss how I can help bring your idea to life.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <Link
              to="/contact"
              style={{
                background: '#f5a623', color: '#1c2d3f',
                fontWeight: 700, fontSize: '.9rem',
                padding: '.85rem 2.4rem', borderRadius: 2,
                textDecoration: 'none', border: '2px solid #f5a623',
                transition: 'all .25s', whiteSpace: 'nowrap', display: 'inline-block',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f5a623'; e.currentTarget.style.color = '#1c2d3f' }}
            >
              Start a Project →
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  )
}
