const { Resend  } = require('resend')
const Message     = require('../models/Message')

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendContactEmail(req, res, next) {
  const { name, email, subject, message } = req.body

  try {
    // ── 1. Save to MongoDB ─────────────────────────────────────
    const saved = await Message.create({ name, email, subject, message })
    console.log(`💾 Message saved to DB: ${saved._id}`)

    // ── 2. Email to YOU ────────────────────────────────────────
    await resend.emails.send({
      from:    'DevTech Pro <onboarding@resend.dev>',
      to:      process.env.OWNER_EMAIL || 'guchibrownz@gmail.com',
      replyTo: email,
      subject: `[DevTech Pro] ${subject || `New message from ${name}`}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
          <div style="background:#1c2d3f;padding:24px 28px;border-top:4px solid #f5a623">
            <h2 style="color:#fff;margin:0;font-size:1.3rem">📬 New Contact Message</h2>
            <p style="color:rgba(255,255,255,.55);margin:4px 0 0;font-size:.82rem">DevTech Pro · ID: ${saved._id}</p>
          </div>
          <div style="padding:24px 28px;background:#f9fafb">
            <table style="width:100%;border-collapse:collapse">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#6b7a8d;font-size:.75rem;text-transform:uppercase;letter-spacing:.1em;width:90px">Name</td>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#1c2d3f;font-weight:600">${name}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#6b7a8d;font-size:.75rem;text-transform:uppercase;letter-spacing:.1em">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #e2e8f0">
                  <a href="mailto:${email}" style="color:#f5a623;font-weight:600">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#6b7a8d;font-size:.75rem;text-transform:uppercase;letter-spacing:.1em">Subject</td>
                <td style="padding:10px 0;color:#1c2d3f">${subject || '—'}</td>
              </tr>
            </table>
            <div style="margin-top:20px;padding:18px 20px;background:#fff;border-left:4px solid #f5a623;border-radius:0 6px 6px 0;border:1px solid #e2e8f0">
              <p style="color:#6b7a8d;font-size:.7rem;text-transform:uppercase;letter-spacing:.12em;margin:0 0 10px">Message</p>
              <p style="color:#1c2d3f;line-height:1.75;margin:0;font-size:.95rem">${message.replace(/\n/g, '<br/>')}</p>
            </div>
            <div style="text-align:center;margin-top:24px">
              <a href="mailto:${email}?subject=Re: ${subject || 'Your message'}"
                style="background:#f5a623;color:#1c2d3f;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:700;font-size:.9rem;display:inline-block">
                Reply to ${name} →
              </a>
            </div>
          </div>
          <p style="text-align:center;color:#9eaab8;font-size:.68rem;padding:12px">
            Received ${new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })} EAT
          </p>
        </div>
      `,
    })

    // ── 3. Auto-reply to SENDER ────────────────────────────────
    await resend.emails.send({
      from:    'DevTech Pro <onboarding@resend.dev>',
      to:      email,
      subject: `Thanks for reaching out, ${name} — DevTech Pro`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
          <div style="background:#1c2d3f;padding:24px 28px;border-top:4px solid #f5a623">
            <h2 style="color:#fff;margin:0;font-size:1.4rem;letter-spacing:.06em">DEV<span style="color:#f5a623">.</span>TECH</h2>
            <p style="color:rgba(255,255,255,.5);margin:4px 0 0;font-size:.75rem;text-transform:uppercase;letter-spacing:.14em">ICT Technician & Software Developer</p>
          </div>
          <div style="padding:28px;background:#fff">
            <p style="font-size:1rem;color:#1c2d3f;margin:0 0 16px">Hi <strong>${name}</strong>,</p>
            <p style="font-size:.95rem;color:#6b7a8d;line-height:1.8;margin:0 0 16px">
              Thank you for getting in touch! I've received your message and will get back to you within
              <strong style="color:#1c2d3f">12 hours</strong>.
            </p>
            <p style="font-size:.95rem;color:#6b7a8d;line-height:1.8;margin:0 0 24px">
              For urgent matters, reach me on
              <a href="https://wa.me/254790078363" style="color:#f5a623;font-weight:600">WhatsApp +254 790 078 363</a>.
            </p>
            <div style="background:#f4f6f9;border-left:4px solid #f5a623;padding:16px 18px;border-radius:0 6px 6px 0;margin-bottom:24px">
              <p style="font-size:.7rem;color:#6b7a8d;text-transform:uppercase;letter-spacing:.12em;margin:0 0 8px">Your message</p>
              <p style="font-size:.88rem;color:#1c2d3f;line-height:1.7;margin:0">${message.replace(/\n/g, '<br/>')}</p>
            </div>
            <p style="font-size:.9rem;color:#1c2d3f;margin:0">
              Best regards,<br/>
              <strong style="color:#f5a623">Guchi Brown</strong><br/>
              <span style="font-size:.8rem;color:#6b7a8d">Meru, Kenya · devtech-pro.vercel.app</span>
            </p>
          </div>
          <p style="text-align:center;color:#9eaab8;font-size:.68rem;padding:12px;background:#f9fafb">
            This is an automated reply — please do not reply to this email directly.
          </p>
        </div>
      `,
    })

    console.log(`✅ Contact email sent from ${name} <${email}>`)

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! I will respond within 12 hours.',
    })

  } catch (err) {
    console.error('❌ Contact error:', err)
    next(err)
  }
}

module.exports = { sendContactEmail }
