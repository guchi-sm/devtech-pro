const nodemailer = require('nodemailer')

/**
 * Create the Nodemailer transporter once.
 * Falls back to Ethereal (fake SMTP) if env vars are missing — useful for dev.
 */
let transporter = null

async function getTransporter() {
  if (transporter) return transporter

  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Production / configured SMTP
    transporter = nodemailer.createTransport({
      host:   process.env.EMAIL_HOST,
      port:   Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  } else {
    // Dev: use Ethereal fake SMTP — preview URL printed in console
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host:   'smtp.ethereal.email',
      port:   587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
    console.log('⚠️  Using Ethereal test SMTP. Set EMAIL_* vars in .env for real email.')
  }

  return transporter
}

/**
 * POST /api/contact
 */
async function sendContactEmail(req, res, next) {
  const { name, email, subject, message } = req.body

  try {
    const t = await getTransporter()

    // ── Email TO the site owner ──────────────────────────────────
    const ownerInfo = await t.sendMail({
      from:    `"DevTech Pro Website" <${process.env.EMAIL_USER || 'no-reply@devtechpro.com'}>`,
      to:      process.env.OWNER_EMAIL || process.env.EMAIL_USER || 'hello@devtechpro.com',
      replyTo: email,
      subject: `[DevTech Pro] ${subject || 'New Contact Form Submission'}`,
      html: `
        <div style="font-family:'DM Sans',Arial,sans-serif;max-width:560px;margin:0 auto;background:#070808;color:#F0EDE6;padding:40px;border-radius:8px;">
          <h2 style="font-family:Impact,sans-serif;font-size:2rem;color:#0055FF;letter-spacing:0.05em;margin:0 0 24px;">
            NEW MESSAGE
          </h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#7A7A7A;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;width:30%;">Name</td><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;font-size:14px;">${name}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#7A7A7A;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">Email</td><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;font-size:14px;"><a href="mailto:${email}" style="color:#0055FF;">${email}</a></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;color:#7A7A7A;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">Subject</td><td style="padding:10px 0;border-bottom:1px solid #1a1a1a;font-size:14px;">${subject || '—'}</td></tr>
          </table>
          <div style="margin-top:28px;">
            <div style="color:#7A7A7A;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">Message</div>
            <div style="font-size:14px;line-height:1.75;background:#0E0F10;padding:20px;border-radius:6px;border-left:3px solid #0055FF;">${message.replace(/\n/g, '<br>')}</div>
          </div>
          <p style="margin-top:32px;font-size:11px;color:#444;text-align:center;">Sent via DevTech Pro website · ${new Date().toLocaleString()}</p>
        </div>
      `,
    })

    // ── Auto-reply TO the sender ─────────────────────────────────
    await t.sendMail({
      from:    `"DevTech Pro" <${process.env.EMAIL_USER || 'no-reply@devtechpro.com'}>`,
      to:      email,
      subject: 'Thanks for reaching out — DevTech Pro',
      html: `
        <div style="font-family:'DM Sans',Arial,sans-serif;max-width:560px;margin:0 auto;background:#070808;color:#F0EDE6;padding:40px;border-radius:8px;">
          <h2 style="font-family:Impact,sans-serif;font-size:2rem;color:#0055FF;letter-spacing:0.05em;margin:0 0 8px;">
            DEV.TECH
          </h2>
          <p style="font-size:11px;color:#7A7A7A;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 28px;">ICT Technician & Software Developer</p>
          <p style="font-size:15px;line-height:1.7;">Hi <strong>${name}</strong>,</p>
          <p style="font-size:14px;line-height:1.75;color:#ccc;margin:16px 0;">
            Thank you for your message! I've received it and will get back to you within <strong style="color:#F0EDE6;">24 hours</strong>.
          </p>
          <p style="font-size:14px;line-height:1.75;color:#ccc;">
            In the meantime, feel free to reach me directly via WhatsApp at <a href="https://wa.me/254700000000" style="color:#0055FF;">+254 700 000 000</a>.
          </p>
          <div style="margin:32px 0;padding:20px;background:#0E0F10;border-radius:6px;border-left:3px solid #0055FF;">
            <p style="font-size:11px;color:#7A7A7A;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 8px;">Your message</p>
            <p style="font-size:13px;color:#aaa;line-height:1.65;margin:0;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="font-size:14px;margin-top:24px;">Best regards,<br/><strong style="color:#0055FF;">DevTech Pro</strong><br/><span style="font-size:12px;color:#7A7A7A;">Nairobi, Kenya</span></p>
        </div>
      `,
    })

    // Log preview URL for Ethereal dev SMTP
    if (!process.env.EMAIL_HOST) {
      console.log('📬 Preview URL:', nodemailer.getTestMessageUrl(ownerInfo))
    }

    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! I will respond within 24 hours.',
    })

  } catch (err) {
    next(err)
  }
}

module.exports = { sendContactEmail }
