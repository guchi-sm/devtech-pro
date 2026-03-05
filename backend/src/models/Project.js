const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  index:    { type: String, trim: true },           // e.g. "001"
  category: { type: String, required: true, trim: true },
  title:    { type: String, required: true, trim: true },
  desc:     { type: String, required: true, trim: true },
  img:      { type: String, trim: true, default: '' },
  tags:     [{ type: String, trim: true }],
  year:     { type: String, trim: true },
  duration: { type: String, trim: true },
  outcome:  { type: String, trim: true },
  visible:  { type: Boolean, default: true },
  order:    { type: Number, default: 0 },
}, { timestamps: true })

module.exports = mongoose.model('Project', projectSchema)
