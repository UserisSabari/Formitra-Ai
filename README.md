# Formitra AI - Government Forms Made Simple

AI-powered form automation for Indian government services. Complete any government form in under 3 minutes with intelligent auto-fill and submission.

## 🚀 Features

- **Auto-Fill Forms** - Intelligent field detection and auto-fill
- **Assisted Submission** - Helps you fill faster; you review and submit manually
- **36 States Supported** - All Indian states and union territories
- **Secure & Private by default** - Application data is stored locally in your browser; if you run AI document verification, your uploaded documents are sent to the Formitra backend which calls Gemini for analysis
- **Multiple Services** - Passport, Income Certificate, Domicile, Driving License, Ration Card, Birth Certificate

## 📁 Project Structure

```
Formitra-Ai/
├── client/          # React web application
├── extension/       # Chrome extension for auto-fill
├── server/          # Express API server
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

Create `server/.env`:

```bash
GEMINI_API_KEY=your_key_here
```

### Configure AI backend URL (Client)

By default, the client calls the deployed backend. To point the client at a different backend, set:

```bash
VITE_AI_API_BASE_URL=http://localhost:5000
```

## 📚 Documentation

Documentation files are being consolidated (coming soon).

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
