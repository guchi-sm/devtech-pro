const mongoose = require('mongoose')

const pageViewSchema = new mongoose.Schema({
  page:       { type: String, required: true, trim: true },  // e.g. '/', '/services', '/blog'
  title:      { type: String, trim: true, default: '' },
  referrer:   { type: String, trim: true, default: '' },
  country:    { type: String, trim: true, default: 'Unknown' },
  city:       { type: String, trim: true, default: '' },
  device:     { type: String, enum: ['mobile', 'tablet', 'desktop'], default: 'desktop' },
  os:         { type: String, trim: true, default: '' },
  browser:    { type: String, trim: true, default: '' },
  sessionId:  { type: String, trim: true, default: '' },  // anonymous session ID
  ip:         { type: String, trim: true, default: '' },
  duration:   { type: Number, default: 0 },  // seconds spent on page (sent on exit)
}, { timestamps: true })

// TTL index — auto-delete analytics older than 90 days to keep DB lean
pageViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 })
pageViewSchema.index({ page: 1, createdAt: -1 })
pageViewSchema.index({ sessionId: 1 })

module.exports = mongoose.model('PageView', pageViewSchema)
