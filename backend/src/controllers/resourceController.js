const Resource     = require('../models/Resource')
const ResourceLead = require('../models/ResourceLead')

// ─── PUBLIC: GET all visible resources ─────────────────────────
async function getResources(req, res) {
  try {
    const { category } = req.query
    const filter = { visible: true }
    if (category && category !== 'All') filter.category = category
    const resources = await Resource.find(filter)
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .select('-__v -accessCode') // ✅ never expose accessCode publicly
    res.json({ success: true, data: resources })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── PUBLIC: Unlock / Request a resource ───────────────────────
async function unlockResource(req, res) {
  try {
    const { id } = req.params
    const { name, email, phone, accessCode } = req.body

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' })
    }

    const resource = await Resource.findOne({ _id: id, visible: true })
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' })
    }

    // ── PREMIUM FLOW ──────────────────────────────────────────────
    // If user is submitting a payment request (no accessCode) → save as pending
    if (resource.isPremium && !accessCode) {
      if (!phone) {
        return res.status(400).json({ success: false, message: 'WhatsApp number is required for premium resources.' })
      }
      // Save as pending lead — admin will verify M-Pesa and send code
      await ResourceLead.create({
        name:          name.trim(),
        email:         email.trim().toLowerCase(),
        phone:         phone.trim(),
        resourceId:    resource._id,
        resourceTitle: resource.title,
        status:        'pending',
        ip:            req.ip || '',
      })
      return res.json({
        success: true,
        pending: true,
        message: `Payment request received! We'll send your access code to WhatsApp ${phone} after verifying your M-Pesa payment.`,
      })
    }

    // ── PREMIUM UNLOCK WITH CODE ──────────────────────────────────
    if (resource.isPremium && accessCode) {
      if (accessCode.trim().toUpperCase() !== resource.accessCode.trim().toUpperCase()) {
        return res.status(403).json({ success: false, message: 'Invalid access code. Please check and try again.', requiresCode: true })
      }
      // Mark their pending lead as used if exists, otherwise create a new one
      await ResourceLead.findOneAndUpdate(
        { email: email.trim().toLowerCase(), resourceId: resource._id, status: 'sent' },
        { accessCodeUsed: accessCode.trim().toUpperCase() },
      )
      await Resource.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } })
      return res.json({ success: true, fileUrl: resource.fileUrl, title: resource.title })
    }

    // ── FREE RESOURCE FLOW ────────────────────────────────────────
    await ResourceLead.create({
      name:          name.trim(),
      email:         email.trim().toLowerCase(),
      phone:         phone?.trim() || '',
      resourceId:    resource._id,
      resourceTitle: resource.title,
      status:        'free',
      ip:            req.ip || '',
    })
    await Resource.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } })
    res.json({ success: true, fileUrl: resource.fileUrl, title: resource.title })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: Mark lead as sent ──────────────────────────────────
async function markLeadSent(req, res) {
  try {
    const { id } = req.params
    const lead = await ResourceLead.findByIdAndUpdate(
      id,
      { status: 'sent', sentAt: new Date() },
      { new: true }
    )
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' })
    res.json({ success: true, data: lead })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: GET all resources ──────────────────────────────────
async function getAllResources(req, res) {
  try {
    const resources = await Resource.find().sort({ order: 1, createdAt: -1 })
    res.json({ success: true, data: resources })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: GET all leads ──────────────────────────────────────
async function getLeads(req, res) {
  try {
    const leads = await ResourceLead.find().sort({ createdAt: -1 }).limit(500)
    res.json({ success: true, data: leads, total: leads.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: CREATE resource ────────────────────────────────────
async function createResource(req, res) {
  try {
    const { title, description, category, fileUrl, thumbnail, fileSize, duration, tags, featured, visible, order, isPremium, accessCode, price, mpesaTill } = req.body
    if (!title || !description || !category || !fileUrl) {
      return res.status(400).json({ success: false, message: 'title, description, category and fileUrl are required.' })
    }
    const resource = await Resource.create({
      title, description, category, fileUrl,
      thumbnail: thumbnail || '', fileSize: fileSize || '', duration: duration || '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      featured: featured === true || featured === 'true',
      visible:  visible  !== false && visible !== 'false',
      isPremium: isPremium === true || isPremium === 'true',
      accessCode: accessCode || '',
      price: parseFloat(price) || 0,
      mpesaTill: mpesaTill || '',
      order: Number(order) || 0,
    })
    res.status(201).json({ success: true, data: resource })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: UPDATE resource ────────────────────────────────────
async function updateResource(req, res) {
  try {
    const { id } = req.params
    const updates = { ...req.body }
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map(t => t.trim()).filter(Boolean)
    }
    if (updates.featured  !== undefined) updates.featured  = updates.featured  === true || updates.featured  === 'true'
    if (updates.visible   !== undefined) updates.visible   = updates.visible   !== false && updates.visible  !== 'false'
    if (updates.isPremium !== undefined) updates.isPremium = updates.isPremium === true  || updates.isPremium === 'true'
    const resource = await Resource.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' })
    res.json({ success: true, data: resource })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: DELETE resource ────────────────────────────────────
async function deleteResource(req, res) {
  try {
    const { id } = req.params
    const resource = await Resource.findByIdAndDelete(id)
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' })
    await ResourceLead.deleteMany({ resourceId: id })
    res.json({ success: true, message: 'Resource deleted.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = {
  getResources, unlockResource, markLeadSent,
  getAllResources, getLeads,
  createResource, updateResource, deleteResource,
}
