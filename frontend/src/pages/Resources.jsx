import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal'
import Footer from '../components/Footer'
import toast, { Toaster } from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || 'https://devtech-pro-api-production.up.railway.app'
const API_URL = `${API_BASE}/api/resources`
console.log('[Resources] Fetching from:', API_URL)

const fadeUp = (d = 0) => ({ initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: d } })

function Reveal({ children, delay = 0 }) {
  const [ref, visible] = useScrollReveal()
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 28 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}>
      {children}
    </motion.div>
  )
}

// ─── CATEGORY CONFIG ───────────────────────────────────────────
const CATEGORIES = [
  { id: 'All',      label: 'All Resources', icon: '📦', color: '#f5a623' },
  { id: 'PDF',      label: 'PDF Guides',    icon: '📄', color: '#ef4444' },
  { id: 'Video',    label: 'Video Tutorials', icon: '🎥', color: '#3b82f6' },
  { id: 'Photo',    label: 'Photos & Diagrams', icon: '🖼️', color: '#22c55e' },
  { id: 'Software', label: 'Software & Tools', icon: '💾', color: '#a855f7' },
]

const CAT_META = {
  PDF:      { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: '📄' },
  Video:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  icon: '🎥' },
  Photo:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   icon: '🖼️' },
  Software: { color: '#a855f7', bg: 'rgba(168,85,247,0.1)', icon: '💾' },
}

// ─── FALLBACK DEMO DATA (shown when API has no resources yet) ──
const DEMO_RESOURCES = [
  { _id: 'd1', title: 'Office Network Setup Guide', description: 'Step-by-step PDF for setting up a secure small office LAN — covers cabling, switches, VLANs and WiFi.', category: 'PDF', thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80&fit=crop', fileSize: '2.1 MB', tags: ['Networking', 'LAN', 'Guide'], featured: true, downloadCount: 47 },
  { _id: 'd2', title: 'MikroTik Router Configuration Tutorial', description: 'Full video walkthrough of configuring a MikroTik router for a small business — firewall, NAT, DNS and bandwidth management.', category: 'Video', thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80&fit=crop', duration: '18:42', tags: ['MikroTik', 'Router', 'Tutorial'], featured: true, downloadCount: 89 },
  { _id: 'd3', title: 'Network Topology Diagrams Pack', description: 'Collection of 12 clean network diagrams (PNG + SVG) for common office layouts — star, mesh, ring and hybrid topologies.', category: 'Photo', thumbnail: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80&fit=crop', fileSize: '8.4 MB', tags: ['Diagrams', 'Topology', 'Templates'], downloadCount: 34 },
  { _id: 'd4', title: 'Windows Server 2022 Setup Checklist', description: 'Comprehensive PDF checklist for deploying Windows Server 2022 — Active Directory, DNS, DHCP, group policies and security hardening.', category: 'PDF', thumbnail: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=600&q=80&fit=crop', fileSize: '1.3 MB', tags: ['Windows Server', 'Checklist', 'AD'], downloadCount: 62 },
  { _id: 'd5', title: 'Inventory System Template (Excel + Access)', description: 'Ready-to-use inventory management template with formulas, stock alerts and a simple database version for small shops.', category: 'Software', thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80&fit=crop', fileSize: '3.7 MB', tags: ['Excel', 'Inventory', 'Template'], downloadCount: 115 },
  { _id: 'd6', title: 'Cybersecurity Basics for SMEs — Video Series', description: 'Three-part video series covering password management, phishing awareness and basic firewall setup for small business owners.', category: 'Video', thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&q=80&fit=crop', duration: '42:10', tags: ['Security', 'SME', 'Training'], downloadCount: 73 },
]

// ─── EMAIL GATE MODAL ──────────────────────────────────────────
function UnlockModal({ resource, onClose, onUnlocked }) {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [accessCode, setCode]   = useState('')
  const [needsCode, setNeedsCode] = useState(resource.isPremium || false)
  const [loading, setLoading]   = useState(false)
  const meta = CAT_META[resource.category] || CAT_META.PDF

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) { toast.error('Please fill in all fields.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Please enter a valid email.'); return }
    if (needsCode && !accessCode.trim()) { toast.error('Please enter your access code.'); return }

    setLoading(true)
    try {
      // Demo resources: simulate unlock
      if (resource._id.startsWith('d')) {
        await new Promise(r => setTimeout(r, 800))
        toast.success('Access granted! Your download is starting.')
        onUnlocked('#')
        return
      }

      const res = await fetch(`${API_URL}/${resource._id}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), accessCode: accessCode.trim() }),
      })
      const data = await res.json()

      // Backend says: needs code
      if (res.status === 403 && data.requiresCode) {
        setNeedsCode(true)
        toast.error(data.message || 'Access code required.')
        setLoading(false)
        return
      }

      if (!res.ok) throw new Error(data.message || 'Failed to unlock.')
      toast.success('Access granted! Your download is starting.')
      onUnlocked(data.fileUrl)
    } catch (err) {
      toast.error(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(6px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: 'var(--bg-card)', borderRadius: 12,
            border: `1px solid ${meta.color}40`,
            boxShadow: `0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px ${meta.color}20`,
            width: '100%', maxWidth: 460,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ background: `linear-gradient(135deg, #070c14, #0c1a2e)`, padding: '1.75rem 1.75rem 1.5rem', position: 'relative' }}>
            <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', color: '#fff', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: meta.bg, border: `1px solid ${meta.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                {meta.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', letterSpacing: '0.16em', textTransform: 'uppercase', color: meta.color, marginBottom: '0.3rem' }}>{resource.category}</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', lineHeight: 1.25 }}>{resource.title}</div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '1.75rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{resource.isPremium ? '👑' : '🔓'}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.4rem' }}>
                {resource.isPremium ? 'Premium Resource' : 'Free Access — Just Your Email'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {resource.isPremium
                  ? 'Enter your details and the access code shared with you to unlock this premium resource.'
                  : 'Enter your details below to instantly unlock and download this resource. No spam, ever.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Your Name</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="John Doe" autoFocus
                  className="form-input"
                  style={{ borderRadius: 6 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Email Address</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="form-input"
                  style={{ borderRadius: 6 }}
                />
              </div>

              {/* ── ACCESS CODE FIELD — shown for premium resources ── */}
              {needsCode && (
                <div>
                  <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.58rem', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#f5a623', marginBottom: '0.4rem' }}>
                    🔑 Access Code
                  </label>
                  <input
                    type="text" value={accessCode} onChange={e => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. GUCHI2024"
                    className="form-input"
                    style={{ borderRadius: 6, borderColor: 'rgba(245,166,35,0.5)', letterSpacing: '0.1em', fontFamily: 'monospace', fontWeight: 700 }}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <p style={{ fontSize: '0.68rem', color: 'rgba(245,166,35,0.7)', marginTop: '0.35rem', lineHeight: 1.4 }}>
                    This is a premium resource. Enter the access code shared with you via WhatsApp.
                  </p>
                </div>
              )}

              <button
                type="submit" disabled={loading}
                style={{
                  width: '100%', background: meta.color, color: '#fff',
                  border: 'none', padding: '0.9rem', borderRadius: 6,
                  fontWeight: 800, fontSize: '0.88rem', cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase',
                  opacity: loading ? 0.75 : 1, transition: 'opacity 0.2s',
                  marginTop: '0.25rem',
                }}
              >
                {loading
                  ? <><svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity: .25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{ opacity: .75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Unlocking…</>
                  : (resource.isPremium ? '🔑 Unlock Premium' : '🔓 Unlock & Download')}
              </button>

              <p style={{ textAlign: 'center', fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                🔒 Your email is safe. I never sell or share your data.
              </p>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── RESOURCE CARD ─────────────────────────────────────────────
function ResourceCard({ resource, onUnlock, delay }) {
  const [hovered, setHovered] = useState(false)
  const meta = CAT_META[resource.category] || CAT_META.PDF

  return (
    <Reveal delay={delay}>
      <div
        className="blog-card"
        style={{ borderTop: `3px solid ${hovered ? meta.color : 'transparent'}`, cursor: 'default' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Thumbnail */}
        <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: '#0c1220' }}>
          {resource.thumbnail
            ? <img src={resource.thumbnail} alt={resource.title} loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s', transform: hovered ? 'scale(1.07)' : 'scale(1)', opacity: 0.85 }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>{meta.icon}</div>
          }
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />

          {/* Premium badge */}
          {resource.isPremium && (
            <div style={{
              position:'absolute', top:'10px', left:'10px', zIndex:2,
              background:'linear-gradient(135deg,#f5a623,#e8940f)',
              color:'#1c2d3f', fontSize:'.58rem', fontFamily:'monospace',
              fontWeight:800, padding:'.25rem .6rem', borderRadius:'4px',
              letterSpacing:'.1em', textTransform:'uppercase',
              boxShadow:'0 2px 8px rgba(245,166,35,.5)',
            }}>👑 PREMIUM</div>
          )}
          {/* Category badge */}
          <div style={{ position: 'absolute', top: 10, left: 10, background: meta.color, color: '#fff', fontSize: '0.58rem', fontFamily: 'monospace', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: 3, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {meta.icon} {resource.category}
          </div>

          {/* Featured badge */}
          {resource.featured && (
            <div style={{ position: 'absolute', top: 10, right: 10, background: '#f5a623', color: '#1c2d3f', fontSize: '0.56rem', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.2rem 0.55rem', borderRadius: 3 }}>
              ⭐ Featured
            </div>
          )}

          {/* Duration for videos */}
          {resource.duration && (
            <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '0.68rem', fontFamily: 'monospace', padding: '0.2rem 0.55rem', borderRadius: 12 }}>
              ▶ {resource.duration}
            </div>
          )}

          {/* File size */}
          {resource.fileSize && (
            <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', color: '#fff', fontSize: '0.68rem', fontFamily: 'monospace', padding: '0.2rem 0.55rem', borderRadius: 12 }}>
              {resource.fileSize}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '1.25rem' }}>
          {/* Tags */}
          {resource.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
              {resource.tags.slice(0, 3).map(tag => (
                <span key={tag} style={{ fontSize: '0.56rem', fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0.15rem 0.45rem', background: `${meta.color}15`, border: `1px solid ${meta.color}30`, borderRadius: 3, color: meta.color, fontWeight: 600 }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, lineHeight: 1.35, color: 'var(--text)', marginBottom: '0.5rem', transition: 'color 0.2s', ...(hovered ? { color: meta.color } : {}) }}>
            {resource.title}
          </h3>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '1.1rem' }}>
            {resource.description}
          </p>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.85rem', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              ⬇ {resource.downloadCount || 0} downloads
            </span>
            <button
              onClick={() => onUnlock(resource)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: hovered ? meta.color : 'transparent',
                color: hovered ? '#fff' : meta.color,
                border: `1.5px solid ${meta.color}`,
                padding: '0.45rem 1rem', borderRadius: 6,
                fontSize: '0.68rem', fontFamily: 'monospace',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {resource.isPremium ? '🔑 Premium Access' : '🔓 Unlock Free'}
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

// ─── MAIN PAGE ─────────────────────────────────────────────────
export default function Resources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch]       = useState('')
  const [selectedResource, setSelectedResource] = useState(null)
  const [unlockedIds, setUnlockedIds] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('unlocked') || '[]') } catch { return [] }
  })

  useEffect(() => {
    fetch(API_URL)
      .then(r => {
        if (!r.ok) throw new Error(`API error ${r.status}`)
        return r.json()
      })
      .then(data => {
        // Use real API data — show empty state if none uploaded yet
        setResources(Array.isArray(data.data) ? data.data : [])
      })
      .catch(err => {
        console.error('Resources fetch error:', err)
        // Only fall back to demo if explicitly in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          setResources(DEMO_RESOURCES)
        } else {
          setResources([])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = resources.filter(r => {
    const matchCat = activeCategory === 'All' || r.category === activeCategory
    const q = search.toLowerCase()
    return matchCat && (!q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags?.some(t => t.toLowerCase().includes(q)))
  })

  const featured = filtered.filter(r => r.featured)
  const rest = filtered.filter(r => !r.featured)

  const handleUnlock = (resource) => {
    // Already unlocked this session
    if (unlockedIds.includes(resource._id)) {
      toast('Already unlocked! Re-downloading…', { icon: '✅' })
      triggerDownload(resource.fileUrl, resource.title)
      return
    }
    setSelectedResource(resource)
  }

  const handleUnlocked = (fileUrl) => {
    const id = selectedResource._id
    const newUnlocked = [...unlockedIds, id]
    setUnlockedIds(newUnlocked)
    try { sessionStorage.setItem('unlocked', JSON.stringify(newUnlocked)) } catch {}
    setSelectedResource(null)
    if (fileUrl && fileUrl !== '#') {
      triggerDownload(fileUrl, selectedResource.title)
    }
  }

  const triggerDownload = (url, title) => {
    if (!url || url === '#') { toast.error('File URL not available yet.'); return }
    const a = document.createElement('a')
    a.href = url
    a.download = title || 'resource'
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Stats from current resources
  const stats = {
    total: resources.length,
    pdf: resources.filter(r => r.category === 'PDF').length,
    video: resources.filter(r => r.category === 'Video').length,
    downloads: resources.reduce((sum, r) => sum + (r.downloadCount || 0), 0),
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)' } }} />

      {/* ─── HERO ── */}
      <section style={{ position: 'relative', paddingTop: '70px', minHeight: '380px', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Circuit board background image — same as Services/About/Portfolio */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />
        <div className="grid-overlay" style={{ zIndex: 2 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,17,40,0.93) 0%, rgba(28,45,63,0.87) 60%, rgba(245,166,35,0.14) 100%)', zIndex: 3 }} />
        <div style={{ position: 'absolute', top: '10%', right: '15%', width: 300, height: 300, background: 'rgba(245,166,35,0.07)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 3 }} />

        <div className="max-w-[1280px] mx-auto px-8 md:px-10 py-20 w-full" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ width: 48, height: 4, background: '#f5a623', borderRadius: 2, marginBottom: '1.2rem' }} />
          <motion.div {...fadeUp(0.1)}>
            <div className="font-mono text-xs tracking-[0.2em] uppercase flex items-center gap-3 mb-4" style={{ color: '#f5a623' }}>
              <span style={{ display: 'block', height: '1px', width: 32, background: '#f5a623' }} />Free Resources
            </div>
          </motion.div>
          <motion.div {...fadeUp(0.2)}>
            <div className="text-display-lg font-display" style={{ color: '#ffffff' }}>
              Downloads &<br /><span style={{ color: '#f5a623' }}>Resources</span>
            </div>
          </motion.div>
          <motion.p {...fadeUp(0.3)} style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', maxWidth: 460, marginTop: '1rem', lineHeight: 1.75 }}>
            Free guides, templates, videos and tools — unlock anything with just your email.
          </motion.p>

          {/* Quick stats */}
          <motion.div {...fadeUp(0.4)} style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '2.5rem' }}>
            {[
              { val: stats.total,     label: 'Resources' },
              { val: stats.pdf,       label: 'PDF Guides' },
              { val: stats.video,     label: 'Videos' },
              { val: `${stats.downloads}+`, label: 'Downloads' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f5a623', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: '0.6rem', fontFamily: 'monospace', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FILTERS ── */}
      <section style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', padding: '1rem 0', position: 'sticky', top: 70, zIndex: 50 }}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                  padding: '0.4rem 0.9rem', borderRadius: 20,
                  border: `1px solid ${activeCategory === cat.id ? cat.color : 'var(--border)'}`,
                  background: activeCategory === cat.id ? `${cat.color}18` : 'transparent',
                  color: activeCategory === cat.id ? cat.color : 'var(--text-muted)',
                  fontSize: '0.72rem', fontFamily: 'monospace',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  fontWeight: activeCategory === cat.id ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
          <input
            type="text" placeholder="🔍  Search resources..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)', fontSize: '0.82rem', outline: 'none', width: 220, fontFamily: 'inherit', transition: 'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor = '#f5a623'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </section>

      {/* ─── CONTENT ── */}
      <section style={{ background: 'var(--bg)', padding: '4rem 0 6rem' }}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">

          {loading ? (
            /* Skeleton */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ borderRadius: 8, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div style={{ height: 180, background: 'var(--bg-2)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', animation: 'shimmer 1.5s infinite' }} />
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    {[80, 100, 60].map((w, j) => (
                      <div key={j} style={{ height: j === 0 ? 14 : j === 1 ? 20 : 12, background: 'var(--bg-2)', borderRadius: 4, marginBottom: '0.75rem', width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>No resources found</p>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured.length > 0 && (
                <div style={{ marginBottom: '3rem' }}>
                  <Reveal>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#f5a623', fontWeight: 700 }}>⭐ Featured Resources</span>
                      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>
                  </Reveal>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featured.map((r, i) => <ResourceCard key={r._id} resource={r} onUnlock={handleUnlock} delay={i * 0.08} />)}
                  </div>
                </div>
              )}

              {/* Rest */}
              {rest.length > 0 && (
                <div>
                  {featured.length > 0 && (
                    <Reveal>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>All Resources</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                      </div>
                    </Reveal>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rest.map((r, i) => <ResourceCard key={r._id} resource={r} onUnlock={handleUnlock} delay={i * 0.07} />)}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Upload CTA */}
          <Reveal delay={0.2}>
            <div className="glass-card" style={{ marginTop: '4rem', padding: '2.5rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(245,166,35,0.05), rgba(168,85,247,0.03))' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>💡</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.4rem' }}>Want a custom guide for your business?</h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                I can create tailored documentation, network diagrams or training materials for your team.
              </p>
              <a href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f5a623', color: '#1c2d3f', fontWeight: 700, fontSize: '0.8rem', padding: '0.75rem 1.75rem', borderRadius: 6, textDecoration: 'none', fontFamily: 'monospace', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Request Custom Resource →
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── EMAIL GATE MODAL ── */}
      <AnimatePresence>
        {selectedResource && (
          <UnlockModal
            resource={selectedResource}
            onClose={() => setSelectedResource(null)}
            onUnlocked={handleUnlocked}
          />
        )}
      </AnimatePresence>

      <Footer />
    </>
  )
}
