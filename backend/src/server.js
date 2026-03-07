require('dotenv').config()

const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const rateLimit  = require('express-rate-limit')
const mongoose   = require('mongoose')
const path       = require('path')

const contactRouter   = require('./routes/contact')
const adminRouter     = require('./routes/admin')
const resourceRouter     = require('./routes/resources')
const analyticsRouter    = require('./routes/analytics')
const testimonialRouter  = require('./routes/testimonials')

const app  = express()
const PORT = process.env.PORT || 5000

app.set('trust proxy', 1)

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅  MongoDB connected'))
  .catch(err => console.error('❌  MongoDB error:', err.message))

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_ORIGIN,
    /\.vercel\.app$/,
  ].filter(Boolean),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 200,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
})
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 5,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many contact submissions. Try again in an hour.' },
})
const unlockLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 30,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many unlock requests. Try again later.' },
})

app.use(globalLimiter)

app.get('/api/health', (_req, res) => {
  res.json({
    success: true, status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'DevTech Pro API',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  })
})

// ─── ROUTES ────────────────────────────────────────────────────
app.use('/api/contact',   contactLimiter, contactRouter)
app.use('/api/admin',     adminRouter)
app.use('/api/resources',    unlockLimiter, resourceRouter)
app.use('/api/analytics',    analyticsRouter)
app.use('/api/testimonials', testimonialRouter)

// ─── ADMIN PANEL ───────────────────────────────────────────────
app.use('/admin', express.static(path.join(__dirname, 'public')))
app.get('/admin', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'))
})

app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found.' }))
app.use((err, _req, res, _next) => {
  console.error('❌ Server Error:', err.stack || err.message)
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
  })
})

app.listen(PORT, () => {
  console.log(`\n✅  DevTech Pro API → http://localhost:${PORT}`)
  console.log(`   Admin Panel  → http://localhost:${PORT}/admin\n`)
})

module.exports = app
