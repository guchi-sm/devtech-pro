const mongoose = require('mongoose')

const testimonialSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  role:       { type: String, trim: true, default: '' },     // e.g. "CEO, Meru Traders"
  company:    { type: String, trim: true, default: '' },
  avatar:     { type: String, trim: true, default: '' },     // Cloudinary URL or initials fallback
  rating:     { type: Number, min: 1, max: 5, default: 5 },
  text:       { type: String, required: true, trim: true },
  service:    { type: String, trim: true, default: '' },     // which service they used
  visible:    { type: Boolean, default: true },
  featured:   { type: Boolean, default: false },
  order:      { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Testimonial', testimonialSchema)
