const mongoose = require('mongoose')

const resourceSchema = new mongoose.Schema({
  title:         { type: String, required: true, trim: true },
  description:   { type: String, required: true, trim: true },
  category:      { type: String, required: true, enum: ['PDF','Video','Photo','Software'] },
  fileUrl:       { type: String, required: true, trim: true },
  thumbnail:     { type: String, trim: true, default: '' },
  fileSize:      { type: String, trim: true, default: '' },
  duration:      { type: String, trim: true, default: '' },
  tags:          [{ type: String, trim: true }],
  featured:      { type: Boolean, default: false },
  visible:       { type: Boolean, default: true },
  isPremium:     { type: Boolean, default: false },
  accessCode:    { type: String, trim: true, default: '' },
  price:         { type: Number, default: 0 },          // ✅ price in KES
  currency:      { type: String, default: 'KES' },      // ✅ currency label
  order:         { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Resource', resourceSchema)
