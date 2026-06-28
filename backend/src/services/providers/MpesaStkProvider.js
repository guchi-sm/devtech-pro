const axios = require('axios')
const BasePaymentProvider = require('./BasePaymentProvider')

/**
 * MpesaStkProvider — Tuma Payments
 * Docs: https://api.tuma.co.ke
 *
 * Env vars:
 *   MPESA_STK_BASE_URL=https://api.tuma.co.ke
 *   MPESA_STK_API_KEY=your_tuma_api_key
 *   MPESA_STK_EMAIL=your_tuma_business_email
 *   MPESA_CALLBACK_URL=https://devtech-pro.onrender.com/api/payments/webhook/mpesa-stk
 */
class MpesaStkProvider extends BasePaymentProvider {
  constructor() {
    super({
      baseUrl:     process.env.MPESA_STK_BASE_URL || 'https://api.tuma.co.ke',
      apiKey:      process.env.MPESA_STK_API_KEY,
      email:       process.env.MPESA_STK_EMAIL,
      callbackUrl: process.env.MPESA_CALLBACK_URL,
    })
    this._token    = null
    this._tokenExp = null
  }

  // ─── Normalize phone to 254XXXXXXXXX ───────────────────────
  normalizePhone(phone) {
    let p = phone.toString().replace(/[\s\-+]/g, '')
    if (p.startsWith('0'))   return '254' + p.slice(1)
    if (p.startsWith('254')) return p
    return '254' + p
  }

  validatePhone(phone) {
    const p = this.normalizePhone(phone)
    return /^2547\d{8}$|^2541\d{8}$/.test(p)
  }

  // ─── Get/cache bearer token ─────────────────────────────────
  async getToken() {
    if (this._token && this._tokenExp && Date.now() < this._tokenExp) {
      return this._token
    }
    console.log('🔐 Tuma auth attempt → email:', this.config.email, 'key:', this.config.apiKey?.slice(0,8) + '...')
    const res = await axios.post(
      `${this.config.baseUrl}/auth/token`,
      { email: this.config.email, api_key: this.config.apiKey },
      { headers: { 'Content-Type': 'application/json' } }
    )
    console.log('🔐 Tuma auth response:', JSON.stringify(res.data))
    const token = res.data?.data?.token || res.data?.token
    if (!res.data?.success || !token) {
      throw new Error(`Tuma auth failed: ${JSON.stringify(res.data)}`)
    }
    this._token    = token
    this._tokenExp = Date.now() + ((res.data?.data?.expires_in || res.data?.expires_in || 86400) * 1000) - (5 * 60 * 1000)
    console.log('✅ Tuma token obtained')
    return this._token
  }

  // ─── Initiate STK Push ─────────────────────────────────────
  async initiatePayment(payload) {
    const { phone, amount } = payload

    if (!this.config.apiKey || !this.config.email) {
      throw new Error('Tuma credentials not configured. Set MPESA_STK_API_KEY and MPESA_STK_EMAIL.')
    }
    if (!phone || !this.validatePhone(phone)) {
      throw new Error('Invalid phone number. Use format 07XXXXXXXX.')
    }

    const normalizedPhone = this.normalizePhone(phone)
    const token = await this.getToken()

    console.log('📤 Tuma STK Push → phone:', normalizedPhone, 'amount:', amount)

    let res
    try {
      res = await axios.post(
        `${this.config.baseUrl}/payment/stk-push`,
        {
          amount:       Math.ceil(Number(amount)),
          phone:        normalizedPhone,
          callback_url: this.config.callbackUrl,
          description:  'DevTech Payment',
        },
        {
          headers: {
            Authorization:  `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )
    } catch (axiosErr) {
      console.error('❌ Tuma STK 400 response:', JSON.stringify(axiosErr.response?.data))
      throw new Error(axiosErr.response?.data?.message || axiosErr.message)
    }

    console.log('📥 Tuma STK response:', JSON.stringify(res.data))

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'STK Push failed.')
    }

    return {
      success:           true,
      checkoutRequestId: res.data.data?.checkout_request_id,
      externalReference: res.data.data?.merchant_request_id,
      message:           res.data.data?.customer_message || 'STK Push sent. Check your phone.',
    }
  }

  // ─── Handle Tuma callback ──────────────────────────────────
  async handleCallback(body) {
    console.log('📲 Tuma callback:', JSON.stringify(body, null, 2))
    const isSuccess = body?.result_code === 0 || body?.status === 'completed'
    return {
      success:           isSuccess,
      status:            isSuccess ? 'successful' : 'failed',
      checkoutRequestId: body?.checkout_request_id,
      externalReference: body?.merchant_request_id,
      receiptNo:         body?.mpesa_receipt_number || '',
      failureReason:     !isSuccess ? (body?.failure_reason || body?.result_desc || 'Payment failed') : '',
    }
  }

  async queryStatus(checkoutRequestId) {
    return { success: false, status: 'pending' }
  }
}

module.exports = MpesaStkProvider
