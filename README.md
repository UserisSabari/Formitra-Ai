# 🏛️ Formitra AI
**Government Forms Made Simple, Fast, and Flawless.**

Formitra AI is a next-generation automation ecosystem designed to eliminate the friction, errors, and sheer time sink of applying for Indian government services. By combining localized edge-compute, cloud Vision AI, and a specialized Chrome Automation Extension, Formitra transforms grueling, hour-long bureaucratic chores into a seamless 3-minute click-through experience.

---

## 🎯 Project Objectives & Achievements
*   **Objective 1: Eliminate Manual Data Entry**
    *   *Achievement:* Built an intelligent extraction pipeline that reads unstructured ID documents (Aadhaar, PAN) and maps them to strict government schemas almost instantaneously using LLM Vision mapping.
*   **Objective 2: Enforce Zero-Leak Privacy Infrastructure**
    *   *Achievement:* Implemented Local WebAssembly (WASM) image processing. Features like background removal and passport photo standardization execute entirely within the user's browser CPU—preventing sensitive biometric photos from ever leaving the local machine.
*   **Objective 3: Bridge the Legacy Gap**
    *   *Achievement:* Engineered a cross-origin Chrome Extension bridge. It listens for payload dispatches from the modern React app and automatically DOM-injects the data sequentially into legacy `.gov.in` sites, requiring zero un-authorized API access.
*   **Objective 4: Enterprise-Grade B2B Aesthetics**
    *   *Achievement:* Designed a deeply interactive, responsive UI powered by native Tailwind CSS v4, featuring glassmorphic overlays, advanced hover physics, and strict, accessible design tokens.

---

## 🏗️ Core Architecture & Folders

The ecosystem relies on three distinct layers working in harmony:

### 1. The Client Application (`/client`)
*The gorgeous, user-facing portal where citizens select services, upload documents, and verify AI-extracted data.*
*   **Core Tech:** React 19, Vite 7, React Router DOM.
*   **Styling & UI:** Tailwind CSS v4, Framer Motion, Lucide React icons.
*   **Key Innovation:** Utilizes local Web Workers via `@imgly/background-removal`. If a user uploads a casual selfie, the React app instantly strips the background and converts it to a government-compliant white-background passport photo locally.

### 2. The Intelligence Server (`/server`)
*A lightweight, high-performance REST API acting as the intelligence broker.*
*   **Core Tech:** Node.js, Express, Multer.
*   **AI Integration:** Google GenAI SDK (`gemini-1.5-pro`).
*   **Key Innovation:** Zero-disk-storage pipelines. User documents are held strictly in RAM (`multer.memoryStorage()`), streamed to the Gemini Vision API for semantic extraction, mapped into the required `formitra_form_data` JSON schema, and immediately purged from memory.

### 3. The Automation Extension (`/extension`)
*The robotic automation bridge navigating legacy `.gov` domains.*
*   **Core Tech:** Vanilla JavaScript, Chrome Manifest V3 APIs.
*   **Key Innovation:** Uses an asynchronous `content.js` listener and `background.js` service worker. It detects "Submit Application" broadcasts from `localhost:5173`, navigates to the target government URL, and executes localized scripts to rapidly type, click, and populate the applicant's data flawlessly.

---

## 🔄 The Ecosystem Workflow

1.  **Service Selection:** User visits the robust Formitra landing page and selects a service pipeline (e.g., *Passport Services* \> *Tamil Nadu*).
2.  **Smart Document Ingestion:** 
    *   User uploads supporting documents (Aadhaar, PAN, Photo) into the "AI Intake Enabled" drop-zone. 
    *   The local React WASM engine optionally cleans and standardizes the photographs.
3.  **Vision AI Extraction:** 
    *   Encrypted files are sent to the Express server. 
    *   Gemini 1.5 Pro visually scans the documents, extracting deeply nested and unstructured data (DOB, full formatted address, IDs) into strict application schemas.
4.  **Verification & Validation:** The user reviews the auto-filled form in the React application. The UI enforces strict regex validation to ensure data won't be rejected by the government site.
5.  **Extension Hand-off (DOM Injection):** 
    *   Upon confirmation, the React app stores the payload securely in local storage and triggers the Chrome Extension.
    *   The extension hijacks the operation, opens the corresponding `passportindia.gov.in` URL, and sequentially injects the payload into the archaic DOM forms in seconds.

---

## 🛠️ Full Technology Stack

**Frontend Client:**
*   `react` ^19.0.0 (DOM Architecture)
*   `@tailwindcss/postcss` & `tailwindcss` ^4.1.18 (Next-Gen Styling Engine)
*   `framer-motion` (Fluid Physics Animations)
*   `@imgly/background-removal` (Local Machine Learning execution)
*   `browser-image-compression` (Pre-flight optimization)

**Backend API:**
*   `express` (Network Routing)
*   `multer` (Multipart/form-data RAM streams)
*   `@google/genai` (LLM Vision Models)
*   `dotenv` (Environment management)

**Browser Automation:**
*   Chrome Extension APIs (Manifest V3, Service Workers, Script Injection)

---

## 🚀 Presentation Runbook (How to Demo)

**1. Boot the Server:**
```bash
cd server
npm install
# Ensure .env contains GEMINI_API_KEY=your_key_here
node server.js
# API running on Port 3000
```

**2. Boot the Client:**
```bash
cd client
npm install
npm run dev
# Portal running on http://localhost:5173
```

**3. Install the Brain (Extension):**
*   Open Google Chrome \> Navigate to `chrome://extensions/`
*   Enable **Developer Mode** (toggle top right).
*   Click **Load Unpacked** and select the `/extension` directory inside this project.

**Demo Flow:**
1. Open `http://localhost:5173`.
2. Click "Get Started" and select **Passport Services**.
3. Upload an ID card. Watch the AI Extraction spinner.
4. Review the perfectly auto-filled form.
5. Click **"Auto Fill via Formitra Extension"** and watch the magic happen on the government portal.

---
*Formitra AI — Architected for speed, built for precision, and designed to redefine Indian citizen-government interactions.*
