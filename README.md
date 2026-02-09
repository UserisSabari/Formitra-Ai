# Formitra AI - Government Forms Made Simple

AI-powered form automation for Indian government services. Complete any government form in under 3 minutes with intelligent auto-fill and submission.

## 🚀 Features

- **Auto-Fill Forms** - Intelligent field detection and auto-fill
- **One-Click Submit** - Automatic form submission
- **36 States Supported** - All Indian states and union territories
- **Secure & Private** - Data stored locally, no external API calls
- **Multiple Services** - Passport, Income Certificate, Domicile, Driving License, Ration Card, Birth Certificate

## 📁 Project Structure

```
Formitra-Ai/
├── client/          # React web application
├── extension/       # Chrome extension for auto-fill
├── server/          # Express API server
└── docs/           # Documentation files
```

## 🛠️ Setup

### Prerequisites
- Node.js 18+ and npm
- Chrome browser (for extension)

### Client (Web App)
```bash
cd client
npm install
npm run dev
```
Opens at `http://localhost:5173`

### Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` folder

### Server (Optional)
```bash
cd server
npm install
npm start
```

## 📚 Documentation

- [START_HERE.md](START_HERE.md) - Quick start guide
- [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) - Complete documentation index
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Setup and testing guide
- [PROJECT_COMPLETION_REPORT.md](PROJECT_COMPLETION_REPORT.md) - Project overview

## ☁️ Deploy to Vercel

The repo is set up to deploy from the **repository root** (no dashboard change needed):

1. Push your code to GitHub and import the repo in [Vercel](https://vercel.com).
2. Leave **Root Directory** empty (default).
3. Vercel will use the root `vercel.json` to run `cd client && npm install` and `cd client && npm run build`, and serve `client/dist`.
4. Redeploy after pushing.

**If the site still doesn’t load:**

- In Vercel → Project → **Settings** → **Build & Development**:
  - Set **Root Directory** to `client`.
  - **Build Command:** `npm run build`
  - **Output Directory:** `dist`
- Save and trigger a new deployment.

SPA routing is handled by rewrites (all routes → `/index.html`).

## 🎯 Current Status

- ✅ Passport Services - Fully functional
- 🚧 Other Services - Coming soon

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please read the documentation before contributing.
