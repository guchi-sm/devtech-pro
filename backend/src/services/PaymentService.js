const mongoose           = require('mongoose')
const { Resend }         = require('resend')
const Payment            = require('../models/Payment')
const Resource           = require('../models/Resource')
const User               = require('../models/User')
const MpesaStkProvider   = require('./providers/MpesaStkProvider')
const CardPaymentProvider = require('./providers/CardPaymentProvider')
const { makeIdempotencyKey, verifyTumaSignature } = require('../utils/tokens')

class PaymentService {

  constructor() {
    this._providers = {}
  }

  // ─── Provider factory (singleton per method) ───────────────
  getProvider(method) {
    if (!this._providers[method]) {
      switch (method) {
        case 'mpesa_stk': this._providers[method] = new MpesaStkProvider();  break
        case 'card':      this._providers[method] = new CardPaymentProvider(); break
        default: return null
      }
    }
    return this._providers[method]
  }

  // ─── Load & validate a premium resource ───────────────────
  async getResource(resourceId) {
    const resource = await Resource.findById(resourceId)
    if (!resource)          throw new Error('Resource not found.')
    if (!resource.isPremium) throw new Error('This resource is free — no payment needed.')
    return resource
  }

  // ══════════════════════════════════════════════════════════
  //  1. M-PESA STK PUSH
  // ══════════════════════════════════════════════════════════
  async initiateStkPush({ phone, resourceId, customerName, customerEmail, userId }) {
    const resource = await this.getResource(resourceId)
    const provider = this.getProvider('mpesa_stk')

    // ── Idempotency: one charge per user+resource per hour ──
    const idempotencyKey = makeIdempotencyKey(
      userId || customerPhone || phone,
      resourceId
    )
    const duplicate = await Payment.findOne({
      idempotencyKey,
      paymentStatus: { $in: ['processing', 'successful'] },
    })
    if (duplicate) {
      if (duplicate.paymentStatus === 'successful') {
        throw new Error('You have already purchased this resource.')
      }
      // Return existing pending payment so frontend can keep polling
      return {
        success:           true,
        message:           'Payment already in progress. Check your phone.',
        checkoutRequestId: duplicate.checkoutRequestId,
        transactionReference: duplicate.transactionReference,
      }
    }

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
      idempotencyKey,
      userId:            userId || null,
      customerPhone:     phone,
      customerName:      customerName || '',
      customerEmail:     customerEmail || '',
      amount:            resource.price,
      expectedAmount:    resource.price,
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
  //  2. M-PESA MANUAL (Send Money code)
  // ══════════════════════════════════════════════════════════
  async initiateManualPayment({ resourceId, customerName, customerEmail, customerPhone, mpesaCode, senderPhone, amount, userId }) {
    const resource = await this.getResource(resourceId)

    if (!mpesaCode || !senderPhone || !amount) {
      throw new Error('M-Pesa code, sender phone and amount are required.')
    }
    if (Number(amount) < resource.price) {
      throw new Error(`Amount KES ${amount} is less than resource price KES ${resource.price}.`)
    }

    // Duplicate M-Pesa code check
    const existing = await Payment.findOne({ externalReference: mpesaCode.toUpperCase() })
    if (existing) throw new Error('This M-Pesa transaction code has already been submitted.')

    const payment = await Payment.create({
      paymentMethod:     'mpesa_manual',
      paymentProvider:   'manual',
      paymentStatus:     'pending_verification',
      externalReference: mpesaCode.toUpperCase(),
      userId:            userId || null,
      customerPhone:     customerPhone || senderPhone,
      customerName:      customerName || '',
      customerEmail:     customerEmail || '',
      amount:            Number(amount),
      expectedAmount:    resource.price,
      currency:          'KES',
      resourceId:        resource._id,
      resourceTitle:     resource.title,
      metadata: { senderPhone, mpesaCode: mpesaCode.toUpperCase(), submittedAmount: Number(amount) },
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
  async initiateCardPayment({ resourceId, customerName, customerEmail, customerPhone, userId }) {
    const resource = await this.getResource(resourceId)
    const provider = this.getProvider('card')

    const result = await provider.initiatePayment({
      amount: resource.price, currency: 'KES',
      customerName, customerEmail, customerPhone,
      resourceTitle: resource.title, resourceId,
    })

    await Payment.create({
      paymentMethod:     'card',
      paymentProvider:   process.env.CARD_PROVIDER || 'intasend',
      paymentStatus:     'processing',
      externalReference: result.externalReference,
      userId:            userId || null,
      customerPhone:     customerPhone || '',
      customerName:      customerName || '',
      customerEmail:     customerEmail || '',
      amount:            resource.price,
      expectedAmount:    resource.price,
      currency:          'KES',
      resourceId:        resource._id,
      resourceTitle:     resource.title,
    })

    return { success: true, checkoutUrl: result.checkoutUrl, message: result.message }
  }

  // ══════════════════════════════════════════════════════════
  //  STATUS POLLING  (used by frontend every 3s)
  // ══════════════════════════════════════════════════════════
  async getPaymentStatus(checkoutRequestId) {
    const payment = await Payment.findOne({ checkoutRequestId })
    if (!payment) throw new Error('Payment not found.')

    let fileUrl = null
    if (payment.paymentStatus === 'successful' && payment.resourceId) {
      const resource = await Resource.findById(payment.resourceId).select('fileUrl')
      fileUrl = resource?.fileUrl || null
    }

    return {
      success:              true,
      status:               payment.paymentStatus,
      mpesaReceiptNo:       payment.mpesaReceiptNo || null,
      transactionReference: payment.transactionReference,
      resourceId:           payment.resourceId,
      resourceTitle:        payment.resourceTitle,
      amount:               payment.amount,
      fileUrl,  // non-null only when successful — frontend uses this to trigger download
    }
  }

  // ══════════════════════════════════════════════════════════
  //  STK WEBHOOK HANDLER
  // ══════════════════════════════════════════════════════════
  async handleStkCallback(body, rawBody, signature) {
    // Signature verification (no-op until Tuma enforces HMAC)
    if (!verifyTumaSignature(rawBody, signature, process.env.MPESA_WEBHOOK_SECRET)) {
      throw new Error('Invalid webhook signature.')
    }

    const provider = this.getProvider('mpesa_stk')
    const result   = await provider.handleCallback(body)

    const payment = await Payment.findOne({ checkoutRequestId: result.checkoutRequestId })
    if (!payment) return { success: true, message: 'Unknown payment — ignored.' }

    // ── Replay attack prevention ────────────────────────────
    if (payment.callbackProcessedAt) {
      console.warn('⚠️  Duplicate STK callback received for', result.checkoutRequestId, '— ignored.')
      return { success: true, message: 'Already processed.' }
    }

    // ── Amount validation ───────────────────────────────────
    const paidAmount = result.amount || payment.amount
    if (result.success && paidAmount < payment.expectedAmount) {
      payment.paymentStatus = 'failed'
      payment.failureReason = `Underpayment: received KES ${paidAmount}, expected KES ${payment.expectedAmount}`
      payment.callbackProcessedAt = new Date()
      await payment.save()
      console.error('❌ Underpayment detected:', payment.transactionReference)
      return { success: true }
    }

    payment.paymentStatus        = result.status
    payment.mpesaReceiptNo       = result.receiptNo || ''
    payment.failureReason        = result.failureReason || ''
    payment.callbackProcessedAt  = new Date()
    if (result.success) {
      payment.metadata = { ...payment.metadata, receiptNo: result.receiptNo }
    }
    await payment.save()

    if (result.success) {
      await this._grantAccessAndDeliver(payment)
    }

    return { success: true }
  }

  // ══════════════════════════════════════════════════════════
  //  CARD WEBHOOK HANDLER
  // ══════════════════════════════════════════════════════════
  async handleCardCallback(body) {
    const provider = this.getProvider('card')
    const result   = await provider.handleCallback(body)

    const payment = await Payment.findOne({ externalReference: result.externalReference })
    if (!payment) return { success: true, message: 'Unknown payment — ignored.' }

    if (payment.callbackProcessedAt) {
      return { success: true, message: 'Already processed.' }
    }

    payment.paymentStatus       = result.status
    payment.mpesaReceiptNo      = result.receiptNo || ''
    payment.callbackProcessedAt = new Date()
    await payment.save()

    if (result.status === 'successful') {
      await this._grantAccessAndDeliver(payment)
    }

    return { success: true }
  }

  // ══════════════════════════════════════════════════════════
  //  GRANT ACCESS + DELIVER  (single source of truth)
  // ══════════════════════════════════════════════════════════
  async _grantAccessAndDeliver(payment) {
    try {
      const resource = await Resource.findById(payment.resourceId)
      if (!resource) {
        console.error('_grantAccessAndDeliver: resource not found', payment.resourceId)
        return
      }

      // ── 1. Update User premium status ──────────────────────
      if (payment.userId) {
        const user = await User.findById(payment.userId)
        if (user) {
          // Determine plan from resource metadata (default: per-resource unlock)
          const plan = payment.metadata?.plan || 'per_resource'

          if (plan === 'lifetime') {
            user.grantPremium('lifetime')
          } else if (plan === 'monthly') {
            user.grantPremium('monthly', 30)
          } else if (plan === 'yearly') {
            user.grantPremium('yearly', 365)
          } else {
            // Per-resource: add to unlockedResources
            user.grantResourceAccess(payment.resourceId)
          }

          await user.save()
          console.log(`✅ Access granted to user ${user.email} for resource ${resource.title}`)
        }
      }

      // ── 2. Increment download count ─────────────────────────
      await Resource.findByIdAndUpdate(payment.resourceId, { $inc: { downloadCount: 1 } })

      // ── 3. Send delivery email ──────────────────────────────
      const emailTo = payment.customerEmail || payment.deliveryEmail
      if (!emailTo) {
        console.warn('_grantAccessAndDeliver: no email for payment', payment._id)
        return
      }

      await this._sendDeliveryEmail({ payment, resource, emailTo })

      // Mark delivered
      payment.deliveredAt   = new Date()
      payment.deliveryEmail = emailTo
      await payment.save()

    } catch (err) {
      // Non-fatal — never crash the webhook response
      console.error('❌ _grantAccessAndDeliver failed:', err.message)
    }
  }

  // ──────────────────────────────────────────────────────────
  async _sendDeliveryEmail({ payment, resource, emailTo }) {
    const resend       = new Resend(process.env.RESEND_API_KEY)
    const customerName = payment.customerName || 'there'
    const supportEmail = process.env.OWNER_EMAIL || 'support@devtech-pro.com'

    await resend.emails.send({
      from:    'DevTech Pro <onboarding@resend.dev>',
      to:      emailTo,
      subject: `Your download is ready — ${resource.title}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f4f6f9;padding:32px;border-radius:12px;">
          <div style="background:#1c2d3f;padding:24px;border-radius:8px;text-align:center;margin-bottom:24px;">
            <h1 style="color:#f5a623;margin:0;font-size:24px;letter-spacing:1px;">DevTech Pro</h1>
            <p style="color:#9eaab8;margin:6px 0 0;font-size:13px;">Professional IT Solutions</p>
          </div>

          <h2 style="color:#1c2d3f;margin:0 0 8px;">Hi ${customerName} 👋</h2>
          <p style="color:#6b7a8d;font-size:16px;line-height:1.6;margin:0 0 24px;">
            Payment confirmed! Your resource is ready to download.
          </p>

          <div style="background:#fff;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid #f5a623;">
            <p style="margin:0 0 4px;color:#9eaab8;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Resource</p>
            <p style="margin:0 0 8px;color:#1c2d3f;font-size:18px;font-weight:bold;">${resource.title}</p>
            <p style="margin:0 0 4px;color:#9eaab8;font-size:12px;">Transaction ref: <strong style="color:#1c2d3f;">${payment.transactionReference}</strong></p>
            ${payment.mpesaReceiptNo ? `<p style="margin:4px 0 0;color:#9eaab8;font-size:12px;">M-Pesa receipt: <strong style="color:#1c2d3f;">${payment.mpesaReceiptNo}</strong></p>` : ''}
          </div>

          <div style="text-align:center;margin:32px 0;">
            <a href="${resource.fileUrl}"
               style="background:#0055ff;color:#fff;padding:16px 40px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;display:inline-block;">
              ⬇&nbsp; Download Now
            </a>
          </div>

          <p style="color:#9eaab8;font-size:13px;text-align:center;margin-bottom:24px;">
            Button not working? Copy this link:<br/>
            <a href="${resource.fileUrl}" style="color:#0055ff;word-break:break-all;font-size:12px;">${resource.fileUrl}</a>
          </p>

          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;"/>
          <p style="color:#9eaab8;font-size:12px;text-align:center;margin:0;">
            Questions? Reply to this email or contact <a href="mailto:${supportEmail}" style="color:#0055ff;">${supportEmail}</a><br/>
            &copy; ${new Date().getFullYear()} DevTech Pro
          </p>
        </div>
      `,
    })

    console.log(`📧 Delivery email sent to ${emailTo} for ${resource.title}`)
  }

  // ══════════════════════════════════════════════════════════
  //  ADMIN — Verify Manual Payment
  // ══════════════════════════════════════════════════════════
  async verifyManualPayment(paymentId, adminEmail, notes) {
    const payment = await Payment.findById(paymentId)
    if (!payment)                                        throw new Error('Payment not found.')
    if (payment.paymentMethod !== 'mpesa_manual')        throw new Error('Only manual payments can be verified this way.')
    if (payment.paymentStatus === 'successful')          throw new Error('Payment already verified.')

    payment.paymentStatus = 'successful'
    payment.verifiedBy    = adminEmail
    payment.verifiedAt    = new Date()
    payment.adminNotes    = notes || ''
    await payment.save()

    // Grant access and email the file — same path as STK
    await this._grantAccessAndDeliver(payment)

    return { success: true, payment }
  }

  async rejectManualPayment(paymentId, adminEmail, reason) {
    const payment = await Payment.findById(paymentId)
    if (!payment)                                 throw new Error('Payment not found.')
    if (payment.paymentStatus === 'successful')   throw new Error('Cannot reject an already verified payment.')

    payment.paymentStatus = 'failed'
    payment.rejectedAt    = new Date()
    payment.rejectReason  = reason || 'Rejected by admin'
    payment.verifiedBy    = adminEmail
    await payment.save()

    return { success: true, payment }
  }

  // ══════════════════════════════════════════════════════════
  //  ADMIN — List & Stats
  // ══════════════════════════════════════════════════════════
  async listPayments({ method, status, search, page = 1, limit = 20 }) {
    const query = {}
    if (method) query.paymentMethod = method
    if (status) query.paymentStatus = status
    if (search) {
      query.$or = [
        { customerPhone:      { $regex: search, $options: 'i' } },
        { customerName:       { $regex: search, $options: 'i' } },
        { externalReference:  { $regex: search, $options: 'i' } },
        { transactionReference: { $regex: search, $options: 'i' } },
        { resourceTitle:      { $regex: search, $options: 'i' } },
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
      stats: { total, pending, successful, failed, pendingVerification, totalRevenue: totalRevenue[0]?.total || 0 },
    }
  }
}

module.exports = new PaymentService()
