const Project = require('../models/Project')

// ─── PUBLIC: GET all visible projects ─────────────────────────
async function getProjects(req, res) {
  try {
    const raw = await Project.find({ visible: true }).sort({ order: 1, createdAt: -1 })
    // Normalize: send both field name variants so any frontend version works
    const projects = raw.map(p => ({
      ...p.toObject(),
      desc: p.description,   // alias for frontend
      img:  p.image,         // alias for frontend
    }))
    return res.json({ success: true, projects })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: GET all projects (including hidden) ────────────────
async function getAllProjects(req, res) {
  try {
    const raw = await Project.find().sort({ order: 1, createdAt: -1 })
    const projects = raw.map(p => ({
      ...p.toObject(),
      desc: p.description,
      img:  p.image,
    }))
    return res.json({ success: true, projects })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: CREATE project ─────────────────────────────────────
async function createProject(req, res) {
  try {
    const { index, category, title, desc, description, img, image, tags, year, duration, outcome, visible, order } = req.body
    const _desc = desc || description
    const _img  = img  || image || ''
    if (!category || !title || !_desc) {
      return res.status(400).json({ success: false, message: 'category, title and description are required.' })
    }
    const count = await Project.countDocuments()
    const project = await Project.create({
      index: index || String(count + 1).padStart(3, '0'),
      category, title, description: _desc,
      image: _img,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      year: year || new Date().getFullYear().toString(),
      duration: duration || '',
      outcome: outcome || '',
      visible: visible !== false,
      order: order || count,
    })
    return res.status(201).json({ success: true, project })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: UPDATE project ─────────────────────────────────────
async function updateProject(req, res) {
  try {
    const { tags, desc, img, ...rest } = req.body
    const update = { ...rest }
    if (desc  !== undefined) update.description = desc
    if (img   !== undefined) update.image = img
    if (tags  !== undefined) {
      update.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())
    }
    const project = await Project.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' })
    return res.json({ success: true, project })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: DELETE project ─────────────────────────────────────
async function deleteProject(req, res) {
  try {
    const project = await Project.findByIdAndDelete(req.params.id)
    if (!project) return res.status(404).json({ success: false, message: 'Project not found.' })
    return res.json({ success: true, message: 'Project deleted.' })
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { getProjects, getAllProjects, createProject, updateProject, deleteProject }
