import { useState, useRef, useEffect } from 'react'

const API = 'https://devtech-pro-api-production.up.railway.app/api/chat'

const QUICK_REPLIES = [
  'What services do you offer?',
  'How much does a website cost?',
  'I need network setup',
  'Get a free quote',
]

export default function AIChatbox() {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm DevTech Pro's AI assistant. I can help you with our services, pricing, or connect you with Guchi directly.\n\nWhat can I help you with today?",
    },
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread]   = useState(0)
  const [pulse, setPulse]     = useState(true)
  const bottomRef             = useRef(null)
  const inputRef              = useRef(null)

  // Stop pulse after 5s
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 5000)
    return () => clearTimeout(t)
  }, [])

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
      setUnread(0)
    }
  }, [open])

  async function sendMessage(text) {
    const content = text || input.trim()
    if (!content || loading) return

    setInput('')
    const newMessages = [...messages, { role: 'user', content }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res  = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      const reply = data.reply || 'Sorry, something went wrong. Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
      if (!open) setUnread(n => n + 1)
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ Connection error. Please check your internet or contact us directly on WhatsApp: +254 790 078 363',
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function formatMessage(text) {
    return text.split('\n').map((line, i) => (
      <span key={i}>{line}{i < text.split('\n').length - 1 && <br/>}</span>
    ))
  }

  return (
    <>
      {/* ── CHAT WINDOW ── */}
      <div style={{
        position: 'fixed', bottom: '150px', right: '24px', zIndex: 9999,
        width: '360px', maxWidth: 'calc(100vw - 48px)',
        background: '#fff', borderRadius: '16px',
        boxShadow: '0 25px 60px rgba(0,0,0,.18), 0 8px 24px rgba(0,0,0,.12)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', border: '1px solid #e2e8f0',
        transition: 'all .35s cubic-bezier(.34,1.56,.64,1)',
        transformOrigin: 'bottom right',
        transform: open ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(20px)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'all' : 'none',
        maxHeight: '520px',
      }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1c2d3f 0%, #2a3f57 100%)',
          padding: '16px 18px', borderBottom: '3px solid #f5a623',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #f5a623, #e8960f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', flexShrink: 0, boxShadow: '0 4px 12px rgba(245,166,35,.4)',
          }}>🤖</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '.95rem', letterSpacing: '.02em' }}>
              DevTech Assistant
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }}/>
              <span style={{ color: 'rgba(255,255,255,.55)', fontSize: '.72rem' }}>Online · Powered by Claude AI</span>
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{
            background: 'rgba(255,255,255,.1)', border: 'none', color: 'rgba(255,255,255,.7)',
            width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer',
            fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .2s',
          }}
          onMouseOver={e => e.target.style.background = 'rgba(255,255,255,.2)'}
          onMouseOut={e => e.target.style.background = 'rgba(255,255,255,.1)'}
          >×</button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '10px',
          background: '#f8fafc', minHeight: '280px', maxHeight: '320px',
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              animation: 'fadeUp .3s ease',
            }}>
              {msg.role === 'assistant' && (
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: '#1c2d3f', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '.75rem', marginRight: '8px',
                  flexShrink: 0, alignSelf: 'flex-end',
                }}>🤖</div>
              )}
              <div style={{
                maxWidth: '78%',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #f5a623, #e8960f)'
                  : '#fff',
                color: msg.role === 'user' ? '#1c2d3f' : '#1c2d3f',
                padding: '10px 14px', borderRadius: msg.role === 'user'
                  ? '16px 4px 16px 16px'
                  : '4px 16px 16px 16px',
                fontSize: '.875rem', lineHeight: '1.65',
                boxShadow: msg.role === 'user'
                  ? '0 4px 12px rgba(245,166,35,.3)'
                  : '0 2px 8px rgba(0,0,0,.06)',
                border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                fontWeight: msg.role === 'user' ? 600 : 400,
              }}>
                {formatMessage(msg.content)}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#1c2d3f', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '.75rem',
              }}>🤖</div>
              <div style={{
                background: '#fff', border: '1px solid #e2e8f0',
                padding: '12px 16px', borderRadius: '4px 16px 16px 16px',
                display: 'flex', gap: '4px', alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,.06)',
              }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: '#f5a623',
                    animation: `bounce .9s ease ${i * .15}s infinite`,
                  }}/>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* Quick replies */}
        {messages.length <= 1 && (
          <div style={{
            padding: '8px 16px', background: '#f8fafc',
            borderTop: '1px solid #e2e8f0', display: 'flex', flexWrap: 'wrap', gap: '6px',
          }}>
            {QUICK_REPLIES.map(q => (
              <button key={q} onClick={() => sendMessage(q)} style={{
                background: '#fff', border: '1px solid #e2e8f0',
                borderRadius: '20px', padding: '5px 12px', fontSize: '.75rem',
                color: '#1c2d3f', cursor: 'pointer', fontWeight: 600,
                transition: 'all .2s', whiteSpace: 'nowrap',
              }}
              onMouseOver={e => { e.target.style.background = '#f5a623'; e.target.style.borderColor = '#f5a623' }}
              onMouseOut={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#e2e8f0' }}
              >{q}</button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          padding: '12px 16px', background: '#fff',
          borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px', alignItems: 'flex-end',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your message…"
            rows={1}
            style={{
              flex: 1, border: '1px solid #e2e8f0', borderRadius: '10px',
              padding: '10px 14px', fontSize: '.875rem', resize: 'none',
              outline: 'none', fontFamily: 'inherit', color: '#1c2d3f',
              transition: 'border-color .2s', lineHeight: '1.5',
              maxHeight: '80px', overflowY: 'auto',
            }}
            onFocus={e => e.target.style.borderColor = '#f5a623'}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: input.trim() && !loading ? '#f5a623' : '#e2e8f0',
              border: 'none', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .2s', flexShrink: 0, fontSize: '1.1rem',
            }}
          >➤</button>
        </div>
      </div>

      {/* ── FLOATING BUTTON ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: '80px', right: '24px', zIndex: 9999,
          width: '60px', height: '60px', borderRadius: '50%',
          background: open ? '#1c2d3f' : 'linear-gradient(135deg, #f5a623, #e8960f)',
          border: '3px solid ' + (open ? '#f5a623' : '#fff'),
          boxShadow: '0 8px 25px rgba(245,166,35,.45), 0 4px 12px rgba(0,0,0,.15)',
          cursor: 'pointer', fontSize: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .3s cubic-bezier(.34,1.56,.64,1)',
          transform: open ? 'rotate(0deg)' : 'rotate(0deg)',
        }}
      >
        {open ? '✕' : '💬'}

        {/* Unread badge */}
        {!open && unread > 0 && (
          <div style={{
            position: 'absolute', top: '-4px', right: '-4px',
            background: '#ef4444', color: '#fff', borderRadius: '50%',
            width: '20px', height: '20px', fontSize: '.7rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #fff',
          }}>{unread}</div>
        )}

        {/* Pulse ring */}
        {pulse && !open && (
          <div style={{
            position: 'absolute', inset: '-8px', borderRadius: '50%',
            border: '2px solid #f5a623', animation: 'ping 1.5s ease infinite',
          }}/>
        )}
      </button>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%           { transform: translateY(-6px); }
        }
        @keyframes ping {
          0%   { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </>
  )
}
