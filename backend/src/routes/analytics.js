const { Router } = require('express')
const auth = require('../middleware/auth')
const { track, getDashboard, getRecent } = require('../controllers/analyticsController')

const router = Router()

router.post('/',             track)                  // POST /api/analytics  (public - track page view)
router.get('/dashboard',     auth, getDashboard)     // GET  /api/analytics/dashboard (admin)
router.get('/recent',        auth, getRecent)        // GET  /api/analytics/recent (admin)

module.exports = router
