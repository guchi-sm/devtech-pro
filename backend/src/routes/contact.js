const { Router } = require('express')
const { contactValidationRules, handleValidationErrors } = require('../middleware/validate')
const { sendContactEmail } = require('../controllers/contactController')

const router = Router()

/**
 * @route  POST /api/contact
 * @desc   Submit contact form — validates, sends email to owner + auto-reply to sender
 * @access Public
 */
router.post(
  '/',
  contactValidationRules,
  handleValidationErrors,
  sendContactEmail
)

module.exports = router
