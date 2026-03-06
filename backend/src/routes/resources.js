const { Router } = require('express')
const auth = require('../middleware/auth')
const {
  getResources, unlockResource,
  getAllResources, getLeads,
  createResource, updateResource, deleteResource,
} = require('../controllers/resourceController')

const router = Router()

// ── PUBLIC ──────────────────────────────────────────────────────
router.get('/',              getResources)       // GET  /api/resources
router.post('/:id/unlock',   unlockResource)     // POST /api/resources/:id/unlock

// ── ADMIN (protected) ───────────────────────────────────────────
router.get('/admin/all',     auth, getAllResources)  // GET  /api/resources/admin/all
router.get('/admin/leads',   auth, getLeads)         // GET  /api/resources/admin/leads
router.post('/',             auth, createResource)   // POST /api/resources
router.put('/:id',           auth, updateResource)   // PUT  /api/resources/:id
router.delete('/:id',        auth, deleteResource)   // DELETE /api/resources/:id

module.exports = router
