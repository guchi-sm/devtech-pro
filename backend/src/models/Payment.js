const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  checkoutRequestId: { type: String, required: true, unique: true },
  phone:             { type: String, required: true },
  amount:            { type: Number, required: true },
  resourceId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
  resourceTitle:     { type: String, default: '' },
  status:            { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  mpesaReceiptNo:    { type: String, default: '' },
  transactionDate:   { type: String, default: '' },
  failureReason:     { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Payment', paymentSchema)
