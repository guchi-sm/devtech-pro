const mongoose = require('mongoose')

const resourceLeadSchema = new mongoose.Schema({
  name:            { type: String, required: true, trim: true },
  email:           { type: String, required: true, trim: true, lowercase: true },
  phone:           { type: String, trim: true, default: '' },       // ✅ WhatsApp number
  resourceId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
  resourceTitle:   { type: String, trim: true },
  accessCodeUsed:  { type: String, trim: true, default: '' },       // filled when they unlock with code
  status:          { type: String, enum: ['free','pending','sent'], default: 'free' }, // ✅ tracking
  sentAt:          { type: Date, default: null },                    // ✅ when you clicked Send Code
  ip:              { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('ResourceLead', resourceLeadSchema)
