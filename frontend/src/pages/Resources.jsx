import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal'
import Footer from '../components/Footer'
import toast, { Toaster } from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_URL || 'https://devtech-pro-api-production.up.railway.app'
const API_URL  = `${API_BASE}/api/resources`

// ── Your M-Pesa details ──────────────────────────────────────────
const MPESA_NUMBER = '0712 345 678'   // ← your Safaricom number
const MPESA_NAME   = 'Guchi Brown'    // ← your M-Pesa name
// ────────────────────────────────────────────────────────────────

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

const CATEGORIES = [
  { id: 'All',      label: 'All Resources',    icon: '📦', color: '#f5a623' },
  { id: 'PDF',      label: 'PDF Guides',        icon: '📄', color: '#ef4444' },
  { id: 'Video',    label: 'Video Tutorials',   icon: '🎥', color: '#3b82f6' },
  { id: 'Photo',    label: 'Photos & Diagrams', icon: '🖼️', color: '#22c55e' },
  { id: 'Software', label: 'Software & Tools',  icon: '💾', color: '#a855f7' },
]

const CAT_META = {
  PDF:      { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   icon: '📄' },
  Video:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  icon: '🎥' },
  Photo:    { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   icon: '🖼️' },
  Software: { color: '#a855f7', bg: 'rgba(168,85,247,0.1)', icon: '💾' },
}

const inputStyle = {
  width: '100%', padding: '0.7rem 0.9rem',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 8, fontSize: '0.88rem',
  color: '#fff', outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.2s',
}

// ── FREE MODAL ────────────────────────────────────────────────────
function FreeModal({ resource, onClose, onUnlocked }) {
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const meta = CAT_META[resource.category] || CAT_META.PDF

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) { toast.error('Please fill in all fields.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Please enter a valid email.'); return }
    setLoading(true)
    try {
      const res  = await fetch(`${API_URL}/${resource._id}/unlock`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed.')
      toast.success('Access granted! Download starting…')
      onUnlocked(data.fileUrl)
    } catch (err) { toast.error(err.message || 'Something went wrong.')
    } finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', backdropFilter:'blur(6px)' }}>
      <motion.div initial={{ opacity:0, scale:0.92, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.92, y:20 }} transition={{ duration:0.3, ease:[0.16,1,0.3,1] }}
        onClick={e => e.stopPropagation()}
        style={{ background:'#0c1a2e', borderRadius:16, border:`1px solid ${meta.color}40`, width:'100%', maxWidth:440, overflow:'hidden', boxShadow:'0 32px 64px rgba(0,0,0,0.5)' }}>
        <div style={{ background:'linear-gradient(135deg,#070c14,#0f1e30)', padding:'1.5rem', borderBottom:'1px solid rgba(255,255,255,0.07)', position:'relative' }}>
          <button onClick={onClose} style={{ position:'absolute', top:12, right:12, background:'rgba(255,255,255,0.08)', border:'none', borderRadius:'50%', width:28, height:28, cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          <div style={{ display:'flex', alignItems:'center', gap:'0.85rem' }}>
            <div style={{ width:46, height:46, borderRadius:12, background:meta.bg, border:`1px solid ${meta.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem' }}>{meta.icon}</div>
            <div>
              <div style={{ fontSize:'0.58rem', letterSpacing:'0.16em', textTransform:'uppercase', color:meta.color, marginBottom:'0.25rem', fontFamily:'monospace' }}>{resource.category}</div>
              <div style={{ fontSize:'0.95rem', fontWeight:800, color:'#fff', lineHeight:1.25 }}>{resource.title}</div>
            </div>
          </div>
        </div>
        <div style={{ padding:'1.75rem' }}>
          <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
            <div style={{ fontSize:'2rem', marginBottom:'0.4rem' }}>🔓</div>
            <h3 style={{ fontSize:'1.05rem', fontWeight:800, color:'#fff', marginBottom:'0.3rem' }}>Free Access — Just Your Email</h3>
            <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.5)', lineHeight:1.6 }}>Enter your details to instantly unlock. No spam, ever.</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
            <div>
              <label style={{ display:'block', fontSize:'0.58rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:'0.35rem', fontFamily:'monospace' }}>Your Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" autoFocus style={inputStyle} onFocus={e => e.target.style.borderColor=meta.color} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'}/>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.58rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:'0.35rem', fontFamily:'monospace' }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} onFocus={e => e.target.style.borderColor=meta.color} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'}/>
            </div>
            <button type="submit" disabled={loading} style={{ width:'100%', background:meta.color, color:'#fff', border:'none', padding:'0.85rem', borderRadius:8, fontWeight:800, fontSize:'0.88rem', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, marginTop:'0.25rem' }}>
              {loading ? '⏳ Unlocking…' : '🔓 Unlock & Download'}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── PREMIUM MODAL ─────────────────────────────────────────────────
function PremiumModal({ resource, onClose }) {
  const [step, setStep]   = useState('request') // 'request' | 'success' | 'unlock'
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode]   = useState('')
  const [loading, setLoading] = useState(false)

  const price    = resource.price || 0
  const currency = resource.currency || 'KES'
  const priceStr = price > 0 ? `${currency} ${price.toLocaleString()}` : null

  const handleRequest = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !phone.trim()) { toast.error('All fields are required.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error('Please enter a valid email.'); return }
    setLoading(true)
    try {
      const res  = await fetch(`${API_URL}/${resource._id}/unlock`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed.')
      setStep('success')
    } catch (err) { toast.error(err.message || 'Something went wrong.')
    } finally { setLoading(false) }
  }

  const handleUnlock = async (e) => {
    e.preventDefault()
    if (!code.trim()) { toast.error('Please enter your access code.'); return }
    setLoading(true)
    try {
      const res  = await fetch(`${API_URL}/${resource._id}/unlock`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || 'Client', email: email || 'client@devtech.co.ke', accessCode: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Invalid code.')
      toast.success('✅ Access granted! Download starting…')
      if (data.fileUrl) {
        const a = document.createElement('a'); a.href = data.fileUrl
        a.download = resource.title; a.target = '_blank'
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
      }
      onClose()
    } catch (err) { toast.error(err.message)
    } finally { setLoading(false) }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', backdropFilter:'blur(6px)' }}>
      <motion.div initial={{ opacity:0, scale:0.9, y:24 }} animate={{ opacity:1, scale:1, y:0 }}
        exit={{ opacity:0, scale:0.9, y:24 }} transition={{ duration:0.35, ease:[0.16,1,0.3,1] }}
        onClick={e => e.stopPropagation()}
        style={{ background:'#0c1a2e', borderRadius:18, border:'1px solid rgba(245,166,35,0.3)', width:'100%', maxWidth:460, maxHeight:'92vh', overflowY:'auto', boxShadow:'0 40px 80px rgba(0,0,0,0.6)', borderTop:'3px solid #f5a623' }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#0a1020,#121e30)', padding:'1.5rem 1.75rem', borderBottom:'1px solid rgba(255,255,255,0.06)', position:'relative', display:'flex', alignItems:'center', gap:'0.85rem' }}>
          <button onClick={onClose} style={{ position:'absolute', top:12, right:14, background:'rgba(255,255,255,0.08)', border:'none', borderRadius:'50%', width:28, height:28, cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem' }}>✕</button>
          <div style={{ width:46, height:46, borderRadius:12, background:'rgba(245,166,35,0.15)', border:'1px solid rgba(245,166,35,0.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>👑</div>
          <div>
            <div style={{ fontSize:'0.58rem', letterSpacing:'0.16em', textTransform:'uppercase', color:'#f5a623', marginBottom:'0.25rem', fontFamily:'monospace' }}>Premium Resource</div>
            <div style={{ fontSize:'0.95rem', fontWeight:800, color:'#fff', lineHeight:1.25 }}>{resource.title}</div>
          </div>
        </div>

        <div style={{ padding:'1.75rem' }}>

          {/* ── STEP 1: Payment request ── */}
          {step === 'request' && (
            <>
              {/* Price badge — shown when price is set */}
              {priceStr && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'1rem', background:'rgba(245,166,35,0.07)', border:'1px solid rgba(245,166,35,0.2)', borderRadius:14, padding:'1rem 1.25rem', marginBottom:'1.25rem' }}>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'0.55rem', fontFamily:'monospace', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(245,166,35,0.65)', marginBottom:'0.3rem' }}>Amount to Pay</div>
                    <div style={{ fontSize:'2.25rem', fontWeight:900, color:'#f5a623', lineHeight:1, letterSpacing:'-0.02em' }}>{priceStr}</div>
                  </div>
                  <div style={{ width:'1px', height:40, background:'rgba(245,166,35,0.2)' }}/>
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'0.55rem', fontFamily:'monospace', letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:'0.3rem' }}>Send To</div>
                    <div style={{ fontSize:'0.88rem', fontWeight:800, color:'#fff' }}>{MPESA_NUMBER}</div>
                    <div style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.45)', marginTop:'0.15rem' }}>{MPESA_NAME}</div>
                  </div>
                </div>
              )}

              {/* M-Pesa steps */}
              <div style={{ background:'rgba(0,200,83,0.07)', border:'1px solid rgba(0,200,83,0.2)', borderRadius:12, padding:'1rem 1.1rem', marginBottom:'1.4rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.65rem' }}>
                  <span style={{ fontSize:'1.1rem' }}>📱</span>
                  <span style={{ fontSize:'0.7rem', fontWeight:800, color:'#00c853', letterSpacing:'0.1em', textTransform:'uppercase', fontFamily:'monospace' }}>M-Pesa Payment Steps</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                  {[
                    `Go to M-Pesa → Send Money`,
                    `Send ${priceStr || 'the required amount'} to ${MPESA_NUMBER} (${MPESA_NAME})`,
                    `Use your name as the M-Pesa reference`,
                    `Fill the form below and submit`,
                    `Receive your access code on WhatsApp & Email`,
                  ].map((s, i) => (
                    <div key={i} style={{ display:'flex', gap:'0.6rem', alignItems:'flex-start' }}>
                      <span style={{ width:18, height:18, borderRadius:'50%', background:'rgba(0,200,83,0.2)', border:'1px solid rgba(0,200,83,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.55rem', fontWeight:800, color:'#00c853', flexShrink:0, marginTop:2 }}>{i+1}</span>
                      <span style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.65)', lineHeight:1.5 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleRequest} style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                <div>
                  <label style={{ display:'block', fontSize:'0.58rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:'0.35rem', fontFamily:'monospace' }}>Your Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" autoFocus style={inputStyle} onFocus={e => e.target.style.borderColor='#f5a623'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'}/>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'0.58rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:'0.35rem', fontFamily:'monospace' }}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={inputStyle} onFocus={e => e.target.style.borderColor='#f5a623'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'}/>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'0.58rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginBottom:'0.35rem', fontFamily:'monospace' }}>WhatsApp Number <span style={{ color:'#f5a623' }}>*</span></label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254 712 345 678" style={inputStyle} onFocus={e => e.target.style.borderColor='#f5a623'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'}/>
                  <p style={{ fontSize:'0.66rem', color:'rgba(255,255,255,0.3)', marginTop:'0.3rem' }}>Your access code will be sent here after payment is verified.</p>
                </div>
                <button type="submit" disabled={loading} style={{ width:'100%', background:'linear-gradient(135deg,#f5a623,#e8940f)', color:'#1c2d3f', border:'none', padding:'0.9rem', borderRadius:8, fontWeight:800, fontSize:'0.88rem', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1, marginTop:'0.25rem' }}>
                  {loading ? '⏳ Submitting…' : '📤 I Have Paid — Submit Request'}
                </button>
                <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', paddingTop:'0.9rem', textAlign:'center' }}>
                  <button type="button" onClick={() => setStep('unlock')} style={{ background:'none', border:'none', color:'rgba(245,166,35,0.7)', fontSize:'0.75rem', cursor:'pointer', textDecoration:'underline', fontFamily:'monospace' }}>
                    🔑 Already have a code? Enter it here
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── STEP 2: Success ── */}
          {step === 'success' && (
            <div style={{ textAlign:'center', padding:'1rem 0' }}>
              <div style={{ fontSize:'3.5rem', marginBottom:'1rem' }}>✅</div>
              <h3 style={{ fontSize:'1.15rem', fontWeight:900, color:'#fff', marginBottom:'0.5rem' }}>Request Received!</h3>
              <p style={{ fontSize:'0.84rem', color:'rgba(255,255,255,0.55)', lineHeight:1.7, marginBottom:'1.5rem' }}>
                Your payment request has been submitted.<br/>
                Once we verify your M-Pesa payment, we'll send your access code to <strong style={{ color:'#f5a623' }}>{phone}</strong> via WhatsApp and to <strong style={{ color:'#f5a623' }}>{email}</strong>.
              </p>
              <div style={{ background:'rgba(245,166,35,0.07)', border:'1px solid rgba(245,166,35,0.2)', borderRadius:10, padding:'0.9rem 1rem', marginBottom:'1.4rem', fontSize:'0.78rem', color:'rgba(255,255,255,0.55)', lineHeight:1.6 }}>
                ⏱ Typical response time: <strong style={{ color:'#f5a623' }}>under 1 hour</strong> during business hours
              </div>
              <button onClick={() => setStep('unlock')} style={{ background:'linear-gradient(135deg,#f5a623,#e8940f)', color:'#1c2d3f', border:'none', padding:'0.75rem 2rem', borderRadius:8, fontWeight:800, fontSize:'0.84rem', cursor:'pointer' }}>
                🔑 Enter Code When Received
              </button>
            </div>
          )}

          {/* ── STEP 3: Enter code ── */}
          {step === 'unlock' && (
            <div>
              <button onClick={() => setStep('request')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:'0.75rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.35rem', marginBottom:'1.25rem', fontFamily:'monospace' }}>
                ← Back
              </button>
              <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>🔑</div>
                <h3 style={{ fontSize:'1.05rem', fontWeight:800, color:'#fff', marginBottom:'0.3rem' }}>Enter Your Access Code</h3>
                <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.45)', lineHeight:1.6 }}>Enter the code sent to your WhatsApp to unlock this resource.</p>
              </div>
              <form onSubmit={handleUnlock} style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                <div>
                  <label style={{ display:'block', fontSize:'0.58rem', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(245,166,35,0.7)', marginBottom:'0.35rem', fontFamily:'monospace' }}>Access Code</label>
                  <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. GUCHI2024" autoFocus
                    style={{ ...inputStyle, borderColor:'rgba(245,166,35,0.4)', fontFamily:'monospace', fontWeight:700, letterSpacing:'0.1em', fontSize:'1.1rem', textAlign:'center' }}
                    onFocus={e => e.target.style.borderColor='#f5a623'} onBlur={e => e.target.style.borderColor='rgba(245,166,35,0.4)'}
                    spellCheck={false} autoComplete="off"/>
                </div>
                <button type="submit" disabled={loading} style={{ width:'100%', background:'linear-gradient(135deg,#f5a623,#e8940f)', color:'#1c2d3f', border:'none', padding:'0.9rem', borderRadius:8, fontWeight:800, fontSize:'0.9rem', cursor:loading?'not-allowed':'pointer', opacity:loading?0.7:1 }}>
                  {loading ? '⏳ Verifying…' : '🔓 Unlock & Download'}
                </button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── RESOURCE CARD ─────────────────────────────────────────────────
function ResourceCard({ resource, onUnlock, delay }) {
  const [hovered, setHovered] = useState(false)
  const meta = CAT_META[resource.category] || CAT_META.PDF
  const price    = resource.price || 0
  const currency = resource.currency || 'KES'

  return (
    <Reveal delay={delay}>
      <div className="blog-card" style={{ borderTop:`3px solid ${hovered ? meta.color : 'transparent'}`, cursor:'default' }}
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <div style={{ position:'relative', height:180, overflow:'hidden', background:'#0c1220' }}>
          {resource.thumbnail
            ? <img src={resource.thumbnail} alt={resource.title} loading="lazy"
                style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.6s', transform:hovered?'scale(1.07)':'scale(1)', opacity:0.85 }}/>
            : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'4rem' }}>{meta.icon}</div>
          }
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }}/>
          {resource.isPremium ? (
            <div style={{ position:'absolute', top:10, left:10, zIndex:2, background:'linear-gradient(135deg,#f5a623,#e8940f)', color:'#1c2d3f', fontSize:'.58rem', fontFamily:'monospace', fontWeight:800, padding:'.25rem .6rem', borderRadius:'4px', letterSpacing:'.1em', textTransform:'uppercase', boxShadow:'0 2px 8px rgba(245,166,35,.5)' }}>👑 PREMIUM</div>
          ) : (
            <div style={{ position:'absolute', top:10, left:10, background:meta.color, color:'#fff', fontSize:'0.58rem', fontFamily:'monospace', letterSpacing:'0.12em', textTransform:'uppercase', fontWeight:700, padding:'0.25rem 0.65rem', borderRadius:3 }}>
              {meta.icon} {resource.category}
            </div>
          )}
          {resource.featured && (
            <div style={{ position:'absolute', top:10, right:10, background:'#f5a623', color:'#1c2d3f', fontSize:'0.56rem', fontFamily:'monospace', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', padding:'0.2rem 0.55rem', borderRadius:3 }}>⭐ Featured</div>
          )}
          {resource.duration && (
            <div style={{ position:'absolute', bottom:10, right:10, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(8px)', color:'#fff', fontSize:'0.68rem', fontFamily:'monospace', padding:'0.2rem 0.55rem', borderRadius:12 }}>▶ {resource.duration}</div>
          )}
        </div>
        <div style={{ padding:'1.25rem' }}>
          {resource.tags?.length > 0 && (
            <div style={{ display:'flex', gap:'0.35rem', flexWrap:'wrap', marginBottom:'0.65rem' }}>
              {resource.tags.slice(0,3).map(tag => (
                <span key={tag} style={{ fontSize:'0.56rem', fontFamily:'monospace', letterSpacing:'0.08em', textTransform:'uppercase', padding:'0.15rem 0.45rem', background:`${meta.color}15`, border:`1px solid ${meta.color}30`, borderRadius:3, color:meta.color, fontWeight:600 }}>{tag}</span>
              ))}
            </div>
          )}
          <h3 style={{ fontSize:'0.95rem', fontWeight:800, lineHeight:1.35, color:'var(--text)', marginBottom:'0.5rem', transition:'color 0.2s', ...(hovered ? { color:meta.color } : {}) }}>{resource.title}</h3>
          <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', lineHeight:1.65, marginBottom:'1.1rem' }}>{resource.description}</p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:'0.85rem', borderTop:'1px solid var(--border)' }}>
            <span style={{ fontSize:'0.62rem', color:'var(--text-muted)', fontFamily:'monospace' }}>⬇ {resource.downloadCount || 0} downloads</span>
            <button onClick={() => onUnlock(resource)}
              style={{ display:'flex', alignItems:'center', gap:'0.4rem', background:hovered?meta.color:'transparent', color:hovered?'#fff':meta.color, border:`1.5px solid ${meta.color}`, padding:'0.45rem 1rem', borderRadius:6, fontSize:'0.68rem', fontFamily:'monospace', letterSpacing:'0.1em', textTransform:'uppercase', fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>
              {resource.isPremium
                ? (price > 0 ? `👑 ${currency} ${price.toLocaleString()}` : '👑 Get Access')
                : '🔓 Free'}
            </button>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

// ── MAIN PAGE ─────────────────────────────────────────────────────
export default function Resources() {
  const [resources, setResources]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch]         = useState('')
  const [selected, setSelected]     = useState(null)

  useEffect(() => {
    fetch(API_URL)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => setResources(Array.isArray(data.data) ? data.data : []))
      .catch(() => setResources([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = resources.filter(r => {
    const matchCat = activeCategory === 'All' || r.category === activeCategory
    const q = search.toLowerCase()
    return matchCat && (!q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags?.some(t => t.toLowerCase().includes(q)))
  })
  const featured = filtered.filter(r => r.featured)
  const rest     = filtered.filter(r => !r.featured)

  const stats = {
    total: resources.length,
    pdf: resources.filter(r => r.category === 'PDF').length,
    video: resources.filter(r => r.category === 'Video').length,
    downloads: resources.reduce((s, r) => s + (r.downloadCount || 0), 0),
  }

  const triggerDownload = (url, title) => {
    if (!url || url === '#') return
    const a = document.createElement('a'); a.href = url; a.download = title || 'resource'
    a.target = '_blank'; document.body.appendChild(a); a.click(); document.body.removeChild(a)
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background:'var(--bg-card)', color:'var(--text)', border:'1px solid var(--border)' } }}/>

      {/* HERO */}
      <section style={{ position:'relative', paddingTop:'70px', minHeight:'380px', display:'flex', alignItems:'center', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, backgroundImage:'url(https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&fit=crop)', backgroundSize:'cover', backgroundPosition:'center', backgroundAttachment:'fixed' }}/>
        <div className="grid-overlay" style={{ zIndex:2 }}/>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(10,17,40,0.93) 0%, rgba(28,45,63,0.87) 60%, rgba(245,166,35,0.14) 100%)', zIndex:3 }}/>
        <div style={{ position:'absolute', top:'10%', right:'15%', width:300, height:300, background:'rgba(245,166,35,0.07)', borderRadius:'50%', filter:'blur(80px)', zIndex:3 }}/>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10 py-20 w-full" style={{ position:'relative', zIndex:10 }}>
          <div style={{ width:48, height:4, background:'#f5a623', borderRadius:2, marginBottom:'1.2rem' }}/>
          <motion.div {...fadeUp(0.1)}>
            <div className="font-mono text-xs tracking-[0.2em] uppercase flex items-center gap-3 mb-4" style={{ color:'#f5a623' }}>
              <span style={{ display:'block', height:'1px', width:32, background:'#f5a623' }}/>Free Resources
            </div>
          </motion.div>
          <motion.div {...fadeUp(0.2)}>
            <div className="text-display-lg font-display" style={{ color:'#ffffff' }}>Downloads &<br/><span style={{ color:'#f5a623' }}>Resources</span></div>
          </motion.div>
          <motion.p {...fadeUp(0.3)} style={{ fontSize:'0.95rem', color:'rgba(255,255,255,0.6)', maxWidth:480, marginTop:'1rem', lineHeight:1.75 }}>
            Free guides, templates and videos. Premium resources available via M-Pesa.
          </motion.p>
          <motion.div {...fadeUp(0.4)} style={{ display:'flex', gap:'2rem', flexWrap:'wrap', marginTop:'2.5rem' }}>
            {[{val:stats.total,label:'Resources'},{val:stats.pdf,label:'PDF Guides'},{val:stats.video,label:'Videos'},{val:`${stats.downloads}+`,label:'Downloads'}].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.6rem', fontWeight:900, color:'#f5a623', lineHeight:1 }}>{s.val}</div>
                <div style={{ fontSize:'0.6rem', fontFamily:'monospace', letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', marginTop:'0.25rem' }}>{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FILTERS */}
      <section style={{ background:'var(--bg-2)', borderBottom:'1px solid var(--border)', padding:'1rem 0', position:'sticky', top:70, zIndex:50 }}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                style={{ display:'flex', alignItems:'center', gap:'0.35rem', padding:'0.4rem 0.9rem', borderRadius:20, border:`1px solid ${activeCategory===cat.id?cat.color:'var(--border)'}`, background:activeCategory===cat.id?`${cat.color}18`:'transparent', color:activeCategory===cat.id?cat.color:'var(--text-muted)', fontSize:'0.72rem', fontFamily:'monospace', letterSpacing:'0.08em', textTransform:'uppercase', fontWeight:activeCategory===cat.id?700:500, cursor:'pointer', transition:'all 0.2s' }}>
                <span>{cat.icon}</span> {cat.label}
              </button>
            ))}
          </div>
          <input type="text" placeholder="🔍  Search resources..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ padding:'0.5rem 1rem', borderRadius:20, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text)', fontSize:'0.82rem', outline:'none', width:220, fontFamily:'inherit', transition:'border-color 0.2s' }}
            onFocus={e => e.target.style.borderColor='#f5a623'} onBlur={e => e.target.style.borderColor='var(--border)'}/>
        </div>
      </section>

      {/* CONTENT */}
      <section style={{ background:'var(--bg)', padding:'4rem 0 6rem' }}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ borderRadius:8, overflow:'hidden', background:'var(--bg-card)', border:'1px solid var(--border)' }}>
                  <div style={{ height:180, background:'var(--bg-2)' }}/>
                  <div style={{ padding:'1.25rem' }}>{[80,100,60].map((w,j) => <div key={j} style={{ height:j===0?14:j===1?20:12, background:'var(--bg-2)', borderRadius:4, marginBottom:'0.75rem', width:`${w}%` }}/>)}</div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'5rem 2rem', color:'var(--text-muted)' }}>
              <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📭</div>
              <p style={{ fontFamily:'monospace', fontSize:'0.8rem', letterSpacing:'0.1em', textTransform:'uppercase' }}>No resources found</p>
            </div>
          ) : (
            <>
              {featured.length > 0 && (
                <div style={{ marginBottom:'3rem' }}>
                  <Reveal><div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
                    <span style={{ fontSize:'0.65rem', fontFamily:'monospace', letterSpacing:'0.2em', textTransform:'uppercase', color:'#f5a623', fontWeight:700 }}>⭐ Featured Resources</span>
                    <div style={{ flex:1, height:1, background:'var(--border)' }}/>
                  </div></Reveal>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featured.map((r,i) => <ResourceCard key={r._id} resource={r} onUnlock={setSelected} delay={i*0.08}/>)}
                  </div>
                </div>
              )}
              {rest.length > 0 && (
                <div>
                  {featured.length > 0 && (
                    <Reveal><div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
                      <span style={{ fontSize:'0.65rem', fontFamily:'monospace', letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text-muted)', fontWeight:600 }}>All Resources</span>
                      <div style={{ flex:1, height:1, background:'var(--border)' }}/>
                    </div></Reveal>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rest.map((r,i) => <ResourceCard key={r._id} resource={r} onUnlock={setSelected} delay={i*0.07}/>)}
                  </div>
                </div>
              )}
            </>
          )}

          <Reveal delay={0.2}>
            <div className="glass-card" style={{ marginTop:'4rem', padding:'2.5rem', textAlign:'center', background:'linear-gradient(135deg, rgba(245,166,35,0.05), rgba(168,85,247,0.03))' }}>
              <div style={{ fontSize:'1.5rem', marginBottom:'0.6rem' }}>💡</div>
              <h3 style={{ fontSize:'1.1rem', fontWeight:800, color:'var(--text)', marginBottom:'0.4rem' }}>Want a custom guide for your business?</h3>
              <p style={{ fontSize:'0.84rem', color:'var(--text-muted)', marginBottom:'1.5rem' }}>I can create tailored documentation, network diagrams or training materials for your team.</p>
              <a href="/contact" style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', background:'#f5a623', color:'#1c2d3f', fontWeight:700, fontSize:'0.8rem', padding:'0.75rem 1.75rem', borderRadius:6, textDecoration:'none', fontFamily:'monospace', letterSpacing:'0.08em', textTransform:'uppercase' }}>Request Custom Resource →</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* MODALS */}
      <AnimatePresence>
        {selected && selected.isPremium && (
          <PremiumModal key="premium" resource={selected} onClose={() => setSelected(null)}/>
        )}
        {selected && !selected.isPremium && (
          <FreeModal key="free" resource={selected} onClose={() => setSelected(null)}
            onUnlocked={(url) => { setSelected(null); if(url && url !== '#') triggerDownload(url, selected.title) }}/>
        )}
      </AnimatePresence>

      <Footer/>
    </>
  )
}
