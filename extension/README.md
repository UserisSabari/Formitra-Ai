Formitra AI Chrome Extension
============================

This folder contains the **Formitra AI Assistant** Chrome extension. It connects the Formitra web app to government / mock portals and automates safe, repeatable form filling.

Overview
--------

- **Popup (`popup.html` + `popup.js`)**
  - Lets the user:
    - Import structured application data from the Formitra web app tab.
    - See which service/state is loaded and how many fields are available.
    - Trigger form filling on the current portal tab.
    - Clear the saved dataset.
- **Content script (`content.js`)**
  - Injected into:
    - `*.passportindia.gov.in`
    - `http://localhost:5173/*` (local dev)
    - `https://formitra-ai.vercel.app/*` (hosted mock portal)
  - Responsibilities:
    - Listen for `FORMITRA_SAVE_DATA` messages from the Formitra client and persist `appData` to `chrome.storage.local`.
    - When asked via `FILL_FORM`, locate matching fields using `FIELD_SELECTORS` and fill them in a framework‑friendly way (input/change/blur events).
    - On the mock portal, drive a **multi‑step demo flow**:
      - Start after the login/account step (user must still log in manually).
      - Auto‑fill known fields from Formitra data.
      - Backfill remaining required fields with neutral demo values (mock portal only).
      - Click **Next** and finally **Submit** when available.
- **Background service worker (`background.js`)**
  - Reacts to `OPEN_MOCK_PORTAL` messages from the content script.
  - Opens `https://formitra-ai.vercel.app/mock-portal` in a new tab so the auto‑driver can run.
- **Manifest (`manifest.json`)**
  - Declares permissions: `activeTab`, `scripting`, `storage`, `tabs`.
  - Registers popup, background service worker, and content script targets.

Development workflow
--------------------

1. **Load the extension in Chrome**
   - Go to `chrome://extensions`.
   - Enable **Developer mode**.
   - Click **Load unpacked** and select the `extension/` folder.

2. **Run the Formitra web app**
   - From the `client/` folder, run `npm run dev` to start the Vite dev server.
   - Complete the passport form flow until the **Review** screen and click **Proceed to Portal**.
   - This sends data to the extension and can also open the hosted mock portal.

3. **Use the extension**
   - On the Formitra tab, open the extension popup and click **Import from this tab** once.
   - On the official or mock portal tab, open the popup and click **Fill Application**.
   - On `https://formitra-ai.vercel.app/mock-portal`, the content script will:
     - Auto‑fill as many fields as possible using real data.
     - Fill remaining required fields with demo values.
     - Drive the stepper and submit for an end‑to‑end demo.

Security & safety
-----------------

- The extension is designed **not to bypass security controls**:
  - It does **not** attempt to break OTPs, CAPTCHAs, or login flows.
  - Login / account creation on any portal remains manual.
- Full end‑to‑end multi‑step automation is only enabled on the **mock portal**, which is under our control and safe for demos.

