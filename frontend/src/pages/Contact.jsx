import { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
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

  /* form inputs styled for corporate palette */
  .form-input {
    width: 100%;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    color: #1c2d3f;
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
    border-radius: 2px;
    outline: none;
    transition: border-color 0.25s, box-shadow 0.25s;
    font-family: inherit;
  }
  .form-input::placeholder { color: #9eaab8; }
  .form-input:focus {
    border-color: #f5a623;
    box-shadow: 0 0 0 3px rgba(245,166,35,0.15);
  }
  .form-input.error { border-color: #ef4444; }

  /* submit button */
  .btn-submit-corp {
    width: 100%;
    background: #f5a623;
    color: #1c2d3f;
    border: 2px solid #f5a623;
    padding: 0.85rem 2rem;
    font-weight: 700;
    font-size: 0.9rem;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.25s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: inherit;
  }
  .btn-submit-corp:hover:not(:disabled) {
    background: transparent;
    color: #f5a623;
  }
  .btn-submit-corp:disabled { opacity: 0.65; cursor: not-allowed; }
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

const CONTACT_INFO = [
  {
    label: 'Email',
    value: 'guchibrownz@gmail.com',
    href: 'mailto:guchibrownz@gmail.com',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    value: '+254 790078363',
    href: 'https://wa.me/254790078363',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    label: 'Location',
    value: 'Meru, Kenya',
    href: 'https://maps.google.com/?q=Meru,Kenya',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>
      </svg>
    ),
  },
  {
    label: 'Response Time',
    value: 'Within 12 hours',
    href: null,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
]

const INITIAL_FORM   = { name: '', email: '', subject: '', message: '' }
const INITIAL_ERRORS = { name: '', email: '', message: '' }

function validate(data) {
  const errors = { ...INITIAL_ERRORS }
  let valid = true
  if (!data.name.trim()) { errors.name = 'Please enter your full name.'; valid = false }
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.email.trim() || !emailRx.test(data.email)) { errors.email = 'Please enter a valid email address.'; valid = false }
  if (!data.message.trim() || data.message.trim().length < 10) { errors.message = 'Please enter a message (at least 10 characters).'; valid = false }
  return { errors, valid }
}

export default function Contact() {
  const [form, setForm]       = useState(INITIAL_FORM)
  const [errors, setErrors]   = useState(INITIAL_ERRORS)
  const [loading, setLoading] = useState(false)

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
      await axios.post('/api/contact', form)
      toast.success("Message sent! I'll be in touch within 12 hours.", { duration: 5000 })
      setForm(INITIAL_FORM)
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.'
      toast.error(msg, { duration: 4000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{THEME_OVERRIDE}</style>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#1c2d3f',
            border: '1px solid #e2e8f0',
            fontSize: '0.875rem',
          },
          success: { iconTheme: { primary: '#f5a623', secondary: '#fff' } },
        }}
      />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="pt-[68px]" style={{ background: 'var(--bg)' }}>
        <div
          className="max-w-[1280px] mx-auto px-8 md:px-10 py-20 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Orange accent bar */}
          <div style={{ width: 48, height: 4, background: '#f5a623', borderRadius: 2, marginBottom: '1.2rem' }} />
          <motion.div {...fadeUp(0.1)}><div className="section-label">Get In Touch</div></motion.div>
          <motion.div {...fadeUp(0.2)}>
            <div className="text-display-lg font-display" style={{ color: 'var(--text)' }}>
              Let's Build<br /><span style={{ color: '#f5a623' }}>Something</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── MAIN CONTENT ─────────────────────────────────────── */}
      <section className="py-16 pb-24" style={{ background: '#f4f6f9' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ── INFO PANEL — image overlay like xtratheme footer ── */}
            <Reveal>
              <div style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 2,
                minHeight: 520,
                display: 'flex',
                flexDirection: 'column',
              }}>
                {/* ── Background image — full bleed ── */}
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80&fit=crop"
                  alt=""
                  aria-hidden="true"
                  style={{
                    position: 'absolute', inset: 0,
                    width: '100%', height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />

                {/* ── Dark navy overlay (like xtratheme screenshot) ── */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(135deg, rgba(28,45,63,.92) 0%, rgba(28,45,63,.80) 100%)',
                }} />

                {/* ── Orange left accent stripe ── */}
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: 4, background: '#f5a623',
                }} />

                {/* ── Content sits above overlay ── */}
                <div style={{
                  position: 'relative', zIndex: 10,
                  padding: '2.5rem 2.5rem 2.5rem 3rem',
                  display: 'flex', flexDirection: 'column', gap: '2rem', flex: 1,
                }}>

                  {/* Header */}
                  <div>
                    <div style={{
                      width: 36, height: 3, background: '#f5a623',
                      borderRadius: 2, marginBottom: '1rem',
                    }} />
                    <h3 style={{
                      fontSize: '1.6rem', fontWeight: 800,
                      color: '#ffffff', marginBottom: '.4rem', lineHeight: 1.2,
                    }}>
                      Contact Details
                    </h3>
                    <p style={{ fontSize: '.9rem', color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>
                      I'm here to help — reach out anytime and I'll respond within 12 hours.
                    </p>
                  </div>

                  {/* Contact items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {CONTACT_INFO.map((item) => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        {/* Orange icon box — matching xtratheme screenshot style */}
                        <div style={{
                          width: 44, height: 44, borderRadius: 2, flexShrink: 0,
                          background: '#f5a623',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#1c2d3f',
                        }}>
                          {item.icon}
                        </div>
                        <div>
                          <div style={{
                            fontSize: '.62rem', fontFamily: 'monospace',
                            letterSpacing: '.18em', textTransform: 'uppercase',
                            color: 'rgba(255,255,255,.45)', marginBottom: '.2rem',
                          }}>
                            {item.label}
                          </div>
                          {item.href ? (
                            <a
                              href={item.href}
                              style={{
                                fontSize: '.95rem', fontWeight: 600,
                                color: '#ffffff', textDecoration: 'none',
                                transition: 'color .2s',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.color = '#f5a623')}
                              onMouseLeave={e => (e.currentTarget.style.color = '#ffffff')}
                            >
                              {item.value}
                            </a>
                          ) : (
                            <span style={{ fontSize: '.95rem', fontWeight: 600, color: '#ffffff' }}>
                              {item.value}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Social links */}
                  <div style={{ marginTop: 'auto' }}>
                    <div style={{
                      fontSize: '.62rem', fontFamily: 'monospace',
                      letterSpacing: '.18em', textTransform: 'uppercase',
                      color: 'rgba(255,255,255,.45)', marginBottom: '.75rem',
                    }}>
                      Find me on
                    </div>
                    <div style={{ display: 'flex', gap: '.6rem' }}>
                      {[
                        {
                          label: 'LinkedIn',
                          href: 'https://www.linkedin.com/in/guchi-brown/',
                          icon: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />,
                        },
                        {
                          label: 'GitHub',
                          href: 'https://github.com/guchi-sm',
                          icon: <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />,
                        },
                      ].map(({ label, href, icon }) => (
                        <a
                          key={label}
                          href={href}
                          aria-label={label}
                          style={{
                            width: 40, height: 40, borderRadius: 2,
                            border: '1px solid rgba(255,255,255,.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'rgba(255,255,255,.65)',
                            transition: 'all .25s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#f5a623'
                            e.currentTarget.style.borderColor = '#f5a623'
                            e.currentTarget.style.color = '#1c2d3f'
                            e.currentTarget.style.transform = 'translateY(-3px)'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)'
                            e.currentTarget.style.color = 'rgba(255,255,255,.65)'
                            e.currentTarget.style.transform = 'translateY(0)'
                          }}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 16, height: 16 }}>{icon}</svg>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* ── FORM PANEL ─────────────────────────────────────── */}
            <Reveal delay={0.1}>
              <div style={{
                background: '#ffffff',
                padding: '2.5rem',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                borderTop: '3px solid #f5a623',
              }}>
                {/* Form header */}
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ width: 36, height: 3, background: '#f5a623', borderRadius: 2, marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c2d3f' }}>
                    Send a Message
                  </h3>
                  <p style={{ fontSize: '.88rem', color: '#6b7a8d', marginTop: '.4rem' }}>
                    Fill in the form below and I'll get back to you shortly.
                  </p>
                </div>

                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    {/* Name */}
                    <div>
                      <label style={{
                        display: 'block', fontFamily: 'monospace',
                        fontSize: '.6rem', letterSpacing: '.2em',
                        textTransform: 'uppercase', color: '#6b7a8d',
                        marginBottom: '.5rem',
                      }} htmlFor="name">
                        Full Name *
                      </label>
                      <input
                        id="name" type="text" name="name"
                        value={form.name} onChange={handleChange}
                        placeholder="Your full name"
                        autoComplete="name"
                        className={`form-input ${errors.name ? 'error' : ''}`}
                      />
                      {errors.name && (
                        <p style={{ fontFamily: 'monospace', fontSize: '.6rem', color: '#ef4444', marginTop: '.4rem' }}>{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label style={{
                        display: 'block', fontFamily: 'monospace',
                        fontSize: '.6rem', letterSpacing: '.2em',
                        textTransform: 'uppercase', color: '#6b7a8d',
                        marginBottom: '.5rem',
                      }} htmlFor="email">
                        Email Address *
                      </label>
                      <input
                        id="email" type="email" name="email"
                        value={form.email} onChange={handleChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className={`form-input ${errors.email ? 'error' : ''}`}
                      />
                      {errors.email && (
                        <p style={{ fontFamily: 'monospace', fontSize: '.6rem', color: '#ef4444', marginTop: '.4rem' }}>{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label style={{
                      display: 'block', fontFamily: 'monospace',
                      fontSize: '.6rem', letterSpacing: '.2em',
                      textTransform: 'uppercase', color: '#6b7a8d',
                      marginBottom: '.5rem',
                    }} htmlFor="subject">
                      Subject
                    </label>
                    <input
                      id="subject" type="text" name="subject"
                      value={form.subject} onChange={handleChange}
                      placeholder="What's this about?"
                      className="form-input"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label style={{
                      display: 'block', fontFamily: 'monospace',
                      fontSize: '.6rem', letterSpacing: '.2em',
                      textTransform: 'uppercase', color: '#6b7a8d',
                      marginBottom: '.5rem',
                    }} htmlFor="message">
                      Message *
                    </label>
                    <textarea
                      id="message" name="message" rows={5}
                      value={form.message} onChange={handleChange}
                      placeholder="Tell me about your project or problem..."
                      className={`form-input resize-y ${errors.message ? 'error' : ''}`}
                    />
                    {errors.message && (
                      <p style={{ fontFamily: 'monospace', fontSize: '.6rem', color: '#ef4444', marginTop: '.4rem' }}>{errors.message}</p>
                    )}
                  </div>

                  <button type="submit" disabled={loading} className="btn-submit-corp">
                    {loading ? (
                      <>
                        <svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                          <circle style={{ opacity: .25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path style={{ opacity: .75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Sending…
                      </>
                    ) : 'Send Message →'}
                  </button>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── CTA BAND ─────────────────────────────────────────── */}
      <section style={{ background: '#1c2d3f', padding: '4rem 0' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <Reveal>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '.4rem', lineHeight: 1.2 }}>
                Prefer a quick call?
              </div>
              <p style={{ fontSize: '.95rem', color: 'rgba(255,255,255,.6)' }}>
                Reach me on WhatsApp for a faster response.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <a
              href="https://wa.me/254790078363"
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
              WhatsApp Me →
            </a>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  )
}
