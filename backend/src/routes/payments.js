const { Router } = require('express')
const auth = require('../middleware/auth')
const {
  initiateStkPush,
  initiateManualPayment,
  initiateCardPayment,
  getPaymentStatus,
  stkWebhook,
  cardWebhook,
  listPayments,
  getStats,
  verifyPayment,
  rejectPayment,
} = require('../controllers/paymentController')

const router = Router()

// ─── Customer: Initiate Payments ───────────────────────────────
router.post('/mpesa-stk',    initiateStkPush)
router.post('/mpesa-manual', initiateManualPayment)
router.post('/card',         initiateCardPayment)

// ─── Customer: Poll Status ─────────────────────────────────────
router.get('/status/:checkoutRequestId', getPaymentStatus)

// ─── Webhooks (called by payment providers — no auth) ──────────
router.post('/webhook/mpesa-stk', stkWebhook)
router.post('/webhook/card',      cardWebhook)

// ─── Admin ─────────────────────────────────────────────────────
router.get('/admin/list',          auth, listPayments)
router.get('/admin/stats',         auth, getStats)
router.patch('/admin/:id/verify',  auth, verifyPayment)
router.patch('/admin/:id/reject',  auth, rejectPayment)

module.exports = router
