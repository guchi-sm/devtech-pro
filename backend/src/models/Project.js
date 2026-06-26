const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  // ─── Display ───────────────────────────────────────────────
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category:    {
    type: String,
    enum: ['Software Dev', 'Web Dev', 'Networking', 'IT Support', 'Cloud', 'Other'],
    default: 'Other',
  },

  // ─── Media ─────────────────────────────────────────────────
  image:       { type: String, trim: true, default: '' },

  // ─── Tech stack & metadata ─────────────────────────────────
  tags:        [{ type: String, trim: true }],
  year:        { type: String, trim: true, default: '' },
  duration:    { type: String, trim: true, default: '' },
  outcome:     { type: String, trim: true, default: '' },

  // ─── Case Study ────────────────────────────────────────────
  client:      { type: String, trim: true, default: '' },
  challenge:   { type: String, trim: true, default: '' },
  solution:    { type: String, trim: true, default: '' },
  results:     [{ type: String, trim: true }],

  // ─── Links ─────────────────────────────────────────────────
  githubUrl:   { type: String, trim: true, default: '' },
  liveUrl:     { type: String, trim: true, default: '' },

  // ─── Admin controls ────────────────────────────────────────
  featured:    { type: Boolean, default: false },
  visible:     { type: Boolean, default: true },
  order:       { type: Number,  default: 0 },
}, { timestamps: true })

projectSchema.index({ category: 1, order: 1 })
projectSchema.index({ visible: 1, featured: -1, order: 1 })

module.exports = mongoose.model('Project', projectSchema)
