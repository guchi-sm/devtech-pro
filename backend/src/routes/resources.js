const { Router } = require('express')
const rateLimit = require('express-rate-limit')
const auth = require('../middleware/auth')
const {
  getResources, unlockResource,
  getAllResources, getLeads,
  createResource, updateResource, deleteResource,
  markLeadSent,
} = require('../controllers/resourceController')

const router = Router()

// Unlock limiter — only for the public unlock endpoint
const unlockLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, max: 30,
  standardHeaders: true, legacyHeaders: false,
  message: { success: false, message: 'Too many unlock requests. Try again later.' },
})

// ── PUBLIC ──────────────────────────────────────────────────────
router.get('/',              getResources)       // GET  /api/resources
router.post('/:id/unlock',   unlockLimiter, unlockResource) // POST /api/resources/:id/unlock

// ── ADMIN (protected) ───────────────────────────────────────────
router.get('/admin/all',     auth, getAllResources)  // GET  /api/resources/admin/all
router.get('/admin/leads',   auth, getLeads)         // GET  /api/resources/admin/leads
router.post('/',             auth, createResource)   // POST /api/resources
router.put('/:id',           auth, updateResource)   // PUT  /api/resources/:id
router.delete('/:id',        auth, deleteResource)   // DELETE /api/resources/:id

module.exports = router
