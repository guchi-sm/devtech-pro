import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollReveal } from '../hooks/useScrollReveal'
import Footer from '../components/Footer'

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 36 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1], delay } })

function Reveal({ children, delay = 0, className = '' }) {
  const [ref, visible] = useScrollReveal()
  return (
    <motion.div ref={ref} className={className} initial={{ opacity: 0, y: 32 }}
      animate={visible ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay }}>
      {children}
    </motion.div>
  )
}

const CATEGORIES = ['All', 'Networking', 'Software Dev', 'IT Tips', 'Cybersecurity', 'Business Tech']

// ─── ALL POSTS WITH FULL CONTENT ──────────────────────────────
const POSTS = [
  {
    id: 1, slug: 'router-settings-small-business',
    category: 'Networking', readTime: '5 min', date: 'Feb 2025',
    title: '5 Router Settings Every Small Business Should Change Today',
    excerpt: 'Most routers ship with insecure default settings. Here are the five changes that will dramatically improve your office network security without any technical expertise.',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=85&fit=crop',
    tags: ['MikroTik', 'Security', 'WiFi'], color: '#3b82f6',
    content: [
      { type: 'intro', text: "Walk into almost any small business in Kenya and you'll find a router on a shelf, factory settings untouched since the ISP installed it. The default password is written on a sticker underneath. Anyone who's visited your office has seen it. This guide covers five changes you can make in under 30 minutes that close the most common attack vectors — no technical background required." },
      { type: 'heading', text: '1. Change the Admin Password (Immediately)' },
      { type: 'paragraph', text: "Every router brand has a known default admin password. Safaricom routers ship with 'admin/admin'. Huawei HG8245H uses 'telecomadmin/admintelecom'. These are the first credentials any attacker tries. Log into your router admin panel (usually 192.168.1.1 or 192.168.100.1), find the admin password setting, and change it to something 12+ characters with letters, numbers, and symbols. Write it on paper and keep it in a locked drawer — not on a sticky note on the router." },
      { type: 'heading', text: '2. Rename Your WiFi Network (SSID)' },
      { type: 'paragraph', text: "Default SSIDs like 'SAFARICOM_HH' or 'ZTE_2.4G_B3F2' immediately reveal your router model to anyone scanning nearby. Attackers use this to look up known vulnerabilities for that specific firmware. Rename your WiFi to something generic that doesn't reveal your business name or location. Avoid names like 'MwangiLawFirmOffice' — that's a targeting gift." },
      { type: 'heading', text: '3. Disable WPS' },
      { type: 'paragraph', text: "WiFi Protected Setup (WPS) was designed to make connecting devices easier via an 8-digit PIN. The problem is that PIN can be brute-forced in hours using freely available tools. WPS is enabled by default on almost every consumer router. Go into your wireless settings, find WPS, and turn it off. Your devices connect slightly differently but you'll close a serious vulnerability." },
      { type: 'heading', text: '4. Set Up a Guest Network for Visitors' },
      { type: 'paragraph', text: "When a client or visitor gets your main WiFi password, they're on the same network as your business computers, NAS drives, printers, and POS systems. Most mid-range routers support a Guest Network — a separate WiFi that gives internet access but isolates visitors from your internal devices. Enable it, set a different password, and give visitors that instead. This one change prevents a huge category of internal network attacks." },
      { type: 'heading', text: '5. Update the Firmware' },
      { type: 'paragraph', text: "Router firmware updates patch security vulnerabilities. A router running two-year-old firmware is exposed to every publicly disclosed vulnerability from those two years. Log into your admin panel, find the firmware/update section, and check for updates. On MikroTik: System → Packages → Check for Updates. Do this now, then set a calendar reminder every 3 months." },
      { type: 'callout', text: "If you're running MikroTik and want a complete hardening checklist — firewall rules, disabling unused services, port knocking — I have a detailed guide in my Resources section." },
    ],
  },
  {
    id: 2, slug: 'office-pc-running-slow-fix',
    category: 'IT Tips', readTime: '3 min', date: 'Jan 2025',
    title: 'Why Your Office PC Is Running Slow — And How to Fix It',
    excerpt: 'Slow computers kill productivity. Before spending money on new hardware, try these proven software fixes that take under 30 minutes.',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=85&fit=crop',
    tags: ['Windows', 'Performance', 'Maintenance'], color: '#22c55e',
    content: [
      { type: 'intro', text: "A slow computer is a productivity killer. I get calls about this every week — business owners ready to buy new machines when the current ones just need a proper cleanup. Before you spend KES 40,000 on a new desktop, spend 30 minutes trying these fixes. Nine times out of ten, the machine comes back to life." },
      { type: 'heading', text: "Step 1: Check What's Actually Using Your Resources" },
      { type: 'paragraph', text: "Press Ctrl+Shift+Esc to open Task Manager. Click 'More details' then sort by CPU and Memory. You're looking for anything using consistently high CPU or more than 500MB of RAM when idle. Common culprits: antivirus doing a full scan during work hours (reschedule to nights), browser with 20 open tabs (close them), Windows Update running in the background. If you see an unknown process at 80%+ CPU, that's a malware flag — skip to Step 4." },
      { type: 'heading', text: 'Step 2: Disable Startup Programs' },
      { type: 'paragraph', text: "Every program you've ever installed wants to run when Windows starts. After a few years, you have 30 programs eating RAM before you've opened a single thing. In Task Manager, click the Startup tab. Disable everything that isn't essential — leave antivirus and your main business software. Restart and measure the difference. This alone often cuts boot time by half." },
      { type: 'heading', text: 'Step 3: Free Up Disk Space' },
      { type: 'paragraph', text: "Windows slows dramatically when your C: drive is more than 85% full. Type 'Disk Cleanup' in the Start menu, select C:, and run it. Click 'Clean up system files' for the deeper clean. Also go to Settings → System → Storage → Temporary Files and delete those. Move large files to an external drive or Google Drive if you're still tight." },
      { type: 'heading', text: 'Step 4: Scan for Malware' },
      { type: 'paragraph', text: "Malware is a very common cause of slow machines in Kenyan offices, mostly from pirated software and USB drives. Windows Defender (built into Windows 10/11) is actually very good. Open it from the Start menu, run a Full Scan. Let it complete even if it takes 2 hours. If it finds something, quarantine it. Then never install cracked software again." },
      { type: 'heading', text: 'Step 5: Upgrade RAM or Switch to an SSD' },
      { type: 'paragraph', text: "If software fixes don't resolve it, the cheapest hardware upgrade is RAM. If you're running 4GB on Windows 10 with Office open, it will always be slow. 8GB is the minimum today. An SSD upgrade is even more transformative — if your machine has an old mechanical hard drive, a 240GB SSD (KES 3,500–5,000) makes it feel like new. Boot times drop from 2 minutes to 15 seconds." },
      { type: 'callout', text: 'I do on-site PC tune-ups and hardware upgrades across Meru. WhatsApp me for same-week availability — most tune-ups are done within 2 hours.' },
    ],
  },
  {
    id: 3, slug: 'custom-software-vs-off-the-shelf',
    category: 'Software Dev', readTime: '7 min', date: 'Jan 2025',
    title: 'When Should Your Business Build Custom Software vs. Buy Off-the-Shelf?',
    excerpt: 'SaaS tools are convenient but they have limits. This guide helps you decide when investing in custom software will actually save money in the long run.',
    img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=85&fit=crop',
    tags: ['Strategy', 'Development', 'ROI'], color: '#f5a623',
    content: [
      { type: 'intro', text: "Every week I talk to business owners paying for three different SaaS tools that still don't cover everything they need, or who have staff maintaining complex Excel spreadsheets because no software fits their exact process. The 'build vs. buy' question is one of the most important tech decisions a growing business makes. Here's the framework I use with clients." },
      { type: 'heading', text: 'When to Buy Off-the-Shelf (SaaS)' },
      { type: 'paragraph', text: "Off-the-shelf wins when your needs match a solved problem. Accounting? Use QuickBooks or Wave. Email marketing? Mailchimp. HR leave tracking? Any of a dozen tools. If your process is standard and the software has thousands of other users with your exact use case, buying is almost always cheaper and faster. Monthly fees of KES 1,000–5,000 are nearly always justified for truly standard functions." },
      { type: 'heading', text: 'When to Build Custom' },
      { type: 'paragraph', text: "Custom software makes sense when your process is your competitive advantage. A hardware shop in Meru that tracks stock across 3 branches with supplier credit terms, custom reorder rules, and M-Pesa reconciliation built in is not well served by generic inventory software. I've built exactly this type of system, and the ROI was clear within 4 months." },
      { type: 'heading', text: 'The Real Cost Comparison' },
      { type: 'paragraph', text: "People underestimate SaaS total cost. A KES 2,500/month tool costs KES 90,000 over 3 years — and you own nothing. A custom system built for KES 80,000–150,000 is yours indefinitely, has no per-user fees, and can be modified as your business changes. The break-even is usually around 24–30 months. Beyond that, custom is cheaper every year." },
      { type: 'heading', text: 'Red Flags That You Need Custom Software' },
      { type: 'paragraph', text: "You're running critical operations in Excel. You're paying for 2+ tools and manually copying data between them. You have staff doing a task that 'should be automatic' but the tool doesn't support it. You've had to change your business process to fit the software. Any of these is a strong signal." },
      { type: 'heading', text: 'What to Expect from a Custom Build' },
      { type: 'paragraph', text: "A small business system typically takes 6–10 weeks and costs KES 60,000–150,000 depending on complexity. You get full ownership of the code and data — no vendor lock-in. The process starts with a detailed requirements session, then builds in phases so you can give feedback early." },
      { type: 'callout', text: "Not sure which direction fits? Book a free 30-minute consultation. I'll give you an honest assessment — even if the answer is 'you don't need custom software yet.'" },
    ],
  },
  {
    id: 4, slug: 'small-business-hacked-kenya',
    category: 'Cybersecurity', readTime: '4 min', date: 'Dec 2024',
    title: 'The 3 Most Common Ways Small Businesses Get Hacked in Kenya',
    excerpt: 'Cybercrime targeting SMEs is rising fast across East Africa. Here are the most common attack vectors I see — and exactly how to defend against them.',
    img: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=85&fit=crop',
    tags: ['Security', 'Kenya', 'SME'], color: '#ef4444',
    content: [
      { type: 'intro', text: "Cybercrime targeting Kenyan businesses is growing fast, and small businesses are the preferred target — not because you have more money, but because you have weaker defences. In my years doing IT support across Meru and central Kenya, I've handled incident responses for businesses that lost client data, had M-Pesa accounts compromised, and had ransomware encrypt their entire file server." },
      { type: 'heading', text: '1. Phishing via WhatsApp and Email' },
      { type: 'paragraph', text: "This is the number one attack vector. A staff member gets a WhatsApp message that looks like it's from KRA, their bank, or a supplier. It asks them to click a link and log in. The link goes to a fake site that harvests credentials. I've seen businesses lose access to M-Pesa business accounts, Gmail, and financial systems this way. Defence: Enable 2FA on all critical accounts — especially Gmail, banking, and M-Pesa. Train every staff member that no legitimate organisation will ask for passwords via WhatsApp." },
      { type: 'heading', text: '2. Pirated Software with Hidden Malware' },
      { type: 'paragraph', text: "A pirated copy of QuickBooks or Microsoft Office from Luthuli Avenue almost always contains bundled malware. It runs silently for months — logging keystrokes, exfiltrating files, or sitting dormant until activated. I've cleaned three ransomware infections in the past year that all traced back to cracked software. Defence: Budget for legitimate software. Microsoft 365 Business Basic is KES 800/user/month — cheaper than one ransomware cleanup." },
      { type: 'heading', text: '3. Unpatched Systems and Exposed Remote Desktop' },
      { type: 'paragraph', text: "Many businesses have Remote Desktop Protocol (RDP) exposed to the internet — set up by a previous IT person for remote access and forgotten. Attackers continuously scan for open RDP ports and try credential-stuffing with leaked password databases. Combined with weak passwords and unpatched Windows, this is a reliable entry point. Defence: Never expose RDP directly to the internet. Use a VPN for remote access. Keep Windows Update enabled." },
      { type: 'callout', text: 'If you suspect your systems have been compromised, disconnect affected machines from the network immediately and contact me. Early containment is the difference between a minor incident and a full disaster.' },
      { type: 'heading', text: 'The Cheapest Security Investment' },
      { type: 'paragraph', text: "A basic security audit for a small office costs KES 6,000–10,000. Compare that to the average ransomware recovery cost in Kenya — KES 50,000–200,000 when you factor in data recovery, downtime, and rebuilding. Security is not expensive. Recovering from an incident is." },
    ],
  },
  {
    id: 5, slug: 'office-network-under-50000-kes',
    category: 'Business Tech', readTime: '6 min', date: 'Dec 2024',
    title: 'Setting Up a Professional Office Network for Under KES 50,000',
    excerpt: "You don't need enterprise budgets for a reliable office network. Here's a complete parts list and setup guide that covers 10–20 workstations.",
    img: 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=1200&q=85&fit=crop',
    tags: ['Budget', 'LAN', 'Setup Guide'], color: '#a855f7',
    content: [
      { type: 'intro', text: "I get asked this constantly: how much does a proper office network cost? Most quotes people receive are padded with enterprise hardware they don't need. Here's a realistic bill of materials for a 10–20 person office in Kenya, keeping total under KES 50,000." },
      { type: 'heading', text: 'The Hardware You Actually Need' },
      { type: 'paragraph', text: "Router/Firewall: MikroTik hEX RB750Gr3 — KES 7,500. This is the backbone. MikroTik RouterOS gives you full firewall control, DHCP, VLAN support, bandwidth management, and VPN in a KES 7,500 box. Don't buy a consumer router for a business." },
      { type: 'paragraph', text: "Network Switch: TP-Link TL-SG1016D 16-port gigabit — KES 6,500. For VLANs (recommended), step up to the TP-Link TL-SG108E smart switch at KES 4,500 for 8 ports." },
      { type: 'paragraph', text: "WiFi Access Point: TP-Link EAP245 or EAP670 — KES 8,000–12,000. A single well-placed AP covers most small offices. Avoid home-grade routers used as APs — they don't handle concurrent office connections well." },
      { type: 'paragraph', text: "Cabling: Cat6 cable (305m box) — KES 5,000. RJ45 connectors and terminations — KES 2,000. Conduit and wall sockets if doing structured cabling — KES 3,000–5,000 extra." },
      { type: 'heading', text: 'Complete Budget Breakdown' },
      { type: 'paragraph', text: "MikroTik router: KES 7,500. 16-port switch: KES 6,500. TP-Link EAP245 AP: KES 9,500. Cat6 cable and terminations: KES 7,000. Installation, configuration, and documentation: KES 12,000–15,000. Total: KES 42,500–45,500. This gets you gigabit LAN, secure WiFi with guest network, proper firewall rules, and a network that scales to 50 users without replacement." },
      { type: 'heading', text: 'What the Setup Covers' },
      { type: 'paragraph', text: "Proper MikroTik configuration includes: firewall rules blocking common attack vectors, DHCP server for automatic IP assignment, bandwidth management so one user can't saturate the link, separate staff and guest WiFi SSIDs, and written network documentation (IP scheme, admin credentials stored securely)." },
      { type: 'callout', text: 'I supply hardware and handle full installation including cabling across Meru and central Kenya. WhatsApp me for a site quote — I respond within a few hours.' },
    ],
  },
  {
    id: 6, slug: 'inventory-spreadsheet-vs-custom-system',
    category: 'Software Dev', readTime: '5 min', date: 'Nov 2024',
    title: 'Inventory Management: Spreadsheet vs. Custom System — Real Numbers',
    excerpt: 'After building 8 inventory systems for local businesses, I broke down the actual cost and time savings vs. continuing to manage stock in Excel.',
    img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=85&fit=crop',
    tags: ['Inventory', 'Excel', 'Automation'], color: '#f5a623',
    content: [
      { type: 'intro', text: "I've built inventory systems for 8 businesses in Kenya — hardware shops, pharmacies, a stationery wholesaler, a spare parts dealer. Every single one was running on Excel before I arrived. Here's what I've actually measured in time savings, error reduction, and payback period." },
      { type: 'heading', text: 'The Real Cost of Running Inventory in Excel' },
      { type: 'paragraph', text: "In a typical 200-SKU hardware shop, I measured: Stock update — 45 minutes every morning. Sale recording — manually entered after each transaction, frequently falling behind during busy periods, leading to 30–60 minute reconciliation at end of day. Reorder decisions — weekly 1–2 hour manual review by the owner. Total recurring overhead: 12–15 hours per week across the team." },
      { type: 'heading', text: 'After a Custom System: The Numbers' },
      { type: 'paragraph', text: "Morning stock check: 15 minutes (system tracks sales in real time, count is just a spot-check). Sale recording: zero extra time — the cashier interface records the sale and deducts stock instantly. Reorder decisions: automated — the system sends a WhatsApp message when any item hits its reorder threshold. Time saving: 8–10 hours per week. At KES 600/hour, that's KES 20,000–25,000/month in recovered productivity." },
      { type: 'heading', text: 'Error Reduction' },
      { type: 'paragraph', text: "Excel inventory errors fall into two categories: entry errors (wrong quantity typed) and timing errors (sale wasn't recorded yet when someone else checked the sheet). Both categories disappear with a real system. In one pharmacy, we compared 3 months pre-system: 12 stockout incidents, versus 3 months post-system: 1 incident. Stockouts cost KES 8,000–15,000 each in lost sales and emergency reorder premiums." },
      { type: 'heading', text: 'What a Custom System Costs' },
      { type: 'paragraph', text: "100–500 SKUs, single location, basic reporting: KES 70,000–100,000. Multi-location with M-Pesa integration and custom reports: KES 120,000–180,000. At KES 20,000/month in recovered productivity, a KES 80,000 system pays back in 4 months. Every month after that is pure gain." },
      { type: 'callout', text: "I offer a free workflow analysis — I map your current inventory process and give you a written cost-benefit breakdown before you commit. If Excel is actually fine for your situation, I'll tell you that." },
    ],
  },
]

// ─── ARTICLE CONTENT RENDERER ─────────────────────────────────
function ArticleBody({ blocks }) {
  return (
    <div>
      {blocks.map((block, i) => {
        if (block.type === 'intro') return (
          <p key={i} style={{
            fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--text)',
            fontWeight: 400, marginBottom: '2rem',
            paddingBottom: '2rem', borderBottom: '1px solid var(--border)',
          }}>{block.text}</p>
        )
        if (block.type === 'heading') return (
          <h3 key={i} style={{
            fontSize: '1.1rem', fontWeight: 800, color: 'var(--text)',
            marginTop: '2rem', marginBottom: '0.75rem',
            paddingLeft: '0.9rem', borderLeft: '3px solid #f5a623',
            lineHeight: 1.3,
          }}>{block.text}</h3>
        )
        if (block.type === 'paragraph') return (
          <p key={i} style={{
            fontSize: '0.93rem', lineHeight: 1.85,
            color: 'var(--text-muted)', marginBottom: '1.2rem',
          }}>{block.text}</p>
        )
        if (block.type === 'callout') return (
          <div key={i} style={{
            margin: '1.75rem 0',
            padding: '1.1rem 1.4rem',
            background: 'rgba(245,166,35,0.07)',
            border: '1px solid rgba(245,166,35,0.22)',
            borderLeft: '4px solid #f5a623',
            borderRadius: '0 8px 8px 0',
          }}>
            <p style={{
              fontSize: '0.88rem', lineHeight: 1.75,
              color: 'var(--text)', fontWeight: 500, margin: 0,
            }}>💡 {block.text}</p>
          </div>
        )
        return null
      })}
    </div>
  )
}

// ─── BLOG CARD ────────────────────────────────────────────────
function BlogCard({ post, delay, onOpen }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Reveal delay={delay}>
      <div
        onClick={() => onOpen(post)}
        className="blog-card"
        style={{
          borderTop: hovered ? `3px solid ${post.color}` : '3px solid transparent',
          cursor: 'pointer',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image */}
        <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
          <img src={post.img} alt={post.title} loading="lazy" style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.6s ease',
            transform: hovered ? 'scale(1.07)' : 'scale(1)',
          }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
          <div style={{
            position: 'absolute', top: 12, left: 12,
            background: post.color, color: '#fff',
            fontSize: '0.58rem', fontFamily: 'monospace',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: 3,
          }}>{post.category}</div>
          <div style={{
            position: 'absolute', bottom: 12, right: 12,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '0.62rem', fontFamily: 'monospace',
            letterSpacing: '0.1em', padding: '0.2rem 0.6rem', borderRadius: 20,
          }}>{post.readTime} read</div>
        </div>

        {/* Content */}
        <div style={{ padding: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.62rem', fontFamily: 'monospace', letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{post.date}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border)', display: 'inline-block' }} />
            {post.tags.slice(0, 2).map(tag => (
              <span key={tag} style={{
                fontSize: '0.56rem', fontFamily: 'monospace', letterSpacing: '0.08em',
                textTransform: 'uppercase', padding: '0.15rem 0.5rem',
                background: `${post.color}15`, border: `1px solid ${post.color}30`,
                borderRadius: 3, color: post.color, fontWeight: 600,
              }}>{tag}</span>
            ))}
          </div>
          <h3 style={{
            fontSize: '1rem', fontWeight: 800, lineHeight: 1.35,
            color: hovered ? post.color : 'var(--text)',
            marginBottom: '0.65rem', transition: 'color 0.2s',
          }}>{post.title}</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.2rem' }}>{post.excerpt}</p>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            fontSize: '0.72rem', fontFamily: 'monospace',
            letterSpacing: '0.1em', textTransform: 'uppercase',
            fontWeight: 700, color: hovered ? post.color : 'var(--text-muted)',
            transition: 'color 0.2s',
          }}>
            Read Article
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
              style={{ transform: hovered ? 'translateX(4px)' : 'translateX(0)', transition: 'transform 0.2s' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Reveal>
  )
}

// ─── INLINE ARTICLE VIEW ──────────────────────────────────────
function ArticleView({ post, onClose, allPosts }) {
  const articleRef = useRef(null)

  // Scroll to article top when it opens
  useEffect(() => {
    setTimeout(() => {
      articleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }, [post.id])

  const related = allPosts.filter(p =>
    p.id !== post.id && (p.category === post.category || p.tags.some(t => post.tags.includes(t)))
  ).slice(0, 2)

  return (
    <motion.div
      ref={articleRef}
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{ scrollMarginTop: 80 }}
    >
      {/* ── Hero image banner ── */}
      <div style={{ position: 'relative', height: 'clamp(220px, 35vw, 400px)', borderRadius: 14, overflow: 'hidden', marginBottom: '2.5rem' }}>
        <img src={post.img} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(7,12,20,0.95) 0%, rgba(7,12,20,0.55) 55%, transparent 100%)' }} />

        {/* Back button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, left: 16,
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(7,12,20,0.75)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)',
            padding: '0.45rem 1rem', borderRadius: 7,
            cursor: 'pointer', fontSize: '0.75rem',
            fontFamily: 'monospace', letterSpacing: '0.08em',
            textTransform: 'uppercase', fontWeight: 600,
            transition: 'all .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,166,35,0.2)'; e.currentTarget.style.borderColor = '#f5a623'; e.currentTarget.style.color = '#f5a623' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(7,12,20,0.75)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
        >
          ← All Articles
        </button>

        {/* Title overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.75rem 2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              background: post.color, color: '#fff',
              fontSize: '0.6rem', fontFamily: 'monospace',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              fontWeight: 700, padding: '0.28rem 0.7rem', borderRadius: 3,
            }}>{post.category}</span>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>{post.date}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'inline-block' }} />
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace' }}>{post.readTime} read</span>
          </div>
          <h1 style={{
            fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', fontWeight: 900,
            color: '#fff', lineHeight: 1.2, margin: 0,
          }}>{post.title}</h1>
        </div>
      </div>

      {/* ── Article body ── */}
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <ArticleBody blocks={post.content} />

        {/* Author + CTA */}
        <div style={{
          marginTop: '3rem', padding: '1.5rem',
          background: 'var(--bg-2)', border: '1px solid var(--border)',
          borderRadius: 12, display: 'flex', gap: '1.25rem',
          alignItems: 'center', flexWrap: 'wrap',
        }}>
          <div style={{
            width: 50, height: 50, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg,#f5a623,#e8960f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', fontWeight: 900, color: '#1c2d3f',
          }}>G</div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '0.2rem' }}>Guchi Brown</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              ICT Technician & Software Developer · Meru, Kenya · 5+ years experience
            </div>
          </div>
          <a
            href={`https://wa.me/254790078363?text=Hi Guchi, I read your article "${post.title}" and have a question.`}
            target="_blank" rel="noopener noreferrer"
            style={{
              background: '#25D366', color: '#fff',
              fontWeight: 700, fontSize: '0.78rem',
              padding: '0.6rem 1.25rem', borderRadius: 7,
              textDecoration: 'none', whiteSpace: 'nowrap',
              transition: 'opacity .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            💬 Ask a Question
          </a>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <div style={{
              fontSize: '0.65rem', fontFamily: 'monospace', letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '1.25rem',
            }}>Related Articles</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: '1rem' }}>
              {related.map(p => (
                <div
                  key={p.id}
                  onClick={() => { window.scrollTo(0,0); onClose(); setTimeout(()=>onClose(p), 50) }}
                  style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
                    transition: 'border-color .2s, transform .2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.transform = 'translateY(-3px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ height: 100, overflow: 'hidden' }}>
                    <img src={p.img} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '0.85rem' }}>
                    <div style={{ fontSize: '0.58rem', fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', color: p.color, fontWeight: 700, marginBottom: '0.35rem' }}>{p.category}</div>
                    <p style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.35, margin: 0 }}>{p.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back to list button */}
        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1.5px solid var(--border)',
              color: 'var(--text-muted)', padding: '0.7rem 2rem',
              borderRadius: 8, cursor: 'pointer', fontSize: '0.82rem',
              fontWeight: 600, transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#f5a623'; e.currentTarget.style.color = '#f5a623' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            ← Back to All Articles
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ─── MAIN BLOG PAGE ───────────────────────────────────────────
export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [openPost, setOpenPost] = useState(null)
  const topRef = useRef(null)

  const filtered = POSTS.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory
    const q = search.toLowerCase()
    return matchCat && (!q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)))
  })

  const handleOpen = (post) => {
    setOpenPost(post)
  }

  const handleClose = (nextPost = null) => {
    if (nextPost && nextPost.id) {
      setOpenPost(nextPost)
    } else {
      setOpenPost(null)
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    }
  }

  return (
    <>
      {/* ─── HERO ── */}
      <section style={{ position: 'relative', paddingTop: '70px', minHeight: '360px', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }} />
        <div className="grid-overlay" style={{ zIndex: 2 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,17,40,0.93) 0%, rgba(28,45,63,0.87) 60%, rgba(245,166,35,0.14) 100%)', zIndex: 3 }} />
        <div style={{ position: 'absolute', top: '20%', right: '12%', width: 280, height: 280, background: 'rgba(245,166,35,0.07)', borderRadius: '50%', filter: 'blur(80px)', zIndex: 3 }} />
        <div className="max-w-[1280px] mx-auto px-8 md:px-10 py-20 w-full" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ width: 48, height: 4, background: '#f5a623', borderRadius: 2, marginBottom: '1.2rem' }} />
          <motion.div {...fadeUp(0.1)}>
            <div className="font-mono text-xs tracking-[0.2em] uppercase flex items-center gap-3 mb-4" style={{ color: '#f5a623' }}>
              <span style={{ display: 'block', height: '1px', width: 32, background: '#f5a623' }} />Tips & Insights
            </div>
          </motion.div>
          <motion.div {...fadeUp(0.2)}>
            <div className="text-display-lg font-display" style={{ color: '#ffffff' }}>
              Tech <span style={{ color: '#f5a623' }}>Blog</span>
            </div>
          </motion.div>
          <motion.p {...fadeUp(0.3)} className="text-sm leading-relaxed max-w-md mt-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Practical IT and software tips for small businesses in Kenya — straight from the field.
          </motion.p>
        </div>
      </section>

      {/* ─── FILTERS ── */}
      <section ref={topRef} style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border)', padding: '1.25rem 0', position: 'sticky', top: 70, zIndex: 50 }}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {/* Back pill when reading */}
            {openPost && (
              <button
                onClick={() => handleClose()}
                style={{
                  padding: '0.4rem 0.9rem', borderRadius: 20,
                  border: '1px solid #f5a623', background: 'rgba(245,166,35,0.1)',
                  color: '#f5a623', fontSize: '0.72rem', fontFamily: 'monospace',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  fontWeight: 700, cursor: 'pointer',
                }}
              >
                ← Back to List
              </button>
            )}
            {!openPost && CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.4rem 0.9rem', borderRadius: 20,
                  border: `1px solid ${activeCategory === cat ? '#f5a623' : 'var(--border)'}`,
                  background: activeCategory === cat ? '#f5a623' : 'transparent',
                  color: activeCategory === cat ? '#1c2d3f' : 'var(--text-muted)',
                  fontSize: '0.72rem', fontFamily: 'monospace',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  fontWeight: activeCategory === cat ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}>{cat}</button>
            ))}
            {openPost && (
              <span style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-muted)', alignSelf: 'center', paddingLeft: '0.5rem' }}>
                Reading: <strong style={{ color: 'var(--text)' }}>{openPost.category}</strong>
              </span>
            )}
          </div>
          {!openPost && (
            <input
              type="text" placeholder="🔍  Search articles..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                padding: '0.5rem 1rem', borderRadius: 20,
                border: '1px solid var(--border)',
                background: 'var(--bg-card)', color: 'var(--text)',
                fontSize: '0.82rem', outline: 'none', width: 220,
                transition: 'border-color 0.2s', fontFamily: 'inherit',
              }}
              onFocus={e => e.target.style.borderColor = '#f5a623'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          )}
        </div>
      </section>

      {/* ─── CONTENT AREA ── */}
      <section style={{ background: 'var(--bg)', padding: '4rem 0 6rem' }}>
        <div className="max-w-[1280px] mx-auto px-6 md:px-10">
          <AnimatePresence mode="wait">
            {openPost ? (
              <ArticleView
                key={openPost.id}
                post={openPost}
                onClose={handleClose}
                allPosts={POSTS}
              />
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    <p style={{ fontFamily: 'monospace', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      No articles found for "{search}"
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((post, i) => (
                      <BlogCard key={post.id} post={post} delay={i * 0.08} onOpen={handleOpen} />
                    ))}
                  </div>
                )}

                {/* Newsletter */}
                <Reveal delay={0.2}>
                  <div className="glass-card" style={{ marginTop: '4rem', padding: '2.5rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(245,166,35,0.06), rgba(59,130,246,0.04))' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>📬</div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>
                      Get new articles in your inbox
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                      Practical IT tips for Kenyan businesses — no spam, monthly digest only.
                    </p>
                    <div style={{ display: 'flex', gap: '0.75rem', maxWidth: 420, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <input type="email" placeholder="your@email.com" className="form-input" style={{ flex: 1, minWidth: 220, borderRadius: 6 }} />
                      <button style={{
                        background: '#f5a623', color: '#1c2d3f',
                        border: '2px solid #f5a623', padding: '0.7rem 1.5rem',
                        borderRadius: 6, fontWeight: 700, fontSize: '0.8rem',
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        cursor: 'pointer', fontFamily: 'monospace',
                        transition: 'all 0.2s', whiteSpace: 'nowrap',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f5a623' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f5a623'; e.currentTarget.style.color = '#1c2d3f' }}
                      >Subscribe →</button>
                    </div>
                  </div>
                </Reveal>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </>
  )
}
