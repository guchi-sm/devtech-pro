const User          = require('../models/User')
const { signUserToken } = require('../utils/tokens')

async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' })
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' })
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' })
    }
    const user = new User({ name: name.trim(), email: email.toLowerCase().trim(), phone: phone?.trim() || '' })
    await user.setPassword(password)
    await user.save()
    const token = signUserToken(user)
    return res.status(201).json({ success: true, message: 'Account created successfully.', token, user: user.toPublicJSON() })
  } catch (err) {
    console.error('register error:', err.message)
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' })
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' })
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }
    const valid = await user.checkPassword(password)
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' })
    }
    user.lastLoginAt = new Date()
    await user.save()
    const token = signUserToken(user)
    return res.json({ success: true, token, user: user.toPublicJSON() })
  } catch (err) {
    console.error('login error:', err.message)
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' })
  }
}

async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' })
    return res.json({ success: true, user: user.toPublicJSON() })
  } catch (err) {
    console.error('getMe error:', err.message)
    return res.status(500).json({ success: false, message: 'Failed to load profile.' })
  }
}

module.exports = { register, login, getMe }