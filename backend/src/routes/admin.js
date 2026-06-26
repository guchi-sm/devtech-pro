const { Router } = require('express')
const auth = require('../middleware/auth')
const {
  login, getMessages, getStats,
  markRead, markUnread, deleteMessage, replyMessage,
} = require('../controllers/adminController')
const {
  getAllProjects, createProject, updateProject, deleteProject,
} = require('../controllers/projectController')
const {
  getAllResources, createResource, updateResource, deleteResource, getLeads, markLeadSent,
} = require('../controllers/resourceController')
const {
  getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial,
} = require('../controllers/testimonialController')
const { getDashboard, getRecent } = require('../controllers/analyticsController')

const router = Router()

// ─── AUTH ─────────────────────────────────────────────────────
router.post('/login', login)

// ─── MESSAGES / CONTACTS ──────────────────────────────────────
router.get('/messages',              auth, getMessages)
router.get('/stats',                 auth, getStats)
router.patch('/messages/:id/read',   auth, markRead)
router.patch('/messages/:id/unread', auth, markUnread)
router.post('/messages/:id/reply',   auth, replyMessage)
router.delete('/messages/:id',       auth, deleteMessage)

// ─── PROJECTS ─────────────────────────────────────────────────
router.get('/projects',              auth, getAllProjects)
router.post('/projects',             auth, createProject)
router.put('/projects/:id',          auth, updateProject)
router.delete('/projects/:id',       auth, deleteProject)

// ─── RESOURCES ────────────────────────────────────────────────
router.get('/resources',             auth, getAllResources)
router.post('/resources',            auth, createResource)
router.put('/resources/:id',         auth, updateResource)
router.delete('/resources/:id',      auth, deleteResource)

// ─── LEADS ────────────────────────────────────────────────────
router.get('/leads',                 auth, getLeads)
router.patch('/leads/:id/sent',      auth, markLeadSent)

// ─── TESTIMONIALS ─────────────────────────────────────────────
router.get('/testimonials',          auth, getAllTestimonials)
router.post('/testimonials',         auth, createTestimonial)
router.put('/testimonials/:id',      auth, updateTestimonial)
router.delete('/testimonials/:id',   auth, deleteTestimonial)

// ─── ANALYTICS ────────────────────────────────────────────────
router.get('/analytics',             auth, getDashboard)
router.get('/analytics/recent',      auth, getRecent)

module.exports = router
