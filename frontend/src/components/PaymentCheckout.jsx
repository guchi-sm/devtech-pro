import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ─── Config ────────────────────────────────────────────────────
const MPESA_NUMBER = import.meta.env.VITE_MPESA_NUMBER || '0790078363'
const MPESA_NAME   = import.meta.env.VITE_MPESA_NAME   || 'STEPHEN NGUCHIE'

// ─── Payment Methods ───────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id:          'mpesa_stk',
    label:       'M-PESA STK Push',
    sublabel:    'Recommended — Instant prompt to your phone',
    icon:        '📱',
    badge:       'RECOMMENDED',
    badgeColor:  '#00a651',
    available:   true,
  },
  {
    id:          'mpesa_manual',
    label:       'M-PESA Send Money',
    sublabel:    'Send manually then enter transaction code',
    icon:        '💸',
    badge:       null,
    available:   true,
  },
  {
    id:          'card',
    label:       'Visa & Mastercard',
    sublabel:    'Pay securely with your debit or credit card',
    icon:        '💳',
    badge:       null,
    available:   true,
  },
  {
    id:          'bank_transfer',
    label:       'Bank Transfer',
    sublabel:    'Direct bank transfer',
    icon:        '🏦',
    badge:       'COMING SOON',
    badgeColor:  '#6b7a8d',
    available:   false,
  },
]

// ─── Styles ────────────────────────────────────────────────────
const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(7,12,20,0.9)', backdropFilter: 'blur(12px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem', overflowY: 'auto',
  },
  card: {
    background: '#0c1a2e', borderRadius: 18, width: '100%', maxWidth: 480,
    boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
    border: '1px solid rgba(255,255,255,0.08)',
    maxHeight: '95vh', overflowY: 'auto',
  },
  header: {
    background: 'linear-gradient(135deg, #070c14, #0f1e30)',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
  },
  input: {
    width: '100%', padding: '0.75rem 1rem', borderRadius: 8,
    border: '1.5px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff', fontSize: '0.9rem', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  label: {
    display: 'block', fontSize: '0.62rem', letterSpacing: '0.14em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
    marginBottom: '0.35rem', fontFamily: 'monospace',
  },
  btn: (bg = '#00a651', color = '#fff') => ({
    width: '100%', padding: '0.85rem', borderRadius: 8,
    background: bg, color, fontWeight: 700, fontSize: '0.9rem',
    border: 'none', cursor: 'pointer', transition: 'opacity 0.2s',
  }),
}

// ─── Input Field ───────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder, required, autoFocus, mono }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: '0.85rem' }}>
      <label style={S.label}>{label}{required && <span style={{ color: '#f5a623' }}> *</span>}</label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        autoFocus={autoFocus} autoComplete="off" spellCheck={false}
        style={{
          ...S.input,
          borderColor: focused ? '#f5a623' : 'rgba(255,255,255,0.12)',
          fontFamily: mono ? 'monospace' : 'inherit',
          letterSpacing: mono ? '0.08em' : 'normal',
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  FORMS
// ══════════════════════════════════════════════════════════════

function StkPushForm({ resource, onSuccess, onError }) {
  const [phone, setPhone]   = useState('')
  const [name,  setName]    = useState('')
  const [step,  setStep]    = useState('form') // form | pending | success | failed
  const [receipt, setReceipt] = useState('')
  const [checkoutId, setCheckoutId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  function normalizePhone(p) {
    p = p.replace(/[\s\-+]/g, '')
    if (p.startsWith('0'))   return '254' + p.slice(1)
    if (p.startsWith('254')) return p
    return '254' + p
  }

  async function handlePay() {
    setError('')
    if (!phone.trim()) return setError('Enter your Safaricom number')
    const norm = normalizePhone(phone)
    if (!/^2547\d{8}$|^2541\d{8}$/.test(norm)) return setError('Invalid number. Use format 0712345678')

    setLoading(true)
    setStep('pending')
    try {
      const res  = await fetch(`${API}/api/payments/mpesa-stk`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: norm, resourceId: resource._id, customerName: name }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.message); return setStep('form') }
      setCheckoutId(data.checkoutRequestId)
      pollStatus(data.checkoutRequestId)
    } catch { setError('Network error. Check your connection.'); setStep('form')
    } finally { setLoading(false) }
  }

  function pollStatus(id) {
    let attempts = 0
    const iv = setInterval(async () => {
      attempts++
      try {
        const res  = await fetch(`${API}/api/payments/status/${id}`)
        const data = await res.json()
        if (data.status === 'successful') {
          clearInterval(iv); setReceipt(data.mpesaReceiptNo); setStep('success')
          onSuccess?.({ receipt: data.mpesaReceiptNo, resource })
        } else if (data.status === 'failed') {
          clearInterval(iv); setError('Payment cancelled or failed.'); setStep('failed')
        } else if (attempts >= 24) {
          clearInterval(iv); setError('Timed out. If you paid, contact support.'); setStep('failed')
        }
      } catch { if (attempts >= 24) { clearInterval(iv); setStep('failed') } }
    }, 5000)
  }

  if (step === 'pending') return (
    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📲</div>
      <div style={{ fontWeight: 800, color: '#fff', fontSize: '1.05rem', marginBottom: '0.5rem' }}>Check Your Phone</div>
      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.84rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
        M-Pesa prompt sent to <strong style={{ color: '#fff' }}>{phone}</strong>.<br/>Enter your PIN to complete payment.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#00a651', fontSize: '0.78rem', fontWeight: 600 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00a651', display: 'inline-block', animation: 'dtpPulse 1s infinite' }}/>
        Waiting for confirmation...
      </div>
    </div>
  )

  if (step === 'success') return (
    <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>✅</div>
      <div style={{ fontWeight: 900, color: '#00a651', fontSize: '1.2rem', marginBottom: '0.35rem' }}>Payment Successful!</div>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>Thank you for your purchase.</div>
      {receipt && (
        <div style={{ background: 'rgba(0,166,81,0.1)', border: '1px solid rgba(0,166,81,0.3)', borderRadius: 8, padding: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.6rem', color: '#00a651', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>M-Pesa Receipt</div>
          <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{receipt}</div>
        </div>
      )}
      <button style={S.btn('#00a651')}>Access Resource →</button>
    </div>
  )

  if (step === 'failed') return (
    <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>❌</div>
      <div style={{ fontWeight: 800, color: '#ef4444', fontSize: '1.05rem', marginBottom: '0.5rem' }}>Payment Failed</div>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginBottom: '1.25rem' }}>{error}</div>
      <button style={S.btn('#1c2d3f')} onClick={() => { setStep('form'); setError('') }}>Try Again</button>
    </div>
  )

  return (
    <div>
      <div style={{ background: 'rgba(0,166,81,0.08)', border: '1px solid rgba(0,166,81,0.2)', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#00a651', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Amount to Pay</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff' }}>KES {resource.price?.toLocaleString()}</div>
      </div>
      <Field label="Your Name (optional)" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe"/>
      <Field label="Safaricom Number" type="tel" value={phone} onChange={e => { setPhone(e.target.value); setError('') }} placeholder="0712345678" required autoFocus/>
      {error && <div style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: '0.75rem' }}>⚠ {error}</div>}
      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
        You'll receive an M-Pesa prompt. Enter your PIN to pay instantly.
      </div>
      <button style={S.btn('#00a651')} onClick={handlePay} disabled={loading}>
        {loading ? '⏳ Sending prompt...' : `Pay KES ${resource.price?.toLocaleString()} →`}
      </button>
    </div>
  )
}

function ManualPaymentForm({ resource, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', senderPhone: '', mpesaCode: '', amount: resource.price || '' })
  const [step, setStep] = useState('form') // form | success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit() {
    setError('')
    if (!form.mpesaCode || !form.senderPhone || !form.amount) {
      return setError('M-Pesa code, sender phone and amount are required.')
    }
    setLoading(true)
    try {
      const res  = await fetch(`${API}/api/payments/mpesa-manual`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId:    resource._id,
          customerName:  form.name,
          customerEmail: form.email,
          customerPhone: form.phone || form.senderPhone,
          mpesaCode:     form.mpesaCode.trim().toUpperCase(),
          senderPhone:   form.senderPhone,
          amount:        form.amount,
        }),
      })
      const data = await res.json()
      if (!data.success) return setError(data.message)
      setStep('success')
    } catch { setError('Network error. Try again.')
    } finally { setLoading(false) }
  }

  if (step === 'success') return (
    <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
      <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⏳</div>
      <div style={{ fontWeight: 900, color: '#f5a623', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Pending Verification</div>
      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', lineHeight: 1.7 }}>
        Your payment has been submitted.<br/>We'll verify and send access within <strong style={{ color: '#fff' }}>1 hour</strong> during business hours.
      </div>
    </div>
  )

  return (
    <div>
      {/* Payment instructions */}
      <div style={{ background: 'rgba(245,166,35,0.07)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 10, padding: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#f5a623', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>📱 Payment Instructions</div>
        {[
          `Go to M-Pesa → Send Money`,
          `Send KES ${resource.price?.toLocaleString()} to ${MPESA_NUMBER}`,
          `Name: ${MPESA_NAME}`,
          `Enter the M-Pesa code you receive below`,
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 800, color: '#f5a623', flexShrink: 0, marginTop: 2 }}>{i+1}</span>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.65)' }}>{s}</span>
          </div>
        ))}
      </div>

      <Field label="M-Pesa Transaction Code" value={form.mpesaCode} onChange={set('mpesaCode')} placeholder="e.g. RGH23XYZAB" required autoFocus mono/>
      <Field label="Sender Phone Number" type="tel" value={form.senderPhone} onChange={set('senderPhone')} placeholder="0712345678" required/>
      <Field label="Amount Sent (KES)" type="number" value={form.amount} onChange={set('amount')} placeholder={resource.price} required/>
      <Field label="Your Name" value={form.name} onChange={set('name')} placeholder="John Doe"/>
      <Field label="Email (to receive access)" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com"/>

      {error && <div style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: '0.75rem' }}>⚠ {error}</div>}
      <button style={S.btn('#f5a623', '#1c2d3f')} onClick={handleSubmit} disabled={loading}>
        {loading ? '⏳ Submitting...' : '📤 Submit Payment for Verification'}
      </button>
    </div>
  )
}

function CardPaymentForm({ resource, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handlePay() {
    setError('')
    if (!form.email) return setError('Email is required for card payment.')
    setLoading(true)
    try {
      const res  = await fetch(`${API}/api/payments/card`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId: resource._id, customerName: form.name, customerEmail: form.email, customerPhone: form.phone }),
      })
      const data = await res.json()
      if (!data.success) return setError(data.message)
      if (data.checkoutUrl) window.location.href = data.checkoutUrl
    } catch { setError('Network error. Try again.')
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div style={{ background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.65rem', color: '#3b82f6', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Amount to Pay</div>
        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fff' }}>KES {resource.price?.toLocaleString()}</div>
        <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>Visa • Mastercard • Secured payment</div>
      </div>
      <Field label="Full Name" value={form.name} onChange={set('name')} placeholder="John Doe" autoFocus/>
      <Field label="Email Address" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required/>
      <Field label="Phone (optional)" type="tel" value={form.phone} onChange={set('phone')} placeholder="0712345678"/>
      {error && <div style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: '0.75rem' }}>⚠ {error}</div>}
      <button style={S.btn('#3b82f6')} onClick={handlePay} disabled={loading}>
        {loading ? '⏳ Connecting...' : `Pay KES ${resource.price?.toLocaleString()} →`}
      </button>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════
//  MAIN CHECKOUT MODAL
// ══════════════════════════════════════════════════════════════
export default function PaymentCheckout({ resource, onClose, onSuccess }) {
  const [selectedMethod, setSelectedMethod] = useState('mpesa_stk')

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div style={S.card}>

        {/* Header */}
        <div style={S.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ fontSize: '1.5rem' }}>🛒</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.6rem', color: '#f5a623', fontFamily: 'monospace', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Checkout</div>
              <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.3 }}>{resource.title}</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 30, height: 30, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 }}>✕</button>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div style={{ padding: '1.25rem 1.5rem 0' }}>
          <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Select Payment Method</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {PAYMENT_METHODS.map(method => (
              <button key={method.id} onClick={() => method.available && setSelectedMethod(method.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  padding: '0.85rem 1rem', borderRadius: 10, border: 'none', cursor: method.available ? 'pointer' : 'not-allowed',
                  background: selectedMethod === method.id ? 'rgba(245,166,35,0.1)' : 'rgba(255,255,255,0.03)',
                  outline: selectedMethod === method.id ? '1.5px solid rgba(245,166,35,0.5)' : '1px solid rgba(255,255,255,0.07)',
                  opacity: method.available ? 1 : 0.5, transition: 'all 0.2s', textAlign: 'left',
                }}>
                <div style={{ fontSize: '1.4rem', flexShrink: 0 }}>{method.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem' }}>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>{method.label}</span>
                    {method.badge && (
                      <span style={{ fontSize: '0.5rem', fontFamily: 'monospace', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', background: method.badgeColor, color: '#fff', padding: '0.15rem 0.45rem', borderRadius: 3 }}>{method.badge}</span>
                    )}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>{method.sublabel}</div>
                </div>
                {method.available && (
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${selectedMethod === method.id ? '#f5a623' : 'rgba(255,255,255,0.2)'}`, background: selectedMethod === method.id ? '#f5a623' : 'transparent', flexShrink: 0, transition: 'all 0.2s' }}/>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Active Form */}
        <div style={{ padding: '0 1.5rem 1.5rem' }}>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.25rem' }}>
            {selectedMethod === 'mpesa_stk'    && <StkPushForm     resource={resource} onSuccess={onSuccess} onError={console.error}/>}
            {selectedMethod === 'mpesa_manual' && <ManualPaymentForm resource={resource} onSuccess={onSuccess}/>}
            {selectedMethod === 'card'         && <CardPaymentForm  resource={resource} onSuccess={onSuccess}/>}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes dtpPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </div>
  )
}
