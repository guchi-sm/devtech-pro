const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema({
  // ─── Identity ──────────────────────────────────────────────
  name:  { type: String, required: true, trim: true, maxlength: 100 },
  email: {
    type: String, required: true,
    trim: true, lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
  },
  phone: { type: String, trim: true, default: '' },
  passwordHash: { type: String, default: '' }, // empty = social/passwordless signup

  // ─── Premium membership ────────────────────────────────────
  isPremium: { type: Boolean, default: false },

  // Subscription-based premium (set expiresAt for time-limited plans)
  // For lifetime: isPremium = true, premium.active = true, premium.expiresAt = null
  premium: {
    active:    { type: Boolean, default: false },
    plan:      { type: String, enum: ['lifetime', 'monthly', 'yearly', ''], default: '' },
    startedAt: { type: Date,    default: null },
    expiresAt: { type: Date,    default: null },  // null = lifetime
  },

  // ─── Auth ──────────────────────────────────────────────────
  emailVerified: { type: Boolean, default: false },
  lastLoginAt:   { type: Date,    default: null },

  // ─── Purchased resources (for per-resource premium model) ──
  unlockedResources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Resource' }],

}, { timestamps: true })

// ─── Indexes ───────────────────────────────────────────────────
userSchema.index({ email: 1 })
userSchema.index({ isPremium: 1 })
userSchema.index({ 'premium.expiresAt': 1 })

// ─── Virtuals ──────────────────────────────────────────────────
userSchema.virtual('hasPremiumAccess').get(function () {
  if (!this.isPremium) return false
  if (!this.premium?.active) return false
  if (!this.premium?.expiresAt) return true           // lifetime
  return new Date() < new Date(this.premium.expiresAt) // not expired
})

// ─── Methods ───────────────────────────────────────────────────
userSchema.methods.setPassword = async function (plaintext) {
  this.passwordHash = await bcrypt.hash(plaintext, 12)
}

userSchema.methods.checkPassword = async function (plaintext) {
  if (!this.passwordHash) return false
  return bcrypt.compare(plaintext, this.passwordHash)
}

// Grant premium access
userSchema.methods.grantPremium = function (plan = 'lifetime', durationDays = null) {
  this.isPremium       = true
  this.premium.active  = true
  this.premium.plan    = plan
  this.premium.startedAt = new Date()

  if (plan === 'lifetime' || !durationDays) {
    this.premium.expiresAt = null
  } else {
    const exp = new Date()
    exp.setDate(exp.getDate() + durationDays)
    this.premium.expiresAt = exp
  }
}

// Grant per-resource access
userSchema.methods.grantResourceAccess = function (resourceId) {
  const id = resourceId.toString()
  const alreadyUnlocked = this.unlockedResources.some(r => r.toString() === id)
  if (!alreadyUnlocked) {
    this.unlockedResources.push(resourceId)
  }
}

userSchema.methods.hasResourceAccess = function (resourceId) {
  if (this.hasPremiumAccess) return true
  return this.unlockedResources.some(r => r.toString() === resourceId.toString())
}

// Safe public profile (never expose passwordHash)
userSchema.methods.toPublicJSON = function () {
  return {
    id:          this._id,
    name:        this.name,
    email:       this.email,
    phone:       this.phone,
    isPremium:   this.isPremium,
    premium: {
      active:    this.premium.active,
      plan:      this.premium.plan,
      expiresAt: this.premium.expiresAt,
    },
    hasPremiumAccess:   this.hasPremiumAccess,
    unlockedResources:  this.unlockedResources,
    emailVerified:      this.emailVerified,
    createdAt:          this.createdAt,
  }
}

module.exports = mongoose.model('User', userSchema)
