const Payment        = require('../models/Payment')
const Resource       = require('../models/Resource')
const MpesaStkProvider  = require('./providers/MpesaStkProvider')
const CardPaymentProvider = require('./providers/CardPaymentProvider')

/**
 * PaymentService
 * Central orchestrator for all payment methods.
 * Uses Strategy Pattern — each method delegates to its provider.
 */
class PaymentService {

  // ─── Get provider instance by method ───────────────────────
  getProvider(method) {
    switch (method) {
      case 'mpesa_stk': return new MpesaStkProvider()
      case 'card':      return new CardPaymentProvider()
      default:          return null
    }
  }

  // ─── Validate resource and return it ───────────────────────
  async getResource(resourceId) {
    const resource = await Resource.findById(resourceId)
    if (!resource)        throw new Error('Resource not found.')
    if (!resource.isPremium) throw new Error('This resource is free — no payment needed.')
    return resource
  }

  // ══════════════════════════════════════════════════════════
  //  1. M-PESA STK PUSH
  // ══════════════════════════════════════════════════════════
  async initiateStkPush({ phone, resourceId, customerName, customerEmail }) {
    const resource = await this.getResource(resourceId)
    const provider = this.getProvider('mpesa_stk')

    const result = await provider.initiatePayment({
      phone,
      amount:        resource.price,
      resourceTitle: resource.title,
      customerName,
      customerEmail,
    })

    const payment = await Payment.create({
      paymentMethod:     'mpesa_stk',
      paymentProvider:   process.env.MPESA_STK_PROVIDER || 'tuma',
      paymentStatus:     'processing',
      checkoutRequestId: result.checkoutRequestId,
      externalReference: result.externalReference,
      customerPhone:     phone,
      customerName:      customerName || '',
      customerEmail:     customerEmail || '',
      amount:            resource.price,
      currency:          'KES',
      resourceId:        resource._id,
      resourceTitle:     resource.title,
    })

    return {
      success:              true,
      message:              result.message,
      checkoutRequestId:    result.checkoutRequestId,
      transactionReference: payment.transactionReference,
    }
  }

  // ══════════════════════════════════════════════════════════
  //  2. M-PESA MANUAL (Send Money)
  // ══════════════════════════════════════════════════════════
  async initiateManualPayment({ resourceId, customerName, customerEmail, customerPhone, mpesaCode, senderPhone, amount }) {
    const resource = await this.getResource(resourceId)

    // Basic validation
    if (!mpesaCode || !senderPhone || !amount) {
      throw new Error('M-Pesa code, sender phone and amount are required.')
    }
    if (Number(amount) < resource.price) {
      throw new Error(`Amount KES ${amount} is less than resource price KES ${resource.price}.`)
    }

    // Check for duplicate M-Pesa code
    const existing = await Payment.findOne({ externalReference: mpesaCode.toUpperCase() })
    if (existing) throw new Error('This M-Pesa transaction code has already been submitted.')

    const payment = await Payment.create({
      paymentMethod:     'mpesa_manual',
      paymentProvider:   'manual',
      paymentStatus:     'pending_verification',
      externalReference: mpesaCode.toUpperCase(),
      customerPhone:     customerPhone || senderPhone,
      customerName:      customerName || '',
      customerEmail:     customerEmail || '',
      amount:            Number(amount),
      currency:          'KES',
      resourceId:        resource._id,
      resourceTitle:     resource.title,
      metadata: {
        senderPhone,
        mpesaCode: mpesaCode.toUpperCase(),
        submittedAmount: Number(amount),
      },
    })

    return {
      success:              true,
      message:              'Payment submitted for verification. You will receive access within 1 hour.',
      transactionReference: payment.transactionReference,
      paymentId:            payment._id,
    }
  }

  // ══════════════════════════════════════════════════════════
  //  3. CARD PAYMENT
  // ══════════════════════════════════════════════════════════
  async initiateCardPayment({ resourceId, customerName, customerEmail, customerPhone }) {
    const resource = await this.getResource(resourceId)
    const provider = this.getProvider('card')

    const result = await provider.initiatePayment({
      amount:        resource.price,
      currency:      'KES',
      customerName,
      customerEmail,
      customerPhone,
      resourceTitle: resource.title,
      resourceId,
    })

    await Payment.create({
      paymentMethod:     'card',
      paymentProvider:   process.env.CARD_PROVIDER || 'intasend',
      paymentStatus:     'processing',
      externalReference: result.externalReference,
      customerPhone:     customerPhone || '',
      customerName:      customerName || '',
      customerEmail:     customerEmail || '',
      amount:            resource.price,
      currency:          'KES',
      resourceId:        resource._id,
      resourceTitle:     resource.title,
    })

    return {
      success:     true,
      checkoutUrl: result.checkoutUrl,
      message:     result.message,
    }
  }

  // ══════════════════════════════════════════════════════════
  //  WEBHOOK HANDLERS
  // ══════════════════════════════════════════════════════════
  async handleStkCallback(body) {
    const provider = this.getProvider('mpesa_stk')
    const result   = await provider.handleCallback(body)

    const payment = await Payment.findOne({ checkoutRequestId: result.checkoutRequestId })
    if (!payment) return { success: true, message: 'Payment not found — ignored.' }

    payment.paymentStatus   = result.status
    payment.mpesaReceiptNo  = result.receiptNo || ''
    payment.failureReason   = result.failureReason || ''
    if (result.success) payment.metadata = { ...payment.metadata, receiptNo: result.receiptNo }
    await payment.save()

    return { success: true }
  }

  async handleCardCallback(body) {
    const provider = this.getProvider('card')
    const result   = await provider.handleCallback(body)

    const payment = await Payment.findOne({ externalReference: result.externalReference })
    if (!payment) return { success: true, message: 'Payment not found — ignored.' }

    payment.paymentStatus = result.status
    payment.mpesaReceiptNo = result.receiptNo || ''
    await payment.save()

    return { success: true }
  }

  // ══════════════════════════════════════════════════════════
  //  STATUS POLLING
  // ══════════════════════════════════════════════════════════
  async getPaymentStatus(checkoutRequestId) {
    const payment = await Payment.findOne({ checkoutRequestId })
    if (!payment) throw new Error('Payment not found.')

    return {
      success:              true,
      status:               payment.paymentStatus,
      mpesaReceiptNo:       payment.mpesaReceiptNo || null,
      transactionReference: payment.transactionReference,
      resourceId:           payment.resourceId,
      resourceTitle:        payment.resourceTitle,
      amount:               payment.amount,
    }
  }

  // ══════════════════════════════════════════════════════════
  //  ADMIN — Verify Manual Payment
  // ══════════════════════════════════════════════════════════
  async verifyManualPayment(paymentId, adminEmail, notes) {
    const payment = await Payment.findById(paymentId)
    if (!payment) throw new Error('Payment not found.')
    if (payment.paymentMethod !== 'mpesa_manual') throw new Error('Only manual payments can be verified this way.')
    if (payment.paymentStatus === 'successful') throw new Error('Payment already verified.')

    payment.paymentStatus = 'successful'
    payment.verifiedBy    = adminEmail
    payment.verifiedAt    = new Date()
    payment.adminNotes    = notes || ''
    await payment.save()

    return { success: true, payment }
  }

  async rejectManualPayment(paymentId, adminEmail, reason) {
    const payment = await Payment.findById(paymentId)
    if (!payment) throw new Error('Payment not found.')
    if (payment.paymentStatus === 'successful') throw new Error('Cannot reject an already verified payment.')

    payment.paymentStatus = 'failed'
    payment.rejectedAt    = new Date()
    payment.rejectReason  = reason || 'Rejected by admin'
    payment.verifiedBy    = adminEmail
    await payment.save()

    return { success: true, payment }
  }

  // ══════════════════════════════════════════════════════════
  //  ADMIN — List & Filter Payments
  // ══════════════════════════════════════════════════════════
  async listPayments({ method, status, search, page = 1, limit = 20 }) {
    const query = {}
    if (method) query.paymentMethod = method
    if (status) query.paymentStatus = status
    if (search) {
      query.$or = [
        { customerPhone:     { $regex: search, $options: 'i' } },
        { customerName:      { $regex: search, $options: 'i' } },
        { externalReference: { $regex: search, $options: 'i' } },
        { transactionReference: { $regex: search, $options: 'i' } },
        { resourceTitle:     { $regex: search, $options: 'i' } },
      ]
    }

    const total    = await Payment.countDocuments(query)
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)

    return { success: true, payments, total, page, pages: Math.ceil(total / limit) }
  }

  async getPaymentStats() {
    const [total, pending, successful, failed, pendingVerification, totalRevenue] = await Promise.all([
      Payment.countDocuments(),
      Payment.countDocuments({ paymentStatus: 'pending' }),
      Payment.countDocuments({ paymentStatus: 'successful' }),
      Payment.countDocuments({ paymentStatus: 'failed' }),
      Payment.countDocuments({ paymentStatus: 'pending_verification' }),
      Payment.aggregate([
        { $match: { paymentStatus: 'successful' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ])

    return {
      success: true,
      stats: {
        total,
        pending,
        successful,
        failed,
        pendingVerification,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    }
  }
}

module.exports = new PaymentService()
