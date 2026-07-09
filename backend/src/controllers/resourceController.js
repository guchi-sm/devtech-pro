const axios        = require('axios')
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
      .select('-__v -accessCode -fileUrl') // never expose fileUrl or accessCode publicly
    res.json({ success: true, data: resources })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── PROTECTED DOWNLOAD  GET /api/resources/:id/download ───────
// Requires requireUser + requireResourceAccess middleware
// Streams the file proxied through the backend — never exposes the raw storage URL
async function downloadResource(req, res) {
  try {
    const resource = await Resource.findOne({ _id: req.params.id, visible: true })
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' })
    }
    if (!resource.isPremium) {
      // Free resources — just send the URL directly (no auth needed)
      return res.json({ success: true, fileUrl: resource.fileUrl })
    }

    // Premium — stream through backend so the real URL is never exposed
    const upstream = await axios.get(resource.fileUrl, { responseType: 'stream', timeout: 30000 })

    const contentType = upstream.headers['content-type'] || 'application/octet-stream'
    const safeFilename = resource.title.replace(/[^a-zA-Z0-9\-_.]/g, '_')
    const ext = resource.fileUrl.split('.').pop()?.split('?')[0] || 'bin'

    res.set({
      'Content-Type':        contentType,
      'Content-Disposition': `attachment; filename="${safeFilename}.${ext}"`,
      'Cache-Control':       'no-store',
      'X-Content-Type-Options': 'nosniff',
    })

    upstream.data.pipe(res)

    await Resource.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } })

  } catch (err) {
    console.error('downloadResource error:', err.message)
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Download failed. Please try again.' })
    }
  }
}

// ─── PUBLIC: Unlock / Request a resource (legacy free flow) ────
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

    // Premium resources: redirect to payment flow
    if (resource.isPremium && !accessCode) {
      if (!phone) {
        return res.status(400).json({ success: false, message: 'Phone number is required for premium resources.' })
      }
      await ResourceLead.create({
        name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(),
        resourceId: resource._id, resourceTitle: resource.title,
        status: 'pending', ip: req.ip || '',
      })
      return res.json({
        success: true, pending: true,
        message: `Request received. We'll send access to ${phone} after verifying payment.`,
      })
    }

    // Premium unlock with access code (legacy admin-sent codes)
    if (resource.isPremium && accessCode) {
      if (!resource.accessCode || accessCode.trim().toUpperCase() !== resource.accessCode.trim().toUpperCase()) {
        return res.status(403).json({ success: false, message: 'Invalid access code.', requiresCode: true })
      }
      await ResourceLead.findOneAndUpdate(
        { email: email.trim().toLowerCase(), resourceId: resource._id, status: 'sent' },
        { accessCodeUsed: accessCode.trim().toUpperCase() },
      )
      await Resource.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } })
      return res.json({ success: true, fileUrl: resource.fileUrl, title: resource.title })
    }

    // Free resource
    await ResourceLead.create({
      name: name.trim(), email: email.trim().toLowerCase(), phone: phone?.trim() || '',
      resourceId: resource._id, resourceTitle: resource.title,
      status: 'free', ip: req.ip || '',
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
    const lead = await ResourceLead.findByIdAndUpdate(
      req.params.id,
      { status: 'sent', sentAt: new Date() },
      { new: true }
    )
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' })
    res.json({ success: true, data: lead })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: GET all resources (includes fileUrl + accessCode) ──
async function getAllResources(req, res) {
  try {
    const resources = await Resource.find().sort({ order: 1, createdAt: -1 })
    res.json({ success: true, data: resources })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

async function getLeads(req, res) {
  try {
    const leads = await ResourceLead.find().sort({ createdAt: -1 }).limit(500)
    res.json({ success: true, data: leads, total: leads.length })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

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
      accessCode: accessCode || '', price: parseFloat(price) || 0,
      mpesaTill: mpesaTill || '', order: Number(order) || 0,
    })
    res.status(201).json({ success: true, data: resource })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

async function updateResource(req, res) {
  try {
    const updates = { ...req.body }
    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map(t => t.trim()).filter(Boolean)
    }
    if (updates.featured  !== undefined) updates.featured  = updates.featured  === true || updates.featured  === 'true'
    if (updates.visible   !== undefined) updates.visible   = updates.visible   !== false && updates.visible  !== 'false'
    if (updates.isPremium !== undefined) updates.isPremium = updates.isPremium === true  || updates.isPremium === 'true'
    const resource = await Resource.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' })
    res.json({ success: true, data: resource })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

async function deleteResource(req, res) {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id)
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found.' })
    await ResourceLead.deleteMany({ resourceId: req.params.id })
    res.json({ success: true, message: 'Resource deleted.' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = {
  getResources, downloadResource, unlockResource, markLeadSent,
  getAllResources, getLeads,
  createResource, updateResource, deleteResource,
}
