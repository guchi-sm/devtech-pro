const { Router } = require('express')
const auth = require('../middleware/auth')
const {
  getProjects, getAllProjects,
  createProject, updateProject, deleteProject,
} = require('../controllers/projectController')

const router = Router()

// Public — portfolio page fetches this
router.get('/', getProjects)

// Admin protected
router.get('/all',    auth, getAllProjects)
router.post('/',      auth, createProject)
router.put('/:id',    auth, updateProject)
router.delete('/:id', auth, deleteProject)

module.exports = router
