import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useScrollReveal } from '../hooks/useScrollReveal'
import Footer from '../components/Footer'

// ─── THEME ────────────────────────────────────────────────────
const THEME_OVERRIDE = `
  :root {
    --bg: #ffffff; --bg-2: #f4f6f9; --bg-card: #ffffff;
    --accent: #f5a623; --accent-glow: rgba(245,166,35,0.12);
    --text: #1c2d3f; --text-muted: #6b7a8d; --border: #e2e8f0;
  }
  .tech-tag {
    font-family: monospace; font-size: 0.6rem; letter-spacing: 0.1em;
    text-transform: uppercase; padding: 0.25rem 0.6rem; border-radius: 2px;
    background: rgba(245,166,35,0.1); color: #1c2d3f;
    border: 1px solid rgba(245,166,35,0.3); display: inline-block;
  }
`

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 36 }, animate: { opacity: 1, y: 0 },
  transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1], delay },
})

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, visible] = useScrollReveal()
  return (
    <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 32 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}>
      {children}
    </motion.div>
  )
}

const API_URL = import.meta.env.VITE_API_URL || 'https://devtech-pro-api-production.up.railway.app'

// ─── PROJECTS DATA ────────────────────────────────────────────
const PROJECTS = [
  {
    id: 1, index: '001', category: 'Software Dev',
    title: 'Inventory Management System',
    desc: 'A full-featured stock management system built for a local retail business. Features barcode scanning, low-stock alerts, supplier tracking, automated reorder, and detailed sales reporting.',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80&fit=crop',
    tags: ['PHP', 'MySQL', 'Bootstrap', 'JavaScript', 'Chart.js'],
    year: '2024', duration: '8 weeks', outcome: 'Reduced stockout incidents by 60%',
    client: 'Local Retail Business, Meru',
    challenge: 'The client was managing 300+ SKUs in Excel, losing stock daily due to entry errors and timing gaps. Reorder decisions were reactive and based on guesswork.',
    solution: 'Built a full POS-integrated inventory system with barcode support, real-time stock tracking, automatic WhatsApp reorder alerts, and a dashboard showing daily sales trends by category.',
    results: ['60% reduction in stockout incidents', 'KES 22,000/month saved in recovered productivity', 'Reorder lead time cut from 4 days to same-day'],
  },
  {
    id: 2, index: '002', category: 'Web Dev',
    title: 'Corporate Business Website',
    desc: 'A modern, mobile-first website for a logistics company. Includes service showcase, team section, interactive contact form, Google Maps integration, and full SEO optimization.',
    img: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80&fit=crop',
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Figma', 'SEO'],
    year: '2024', duration: '3 weeks', outcome: '40% increase in online inquiries',
    client: 'Logistics Company, Nairobi',
    challenge: 'No online presence meant the business was invisible to new clients searching online. Competitors with basic websites were winning contracts by default.',
    solution: 'Designed and built a professional website from Figma mockups through to deployment. Full SEO setup including meta tags, structured data, Google Business integration, and page speed optimization.',
    results: ['40% increase in inbound inquiries within 2 months', 'First-page Google ranking for 3 local keywords', 'Page speed score 94/100 on mobile'],
  },
  {
    id: 3, index: '003', category: 'Networking',
    title: 'Small Office Network Setup',
    desc: 'Full LAN deployment for a 20-person office including structured cabling, managed switch, router configuration, WiFi access points, VLAN segmentation, and network documentation.',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80&fit=crop',
    tags: ['Cisco', 'MikroTik', 'Cat6 Cabling', 'VLAN', 'Ubiquiti'],
    year: '2023', duration: '2 weeks', outcome: '99.8% uptime in first 6 months',
    client: 'Professional Services Firm, Meru',
    challenge: 'The office was running on a single consumer router with no segmentation. Staff and visitor devices were on the same network as financial systems. Frequent dropouts disrupted operations.',
    solution: 'Deployed full structured cabling (Cat6), MikroTik hEX firewall/router, TP-Link managed switch with VLANs separating staff, finance, and guest networks, and 2× Ubiquiti APs for full coverage.',
    results: ['99.8% network uptime in first 6 months', 'Zero security incidents post-deployment', 'Full written network documentation delivered'],
  },
  {
    id: 4, index: '004', category: 'IT Support',
    title: 'IT Infrastructure Overhaul',
    desc: 'Complete IT overhaul for an NGO — migrated from legacy desktop systems to cloud-ready workstations, deployed centralized backup, and established IT support procedures.',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80&fit=crop',
    tags: ['Windows Server', 'Active Directory', 'Cloud Backup', 'IT Policy'],
    year: '2023', duration: '6 weeks', outcome: 'Zero data loss incidents post-migration',
    client: 'NGO, Central Kenya',
    challenge: "7-year-old workstations running Windows 7, no centralised backup, no IT policy. A hard drive failure had already caused partial data loss. The organisation had no IT budget visibility.",
    solution: 'Audited all hardware, replaced critical machines, deployed Windows Server with Active Directory for centralised login, configured automated cloud backup to Google Workspace, and wrote an IT policy document for staff.',
    results: ['Zero data loss incidents in 12 months post-migration', 'Backup recovery tested successfully quarterly', 'IT support costs reduced by 40% through standardisation'],
  },
  {
    id: 5, index: '005', category: 'Software Dev',
    title: 'HR Management Portal',
    desc: 'Web-based HR portal for a 50-employee company — leave management, attendance tracking, payroll calculations, and employee self-service portal.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&fit=crop',
    tags: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    year: '2024', duration: '10 weeks', outcome: 'Cut HR admin time by 35%',
    client: 'Manufacturing Company, Meru',
    challenge: 'HR was managing leave requests via WhatsApp, attendance via paper registers, and payroll via Excel. Errors were frequent. Disputes over leave balances were a recurring issue.',
    solution: 'Built a full-stack HR portal with employee self-service (leave application, payslip download), manager approval workflows, biometric attendance integration, and automated payroll calculation with M-Pesa batch export.',
    results: ['35% reduction in HR admin time per month', 'Leave disputes dropped to near zero', 'Payroll processing time cut from 2 days to 3 hours'],
  },
  {
    id: 6, index: '006', category: 'Networking',
    title: 'Retail Chain WiFi Deployment',
    desc: 'Multi-site WiFi deployment across 4 retail branches with centralized management, captive portal for customers, and secure staff VLAN.',
    img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80&fit=crop',
    tags: ['Ubiquiti UniFi', 'VLAN', 'Captive Portal', 'Site Survey'],
    year: '2023', duration: '4 weeks', outcome: 'Full coverage across all 4 sites',
    client: 'Retail Chain, 4 branches',
    challenge: "4 retail branches all running independent consumer routers with no central visibility. Staff were using the same WiFi as customers. No captive portal meant no data collection from customer WiFi usage.",
    solution: 'Site survey across all 4 locations, Ubiquiti UniFi deployment with centralized cloud controller, captive portal with SMS login for customer data collection, staff VLAN isolated from customer traffic.',
    results: ['Full WiFi coverage across all 4 sites', 'Centralized monitoring — one dashboard for all branches', 'Customer WiFi data now feeds into marketing campaigns'],
  },
]

const CATEGORIES = ['All', 'Software Dev', 'Web Dev', 'Networking', 'IT Support']

// ─── PROFILE SECTION ─────────────────────────────────────────
// 👇 Replace PHOTO_URL with your actual Cloudinary photo URL
const PHOTO_URL = 'https://images.unsplash.com/photo-1607705703571-c5a8695f18f6?w=400&q=85&fit=crop&crop=face'
// To use your own photo:
// 1. Upload to Cloudinary (cloud name: dtsjd5u2s, preset: devtech_resources)
// 2. Replace the URL above with your Cloudinary URL

function ProfileSection() {
  return (
    <Reveal>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        marginBottom: '2.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(1.5rem, 4vw, 3rem)',
        flexWrap: 'wrap',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* background accent */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Photo */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 'clamp(90px, 16vw, 130px)',
            height: 'clamp(90px, 16vw, 130px)',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '4px solid #f5a623',
            boxShadow: '0 0 0 4px rgba(245,166,35,0.15)',
          }}>
            <img
              src={PHOTO_URL}
              alt="Guchi Brown — ICT Technician & Software Developer"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
            />
          </div>
          {/* Available badge */}
          <div style={{
            position: 'absolute', bottom: 4, right: 4,
            background: '#fff', border: '2px solid #fff',
            borderRadius: '50%', width: 22, height: 22,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{
            fontSize: '0.6rem', fontFamily: 'monospace', letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#f5a623', fontWeight: 700,
            marginBottom: '0.4rem',
          }}>
            Available for Projects
          </div>
          <h2 style={{
            fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 900,
            color: 'var(--text)', marginBottom: '0.3rem', lineHeight: 1.2,
          }}>
            Guchi Brown
          </h2>
          <div style={{
            fontSize: '0.82rem', color: 'var(--text-muted)',
            marginBottom: '0.85rem', fontWeight: 500,
          }}>
            ICT Technician & Software Developer · Meru, Kenya
          </div>
          <p style={{
            fontSize: '0.85rem', color: 'var(--text-muted)',
            lineHeight: 1.7, marginBottom: '1.25rem', maxWidth: 520,
          }}>
            I build reliable software and IT infrastructure for businesses across Kenya.
            5+ years delivering real results — from custom business systems to full network deployments.
          </p>
          {/* Quick stats */}
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            {[
              { num: '30+', label: 'Projects' },
              { num: '15+', label: 'Clients' },
              { num: '5+', label: 'Years Exp.' },
              { num: '99%', label: 'Uptime SLA' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1c2d3f', lineHeight: 1 }}>
                  {s.num}
                </div>
                <div style={{ fontSize: '0.62rem', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flexShrink: 0 }}>
          <Link to="/contact" style={{
            background: '#f5a623', color: '#1c2d3f',
            fontWeight: 700, fontSize: '0.82rem',
            padding: '0.7rem 1.5rem', borderRadius: 7,
            textDecoration: 'none', textAlign: 'center',
            border: '2px solid #f5a623', transition: 'all .2s', whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1c2d3f' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#f5a623'; e.currentTarget.style.color = '#1c2d3f' }}
          >
            Hire Me →
          </Link>
          <a href="https://wa.me/254790078363" target="_blank" rel="noopener noreferrer" style={{
            background: '#25D366', color: '#fff',
            fontWeight: 700, fontSize: '0.82rem',
            padding: '0.7rem 1.5rem', borderRadius: 7,
            textDecoration: 'none', textAlign: 'center',
            transition: 'opacity .2s', whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
    </Reveal>
  )
}

// ─── PROJECT CARD ─────────────────────────────────────────────
function ProjectCard({ proj, delay, onOpen }) {
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
          borderRadius: 4,
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onOpen(proj)}
      >
        <div className="relative h-52 overflow-hidden">
          <img src={proj.img} alt={proj.title} loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute top-3 right-3 font-mono text-[0.58rem] tracking-[0.15em] uppercase px-2.5 py-1"
            style={{ background: '#f5a623', color: '#1c2d3f', fontWeight: 700 }}>
            {proj.category}
          </div>
          <div className="absolute bottom-4 left-5 font-display text-5xl leading-none"
            style={{ color: 'rgba(255,255,255,.15)' }}>
            {proj.index}
          </div>
          {/* Outcome slide-up on hover */}
          <div className="absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300"
            style={{
              background: '#1c2d3f',
              transform: hovered ? 'translateY(0)' : 'translateY(100%)',
              borderTop: '3px solid #f5a623',
            }}>
            <p style={{ color: '#f5a623', fontSize: '.75rem', fontWeight: 700 }}>✓ {proj.outcome}</p>
          </div>
        </div>

        <div style={{ position: 'relative', overflow: 'hidden' }}>
          {/* subtle bg image */}
          <img src={proj.img} alt="" aria-hidden="true" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', opacity: hovered ? 0.07 : 0.04,
            filter: 'blur(2px) saturate(0.5)', transition: 'opacity .4s', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: hovered ? 'linear-gradient(135deg, rgba(28,45,63,.06) 0%, rgba(245,166,35,.04) 100%)' : 'rgba(255,255,255,.92)',
            transition: 'background .4s', pointerEvents: 'none',
          }} />
          {/* left accent bar */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: hovered ? 3 : 0, background: '#f5a623', transition: 'width .3s',
          }} />
          <div className="p-6" style={{ position: 'relative', zIndex: 1 }}>
            <div className="font-mono text-[0.6rem] tracking-[0.2em] uppercase mb-2"
              style={{ color: '#f5a623', fontWeight: 700 }}>
              {proj.year} · {proj.duration}
            </div>
            <h3 className="font-display text-xl tracking-wide mb-2.5" style={{ color: '#1c2d3f' }}>
              {proj.title}
            </h3>
            <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
              {proj.desc}
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {proj.tags.map(tag => <span key={tag} className="tech-tag">{tag}</span>)}
            </div>
            <div className="inline-flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.12em] uppercase"
              style={{ color: hovered ? '#f5a623' : 'var(--text-muted)', fontWeight: 600, transition: 'color .2s' }}>
              View Case Study
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
                style={{ transform: hovered ? 'translateX(3px)' : 'translateX(0)', transition: 'transform .2s' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

// ─── CASE STUDY MODAL ─────────────────────────────────────────
function CaseStudyModal({ proj, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', fn); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(7,12,20,0.82)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 12, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: '#fff', borderRadius: 16,
          width: '100%', maxWidth: 720,
          maxHeight: '90vh', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
          borderTop: '4px solid #f5a623',
        }}
      >
        {/* Hero image */}
        <div style={{ position: 'relative', height: 220, flexShrink: 0 }}>
          <img src={proj.img} alt={proj.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,12,20,0.9) 0%, rgba(7,12,20,0.4) 60%, transparent 100%)' }} />
          {/* Close button */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 14, right: 14,
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(7,12,20,0.7)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
            fontSize: '1.1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(7,12,20,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
          >✕</button>
          {/* Title over image */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem 1.75rem' }}>
            <div style={{
              display: 'inline-block', background: '#f5a623', color: '#1c2d3f',
              fontSize: '0.58rem', fontFamily: 'monospace', letterSpacing: '0.14em',
              textTransform: 'uppercase', fontWeight: 700,
              padding: '0.25rem 0.7rem', borderRadius: 3, marginBottom: '0.6rem',
            }}>{proj.category}</div>
            <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.6rem)', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.2 }}>
              {proj.title}
            </h2>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1.75rem' }}>

          {/* Meta row */}
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            {[
              { label: 'Client', value: proj.client },
              { label: 'Year', value: proj.year },
              { label: 'Duration', value: proj.duration },
            ].map(m => (
              <div key={m.label}>
                <div style={{ fontSize: '0.58rem', fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f5a623', fontWeight: 700, marginBottom: '0.25rem' }}>{m.label}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1c2d3f' }}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Challenge */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#f5a623', fontWeight: 700, marginBottom: '0.6rem' }}>
              The Challenge
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: '#6b7a8d', margin: 0 }}>{proj.challenge}</p>
          </div>

          {/* Solution */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#f5a623', fontWeight: 700, marginBottom: '0.6rem' }}>
              My Solution
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.75, color: '#6b7a8d', margin: 0 }}>{proj.solution}</p>
          </div>

          {/* Results */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#f5a623', fontWeight: 700, marginBottom: '0.75rem' }}>
              Results
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {proj.results.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                  <span style={{ color: '#22c55e', fontSize: '0.9rem', flexShrink: 0, marginTop: '0.1rem' }}>✓</span>
                  <span style={{ fontSize: '0.88rem', color: '#1c2d3f', fontWeight: 500 }}>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.6rem' }}>
              Technologies Used
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {proj.tags.map(tag => <span key={tag} className="tech-tag">{tag}</span>)}
            </div>
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
            <Link to="/contact"
              onClick={onClose}
              style={{
                background: '#f5a623', color: '#1c2d3f',
                fontWeight: 700, fontSize: '0.85rem',
                padding: '0.75rem 1.75rem', borderRadius: 7,
                textDecoration: 'none', border: '2px solid #f5a623',
                transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'transparent' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f5a623' }}
            >
              Start a Similar Project →
            </Link>
            <a href="https://wa.me/254790078363"
              target="_blank" rel="noopener noreferrer"
              style={{
                background: '#25D366', color: '#fff',
                fontWeight: 700, fontSize: '0.85rem',
                padding: '0.75rem 1.75rem', borderRadius: 7,
                textDecoration: 'none', transition: 'opacity .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              💬 Discuss This Project
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────
export default function Portfolio() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [projects, setProjects] = useState(PROJECTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openProj, setOpenProj] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/api/projects`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.projects?.length > 0) {
          setProjects(data.projects.map((p, i) => ({
            ...p, id: p._id,
            index: p.index || String(i + 1).padStart(3, '0'),
          })))
        }
      })
      .catch(() => setError('Showing local projects.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = projects.filter(p => {
    const matchCat = activeFilter === 'All' || p.category === activeFilter
    const q = query.toLowerCase()
    return matchCat && (!q || p.title.toLowerCase().includes(q) || p.desc?.toLowerCase().includes(q) || (p.tags || []).some(t => t.toLowerCase().includes(q)))
  })

  return (
    <>
      <style>{THEME_OVERRIDE}</style>

      {/* ─── HERO ── */}
      <section style={{ position: 'relative', paddingTop: '70px', minHeight: '380px', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,17,40,0.92) 0%, rgba(28,45,63,0.85) 60%, rgba(245,166,35,0.15) 100%)' }} />
        <div className="max-w-[1280px] mx-auto px-8 md:px-10 py-20 w-full" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: 48, height: 4, background: '#f5a623', borderRadius: 2, marginBottom: '1.2rem' }} />
          <motion.div {...fadeUp(0.1)}>
            <div className="font-mono text-xs tracking-[0.2em] uppercase flex items-center gap-3 mb-4" style={{ color: '#f5a623' }}>
              <span style={{ display: 'block', height: '1px', width: 32, background: '#f5a623' }} />Selected Work
            </div>
          </motion.div>
          <motion.div {...fadeUp(0.2)}>
            <div className="text-display-lg font-display" style={{ color: '#ffffff' }}>Portfolio</div>
          </motion.div>
          <motion.p {...fadeUp(0.3)} className="text-sm leading-relaxed max-w-md mt-4" style={{ color: 'rgba(255,255,255,0.7)' }}>
            Real projects. Real results. A selection of work spanning software development, networking, and IT deployments across Kenya.
          </motion.p>
        </div>
      </section>

      {/* ─── FILTER + SEARCH ── */}
      <section style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">
          <div className="flex flex-col gap-3 py-5">
            <div className="relative max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--text-muted)' }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input type="text" placeholder="Search projects, tags, tech..."
                value={query} onChange={e => { setQuery(e.target.value); setActiveFilter('All') }}
                className="w-full font-mono text-[0.68rem] tracking-wide pl-9 pr-4 py-2 rounded outline-none transition-all duration-200"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
                onFocus={e => (e.target.style.borderColor = '#f5a623')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveFilter(cat)}
                  className="font-mono text-[0.65rem] tracking-[0.14em] uppercase px-4 py-2 transition-all duration-200"
                  style={{
                    background: activeFilter === cat ? '#f5a623' : 'transparent',
                    color: activeFilter === cat ? '#1c2d3f' : 'var(--text-muted)',
                    border: `1px solid ${activeFilter === cat ? '#f5a623' : 'var(--border)'}`,
                    fontWeight: activeFilter === cat ? 700 : 400, borderRadius: 2,
                  }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT ── */}
      <section className="py-10 pb-24" style={{ background: '#f4f6f9' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">

          {/* Profile card */}
          <ProfileSection />

          {error && (
            <div style={{ background: '#fef9ec', border: '1px solid #f5a623', borderRadius: 4, padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#1c2d3f', fontFamily: 'monospace' }}>
              ⚠️ {error}
            </div>
          )}
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'monospace', fontSize: '0.75rem', color: '#6b7a8d', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Loading projects…
            </div>
          )}

          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.length === 0 && !loading && (
              <div className="col-span-3 py-24 text-center font-mono text-[0.72rem] tracking-widest uppercase"
                style={{ color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 8 }}>
                No projects found for "{query}" — try a different search.
              </div>
            )}
            {filtered.map((proj, i) => (
              <ProjectCard key={proj.id} proj={proj} delay={i * 0.08} onOpen={setOpenProj} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA BAND ── */}
      <section style={{ position: 'relative', padding: '5rem 0', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=80&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(28,45,63,0.95) 0%, rgba(10,17,40,0.90) 60%, rgba(245,166,35,0.2) 100%)' }} />
        <div className="max-w-[1280px] mx-auto px-8 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6" style={{ position: 'relative', zIndex: 1 }}>
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
            <Link to="/contact" style={{
              background: '#f5a623', color: '#1c2d3f', fontWeight: 700, fontSize: '.9rem',
              padding: '.85rem 2.4rem', borderRadius: 2, textDecoration: 'none',
              border: '2px solid #f5a623', transition: 'all .25s', whiteSpace: 'nowrap', display: 'inline-block',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f5a623'; e.currentTarget.style.color = '#1c2d3f' }}>
              Start a Project →
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />

      {/* ─── CASE STUDY MODAL ── */}
      <AnimatePresence>
        {openProj && (
          <CaseStudyModal proj={openProj} onClose={() => setOpenProj(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
