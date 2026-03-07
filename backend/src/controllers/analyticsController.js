const PageView = require('../models/PageView')

// ─── Detect device type from User-Agent ────────────────────────
function detectDevice(ua = '') {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) return 'mobile'
  return 'desktop'
}

function detectOS(ua = '') {
  if (/windows nt/i.test(ua))   return 'Windows'
  if (/mac os x/i.test(ua))     return 'macOS'
  if (/android/i.test(ua))      return 'Android'
  if (/iphone|ipad/i.test(ua))  return 'iOS'
  if (/linux/i.test(ua))        return 'Linux'
  return 'Unknown'
}

function detectBrowser(ua = '') {
  if (/edg\//i.test(ua))     return 'Edge'
  if (/chrome/i.test(ua))    return 'Chrome'
  if (/firefox/i.test(ua))   return 'Firefox'
  if (/safari/i.test(ua))    return 'Safari'
  if (/opera|opr/i.test(ua)) return 'Opera'
  return 'Unknown'
}

// ─── PUBLIC: Track a page view ──────────────────────────────────
async function track(req, res) {
  try {
    const { page, title, referrer, sessionId, duration } = req.body
    if (!page) return res.status(400).json({ success: false, message: 'page is required' })

    const ua      = req.headers['user-agent'] || ''
    const ip      = (req.headers['x-forwarded-for'] || req.ip || '').split(',')[0].trim()

    // Basic geo from Cloudflare/Railway headers (no extra API needed)
    const country = req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'] || 'Unknown'
    const city    = req.headers['cf-iplocation'] || req.headers['x-vercel-ip-city'] || ''

    await PageView.create({
      page:    page.substring(0, 200),
      title:   (title || '').substring(0, 200),
      referrer:(referrer || '').substring(0, 500),
      country, city,
      device:  detectDevice(ua),
      os:      detectOS(ua),
      browser: detectBrowser(ua),
      sessionId: (sessionId || '').substring(0, 64),
      ip:      ip.substring(0, 64),
      duration: Number(duration) || 0,
    })

    res.json({ success: true })
  } catch (err) {
    // Don't break the user experience — silently fail
    res.json({ success: false })
  }
}

// ─── ADMIN: Get analytics dashboard data ───────────────────────
async function getDashboard(req, res) {
  try {
    const now   = new Date()
    const day7  = new Date(now - 7  * 24 * 60 * 60 * 1000)
    const day30 = new Date(now - 30 * 24 * 60 * 60 * 1000)
    const today = new Date(now); today.setHours(0, 0, 0, 0)

    // Total counts
    const [total, todayCount, week, month] = await Promise.all([
      PageView.countDocuments(),
      PageView.countDocuments({ createdAt: { $gte: today } }),
      PageView.countDocuments({ createdAt: { $gte: day7 } }),
      PageView.countDocuments({ createdAt: { $gte: day30 } }),
    ])

    // Unique sessions (unique visitors approx)
    const uniqueSessions = await PageView.distinct('sessionId', { sessionId: { $ne: '' } })

    // Top pages
    const topPages = await PageView.aggregate([
      { $group: { _id: '$page', views: { $sum: 1 } } },
      { $sort:  { views: -1 } },
      { $limit: 10 },
    ])

    // Device breakdown
    const devices = await PageView.aggregate([
      { $group: { _id: '$device', count: { $sum: 1 } } },
    ])

    // Country breakdown
    const countries = await PageView.aggregate([
      { $match: { country: { $ne: 'Unknown' } } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
      { $limit: 10 },
    ])

    // Browser breakdown
    const browsers = await PageView.aggregate([
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ])

    // Daily views for chart (last 14 days)
    const dailyViews = await PageView.aggregate([
      { $match: { createdAt: { $gte: new Date(now - 14 * 24 * 60 * 60 * 1000) } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        views: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ])

    res.json({
      success: true,
      data: {
        totals: { total, todayCount, week, month, uniqueVisitors: uniqueSessions.length },
        topPages, devices, countries, browsers, dailyViews,
      },
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

// ─── ADMIN: Get recent page views ──────────────────────────────
async function getRecent(req, res) {
  try {
    const views = await PageView.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .select('page country device browser createdAt sessionId')
    res.json({ success: true, data: views })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

module.exports = { track, getDashboard, getRecent }
