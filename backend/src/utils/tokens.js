const jwt    = require('jsonwebtoken')
const crypto = require('crypto')

function signUserToken(user, expiresIn = '30d') {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, role: 'user' },
    process.env.JWT_SECRET,
    { expiresIn }
  )
}

function makeIdempotencyKey(userId, resourceId, windowMs = 60 * 60 * 1000) {
  const window = Math.floor(Date.now() / windowMs)
  return crypto
    .createHash('sha256')
    .update(`${userId}:${resourceId}:${window}`)
    .digest('hex')
}

function verifyTumaSignature(rawBody, signature, secret) {
  if (!secret || !signature) return true
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex')
  )
}

module.exports = { signUserToken, makeIdempotencyKey, verifyTumaSignature }