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
      .select('-__v')

    res.json({ success: true, data: resources })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── PUBLIC: Unlock a resource (email gate + optional premium code) ──
async function unlockResource(req, res) {
  try {
    const { id } = req.params
    const { name, email, accessCode } = req.body

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

    // Premium check — must provide correct access code
    if (resource.isPremium) {
      if (!accessCode) {
        return res.status(403).json({ success: false, message: 'This is a premium resource. Please enter your access code.', requiresCode: true })
      }
      if (accessCode.trim() !== resource.accessCode.trim()) {
        return res.status(403).json({ success: false, message: 'Invalid access code. Please check your code and try again.', requiresCode: true })
      }
    }

    // Save lead
    await ResourceLead.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      resourceId: resource._id,
      resourceTitle: resource.title,
      ip: req.ip || '',
    })

    // Increment download counter
    await Resource.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } })

    res.json({ success: true, fileUrl: resource.fileUrl, title: resource.title })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: GET all resources (including hidden) ───────────────
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
    const leads = await ResourceLead.find()
      .sort({ createdAt: -1 })
      .limit(200)
    res.json({ success: true, data: leads, total: leads.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: CREATE resource ────────────────────────────────────
async function createResource(req, res) {
  try {
    const { title, description, category, fileUrl, thumbnail, fileSize, duration, tags, featured, visible, order } = req.body

    if (!title || !description || !category || !fileUrl) {
      return res.status(400).json({ success: false, message: 'title, description, category and fileUrl are required.' })
    }

    const resource = await Resource.create({
      title, description, category, fileUrl,
      thumbnail: thumbnail || '',
      fileSize: fileSize || '',
      duration: duration || '',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      featured: featured === true || featured === 'true',
      visible: visible !== false && visible !== 'false',
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
    if (updates.featured !== undefined) updates.featured = updates.featured === true || updates.featured === 'true'
    if (updates.visible !== undefined) updates.visible = updates.visible !== false && updates.visible !== 'false'

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

    // Also clean up its leads
    await ResourceLead.deleteMany({ resourceId: id })

    res.json({ success: true, message: 'Resource deleted.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = {
  getResources, unlockResource,
  getAllResources, getLeads,
  createResource, updateResource, deleteResource,
}
