const { Router } = require('express')
const router = Router()

const SYSTEM_PROMPT = `You are a friendly and professional AI assistant for DevTech Pro, a tech company based in Meru, Kenya run by Guchi Brown.

ABOUT DEVTECH PRO:
- Owner: Guchi Brown — ICT Technician & Full Stack Software Developer
- Location: Meru, Kenya
- Website: devtech-pro.vercel.app
- WhatsApp: +254 790 078 363
- Email: guchibrownz@gmail.com

SERVICES OFFERED:
1. Network Infrastructure — LAN/WAN setup, WiFi, structured cabling, network security, VPN
2. Web Development — React frontends, Node.js/Express backends, REST APIs, full stack apps
3. IT Support & Maintenance — hardware repair, OS installation, virus removal, data recovery
4. Cloud Solutions — AWS/GCP setup, cloud migration, server management
5. Cybersecurity — penetration testing, firewall setup, security audits
6. Software Development — custom business apps, mobile-responsive web apps, databases

PRICING:
- Website development: starts from KES 15,000
- Network setup: starts from KES 10,000
- IT support: KES 2,000/hour or monthly retainer
- Always offer free consultation first

YOUR ROLE:
- Answer questions about DevTech Pro services professionally
- Help visitors understand what services they need
- Collect leads — if someone is interested, ask for their name, email and what they need
- For urgent issues direct them to WhatsApp: +254 790 078 363
- Keep responses concise, friendly and professional
- Use emojis sparingly for a modern feel
- If asked something outside your knowledge, say you will forward to Guchi directly

Always respond in the same language the user writes in.`

router.post('/', async (req, res) => {
  const { messages } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ success: false, message: 'Messages array required.' })
  }

  try {
    const history = messages.slice(-10).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const lastMessage = history.pop()

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [...history, lastMessage],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error('Gemini API error:', data)
      return res.status(500).json({ success: false, message: 'AI service unavailable.' })
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
      || 'Sorry, I could not generate a response. Please try again.'

    return res.json({ success: true, reply })

  } catch (err) {
    console.error('Chat error:', err)
    return res.status(500).json({ success: false, message: 'Chat service error.' })
  }
})

module.exports = router
