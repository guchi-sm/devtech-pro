const jwt      = require('jsonwebtoken')
const bcrypt   = require('bcryptjs')
const { Resend } = require('resend')
const Message  = require('../models/Message')

const resend = new Resend(process.env.RESEND_API_KEY)

// ─── LOGIN ─────────────────────────────────────────────────────
async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password)
    return res.status(400).json({ success: false, message: 'Email and password required.' })

  const adminEmail    = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword)
    return res.status(500).json({ success: false, message: 'Admin credentials not configured.' })

  if (email.toLowerCase() !== adminEmail.toLowerCase())
    return res.status(401).json({ success: false, message: 'Invalid credentials.' })

  let passwordValid = false
  if (adminPassword.startsWith('$2')) {
    passwordValid = await bcrypt.compare(password, adminPassword)
  } else {
    passwordValid = password === adminPassword
  }

  if (!passwordValid)
    return res.status(401).json({ success: false, message: 'Invalid credentials.' })

  const token = jwt.sign(
    { email: adminEmail, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )
  return res.json({ success: true, token, expiresIn: '24h' })
}

// ─── GET ALL MESSAGES ──────────────────────────────────────────
async function getMessages(req, res) {
  try {
    const { page = 1, limit = 50, filter = 'all' } = req.query
    const query = {}
    if (filter === 'unread') query.read = false
    if (filter === 'read')   query.read = true

    const total    = await Message.countDocuments(query)
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    return res.json({ success: true, messages, total, page: Number(page) })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

// ─── GET STATS ─────────────────────────────────────────────────
async function getStats(req, res) {
  try {
    const total  = await Message.countDocuments()
    const unread = await Message.countDocuments({ read: false })

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const today = await Message.countDocuments({ createdAt: { $gte: todayStart } })

    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7)
    const thisWeek = await Message.countDocuments({ createdAt: { $gte: weekStart } })

    return res.json({ success: true, stats: { total, unread, today, thisWeek } })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

// ─── MARK AS READ ──────────────────────────────────────────────
async function markRead(req, res) {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true, readAt: new Date() },
      { new: true }
    )
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' })
    return res.json({ success: true, message: msg })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

// ─── MARK AS UNREAD ────────────────────────────────────────────
async function markUnread(req, res) {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { read: false, readAt: null },
      { new: true }
    )
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' })
    return res.json({ success: true, message: msg })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

// ─── DELETE MESSAGE ────────────────────────────────────────────
async function deleteMessage(req, res) {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id)
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' })
    return res.json({ success: true, message: 'Message deleted.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

// ─── REPLY TO MESSAGE (via Resend) ─────────────────────────────
async function replyMessage(req, res) {
  try {
    const { replyText } = req.body
    if (!replyText || !replyText.trim())
      return res.status(400).json({ success: false, message: 'Reply text is required.' })

    const msg = await Message.findById(req.params.id)
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' })

    await resend.emails.send({
      from:    'DevTech Pro <onboarding@resend.dev>',
      to:      msg.email,
      replyTo: process.env.OWNER_EMAIL || 'guchibrownz@gmail.com',
      subject: `Re: ${msg.subject || 'Your message to DevTech Pro'}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
          <div style="background:#1c2d3f;padding:24px 28px;border-top:4px solid #f5a623">
            <h2 style="color:#fff;margin:0;font-size:1.3rem">DEV<span style="color:#f5a623">.</span>TECH</h2>
            <p style="color:rgba(255,255,255,.5);margin:4px 0 0;font-size:.75rem;text-transform:uppercase;letter-spacing:.14em">ICT Technician & Software Developer</p>
          </div>
          <div style="padding:28px;background:#fff">
            <p style="font-size:1rem;color:#1c2d3f;margin:0 0 16px">Hi <strong>${msg.name}</strong>,</p>
            <div style="font-size:.95rem;color:#1c2d3f;line-height:1.85;margin:0 0 24px;white-space:pre-wrap">${replyText.replace(/\n/g, '<br/>')}</div>
            <div style="border-top:1px solid #e2e8f0;padding-top:16px;margin-top:8px">
              <p style="font-size:.8rem;color:#6b7a8d;margin:0 0 4px">In reply to your message:</p>
              <div style="background:#f4f6f9;border-left:3px solid #e2e8f0;padding:10px 14px;font-size:.85rem;color:#6b7a8d;border-radius:0 4px 4px 0">
                "${msg.message.slice(0, 200)}${msg.message.length > 200 ? '…' : ''}"
              </div>
            </div>
            <p style="font-size:.9rem;color:#1c2d3f;margin:1.5rem 0 0">
              Best regards,<br/>
              <strong style="color:#f5a623">Guchi Brown</strong><br/>
              <span style="font-size:.8rem;color:#6b7a8d">Meru, Kenya · +254 790 078 363</span>
            </p>
          </div>
          <p style="text-align:center;color:#9eaab8;font-size:.68rem;padding:12px;background:#f9fafb">
            DevTech Pro · devtech-pro.vercel.app
          </p>
        </div>
      `,
    })

    // Auto mark as read after reply
    await Message.findByIdAndUpdate(req.params.id, { read: true, readAt: new Date() })

    return res.json({ success: true, message: `Reply sent to ${msg.email}` })
  } catch (err) {
    console.error('Reply error:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { login, getMessages, getStats, markRead, markUnread, deleteMessage, replyMessage }
