const Testimonial = require('../models/Testimonial')

// ─── PUBLIC: Get visible testimonials ──────────────────────────
async function getTestimonials(req, res) {
  try {
    const testimonials = await Testimonial.find({ visible: true })
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .select('-__v')
    res.json({ success: true, data: testimonials })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: Get all testimonials ───────────────────────────────
async function getAllTestimonials(req, res) {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1, createdAt: -1 })
    res.json({ success: true, data: testimonials })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: Create ─────────────────────────────────────────────
async function createTestimonial(req, res) {
  try {
    const { name, role, company, avatar, rating, text, service, visible, featured, order } = req.body
    if (!name || !text) return res.status(400).json({ success: false, message: 'name and text are required.' })
    const t = await Testimonial.create({
      name, role: role||'', company: company||'', avatar: avatar||'',
      rating: Number(rating)||5, text, service: service||'',
      visible: visible !== false && visible !== 'false',
      featured: featured === true || featured === 'true',
      order: Number(order)||0,
    })
    res.status(201).json({ success: true, data: t })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: Update ─────────────────────────────────────────────
async function updateTestimonial(req, res) {
  try {
    const updates = { ...req.body }
    if (updates.rating)   updates.rating   = Number(updates.rating)
    if (updates.order)    updates.order    = Number(updates.order)
    if (updates.featured !== undefined) updates.featured = updates.featured===true||updates.featured==='true'
    if (updates.visible  !== undefined) updates.visible  = updates.visible!==false&&updates.visible!=='false'
    const t = await Testimonial.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    if (!t) return res.status(404).json({ success: false, message: 'Not found.' })
    res.json({ success: true, data: t })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: Delete ─────────────────────────────────────────────
async function deleteTestimonial(req, res) {
  try {
    const t = await Testimonial.findByIdAndDelete(req.params.id)
    if (!t) return res.status(404).json({ success: false, message: 'Not found.' })
    res.json({ success: true, message: 'Deleted.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getTestimonials, getAllTestimonials, createTestimonial, updateTestimonial, deleteTestimonial }
