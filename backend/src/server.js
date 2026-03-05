require('dotenv').config()

const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const rateLimit  = require('express-rate-limit')
const mongoose   = require('mongoose')
const path       = require('path')

const contactRouter  = require('./routes/contact')
const adminRouter    = require('./routes/admin')
const chatRouter     = require('./routes/chat')       // ✅ FIX: was missing
const projectRouter  = require('./routes/projects')   // ✅ NEW: portfolio CRUD

const app  = express()
const PORT = process.env.PORT || 5000

// ─── TRUST PROXY (Railway) ─────────────────────────────────────
app.set('trust proxy', 1)

// ─── MONGODB ───────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅  MongoDB connected'))
  .catch(err => console.error('❌  MongoDB error:', err.message))

// ─── SECURITY ──────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }))

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_ORIGIN,
    /\.vercel\.app$/,
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

// ─── LOGGING ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))

// ─── BODY PARSING ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ─── RATE LIMITING ─────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 100,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
})

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many contact submissions. Please try again in an hour.' },
})

app.use(globalLimiter)

// ─── HEALTH CHECK ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true, status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'DevTech Pro API',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})

// ─── API ROUTES ────────────────────────────────────────────────
app.use('/api/contact',  contactLimiter, contactRouter)
app.use('/api/admin',    adminRouter)
app.use('/api/chat',     chatRouter)       // ✅ FIX: now mounted
app.use('/api/projects', projectRouter)    // ✅ NEW: portfolio CRUD

// ─── ADMIN DASHBOARD (serve HTML) ─────────────────────────────
app.use('/admin', express.static(path.join(__dirname, 'public')))
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'))
})

// ─── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' })
})

// ─── ERROR HANDLER ─────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('❌ Server Error:', err.stack || err.message)
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred.'
      : err.message,
  })
})

// ─── START ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  DevTech Pro API running on http://localhost:${PORT}`)
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`)
  console.log(`   CORS Origin : ${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}`)
  console.log(`   Admin Panel : http://localhost:${PORT}/admin\n`)
})

module.exports = app
