const { Router } = require('express')
const auth = require('../middleware/auth')
const {
  getTestimonials, getAllTestimonials,
  createTestimonial, updateTestimonial, deleteTestimonial
} = require('../controllers/testimonialController')

const router = Router()

router.get('/',           getTestimonials)                  // Public
router.get('/admin/all',  auth, getAllTestimonials)          // Admin
router.post('/',          auth, createTestimonial)           // Admin
router.put('/:id',        auth, updateTestimonial)           // Admin
router.delete('/:id',     auth, deleteTestimonial)           // Admin

module.exports = router
