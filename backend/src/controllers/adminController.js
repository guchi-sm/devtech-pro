const jwt      = require('jsonwebtoken')
const bcrypt   = require('bcryptjs')
const Message  = require('../models/Message')

// ─── LOGIN ─────────────────────────────────────────────────────
async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required.' })
  }

  const adminEmail    = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    return res.status(500).json({ success: false, message: 'Admin credentials not configured.' })
  }

  // Check email
  if (email.toLowerCase() !== adminEmail.toLowerCase()) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' })
  }

  // Check password (supports both plain text and bcrypt hash)
  let passwordValid = false
  if (adminPassword.startsWith('$2')) {
    // bcrypt hash
    passwordValid = await bcrypt.compare(password, adminPassword)
  } else {
    // plain text (fine for personal portfolio)
    passwordValid = password === adminPassword
  }

  if (!passwordValid) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' })
  }

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

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const today = await Message.countDocuments({ createdAt: { $gte: todayStart } })

    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
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

module.exports = { login, getMessages, getStats, markRead, markUnread, deleteMessage }
