
require('dotenv').config()

const express   = require('express')
const cors      = require('cors')
const helmet    = require('helmet')
const morgan    = require('morgan')
const rateLimit = require('express-rate-limit')

const contactRouter = require('./routes/contact')

const app  = express()
const PORT = process.env.PORT || 5000

// ─── TRUST PROXY (required for Railway + express-rate-limit) ───
app.set('trust proxy', 1)

// ─── SECURITY ──────────────────────────────────────────────────
app.use(helmet())

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_ORIGIN,
    /\.vercel\.app$/,        // allow all vercel preview URLs
  ].filter(Boolean),
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}))

// ─── LOGGING ───────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// ─── BODY PARSING ──────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// ─── RATE LIMITING ─────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
})

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many contact submissions. Please try again in an hour.' },
})

app.use(globalLimiter)

// ─── HEALTH CHECK ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'DevTech Pro API',
  })
})

// ─── ROUTES ────────────────────────────────────────────────────
app.use('/api/contact', contactLimiter, contactRouter)

// ─── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' })
})

// ─── GLOBAL ERROR HANDLER ──────────────────────────────────────
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
  console.log(`   CORS Origin : ${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}\n`)
})

module.exports = app