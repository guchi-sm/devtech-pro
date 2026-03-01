import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Home',      to: '/' },
  { label: 'About',     to: '/about' },
  { label: 'Services',  to: '/services' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'Contact',   to: '/contact' },
]

const SOCIALS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/guchi-brown/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}>
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'GitHub',
    href: 'https://github.com/guchi-sm',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    label: 'X / Twitter',
    href: 'https://twitter.com/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/254790078363',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ position: 'relative', overflow: 'hidden' }}>

      {/* Full-bleed background image */}
      <img
        src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1800&q=80&fit=crop"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
          pointerEvents: 'none', userSelect: 'none',
        }}
      />

      {/* Dark navy overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(8,12,22,.97) 0%, rgba(20,33,52,.95) 100%)',
        pointerEvents: 'none',
      }} />

      {/* Orange top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 3, background: '#f5a623', zIndex: 5,
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10 }}>

        {/* Upper grid */}
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          padding: '4.5rem 2rem 3.5rem',
          display: 'grid',
          gridTemplateColumns: '1.8fr 1fr 1.2fr',
          gap: '4rem',
        }}>

          {/* Brand */}
          <div>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '1.25rem' }}>
              <span style={{ fontWeight: 900, fontSize: '1.55rem', letterSpacing: '.08em', color: '#ffffff', fontFamily: 'inherit' }}>
                DEV<span style={{ color: '#f5a623' }}>.</span>TECH
              </span>
            </Link>
            <p style={{ fontSize: '.88rem', color: 'rgba(255,255,255,.5)', lineHeight: 1.85, maxWidth: 290, marginBottom: '2rem' }}>
              Helping small businesses build reliable and secure IT systems — from network setup to custom software solutions.
            </p>
            <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              {SOCIALS.map(({ label, href, icon }) => (
                <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer"
                  style={{ width: 38, height: 38, borderRadius: 2, border: '1px solid rgba(255,255,255,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.5)', textDecoration: 'none', transition: 'all .25s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f5a623'; e.currentTarget.style.borderColor = '#f5a623'; e.currentTarget.style.color = '#1c2d3f'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.14)'; e.currentTarget.style.color = 'rgba(255,255,255,.5)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >{icon}</a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div style={{ fontSize: '.68rem', fontFamily: 'monospace', letterSpacing: '.18em', textTransform: 'uppercase', color: '#f5a623', fontWeight: 700, marginBottom: '1.4rem', paddingBottom: '.6rem', borderBottom: '1px solid rgba(245,166,35,.2)' }}>
              Navigation
            </div>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '.7rem' }}>
              {NAV_LINKS.map(({ label, to }) => (
                <Link key={to} to={to}
                  style={{ fontSize: '.75rem', fontFamily: 'monospace', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '.5rem', transition: 'color .2s, gap .25s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#f5a623'; e.currentTarget.style.gap = '.85rem' }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.45)'; e.currentTarget.style.gap = '.5rem' }}
                >
                  <span style={{ width: 14, height: 1, background: 'currentColor', flexShrink: 0, display: 'inline-block' }} />
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <div style={{ fontSize: '.68rem', fontFamily: 'monospace', letterSpacing: '.18em', textTransform: 'uppercase', color: '#f5a623', fontWeight: 700, marginBottom: '1.4rem', paddingBottom: '.6rem', borderBottom: '1px solid rgba(245,166,35,.2)' }}>
              Contact
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { href: 'mailto:guchibrownz@gmail.com', text: 'guchibrownz@gmail.com', icon: <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ width: 14, height: 14 }}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg> },
                { href: 'https://wa.me/254790078363', text: '+254 790 078 363', icon: <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ width: 14, height: 14 }}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg> },
                { href: 'https://maps.google.com/?q=Meru,Kenya', text: 'Meru, Kenya', icon: <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" style={{ width: 14, height: 14 }}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg> },
              ].map(({ href, text, icon }) => (
                <a key={text} href={href} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '.75rem', color: 'rgba(255,255,255,.5)', textDecoration: 'none', fontSize: '.88rem', transition: 'color .2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f5a623')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.5)')}
                >
                  <span style={{ width: 32, height: 32, borderRadius: 2, flexShrink: 0, background: 'rgba(245,166,35,.12)', border: '1px solid rgba(245,166,35,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5a623' }}>
                    {icon}
                  </span>
                  {text}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', borderTop: '1px solid rgba(255,255,255,.07)' }} />

        {/* Bottom bar */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.4rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '.63rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)' }}>
            © {year} DevTech Pro. All rights reserved.
          </p>
          <p style={{ fontFamily: 'monospace', fontSize: '.63rem', letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)' }}>
            ICT Technician &amp; Software Developer
          </p>
        </div>
      </div>
    </footer>
  )
}