const axios = require('axios')
const Payment  = require('../models/Payment')
const Resource = require('../models/Resource')

const MPESA_ENV = process.env.MPESA_ENV || 'sandbox'
const BASE_URL  = MPESA_ENV === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke'

// ─── GET ACCESS TOKEN ──────────────────────────────────────────
async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64')

  const res = await axios.get(
    `${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } }
  )
  return res.data.access_token
}

// ─── STK PUSH ─────────────────────────────────────────────────
async function stkPush(req, res) {
  try {
    const { phone, resourceId, amount } = req.body

    if (!phone || !resourceId || !amount) {
      return res.status(400).json({ success: false, message: 'phone, resourceId and amount are required.' })
    }

    // Normalize phone to 254XXXXXXXXX
    let normalizedPhone = phone.toString().replace(/[\s\-+]/g, '')
    if (normalizedPhone.startsWith('0'))   normalizedPhone = '254' + normalizedPhone.slice(1)
    if (normalizedPhone.startsWith('254')) normalizedPhone = normalizedPhone
    else normalizedPhone = '254' + normalizedPhone

    console.log('📱 Normalized phone:', normalizedPhone, 'Length:', normalizedPhone.length)

    if (normalizedPhone.length !== 12) {
      return res.status(400).json({ success: false, message: `Invalid phone number length: ${normalizedPhone.length}. Expected 12 digits.` })
    }

    const resource = await Resource.findById(resourceId)
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' })

    const shortcode   = process.env.MPESA_SHORTCODE
    const passkey     = process.env.MPESA_PASSKEY
    const callbackUrl = process.env.MPESA_CALLBACK_URL

    // Timestamp: YYYYMMDDHHmmss
    const now       = new Date()
    const pad       = n => String(n).padStart(2, '0')
    const timestamp = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
    const password  = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')

    console.log('🔑 Shortcode:', shortcode)
    console.log('⏰ Timestamp:', timestamp)
    console.log('🌍 Base URL:', BASE_URL)
    console.log('📞 Callback:', callbackUrl)

    const token = await getAccessToken()
    console.log('✅ Access token obtained')

    const payload = {
      BusinessShortCode: shortcode,
      Password:          password,
      Timestamp:         timestamp,
      TransactionType:   'CustomerPayBillOnline',
      Amount:            Math.ceil(Number(amount)),
      PartyA:            normalizedPhone,
      PartyB:            shortcode,
      PhoneNumber:       normalizedPhone,
      CallBackURL:       callbackUrl,
      AccountReference:  'DevTechPro',
      TransactionDesc:   `Payment for ${resource.title}`,
    }

    console.log('📤 STK Push payload:', JSON.stringify(payload, null, 2))

    const stkRes = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      payload,
      {
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('📥 STK Push response:', stkRes.data)

    const { CheckoutRequestID, ResponseCode, ResponseDescription } = stkRes.data

    if (ResponseCode !== '0') {
      return res.status(400).json({ success: false, message: ResponseDescription })
    }

    await Payment.create({
      checkoutRequestId: CheckoutRequestID,
      phone:             normalizedPhone,
      amount:            Math.ceil(Number(amount)),
      resourceId,
      resourceTitle:     resource.title,
      status:            'pending',
    })

    return res.json({
      success:           true,
      message:           'STK Push sent. Check your phone.',
      checkoutRequestId: CheckoutRequestID,
    })

  } catch (err) {
    const errData = err.response?.data || err.message
    console.error('❌ STK Push error details:', JSON.stringify(errData, null, 2))
    return res.status(500).json({ success: false, message: 'Payment initiation failed. Try again.' })
  }
}

// ─── CALLBACK ──────────────────────────────────────────────────
async function mpesaCallback(req, res) {
  try {
    console.log('📲 M-Pesa Callback received:', JSON.stringify(req.body, null, 2))
    const body = req.body?.Body?.stkCallback
    if (!body) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' })

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = body
    const payment = await Payment.findOne({ checkoutRequestId: CheckoutRequestID })
    if (!payment) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' })

    if (ResultCode === 0) {
      const items = CallbackMetadata?.Item || []
      const get   = (name) => items.find(i => i.Name === name)?.Value
      payment.status          = 'completed'
      payment.mpesaReceiptNo  = get('MpesaReceiptNumber')
      payment.transactionDate = get('TransactionDate')
      payment.amount          = get('Amount') || payment.amount
    } else {
      payment.status        = 'failed'
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
      success:        true,
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
