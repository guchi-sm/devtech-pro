# DevTech Pro — Personal Professional Website

**ICT Technician & Software Developer** — Targeting small businesses and startups.

## 🗂 Project Structure

```
devtech-pro/
├── frontend/          # React + Tailwind CSS + Vite
└── backend/           # Node.js + Express REST API
```

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env        # Fill in your values
npm run dev                 # Starts on http://localhost:5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev                 # Starts on http://localhost:5173
```

## 🛠 Tech Stack

| Layer      | Technology                     |
|------------|-------------------------------|
| Frontend   | React 18, React Router DOM    |
| Styling    | Tailwind CSS v3               |
| Animation  | Framer Motion                 |
| Bundler    | Vite                          |
| Backend    | Node.js, Express              |
| Validation | express-validator             |
| Email      | Nodemailer                    |
| Env        | dotenv                        |

## 🌗 Theme System
- Defaults to OS `prefers-color-scheme`
- Persisted to `localStorage`
- CSS custom properties controlled via `dark` class on `<html>`
- Zero flicker, zero reload

## 📁 Pages
1. **Home** — Hero, services preview, stats, CTA
2. **About** — Bio, animated skill bars, mission
3. **Services** — Accordion service blocks
4. **Portfolio** — Project cards with tech photos
5. **Contact** — Form with validation → Express API

## 🚀 Production Build

```bash
# Frontend
cd frontend && npm run build

# Backend (using PM2)
cd backend && pm install -g pm2 && pm2 start src/server.js --name devtech-api
```

