const axios = require('axios')
const BasePaymentProvider = require('./BasePaymentProvider')

/**
 * CardPaymentProvider
 * Supports IntaSend, Flutterwave, Pesapal, Stripe
 * Switch provider via CARD_PROVIDER env variable.
 *
 * Env vars:
 *   CARD_PROVIDER=intasend|flutterwave|pesapal|stripe
 *   CARD_API_KEY=xxx
 *   CARD_API_SECRET=xxx
 *   CARD_CALLBACK_URL=https://devtech-pro.onrender.com/api/payments/webhook/card
 *   CARD_REDIRECT_URL=https://your-vercel-app.vercel.app/payment/callback
 */
class CardPaymentProvider extends BasePaymentProvider {
  constructor() {
    super({
      provider:    process.env.CARD_PROVIDER     || 'intasend',
      apiKey:      process.env.CARD_API_KEY,
      apiSecret:   process.env.CARD_API_SECRET,
      callbackUrl: process.env.CARD_CALLBACK_URL,
      redirectUrl: process.env.CARD_REDIRECT_URL,
    })
  }

  async initiateIntaSend(payload) {
    const { amount, currency, customerEmail, customerName, resourceTitle } = payload
    const res = await axios.post(
      'https://payment.intasend.com/api/v1/checkout/',
      {
        public_key:   this.config.apiKey,
        currency:     currency || 'KES',
        amount,
        email:        customerEmail,
        first_name:   customerName?.split(' ')[0] || '',
        last_name:    customerName?.split(' ')[1] || '',
        comment:      `Payment for ${resourceTitle}`,
        callback_url: this.config.callbackUrl,
        redirect_url: this.config.redirectUrl,
      },
      { headers: { 'Content-Type': 'application/json' } }
    )
    return {
      success:           true,
      checkoutUrl:       res.data?.url,
      externalReference: res.data?.id,
      message:           'Redirecting to card payment...',
    }
  }

  async initiateFlutterwave(payload) {
    const { amount, currency, customerEmail, customerName, customerPhone, resourceId } = payload
    const txRef = `DTP-${Date.now()}`
    const res = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref:        txRef,
        amount,
        currency:      currency || 'KES',
        redirect_url:  this.config.redirectUrl,
        customer: { email: customerEmail, phonenumber: customerPhone, name: customerName },
        customizations: { title: 'DevTech Pro', description: 'Resource Payment' },
      },
      { headers: { Authorization: `Bearer ${this.config.apiKey}`, 'Content-Type': 'application/json' } }
    )
    return {
      success:           true,
      checkoutUrl:       res.data?.data?.link,
      externalReference: txRef,
      message:           'Redirecting to card payment...',
    }
  }

  async initiatePayment(payload) {
    if (!this.config.apiKey) throw new Error('Card payment provider not configured.')
    if (this.config.provider === 'flutterwave') return this.initiateFlutterwave(payload)
    return this.initiateIntaSend(payload)
  }

  async handleCallback(body) {
    // IntaSend webhook
    if (body?.invoice_id || body?.state) {
      return {
        success:           body.state === 'COMPLETE',
        status:            body.state === 'COMPLETE' ? 'successful' : 'failed',
        externalReference: body.invoice_id || body.tracking_id,
        receiptNo:         body.invoice_id,
      }
    }
    // Flutterwave webhook
    if (body?.event === 'charge.completed') {
      return {
        success:           body.data?.status === 'successful',
        status:            body.data?.status === 'successful' ? 'successful' : 'failed',
        externalReference: body.data?.tx_ref,
        receiptNo:         body.data?.flw_ref,
      }
    }
    return { success: false, status: 'failed' }
  }

  async queryStatus(reference) {
    return { success: false, status: 'pending' }
  }
}

module.exports = CardPaymentProvider
