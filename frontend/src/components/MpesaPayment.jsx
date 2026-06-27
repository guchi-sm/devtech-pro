import { useState } from 'react'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function MpesaPayment({ resource, onClose, onSuccess }) {
  const [phone, setPhone]     = useState('')
  const [step, setStep]       = useState('form')
  const [error, setError]     = useState('')
  const [receipt, setReceipt] = useState('')

  function normalizePhone(raw) {
    // Strip spaces, dashes, plus
    let p = raw.replace(/[\s\-+]/g, '')
    if (p.startsWith('254')) return p          // already 254XXXXXXXXX
    if (p.startsWith('0'))   return '254' + p.slice(1)  // 07XX → 2547XX
    return p
  }

  function validatePhone(raw) {
    const p = normalizePhone(raw)
    return /^2547\d{8}$|^2541\d{8}$/.test(p)
  }

  async function handlePay() {
    setError('')
    if (!phone.trim()) return setError('Enter your Safaricom number e.g. 0712345678')
    if (!validatePhone(phone)) return setError('Invalid number. Use format 0712345678 or 0112345678')

    setStep('pending')
    try {
      const res = await fetch(`${API}/api/mpesa/stk-push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone:      normalizePhone(phone),
          resourceId: resource._id,
          amount:     resource.price,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message || 'Payment failed. Try again.')
        return setStep('form')
      }
      pollStatus(data.checkoutRequestId)
    } catch {
      setError('Network error. Check your connection.')
      setStep('form')
    }
  }

  async function pollStatus(id) {
    let attempts = 0
    const interval = setInterval(async () => {
      attempts++
      try {
        const res  = await fetch(`${API}/api/mpesa/status/${id}`)
        const data = await res.json()
        if (data.status === 'completed') {
          clearInterval(interval)
          setReceipt(data.mpesaReceiptNo)
          setStep('success')
          onSuccess?.({ receipt: data.mpesaReceiptNo, resource })
        } else if (data.status === 'failed') {
          clearInterval(interval)
          setError('Payment was cancelled or failed. Try again.')
          setStep('failed')
        } else if (attempts >= 24) {
          clearInterval(interval)
          setError('Payment timed out. If you paid, contact support.')
          setStep('failed')
        }
      } catch {
        if (attempts >= 24) { clearInterval(interval); setStep('failed') }
      }
    }, 5000)
  }

  const overlay = { position:'fixed', inset:0, zIndex:9999, background:'rgba(7,12,20,0.85)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }
  const card    = { background:'#fff', borderRadius:16, width:'100%', maxWidth:420, boxShadow:'0 40px 80px rgba(0,0,0,0.4)', overflow:'hidden', borderTop:'4px solid #00a651' }
  const btn     = (bg = '#00a651') => ({ width:'100%', padding:'0.85rem', borderRadius:8, background:bg, color:'#fff', fontWeight:700, fontSize:'0.95rem', border:'none', cursor:'pointer' })

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div style={card}>

        {/* Header */}
        <div style={{ background:'#00a651', padding:'1.25rem 1.5rem', display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <div style={{ fontSize:'1.75rem' }}>📱</div>
          <div>
            <div style={{ color:'#fff', fontWeight:800, fontSize:'1rem' }}>M-Pesa Payment</div>
            <div style={{ color:'rgba(255,255,255,0.8)', fontSize:'0.78rem' }}>{resource.title}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'none', color:'#fff', fontSize:'1.2rem', cursor:'pointer' }}>✕</button>
        </div>

        <div style={{ padding:'1.5rem' }}>

          {/* FORM */}
          {step === 'form' && (
            <>
              <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'0.85rem', marginBottom:'1.25rem' }}>
                <div style={{ fontSize:'0.75rem', color:'#166534', fontWeight:600 }}>Amount to Pay</div>
                <div style={{ fontSize:'1.75rem', fontWeight:900, color:'#15803d' }}>KES {resource.price?.toLocaleString()}</div>
              </div>

              <label style={{ display:'block', fontSize:'0.8rem', fontWeight:600, color:'#1c2d3f', marginBottom:'0.4rem' }}>
                Safaricom Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 0712345678"
                value={phone}
                onChange={e => { setPhone(e.target.value); setError('') }}
                style={{
  width:'100%', padding:'0.75rem 1rem', borderRadius:8, marginBottom:'0.5rem',
  border:`1.5px solid ${error ? '#ef4444' : '#e2e8f0'}`,
  fontSize:'1rem', outline:'none', boxSizing:'border-box',
  color: '#1c2d3f',        // ← add this
  background: '#ffffff',   // ← add this
}}
                onKeyDown={e => e.key === 'Enter' && handlePay()}
              />
              {error && <div style={{ color:'#ef4444', fontSize:'0.78rem', marginBottom:'0.75rem' }}>⚠ {error}</div>}

              <div style={{ fontSize:'0.75rem', color:'#6b7a8d', marginBottom:'1.25rem', lineHeight:1.6 }}>
                You will receive an M-Pesa prompt on your phone. Enter your PIN to complete payment.
              </div>
              <button style={btn()} onClick={handlePay}>Pay KES {resource.price?.toLocaleString()} →</button>
            </>
          )}

          {/* PENDING */}
          {step === 'pending' && (
            <div style={{ textAlign:'center', padding:'1.5rem 0' }}>
              <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📲</div>
              <div style={{ fontWeight:800, fontSize:'1.1rem', color:'#1c2d3f', marginBottom:'0.5rem' }}>Check Your Phone</div>
              <div style={{ color:'#6b7a8d', fontSize:'0.85rem', lineHeight:1.7, marginBottom:'1.5rem' }}>
                An M-Pesa prompt has been sent to <strong>{phone}</strong>.<br/>Enter your M-Pesa PIN to complete the payment.
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', color:'#00a651', fontSize:'0.8rem', fontWeight:600 }}>
                <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:'#00a651' }} />
                Waiting for confirmation...
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {step === 'success' && (
            <div style={{ textAlign:'center', padding:'1rem 0' }}>
              <div style={{ fontSize:'3.5rem', marginBottom:'0.75rem' }}>✅</div>
              <div style={{ fontWeight:900, fontSize:'1.2rem', color:'#15803d', marginBottom:'0.4rem' }}>Payment Successful!</div>
              <div style={{ color:'#6b7a8d', fontSize:'0.85rem', marginBottom:'1rem' }}>Thank you for your purchase.</div>
              {receipt && (
                <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8, padding:'0.75rem', marginBottom:'1.25rem' }}>
                  <div style={{ fontSize:'0.7rem', color:'#166534', fontWeight:600, marginBottom:'0.2rem' }}>M-Pesa Receipt</div>
                  <div style={{ fontWeight:800, color:'#15803d', fontFamily:'monospace', fontSize:'1rem' }}>{receipt}</div>
                </div>
              )}
              <button style={btn()} onClick={() => { onClose?.(); onSuccess?.({ receipt, resource }) }}>Access Resource →</button>
            </div>
          )}

          {/* FAILED */}
          {step === 'failed' && (
            <div style={{ textAlign:'center', padding:'1rem 0' }}>
              <div style={{ fontSize:'3rem', marginBottom:'0.75rem' }}>❌</div>
              <div style={{ fontWeight:800, fontSize:'1.1rem', color:'#dc2626', marginBottom:'0.5rem' }}>Payment Failed</div>
              <div style={{ color:'#6b7a8d', fontSize:'0.85rem', marginBottom:'1.25rem' }}>{error || 'Something went wrong. Please try again.'}</div>
              <button style={btn('#1c2d3f')} onClick={() => { setStep('form'); setError('') }}>Try Again</button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
