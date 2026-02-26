import { useState } from 'react'
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

export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = activeFilter === 'All'
    ? PROJECTS
    : PROJECTS.filter(p => p.category === activeFilter)

  return (
    <>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="pt-[68px]" style={{ background: 'var(--bg)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10 py-20 border-b" style={{ borderColor: 'var(--border)' }}>
          <motion.div {...fadeUp(0.1)}><div className="section-label">Selected Work</div></motion.div>
          <motion.div {...fadeUp(0.2)}>
            <div className="text-display-lg font-display" style={{ color: 'var(--text)' }}>Portfolio</div>
          </motion.div>
          <motion.p {...fadeUp(0.3)} className="text-sm leading-relaxed max-w-md mt-4" style={{ color: 'var(--text-muted)' }}>
            A selection of projects spanning software development, networking, and IT deployments.
          </motion.p>
        </div>
      </section>

      {/* ─── FILTER TABS ──────────────────────────────────────── */}
      <section style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">
          <div className="flex flex-wrap gap-1 py-5">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className="font-mono text-[0.65rem] tracking-[0.14em] uppercase px-4 py-2 rounded transition-all duration-200"
                style={{
                  background: activeFilter === cat ? 'var(--accent)' : 'transparent',
                  color: activeFilter === cat ? '#fff' : 'var(--text-muted)',
                  border: `1px solid ${activeFilter === cat ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROJECTS GRID ────────────────────────────────────── */}
      <section className="py-10 pb-24" style={{ background: 'var(--bg)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ background: 'var(--border)' }}
          >
            {filtered.map((proj, i) => (
              <Reveal key={proj.id} delay={i * 0.08}>
                <div
                  className="project-card-inner group cursor-pointer overflow-hidden transition-colors duration-300"
                  style={{ background: 'var(--bg-card)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-card)')}
                >
                  {/* Photo */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={proj.img}
                      alt={proj.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                    {/* Category badge */}
                    <div className="absolute top-3 right-3 font-mono text-[0.58rem] tracking-[0.15em] uppercase px-2.5 py-1 rounded backdrop-blur-sm"
                      style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.75)' }}>
                      {proj.category}
                    </div>

                    {/* Index */}
                    <div className="absolute bottom-4 left-5 font-display text-5xl text-white/15 leading-none">
                      {proj.index}
                    </div>

                    {/* Outcome on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400"
                      style={{ background: 'var(--accent)' }}>
                      <p className="text-white text-xs font-medium">✓ {proj.outcome}</p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-6">
                    <div className="font-mono text-[0.6rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--accent)' }}>
                      {proj.year} · {proj.duration}
                    </div>
                    <h3 className="font-display text-xl tracking-wide mb-2.5" style={{ color: 'var(--text)' }}>
                      {proj.title}
                    </h3>
                    <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
                      {proj.desc}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {proj.tags.map(tag => (
                        <span key={tag} className="tech-tag">{tag}</span>
                      ))}
                    </div>

                    {/* Link */}
                    <a
                      href="#"
                      onClick={e => e.preventDefault()}
                      className="inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.12em] uppercase transition-colors duration-200"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      View Case Study
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="py-24 text-center border-t" style={{ background: 'var(--bg-2)', borderColor: 'var(--border)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">
          <Reveal>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              Have a project in mind? Let's build it.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Link to="/contact" className="btn btn-primary mx-auto">Start a Project →</Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  )
}
