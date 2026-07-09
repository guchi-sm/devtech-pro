const { Router }   = require('express')
const rateLimit    = require('express-rate-limit')
const { requireUser, requirePremium, requireResourceAccess } = require('../middleware/require-user')
const { register, login, getMe } = require('../controllers/userController')

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 20,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many auth requests. Try again in 15 minutes.' },
})

router.post('/register', authLimiter, register)
router.post('/login',    authLimiter, login)
router.get('/me',        requireUser, getMe)

module.exports = router