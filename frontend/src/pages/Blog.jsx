import { useState } from 'react'
import { motion } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal'
import Footer from '../components/Footer'

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 36 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1], delay } })

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, visible] = useScrollReveal()
  return (
    <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 32 }}
      animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}>
      {children}
    </motion.div>
  )
}

const CATEGORIES = ['All', 'Networking', 'Software Dev', 'IT Tips', 'Cybersecurity', 'Business Tech']

const POSTS = [
  {
    id: 1, category: 'Networking', readTime: '5 min',
    date: 'Feb 2025',
    title: '5 Router Settings Every Small Business Should Change Today',
    excerpt: 'Most routers ship with insecure default settings. Here are the five changes that will dramatically improve your office network security without any technical expertise.',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80&fit=crop',
    tags: ['MikroTik', 'Security', 'WiFi'],
    color: '#3b82f6',
  },
  {
    id: 2, category: 'IT Tips', readTime: '3 min',
    date: 'Jan 2025',
    title: 'Why Your Office PC Is Running Slow — And How to Fix It',
    excerpt: 'Slow computers kill productivity. Before spending money on new hardware, try these proven software fixes that take under 30 minutes.',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80&fit=crop',
    tags: ['Windows', 'Performance', 'Maintenance'],
    color: '#22c55e',
  },
  {
    id: 3, category: 'Software Dev', readTime: '7 min',
    date: 'Jan 2025',
    title: 'When Should Your Business Build Custom Software vs. Buy Off-the-Shelf?',
    excerpt: 'SaaS tools are convenient but they have limits. This guide helps you decide when investing in custom software will actually save money in the long run.',
    img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80&fit=crop',
    tags: ['Strategy', 'Development', 'ROI'],
    color: '#f5a623',
  },
  {
    id: 4, category: 'Cybersecurity', readTime: '4 min',
    date: 'Dec 2024',
    title: 'The 3 Most Common Ways Small Businesses Get Hacked in Kenya',
    excerpt: 'Cybercrime targeting SMEs is rising fast across East Africa. Here are the most common attack vectors I see — and exactly how to defend against them.',
    img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80&fit=crop',
    tags: ['Security', 'Kenya', 'SME'],
    color: '#ef4444',
  },
  {
    id: 5, category: 'Business Tech', readTime: '6 min',
    date: 'Dec 2024',
    title: 'Setting Up a Professional Office Network for Under KES 50,000',
    excerpt: 'You don\'t need enterprise budgets for a reliable office network. Here\'s a complete parts list and setup guide that covers 10–20 workstations.',
    img: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=800&q=80&fit=crop',
    tags: ['Budget', 'LAN', 'Setup Guide'],
    color: '#a855f7',
  },
  {
    id: 6, category: 'Software Dev', readTime: '5 min',
    date: 'Nov 2024',
    title: 'Inventory Management: Spreadsheet vs. Custom System — Real Numbers',
    excerpt: 'After building 8 inventory systems for local businesses, I broke down the actual cost and time savings vs. continuing to manage stock in Excel.',
    img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80&fit=crop',
    tags: ['Inventory', 'Excel', 'Automation'],
    color: '#f5a623',
  },
]

function BlogCard({ post, delay }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Reveal delay={delay}>
      <div
        className="blog-card"
        style={{ borderTop: hovered ? `3px solid ${post.color}` : '3px solid transparent' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
          <img
            src={post.img} alt={post.title} loading="lazy"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.6s ease',
              transform: hovered ? 'scale(1.07)' : 'scale(1)',
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />

          {/* Category badge */}
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: post.color, color: '#fff',
            fontSize: '0.58rem', fontFamily: 'monospace',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: 3,
          }}>
            {post.category}
          </div>

          {/* Read time */}
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '0.62rem', fontFamily: 'monospace',
            letterSpacing: '0.1em', padding: '0.2rem 0.6rem', borderRadius: 20,
          }}>
            {post.readTime} read
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.4rem' }}>
          {/* Date + tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {post.date}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border)', display: 'inline-block' }} />
            {post.tags.slice(0, 2).map(tag => (
              <span key={tag} style={{
                fontSize: '0.56rem', fontFamily: 'monospace', letterSpacing: '0.08em',
                textTransform: 'uppercase', padding: '0.15rem 0.5rem',
                background: `${post.color}15`, border: `1px solid ${post.color}30`,
                borderRadius: 3, color: post.color, fontWeight: 600,
              }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '1rem', fontWeight: 800, lineHeight: 1.35,
            color: 'var(--text)', marginBottom: '0.65rem',
            transition: 'color 0.2s',
            ...(hovered ? { color: post.color } : {}),
          }}>
            {post.title}
          </h3>

          {/* Excerpt */}
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.2rem' }}>
            {post.excerpt}
          </p>

          {/* Read more */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.72rem', fontFamily: 'monospace',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            fontWeight: 700, color: hovered ? post.color : 'var(--text-muted)',
            transition: 'color 0.2s',
          }}>
            Read Article
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              style={{ transform: hovered ? 'translateX(4px)' : 'translateX(0)', transition: 'transform 0.2s' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = POSTS.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory
    const q = search.toLowerCase()
    return matchCat && (!q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)))
  })

  return (
    <>
      {/* ─── HERO ── */}
      <section style={{ position: 'relative', paddingTop: '70px', minHeight: '360px', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Circuit board background — matching Services / About / Portfolio */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />
        <div className="grid-overlay" style={{ zIndex: 2 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,17,40,0.93) 0%, rgba(28,45,63,0.87) 60%, rgba(245,166,35,0.14) 100%)', zIndex: 3 }} />
        <div style={{ position: 'absolute', top: '20%', right: '12%', width: 280, height: 280, background: 'rgba(245,166,35,0.07)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 3 }} />

        <div className="max-w-[1280px] mx-auto px-8 md:px-10 py-20 w-full" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ width: 48, height: 4, background: '#f5a623', borderRadius: 2, marginBottom: '1.2rem' }} />
          <motion.div {...fadeUp(0.1)}>
            <div className="font-mono text-xs tracking-[0.2em] uppercase flex items-center gap-3 mb-4" style={{ color: '#f5a623' }}>
              <span style={{ display: 'block', height: '1px', width: 32, background: '#f5a623' }} />Tips & Insights
            </div>
          </motion.div>
          <motion.div {...fadeUp(0.2)}>
            <div className="text-display-lg font-display" style={{ color: '#ffffff' }}>
              Tech <span style={{ color: '#f5a623' }}>Blog</span>
            </div>
          </motion.div>
          <motion.p {...fadeUp(0.3)} className="text-sm leading-relaxed max-w-md mt-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Practical IT and software tips for small businesses in Kenya — straight from the field.
          </motion.p>
        </div>
      </section>

      {/* ─── FILTERS + SEARCH ── */}
      <section style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', padding: '1.25rem 0', position: 'sticky', top: 70, zIndex: 50 }}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Category pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.4rem 0.9rem', borderRadius: 20,
                  border: `1px solid ${activeCategory === cat ? '#f5a623' : 'var(--border)'}`,
                  background: activeCategory === cat ? '#f5a623' : 'transparent',
                  color: activeCategory === cat ? '#1c2d3f' : 'var(--text-muted)',
                  fontSize: '0.72rem', fontFamily: 'monospace',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  fontWeight: activeCategory === cat ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text" placeholder="🔍  Search articles..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              padding: '0.5rem 1rem', borderRadius: 20,
              border: '1px solid var(--border)',
              background: 'var(--bg-card)', color: 'var(--text)',
              fontSize: '0.82rem', outline: 'none',
              width: 220, transition: 'border-color 0.2s',
              fontFamily: 'inherit',
            }}
            onFocus={e => e.target.style.borderColor = '#f5a623'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
      </section>

      {/* ─── POSTS GRID ── */}
      <section style={{ background: 'var(--bg)', padding: '4rem 0 6rem' }}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                No articles found for "{search}"
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post, i) => (
                <BlogCard key={post.id} post={post} delay={i * 0.08} />
              ))}
            </div>
          )}

          {/* Newsletter CTA */}
          <Reveal delay={0.2}>
            <div className="glass-card" style={{ marginTop: '4rem', padding: '2.5rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(245,166,35,0.06), rgba(59,130,246,0.04))' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>📬</div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>
                Get new articles in your inbox
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Practical IT tips for Kenyan businesses — no spam, monthly digest only.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', maxWidth: 420, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
                <input
                  type="email" placeholder="your@email.com"
                  className="form-input"
                  style={{ flex: 1, minWidth: 220, borderRadius: 6 }}
                />
                <button style={{
                  background: '#f5a623', color: '#1c2d3f',
                  border: '2px solid #f5a623', padding: '0.7rem 1.5rem',
                  borderRadius: 6, fontWeight: 700, fontSize: '0.8rem',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  cursor: 'pointer', fontFamily: 'monospace',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f5a623' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f5a623'; e.currentTarget.style.color = '#1c2d3f' }}
                >
                  Subscribe →
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  )
}
