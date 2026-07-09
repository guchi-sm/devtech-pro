const jwt  = require('jsonwebtoken')
const User = require('../models/User')

/**
 * requireUser
 * Verifies customer JWT, loads the full User document onto req.user.
 * Use on any endpoint that needs an authenticated customer.
 */
async function requireUser(req, res, next) {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      const msg = err.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Invalid token. Please log in again.'
      return res.status(401).json({ success: false, message: msg })
    }

    // Must be a customer token (role: 'user'), not admin
    if (!decoded.userId || decoded.role !== 'user') {
      return res.status(403).json({ success: false, message: 'Access denied.' })
    }

    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found. Please log in again.' })
    }

    req.user = user
    next()
  } catch (err) {
    console.error('requireUser error:', err.message)
    return res.status(500).json({ success: false, message: 'Authentication error.' })
  }
}

/**
 * requirePremium
 * Must be used AFTER requireUser.
 * Checks isPremium, premium.active, and expiry date.
 * Returns HTTP 403 if not premium or subscription has lapsed.
 */
async function requirePremium(req, res, next) {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }

    if (!user.isPremium || !user.premium?.active) {
      return res.status(403).json({
        success:  false,
        code:     'NOT_PREMIUM',
        message:  'Premium membership required to access this resource.',
      })
    }

    // Check subscription expiry (null expiresAt = lifetime)
    if (user.premium.expiresAt && new Date() > new Date(user.premium.expiresAt)) {
      return res.status(403).json({
        success:   false,
        code:      'PREMIUM_EXPIRED',
        message:   'Your premium membership has expired. Please renew to continue.',
        expiresAt: user.premium.expiresAt,
      })
    }

    next()
  } catch (err) {
    console.error('requirePremium error:', err.message)
    return res.status(500).json({ success: false, message: 'Authorization error.' })
  }
}

/**
 * requireResourceAccess
 * Must be used AFTER requireUser.
 * Checks if user has premium OR has specifically purchased this resource.
 * Reads :id from req.params.
 */
async function requireResourceAccess(req, res, next) {
  try {
    const user       = req.user
    const resourceId = req.params.id

    if (!user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' })
    }

    // Full premium access — check expiry
    if (user.isPremium && user.premium?.active) {
      const expired = user.premium.expiresAt && new Date() > new Date(user.premium.expiresAt)
      if (!expired) return next()
    }

    // Per-resource purchase check
    const hasAccess = user.unlockedResources.some(r => r.toString() === resourceId)
    if (hasAccess) return next()

    return res.status(403).json({
      success: false,
      code:    'ACCESS_DENIED',
      message: 'Purchase required to download this resource.',
    })
  } catch (err) {
    console.error('requireResourceAccess error:', err.message)
    return res.status(500).json({ success: false, message: 'Authorization error.' })
  }
}

module.exports = { requireUser, requirePremium, requireResourceAccess }
