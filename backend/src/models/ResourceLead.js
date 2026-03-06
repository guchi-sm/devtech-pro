const mongoose = require('mongoose')

// Stores every email that unlocks a resource download (lead capture)
const resourceLeadSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, trim: true, lowercase: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', required: true },
  resourceTitle: { type: String, trim: true },
  ip:         { type: String, trim: true, default: '' },
}, { timestamps: true })

// Prevent same email downloading same resource multiple times from being stored twice
resourceLeadSchema.index({ email: 1, resourceId: 1 }, { unique: false })

module.exports = mongoose.model('ResourceLead', resourceLeadSchema)
