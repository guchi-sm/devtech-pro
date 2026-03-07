const mongoose = require('mongoose')

const resourceSchema = new mongoose.Schema({
  title:         { type: String, required: true, trim: true },
  description:   { type: String, required: true, trim: true },
  category:      { type: String, required: true, enum: ['PDF', 'Video', 'Photo', 'Software'], trim: true },
  fileUrl:       { type: String, required: true, trim: true },  // Cloudinary or Google Drive direct URL
  thumbnail:     { type: String, trim: true, default: '' },     // Cloudinary image URL for preview
  fileSize:      { type: String, trim: true, default: '' },     // e.g. "2.4 MB"
  duration:      { type: String, trim: true, default: '' },     // for videos e.g. "12:34"
  tags:          [{ type: String, trim: true }],
  featured:      { type: Boolean, default: false },
  visible:       { type: Boolean, default: true },
  downloadCount: { type: Number, default: 0 },
  order:         { type: Number, default: 0 },
  isPremium:     { type: Boolean, default: false },   // premium = requires access code
  accessCode:    { type: String, trim: true, default: '' }, // code admin sets for premium
}, { timestamps: true })

module.exports = mongoose.model('Resource', resourceSchema)
