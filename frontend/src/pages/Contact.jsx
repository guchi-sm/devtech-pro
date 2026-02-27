import { useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import toast, { Toaster } from 'react-hot-toast'
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

const INITIAL_FORM = { name: '', email: '', subject: '', message: '' }
const INITIAL_ERRORS = { name: '', email: '', message: '' }

function validate(data) {
  const errors = { ...INITIAL_ERRORS }
  let valid = true

  if (!data.name.trim()) {
    errors.name = 'Please enter your full name.'
    valid = false
  }

  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!data.email.trim() || !emailRx.test(data.email)) {
    errors.email = 'Please enter a valid email address.'
    valid = false
  }

  if (!data.message.trim() || data.message.trim().length < 10) {
    errors.message = 'Please enter a message (at least 10 characters).'
    valid = false
  }

  return { errors, valid }
}

export default function Contact() {
  const [form, setForm]       = useState(INITIAL_FORM)
  const [errors, setErrors]   = useState(INITIAL_ERRORS)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { errors: newErrors, valid } = validate(form)
    if (!valid) { setErrors(newErrors); return }

    setLoading(true)
    try {
      await axios.post('/api/contact', form)
      toast.success('Message sent! I\'ll be in touch within 12 hours.', { duration: 5000 })
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
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.875rem',
          },
        }}
      />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="pt-[68px]" style={{ background: 'var(--bg)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10 py-20 border-b" style={{ borderColor: 'var(--border)' }}>
          <motion.div {...fadeUp(0.1)}><div className="section-label">Get In Touch</div></motion.div>
          <motion.div {...fadeUp(0.2)}>
            <div className="text-display-lg font-display" style={{ color: 'var(--text)' }}>
              Let's Build<br /><span style={{ color: 'var(--accent)' }}>Something</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── MAIN CONTENT ─────────────────────────────────────── */}
      <section className="py-16 pb-24" style={{ background: 'var(--bg)' }}>
        <div className="max-w-[1280px] mx-auto px-8 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: 'var(--border)' }}>

            {/* ─── INFO PANEL ─────────────────────────────────── */}
            <Reveal>
              <div className="flex flex-col gap-8 p-8 md:p-12 h-full" style={{ background: 'var(--bg-card)' }}>

                {/* Hero image */}
                <div className="relative h-48 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80&fit=crop"
                    alt="Contact illustration"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,85,255,0.3) 0%, transparent 60%)' }} />
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <h3 className="font-display text-2xl text-white tracking-wide">Contact Details</h3>
                    <p className="text-white/70 text-xs mt-1">I'm here to help — reach out anytime</p>
                  </div>
                </div>

                {/* Contact items */}
                <div className="flex flex-col gap-5">
                  {CONTACT_INFO.map((item) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--accent-glow)', border: '1px solid rgba(0,85,255,0.2)', color: 'var(--accent)' }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-mono text-[0.6rem] tracking-[0.18em] uppercase mb-0.5" style={{ color: 'var(--text-muted)' }}>
                          {item.label}
                        </div>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-sm font-medium transition-colors duration-200"
                            style={{ color: 'var(--text)' }}
                            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}
                          >
                            {item.value}
                          </a>
                        ) : (
                          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Social links */}
                <div className="mt-auto">
                  <div className="font-mono text-[0.6rem] tracking-[0.18em] uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
                    Find me on
                  </div>
                  <div className="flex gap-2">
                    {[
                      {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/guchi-brown/',
    icon: (
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com/guchi-sm',
    icon: (
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    ),
  },
                    ].map(({ label, href, icon }) => (
                      <a
                        key={label}
                        href={href}
                        aria-label={label}
                        className="w-10 h-10 rounded-lg border flex items-center justify-center transition-all duration-200"
                        style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = 'var(--accent)'
                          e.currentTarget.style.borderColor = 'var(--accent)'
                          e.currentTarget.style.transform = 'translateY(-3px)'
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = 'var(--text-muted)'
                          e.currentTarget.style.borderColor = 'var(--border)'
                          e.currentTarget.style.transform = 'translateY(0)'
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">{icon}</svg>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* ─── FORM ────────────────────────────────────────── */}
            <Reveal delay={0.1}>
              <div className="p-8 md:p-12" style={{ background: 'var(--bg)' }}>
                <h3 className="font-display text-2xl tracking-wide mb-8" style={{ color: 'var(--text)' }}>
                  Send a Message
                </h3>

                <form onSubmit={handleSubmit} noValidate className="space-y-5">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name */}
                    <div>
                      <label className="block font-mono text-[0.6rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--text-muted)' }} htmlFor="name">
                        Full Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        autoComplete="name"
                        className={`form-input ${errors.name ? 'error' : ''}`}
                      />
                      {errors.name && (
                        <p className="font-mono text-[0.6rem] text-red-500 mt-1.5">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block font-mono text-[0.6rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--text-muted)' }} htmlFor="email">
                        Email Address *
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className={`form-input ${errors.email ? 'error' : ''}`}
                      />
                      {errors.email && (
                        <p className="font-mono text-[0.6rem] text-red-500 mt-1.5">{errors.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block font-mono text-[0.6rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--text-muted)' }} htmlFor="subject">
                      Subject
                    </label>
                    <input
                      id="subject"
                      type="text"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      placeholder="What's this about?"
                      className="form-input"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block font-mono text-[0.6rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--text-muted)' }} htmlFor="message">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell me about your project or problem..."
                      className={`form-input resize-y ${errors.message ? 'error' : ''}`}
                    />
                    {errors.message && (
                      <p className="font-mono text-[0.6rem] text-red-500 mt-1.5">{errors.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full justify-center"
                    style={{ opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Sending…
                      </>
                    ) : (
                      'Send Message →'
                    )}
                  </button>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
