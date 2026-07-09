const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  // ─── Core ──────────────────────────────────────────────────
  paymentMethod: {
    type: String,
    enum: ['mpesa_stk', 'mpesa_manual', 'card', 'bank_transfer'],
    required: true,
  },
  paymentProvider: { type: String, default: 'manual' },

  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'successful', 'failed', 'cancelled', 'pending_verification'],
    default: 'pending',
  },

  // ─── References ────────────────────────────────────────────
  transactionReference: { type: String, unique: true, sparse: true }, // internal DTP-XXXX
  externalReference:    { type: String, default: '' },  // M-Pesa code / provider ref
  checkoutRequestId:    { type: String, default: '' },  // STK Push polling ID
  idempotencyKey:       { type: String, default: '' },  // prevent duplicate charges

  // ─── User (authenticated purchases) ────────────────────────
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // ─── Customer ──────────────────────────────────────────────
  customerPhone: { type: String, default: '' },
  customerName:  { type: String, default: '' },
  customerEmail: { type: String, default: '' },

  // ─── Amount ────────────────────────────────────────────────
  amount:          { type: Number, required: true },
  expectedAmount:  { type: Number, required: true }, // validated against resource price
  currency:        { type: String, default: 'KES' },

  // ─── Resource ──────────────────────────────────────────────
  resourceId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Resource' },
  resourceTitle: { type: String, default: '' },

  // ─── Delivery ──────────────────────────────────────────────
  deliveredAt:   { type: Date, default: null },   // when file was sent
  deliveryEmail: { type: String, default: '' },   // email used for delivery

  // ─── Admin Verification (for manual payments) ──────────────
  verifiedBy:   { type: String, default: '' },
  verifiedAt:   { type: Date },
  rejectedAt:   { type: Date },
  rejectReason: { type: String, default: '' },
  adminNotes:   { type: String, default: '' },

  // ─── Provider Response ─────────────────────────────────────
  mpesaReceiptNo: { type: String, default: '' },
  failureReason:  { type: String, default: '' },
  metadata:       { type: mongoose.Schema.Types.Mixed, default: {} },

  // ─── Replay attack prevention ───────────────────────────────
  callbackProcessedAt: { type: Date, default: null }, // set when callback first processed

}, { timestamps: true })

// ─── Indexes ───────────────────────────────────────────────────
paymentSchema.index({ paymentStatus: 1, createdAt: -1 })
paymentSchema.index({ paymentMethod: 1, createdAt: -1 })
paymentSchema.index({ customerPhone: 1 })
paymentSchema.index({ externalReference: 1 })
paymentSchema.index({ checkoutRequestId: 1 })
paymentSchema.index({ resourceId: 1 })
paymentSchema.index({ userId: 1 })
paymentSchema.index({ idempotencyKey: 1 })

// ─── Auto-generate internal transaction reference ───────────────
paymentSchema.pre('save', function (next) {
  if (!this.transactionReference) {
    const ts   = Date.now().toString(36).toUpperCase()
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
    this.transactionReference = `DTP-${ts}-${rand}`
  }
  next()
})

module.exports = mongoose.model('Payment', paymentSchema)
