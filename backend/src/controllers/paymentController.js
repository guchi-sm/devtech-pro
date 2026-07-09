const PaymentService = require('../services/PaymentService')

// ══════════════════════════════════════════════════════════════
//  CUSTOMER ENDPOINTS
// ══════════════════════════════════════════════════════════════

// POST /api/payments/mpesa-stk
async function initiateStkPush(req, res) {
  try {
    const { phone, resourceId, customerName, customerEmail } = req.body
    if (!phone || !resourceId) {
      return res.status(400).json({ success: false, message: 'phone and resourceId are required.' })
    }
    // req.user is set by requireUser middleware (optional — guests allowed)
    const result = await PaymentService.initiateStkPush({
      phone, resourceId, customerName, customerEmail,
      userId: req.user?._id || null,
    })
    return res.json(result)
  } catch (err) {
    console.error('❌ STK Push error:', err.message)
    return res.status(500).json({ success: false, message: err.message || 'Payment initiation failed.' })
  }
}

// POST /api/payments/mpesa-manual
async function initiateManualPayment(req, res) {
  try {
    const { resourceId, customerName, customerEmail, customerPhone, mpesaCode, senderPhone, amount } = req.body
    if (!resourceId || !mpesaCode || !senderPhone || !amount) {
      return res.status(400).json({ success: false, message: 'resourceId, mpesaCode, senderPhone and amount are required.' })
    }
    const result = await PaymentService.initiateManualPayment({
      resourceId, customerName, customerEmail, customerPhone,
      mpesaCode, senderPhone, amount,
      userId: req.user?._id || null,
    })
    return res.status(201).json(result)
  } catch (err) {
    console.error('❌ Manual payment error:', err.message)
    return res.status(400).json({ success: false, message: err.message })
  }
}

// POST /api/payments/card
async function initiateCardPayment(req, res) {
  try {
    const { resourceId, customerName, customerEmail, customerPhone } = req.body
    if (!resourceId || !customerEmail) {
      return res.status(400).json({ success: false, message: 'resourceId and customerEmail are required.' })
    }
    const result = await PaymentService.initiateCardPayment({
      resourceId, customerName, customerEmail, customerPhone,
      userId: req.user?._id || null,
    })
    return res.json(result)
  } catch (err) {
    console.error('❌ Card payment error:', err.message)
    return res.status(500).json({ success: false, message: err.message || 'Card payment initiation failed.' })
  }
}

// GET /api/payments/status/:checkoutRequestId
async function getPaymentStatus(req, res) {
  try {
    const result = await PaymentService.getPaymentStatus(req.params.checkoutRequestId)
    return res.json(result)
  } catch (err) {
    return res.status(404).json({ success: false, message: err.message })
  }
}

// ══════════════════════════════════════════════════════════════
//  WEBHOOKS  (called by Tuma / card provider — no JWT auth)
// ══════════════════════════════════════════════════════════════

// POST /api/payments/webhook/mpesa-stk
async function stkWebhook(req, res) {
  try {
    console.log('📲 STK Webhook received:', JSON.stringify(req.body, null, 2))
    const signature = req.headers['x-tuma-signature'] || ''
    await PaymentService.handleStkCallback(req.body, req.rawBody || '', signature)
    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (err) {
    console.error('❌ STK Webhook error:', err.message)
    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' }) // always 200 to provider
  }
}

// POST /api/payments/webhook/card
async function cardWebhook(req, res) {
  try {
    console.log('💳 Card Webhook received:', JSON.stringify(req.body, null, 2))
    await PaymentService.handleCardCallback(req.body)
    return res.json({ success: true })
  } catch (err) {
    console.error('❌ Card Webhook error:', err.message)
    return res.json({ success: true }) // always 200 to provider
  }
}

// ══════════════════════════════════════════════════════════════
//  ADMIN ENDPOINTS
// ══════════════════════════════════════════════════════════════

async function listPayments(req, res) {
  try {
    const { method, status, search, page, limit } = req.query
    const result = await PaymentService.listPayments({
      method, status, search,
      page: Number(page) || 1,
      limit: Number(limit) || 20,
    })
    return res.json(result)
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

async function getStats(req, res) {
  try {
    const result = await PaymentService.getPaymentStats()
    return res.json(result)
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

async function verifyPayment(req, res) {
  try {
    const { notes } = req.body
    const result = await PaymentService.verifyManualPayment(
      req.params.id,
      req.admin?.email || 'admin',
      notes
    )
    return res.json(result)
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message })
  }
}

async function rejectPayment(req, res) {
  try {
    const { reason } = req.body
    const result = await PaymentService.rejectManualPayment(
      req.params.id,
      req.admin?.email || 'admin',
      reason
    )
    return res.json(result)
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message })
  }
}

module.exports = {
  initiateStkPush, initiateManualPayment, initiateCardPayment,
  getPaymentStatus, stkWebhook, cardWebhook,
  listPayments, getStats, verifyPayment, rejectPayment,
}
