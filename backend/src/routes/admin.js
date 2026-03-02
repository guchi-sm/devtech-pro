const { Router } = require('express')
const auth = require('../middleware/auth')
const {
  login, getMessages, getStats,
  markRead, markUnread, deleteMessage,
} = require('../controllers/adminController')

const router = Router()

router.post('/login', login)
router.get('/messages', auth, getMessages)
router.get('/stats', auth, getStats)
router.patch('/messages/:id/read', auth, markRead)
router.patch('/messages/:id/unread', auth, markUnread)
router.delete('/messages/:id', auth, deleteMessage)

module.exports = router