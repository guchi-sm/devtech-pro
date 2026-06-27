const { Router } = require('express')
const { stkPush, mpesaCallback, checkStatus } = require('../controllers/mpesaController')

const router = Router()

router.post('/stk-push',            stkPush)
router.post('/callback',            mpesaCallback)
router.get('/status/:checkoutRequestId', checkStatus)

module.exports = router
