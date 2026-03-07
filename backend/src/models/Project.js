const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  // ─── Display ───────────────────────────────────────────────
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },  // maps to `desc` on frontend
  category:    {
    type: String,
    enum: ['Software Dev', 'Web Dev', 'Networking', 'IT Support', 'Cloud', 'Other'],
    default: 'Other',
  },

  // ─── Media ─────────────────────────────────────────────────
  image:       { type: String, trim: true, default: '' },     // thumbnail URL (Cloudinary / Unsplash)

  // ─── Tech stack & metadata ─────────────────────────────────
  tags:        [{ type: String, trim: true }],                // ['PHP', 'MySQL', 'Chart.js']
  year:        { type: String, trim: true, default: '' },     // '2024'
  duration:    { type: String, trim: true, default: '' },     // '8 weeks'
  outcome:     { type: String, trim: true, default: '' },     // 'Reduced stockout by 60%'

  // ─── Links ─────────────────────────────────────────────────
  githubUrl:   { type: String, trim: true, default: '' },
  liveUrl:     { type: String, trim: true, default: '' },

  // ─── Admin controls ────────────────────────────────────────
  featured:    { type: Boolean, default: false },  // pin to top of portfolio
  visible:     { type: Boolean, default: true },   // show publicly
  order:       { type: Number,  default: 0 },      // manual sort order
}, { timestamps: true })

projectSchema.index({ category: 1, order: 1 })
projectSchema.index({ visible: 1, featured: -1, order: 1 })

module.exports = mongoose.model('Project', projectSchema)
