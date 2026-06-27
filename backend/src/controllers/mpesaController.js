const axios = require('axios')
const Payment = require('../models/Payment')
const Resource = require('../models/Resource')

const MPESA_ENV = process.env.MPESA_ENV || 'sandbox'
const BASE_URL = MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

// ─── GET ACCESS TOKEN ──────────────────────────────────────────
async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64')

  const res = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  })
  return res.data.access_token
}

// ─── STK PUSH ─────────────────────────────────────────────────
async function stkPush(req, res) {
  try {
    const { phone, resourceId, amount } = req.body

    if (!phone || !resourceId || !amount) {
      return res.status(400).json({ success: false, message: 'phone, resourceId and amount are required.' })
    }

    // Normalize phone: 0712345678 → 254712345678
    const normalizedPhone = phone.startsWith('0')
      ? '254' + phone.slice(1)
      : phone.startsWith('+')
      ? phone.slice(1)
      : phone

    if (!/^2547\d{8}$|^2541\d{8}$/.test(normalizedPhone)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number. Use format 07XXXXXXXX.' })
    }

    // Get resource details
    const resource = await Resource.findById(resourceId)
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' })

    const shortcode  = process.env.MPESA_SHORTCODE
    const passkey    = process.env.MPESA_PASSKEY
    const timestamp  = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14)
    const password   = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')
    const callbackUrl = process.env.MPESA_CALLBACK_URL

    const token = await getAccessToken()

    const stkRes = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: shortcode,
        Password:          password,
        Timestamp:         timestamp,
        TransactionType:   'CustomerPayBillOnline',
        Amount:            Math.ceil(amount),
        PartyA:            normalizedPhone,
        PartyB:            shortcode,
        PhoneNumber:       normalizedPhone,
        CallBackURL:       callbackUrl,
        AccountReference:  `DEVTECH-${resourceId.slice(-6).toUpperCase()}`,
        TransactionDesc:   `Payment for ${resource.title}`,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    const { CheckoutRequestID, ResponseCode, ResponseDescription } = stkRes.data

    if (ResponseCode !== '0') {
      return res.status(400).json({ success: false, message: ResponseDescription })
    }

    // Save pending payment
    await Payment.create({
      checkoutRequestId: CheckoutRequestID,
      phone:             normalizedPhone,
      amount:            Math.ceil(amount),
      resourceId,
      resourceTitle:     resource.title,
      status:            'pending',
    })

    return res.json({
      success: true,
      message: 'STK Push sent. Check your phone.',
      checkoutRequestId: CheckoutRequestID,
    })
  } catch (err) {
    console.error('❌ STK Push error:', err.response?.data || err.message)
    return res.status(500).json({ success: false, message: 'Payment initiation failed. Try again.' })
  }
}

// ─── CALLBACK (Safaricom calls this after payment) ─────────────
async function mpesaCallback(req, res) {
  try {
    const body = req.body?.Body?.stkCallback
    if (!body) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' })

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = body

    const payment = await Payment.findOne({ checkoutRequestId: CheckoutRequestID })
    if (!payment) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' })

    if (ResultCode === 0) {
      // Success — extract metadata
      const items = CallbackMetadata?.Item || []
      const get = (name) => items.find(i => i.Name === name)?.Value

      payment.status          = 'completed'
      payment.mpesaReceiptNo  = get('MpesaReceiptNumber')
      payment.transactionDate = get('TransactionDate')
      payment.amount          = get('Amount') || payment.amount
    } else {
      payment.status       = 'failed'
      payment.failureReason = ResultDesc
    }

    await payment.save()
    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (err) {
    console.error('❌ Callback error:', err.message)
    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}

// ─── POLL STATUS ───────────────────────────────────────────────
async function checkStatus(req, res) {
  try {
    const { checkoutRequestId } = req.params
    const payment = await Payment.findOne({ checkoutRequestId })

    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' })

    return res.json({
      success: true,
      status:         payment.status,
      mpesaReceiptNo: payment.mpesaReceiptNo || null,
      resourceId:     payment.resourceId,
      resourceTitle:  payment.resourceTitle,
    })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { stkPush, mpesaCallback, checkStatus }
