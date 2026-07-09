const { Router }   = require('express')
const rateLimit    = require('express-rate-limit')
const auth         = require('../middleware/auth')
const { requireUser, requirePremium, requireResourceAccess } = require('../middleware/require-user')
const {
  getResources, downloadResource, unlockResource, markLeadSent,
  getAllResources, getLeads,
  createResource, updateResource, deleteResource,
} = require('../controllers/resourceController')

const router = Router()

const unlockLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 30,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many unlock requests. Try again later.' },
})

const downloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 60,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many download requests. Try again later.' },
})

// ── PUBLIC ──────────────────────────────────────────────────────
router.get('/',            getResources)
router.post('/:id/unlock', unlockLimiter, unlockResource)

// ── PROTECTED DOWNLOAD (JWT + premium/resource-access check) ───
router.get(
  '/:id/download',
  downloadLimiter,
  requireUser,              // verify JWT, load req.user
  requireResourceAccess,    // check premium or per-resource unlock
  downloadResource          // stream file
)

// ── ADMIN (admin JWT) ────────────────────────────────────────────
router.get('/admin/all',          auth, getAllResources)
router.get('/admin/leads',        auth, getLeads)
router.patch('/admin/leads/:id/sent', auth, markLeadSent)
router.post('/',                  auth, createResource)
router.put('/:id',                auth, updateResource)
router.delete('/:id',             auth, deleteResource)

module.exports = router
