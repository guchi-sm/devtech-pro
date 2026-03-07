import { useState } from 'react'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { useScrollReveal } from '../hooks/useScrollReveal'
import Footer from '../components/Footer'

const API_URL = `${import.meta.env.VITE_API_URL || 'https://devtech-pro-api-production.up.railway.app'}/api/contact`

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

const CONTACT_INFO = [
  { label: 'Email', value: 'guchibrownz@gmail.com', href: 'mailto:guchibrownz@gmail.com',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg> },
  { label: 'WhatsApp', value: '+254 790 078 363', href: 'https://wa.me/254790078363',
    icon: <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg> },
  { label: 'Location', value: 'Meru, Kenya', href: 'https://maps.google.com/?q=Meru,Kenya',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg> },
  { label: 'Response Time', value: 'Within 12 hours', href: null,
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
]

const SERVICES_LIST = ['Software Development', 'Web Development', 'Network Setup', 'IT Support & Repair', 'Cloud & Cybersecurity', 'Other']
const TIME_SLOTS = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM']

const INITIAL_FORM    = { name: '', email: '', subject: '', message: '' }
const INITIAL_ERRORS  = { name: '', email: '', message: '' }
const INITIAL_BOOKING = { name: '', email: '', phone: '', service: '', date: '', time: '', notes: '' }

function validate(data) {
  const errors = { ...INITIAL_ERRORS }; let valid = true
  if (!data.name.trim()) { errors.name = 'Please enter your full name.'; valid = false }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { errors.email = 'Please enter a valid email.'; valid = false }
  if (!data.message.trim() || data.message.trim().length < 10) { errors.message = 'Message must be at least 10 characters.'; valid = false }
  return { errors, valid }
}

export default function Contact() {
  const [activeTab, setActiveTab] = useState('message')
  const [form, setForm]       = useState(INITIAL_FORM)
  const [errors, setErrors]   = useState(INITIAL_ERRORS)
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [sentName, setSentName] = useState('')
  const [booking, setBooking] = useState(INITIAL_BOOKING)
  const [bookingSent, setBookingSent] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { errors: newErrors, valid } = validate(form)
    if (!valid) { setErrors(newErrors); return }
    setLoading(true)
    try {
      const res = await fetch(API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, subject: form.subject || 'New message from DevTech Pro', message: form.message }),
      })
      if (res.ok) {
        setSentName(form.name); setSent(true); setForm(INITIAL_FORM)
        toast.success("Message sent! I'll reply within 12 hours.", { duration: 6000 })
      } else { throw new Error('Something went wrong.') }
    } catch (err) { toast.error(err.message || 'Failed to send. Please WhatsApp me directly.', { duration: 5000 }) }
    finally { setLoading(false) }
  }

  const handleBooking = async (e) => {
    e.preventDefault()
    if (!booking.name || !booking.email || !booking.service || !booking.date || !booking.time) {
      toast.error('Please fill in all required fields.'); return
    }
    setLoading(true)
    try {
      // Send booking as a contact message
      const bookingMessage = `📅 APPOINTMENT REQUEST\n\nService: ${booking.service}\nDate: ${booking.date}\nTime: ${booking.time}\nPhone: ${booking.phone || 'Not provided'}\n\nNotes: ${booking.notes || 'None'}`
      const res = await fetch(API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: booking.name, email: booking.email, subject: `Appointment Request — ${booking.service}`, message: bookingMessage }),
      })
      if (res.ok) {
        setBookingSent(true); setBooking(INITIAL_BOOKING)
        toast.success("Appointment request sent! I'll confirm shortly.", { duration: 6000 })
      } else { throw new Error('Something went wrong.') }
    } catch (err) { toast.error('Failed to send. Please WhatsApp me directly.', { duration: 5000 }) }
    finally { setLoading(false) }
  }

  const tabStyle = (tab) => ({
    padding: '0.75rem 1.5rem', border: 'none', cursor: 'pointer',
    fontFamily: 'monospace', fontSize: '0.72rem',
    letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700,
    borderBottom: `2px solid ${activeTab === tab ? '#f5a623' : 'transparent'}`,
    color: activeTab === tab ? '#f5a623' : 'var(--text-muted)',
    background: 'transparent', transition: 'all 0.2s',
  })

  const fieldLabel = (text) => (
    <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.45rem' }}>
      {text}
    </label>
  )

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-card)', color: 'var(--text)', border: '1px solid var(--border)', fontSize: '.875rem' }, success: { iconTheme: { primary: '#f5a623', secondary: '#fff' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } } }} />

      {/* ─── HERO ── */}
      <section style={{ position: 'relative', paddingTop: '70px', minHeight: '360px', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Circuit board background — matching Services / About / Portfolio */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />
        <div className="grid-overlay" style={{ zIndex: 2 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,17,40,0.93) 0%, rgba(28,45,63,0.87) 60%, rgba(245,166,35,0.14) 100%)', zIndex: 3 }} />
        <div style={{ position: 'absolute', top: '30%', right: '20%', width: 280, height: 280, background: 'rgba(245,166,35,0.07)', borderRadius: '50%', filter: 'blur(70px)', zIndex: 3 }} />
        <div className="max-w-[1280px] mx-auto px-8 md:px-10 py-20 w-full" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ width: 48, height: 4, background: '#f5a623', borderRadius: 2, marginBottom: '1.2rem' }} />
          <motion.div {...fadeUp(0.1)}>
            <div className="font-mono text-xs tracking-[0.2em] uppercase flex items-center gap-3 mb-4" style={{ color: '#f5a623' }}>
              <span style={{ display: 'block', height: '1px', width: 32, background: '#f5a623' }} />Get In Touch
            </div>
          </motion.div>
          <motion.div {...fadeUp(0.2)}>
            <div className="text-display-lg font-display" style={{ color: '#ffffff' }}>
              Let's Build<br /><span style={{ color: '#f5a623' }}>Something</span>
            </div>
          </motion.div>
          <motion.p {...fadeUp(0.3)} className="text-sm leading-relaxed max-w-md mt-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Have a project or need IT support? Reach out and I'll get back to you within 12 hours.
          </motion.p>
        </div>
      </section>

      {/* ─── MAIN SECTION ── */}
      <section style={{ background: 'var(--bg-2)', padding: '4rem 0 6rem' }}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* LEFT — Contact info + map */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <Reveal>
                <div className="glass-card" style={{ padding: '2rem', overflow: 'hidden' }}>
                  <div style={{ width: 32, height: 3, background: '#f5a623', borderRadius: 2, marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.4rem' }}>Contact Details</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                    Reach out anytime — I respond within 12 hours.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {CONTACT_INFO.map(item => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{
                          width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                          background: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#f5a623',
                        }}>
                          {item.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.58rem', fontFamily: 'monospace', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>{item.label}</div>
                          {item.href
                            ? <a href={item.href} style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', textDecoration: 'none', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#f5a623'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}>{item.value}</a>
                            : <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>{item.value}</span>
                          }
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Social links */}
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.58rem', fontFamily: 'monospace', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Find me on</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {[
                        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/guchi-brown/', d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                        { label: 'GitHub', href: 'https://github.com/guchi-sm', d: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12' },
                      ].map(({ label, href, d }) => (
                        <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"
                          style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', transition: 'all 0.2s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#f5a623'; e.currentTarget.style.borderColor = '#f5a623'; e.currentTarget.style.color = '#1c2d3f'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 14, height: 14 }}><path d={d} /></svg>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* ─── MAP ── */}
              <Reveal delay={0.1}>
                <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <svg width="14" height="14" fill="none" stroke="#f5a623" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Meru, Kenya
                    </span>
                  </div>
                  <iframe
                    title="DevTech Pro Location — Meru, Kenya"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63825.48123456!2d37.6495!3d0.0467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1827ef31c1c95f91%3A0x6b7b1b1b1b1b1b1b!2sMeru%2C%20Kenya!5e0!3m2!1sen!2ske!4v1700000000000!5m2!1sen!2ske"
                    width="100%" height="240"
                    style={{ border: 'none', display: 'block', filter: 'grayscale(20%) contrast(1.05)' }}
                    allowFullScreen="" loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </Reveal>
            </div>

            {/* RIGHT — Tabs: Message / Book Appointment */}
            <Reveal delay={0.1} className="lg:col-span-3">
              <div className="glass-card" style={{ overflow: 'hidden' }}>

                {/* Tab bar */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-2)' }}>
                  <button style={tabStyle('message')} onClick={() => setActiveTab('message')}>
                    ✉️ Send Message
                  </button>
                  <button style={tabStyle('booking')} onClick={() => setActiveTab('booking')}>
                    📅 Book Appointment
                  </button>
                </div>

                <div style={{ padding: '2rem' }}>

                  {/* ── MESSAGE TAB ── */}
                  {activeTab === 'message' && (
                    <>
                      {sent ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem 1rem' }}>
                          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(245,166,35,0.1)', border: '2px solid #f5a623', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', animation: 'checkPop .5s ease forwards' }}>
                            <svg fill="none" stroke="#f5a623" strokeWidth={2.5} viewBox="0 0 24 24" style={{ width: 32, height: 32 }}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                          </div>
                          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>Message Sent, {sentName}!</h3>
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '2rem', maxWidth: 300 }}>
                            I'll reply within <strong style={{ color: 'var(--text)' }}>12 hours</strong>. Check your inbox for a confirmation.
                          </p>
                          <button onClick={() => { setSent(false); setSentName('') }}
                            style={{ background: '#f5a623', color: '#1c2d3f', border: '2px solid #f5a623', fontWeight: 700, fontSize: '0.82rem', padding: '0.7rem 1.75rem', borderRadius: 6, cursor: 'pointer', transition: 'all .25s', fontFamily: 'inherit', letterSpacing: '0.06em' }}>
                            Send Another →
                          </button>
                        </div>
                      ) : (
                        <>
                          <div style={{ marginBottom: '1.75rem' }}>
                            <div style={{ width: 32, height: 3, background: '#f5a623', borderRadius: 2, marginBottom: '0.75rem' }} />
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>Send a Message</h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Fill in the form and I'll get back to you shortly.</p>
                          </div>
                          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                {fieldLabel('Full Name *')}
                                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" autoComplete="name" className={`form-input ${errors.name ? 'error' : ''}`} />
                                {errors.name && <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#ef4444', marginTop: '0.3rem' }}>{errors.name}</p>}
                              </div>
                              <div>
                                {fieldLabel('Email Address *')}
                                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" className={`form-input ${errors.email ? 'error' : ''}`} />
                                {errors.email && <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#ef4444', marginTop: '0.3rem' }}>{errors.email}</p>}
                              </div>
                            </div>
                            <div>
                              {fieldLabel('Subject')}
                              <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="What's this about?" className="form-input" />
                            </div>
                            <div>
                              {fieldLabel('Message *')}
                              <textarea name="message" rows={5} value={form.message} onChange={handleChange} placeholder="Tell me about your project or problem..." className={`form-input resize-y ${errors.message ? 'error' : ''}`} />
                              {errors.message && <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#ef4444', marginTop: '0.3rem' }}>{errors.message}</p>}
                            </div>
                            <button type="submit" disabled={loading}
                              style={{ width: '100%', background: loading ? 'rgba(245,166,35,0.7)' : '#f5a623', color: '#1c2d3f', border: '2px solid #f5a623', padding: '0.9rem', fontWeight: 700, fontSize: '0.88rem', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'inherit', letterSpacing: '0.06em' }}
                              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f5a623' }}}
                              onMouseLeave={e => { e.currentTarget.style.background = '#f5a623'; e.currentTarget.style.color = '#1c2d3f' }}>
                              {loading
                                ? <><svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24"><circle style={{ opacity: .25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{ opacity: .75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Sending…</>
                                : 'Send Message →'}
                            </button>
                          </form>
                        </>
                      )}
                    </>
                  )}

                  {/* ── BOOKING TAB ── */}
                  {activeTab === 'booking' && (
                    <>
                      {bookingSent ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '3rem 1rem' }}>
                          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📅</div>
                          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>Appointment Requested!</h3>
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '2rem', maxWidth: 300 }}>
                            I'll confirm your appointment within <strong style={{ color: 'var(--text)' }}>2 hours</strong> via email or WhatsApp.
                          </p>
                          <button onClick={() => setBookingSent(false)}
                            style={{ background: '#f5a623', color: '#1c2d3f', border: '2px solid #f5a623', fontWeight: 700, fontSize: '0.82rem', padding: '0.7rem 1.75rem', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
                            Book Another →
                          </button>
                        </div>
                      ) : (
                        <>
                          <div style={{ marginBottom: '1.75rem' }}>
                            <div style={{ width: 32, height: 3, background: '#f5a623', borderRadius: 2, marginBottom: '0.75rem' }} />
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text)' }}>Book an Appointment</h3>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Schedule a free consultation call or on-site visit.</p>
                          </div>
                          <form onSubmit={handleBooking} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                {fieldLabel('Full Name *')}
                                <input type="text" value={booking.name} onChange={e => setBooking(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" className="form-input" />
                              </div>
                              <div>
                                {fieldLabel('Email *')}
                                <input type="email" value={booking.email} onChange={e => setBooking(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" className="form-input" />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                {fieldLabel('Phone / WhatsApp')}
                                <input type="tel" value={booking.phone} onChange={e => setBooking(p => ({ ...p, phone: e.target.value }))} placeholder="+254 7XX XXX XXX" className="form-input" />
                              </div>
                              <div>
                                {fieldLabel('Service Needed *')}
                                <select value={booking.service} onChange={e => setBooking(p => ({ ...p, service: e.target.value }))} className="form-input" style={{ cursor: 'pointer' }}>
                                  <option value="">Select a service...</option>
                                  {SERVICES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                {fieldLabel('Preferred Date *')}
                                <input type="date" value={booking.date} onChange={e => setBooking(p => ({ ...p, date: e.target.value }))} className="form-input" min={new Date().toISOString().split('T')[0]} />
                              </div>
                              <div>
                                {fieldLabel('Preferred Time *')}
                                <select value={booking.time} onChange={e => setBooking(p => ({ ...p, time: e.target.value }))} className="form-input" style={{ cursor: 'pointer' }}>
                                  <option value="">Select time...</option>
                                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                            </div>
                            <div>
                              {fieldLabel('Additional Notes')}
                              <textarea rows={3} value={booking.notes} onChange={e => setBooking(p => ({ ...p, notes: e.target.value }))} placeholder="Describe what you need help with..." className="form-input resize-none" />
                            </div>

                            {/* Info strip */}
                            <div style={{ background: 'rgba(245,166,35,0.06)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 6, padding: '0.75rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                              📍 Available for on-site visits in Meru and surrounding areas · Remote consultations available nationwide
                            </div>

                            <button type="submit" disabled={loading}
                              style={{ width: '100%', background: '#f5a623', color: '#1c2d3f', border: '2px solid #f5a623', padding: '0.9rem', fontWeight: 700, fontSize: '0.88rem', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'inherit', letterSpacing: '0.06em', opacity: loading ? 0.7 : 1 }}>
                              {loading ? 'Sending…' : '📅 Request Appointment →'}
                            </button>
                          </form>
                        </>
                      )}
                    </>
                  )}

                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* ─── CTA BAND ── */}
      <section style={{ position: 'relative', padding: '5rem 0', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0a1128 0%, #070c14 60%, #1a0f00 100%)' }} />
        <div className="grid-overlay" />
        <div className="max-w-[1280px] mx-auto px-8 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6" style={{ position: 'relative', zIndex: 1 }}>
          <Reveal>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '.4rem', lineHeight: 1.2 }}>Prefer a quick chat?</div>
              <p style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.55)' }}>Reach me on WhatsApp for the fastest response.</p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <a href="https://wa.me/254790078363"
              style={{ background: '#25D366', color: '#fff', fontWeight: 700, fontSize: '.9rem', padding: '.85rem 2.4rem', borderRadius: 6, textDecoration: 'none', border: '2px solid #25D366', transition: 'all .25s', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#25D366' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#25D366'; e.currentTarget.style.color = '#fff' }}>
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Me →
            </a>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  )
}
