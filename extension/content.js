// content.js - Intelligent form filler (no auto-submit)
// This script runs on government portals (e.g., passportindia.gov.in, mock portals)

console.log("Formitra AI Assistant: Loaded on portal.");

// Field selector mappings for intelligent field detection
const FIELD_SELECTORS = {
    firstName: ['#givenName', 'input[name="givenName"]', 'input[placeholder*="first name" i]', 'input[placeholder*="given name" i]'],
    lastName: ['#surname', '#lastName', 'input[name="surname"]', 'input[name="lastName"]', 'input[placeholder*="last name" i]'],
    fatherName: ['#fatherName', '#fathersName', 'input[name="fatherName"]', 'input[placeholder*="father" i]'],
    email: ['#email', '#emailAddress', 'input[name="email"]', 'input[type="email"]', 'input[placeholder*="email" i]'],
    mobile: ['#mobile', '#mobileNumber', '#phone', 'input[name="mobile"]', 'input[name="phone"]', 'input[type="tel"]', 'input[placeholder*="mobile" i]'],
    dob: ['#dob', '#dateOfBirth', 'input[name="dob"]', 'input[name="dateOfBirth"]', 'input[type="date"]', 'input[placeholder*="date of birth" i]'],
    gender: ['#gender', '#sex', 'select[name="gender"]', 'select[name="sex"]', 'input[name="gender"]'],
    maritalStatus: ['#maritalStatus', '#maritalStatuses', 'select[name="maritalStatus"]', 'input[name="maritalStatus"]', 'input[placeholder*="marital" i]'],
    address: ['#address', '#fullAddress', 'textarea[name="address"]', 'input[name="address"]', 'input[placeholder*="address" i]'],
    city: ['#city', '#cityName', 'input[name="city"]', 'input[placeholder*="city" i]'],
    pincode: ['#pincode', '#zipcode', '#postalCode', 'input[name="pincode"]', 'input[name="zipcode"]', 'input[placeholder*="pin" i]'],
    state: ['#state', '#stateCode', 'select[name="state"]', 'input[name="state"]', 'input[placeholder*="state" i]'],
    passportType: ['#passportType', '#type', 'select[name="passportType"]', 'input[name="passportType"]'],
    occupation: ['#occupation', 'input[name="occupation"]', 'input[placeholder*="occupation" i]'],
    oldPassportNumber: ['#oldPassportNumber', '#previousPassport', 'input[name="oldPassportNumber"]', 'input[placeholder*="old passport" i]']
};

// Listen for a "Fill Form" request from the extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "FILL_FORM") {
        console.log("Formitra AI: Received fill form request", request.data);
        const data = request.data;
        const service = request.service || 'passport';
        const files = request.files || [];
        
        // Acknowledge receipt immediately
        sendResponse({ status: "success", message: "Form filling initiated" });
        
        try {
            // Initiate Full Automation Engine
            window.sessionStorage.setItem('formitra_auto_mode', JSON.stringify({ data, service, files }));
            runAutomationTick(data, service, files);
        } catch (e) {
            console.error("Formitra AI Injection Error:", e);
        }
    }
});

// Capture data from the Formitra Web App
window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "FORMITRA_SAVE_DATA") {
        console.log("Formitra AI: Data captured from web app.", event.data.payload);
        chrome.storage.local.set({ appData: event.data.payload }, () => {
            console.log("Formitra AI: Data saved to extension storage.");
        });
    }
    
    // Listen for submission success notifications
    if (event.data && event.data.type === "FORMITRA_SUBMISSION_SUCCESS") {
        console.log("Formitra AI: Form submitted successfully!", event.data.payload);
    }
});

// -------- Universal Automation Engine (Multi-Step & Single Page) --------

function checkAutomationBoot() {
    const autoState = window.sessionStorage.getItem('formitra_auto_mode');
    if (autoState) {
        console.log("Formitra AI: Resuming full automation from session state...");
        try {
            const parsed = JSON.parse(autoState);
            setTimeout(() => runAutomationTick(parsed.data, parsed.service, parsed.files), 500);
        } catch(e) {}
    }
}

async function runAutomationTick(data, service, files) {
    if (!document.body) return;
    console.log("Formitra AI: Running automation tick...");

    // Fill the current visible fields
    fillFormIntelligently(data, service, files, true);

    // Backfill empty required fields with demo data to pass strict frontend validation
    backfillDemoData();

    // Give DOM time to react to injected events (e.g., React state updates)
    await sleep(800);

    // Attempt to locate navigational buttons based on generic text heuristics
    const submitBtn = findNavigationButton(['submit', 'review', 'finish', 'complete']);
    
    // If we're on the final submission page, Stop the engine!
    if (submitBtn) {
        console.log("Formitra AI: Reached terminal/submit step. Halting Engine.");
        window.sessionStorage.removeItem('formitra_auto_mode');
        setTimeout(() => showNextStepsModal(), 500);
        return;
    }

    const nextBtn = findNavigationButton(['next', 'continue', 'proceed', 'save & next']);
    
    if (nextBtn) {
        console.log("Formitra AI: Auto-clicking Next button...");
        
        // SPA Observer: Watch for DOM mutations indicating a step change WITHOUT a hard reload
        let changed = false;
        const observer = new MutationObserver(() => {
            changed = true;
            observer.disconnect();
            console.log("Formitra AI: SPA step transition detected.");
            setTimeout(() => runAutomationTick(data, service, files), 800);
        });
        
        // Start observing immediately before click
        observer.observe(document.body, { childList: true, subtree: true });

        nextBtn.click();
        
        // Clean up observer if it's just a dead click
        setTimeout(() => {
            if (!changed) {
                observer.disconnect();
                console.log("Formitra AI: No DOM change after click. Engine waiting/Paused.");
                window.sessionStorage.removeItem('formitra_auto_mode');
                window.sessionStorage.setItem('formitra_engine_paused', 'true');
                refreshFloatingWidget({data, service, files});
            }
        }, 4000);
        
        // Note: If the click triggers a HARD redirect (page reload), the observer dies,
        // but the engine will resurrect seamlessly on the next page via checkAutomationBoot()!
    } else {
        console.log("Formitra AI: No navigation buttons detected. Engine Paused (Captcha/Manual).");
        window.sessionStorage.removeItem('formitra_auto_mode');
        window.sessionStorage.setItem('formitra_engine_paused', 'true');
        refreshFloatingWidget({data, service, files});
    }
}

function findNavigationButton(keywords) {
    // Specifically target our React Mock Portal buttons first for flawless demos
    if (keywords.includes('next')) {
        const mock = document.querySelector('[data-testid="mock-next"]');
        if (mock && !mock.disabled) return mock;
    }
    if (keywords.includes('submit')) {
        const mock = document.querySelector('[data-testid="mock-submit"]');
        if (mock && !mock.disabled) return mock;
    }

    // Generic selector approach for wild government websites
    const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], a.btn, a.button'));
    for (const btn of buttons) {
        if (btn.disabled) continue;
        if (btn.offsetParent === null) continue; // Check if element is visually hidden
        
        const text = (btn.innerText || btn.value || btn.textContent || '').toLowerCase().trim();
        // Avoid clicking structural buttons arbitrarily
        if (!text || text.length > 30) continue; 

        // Exact match or contains
        if (keywords.some(k => text === k || text.startsWith(k) || text.endsWith(k))) {
            return btn;
        }
    }
    return null;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Global Engine Boot Listener
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(() => {
        checkAutomationBoot();
        injectFloatingControlWidget();
    }, 600);
} else {
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(() => {
            checkAutomationBoot();
            injectFloatingControlWidget();
        }, 600);
    });
}

// -------- Floating UX Control Widget --------

function injectFloatingControlWidget() {
    // Prevent widget from bleeding onto irrelevant websites (YouTube, Google, etc)
    const activeDomain = window.location.hostname.toLowerCase();
    const isApprovedDomain = ['gov.in', 'localhost', '127.0', 'vercel.app', 'formitra'].some(d => activeDomain.includes(d));
    if (!isApprovedDomain) return;

    chrome.storage.local.get(['appData'], (result) => {
        if (!result.appData || !result.appData.data) return;
        
        if (document.getElementById('formitra-floating-widget')) return;

        const widget = document.createElement('div');
        widget.id = 'formitra-floating-widget';
        widget.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #0f172a;
            color: white;
            padding: 12px 18px;
            border-radius: 10px;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.4);
            z-index: 2147483647; /* max z-index */
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            gap: 12px;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            user-select: none;
            border: 1px solid rgba(255,255,255,0.1);
        `;

        // Keyframes for animations
        if (!document.getElementById('fm-keyframes')) {
            const style = document.createElement('style');
            style.id = 'fm-keyframes';
            style.innerHTML = '@keyframes fm-pulse { 0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); } 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); } }';
            document.head.appendChild(style);
        }

        document.body.appendChild(widget);
        updateWidgetState(widget, result.appData);
    });
}

function refreshFloatingWidget(fallbackAppData) {
    chrome.storage.local.get(['appData'], (result) => {
        const dataToUse = (result.appData && result.appData.data) ? result.appData : fallbackAppData;
        const widget = document.getElementById('formitra-floating-widget');
        if (widget && dataToUse) {
            updateWidgetState(widget, dataToUse);
        } else if (!widget && dataToUse) {
            injectFloatingControlWidget();
        }
    });
}

function updateWidgetState(widgetEl, appData) {
    const isRunning = !!window.sessionStorage.getItem('formitra_auto_mode');
    const isPaused = !!window.sessionStorage.getItem('formitra_engine_paused');

    if (isRunning) {
        widgetEl.innerHTML = `
            <div style="width:10px; height:10px; border-radius:50%; background:#22c55e; animation: fm-pulse 1.5s infinite;"></div>
            <span style="font-weight:600; font-size:14px; letter-spacing:0.3px;">Engine Running</span>
            <button id="fm-widget-pause" style="background:transparent; border:1px solid rgba(255,255,255,0.2); color:white; padding:4px 10px; border-radius:6px; cursor:pointer; font-size:12px; margin-left:4px; font-weight:600;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='transparent'">Stop</button>
        `;
        widgetEl.querySelector('#fm-widget-pause').addEventListener('click', () => {
             window.sessionStorage.removeItem('formitra_auto_mode');
             updateWidgetState(widgetEl, appData);
        });
    } else if (isPaused) {
        // Paused state (awaiting Captcha etc)
        widgetEl.innerHTML = `
            <div style="width:10px; height:10px; border-radius:50%; background:#f59e0b;"></div>
            <span style="font-weight:600; font-size:14px; color:#fcd34d;">Paused (Await Captcha)</span>
            <button id="fm-widget-resume" style="background:#2563eb; border:none; color:white; padding:5px 12px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px; box-shadow:0 2px 4px rgba(37,99,235,0.4);" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">Resume</button>
        `;
        widgetEl.querySelector('#fm-widget-resume').addEventListener('click', () => {
             window.sessionStorage.removeItem('formitra_engine_paused');
             window.sessionStorage.setItem('formitra_auto_mode', JSON.stringify(appData));
             updateWidgetState(widgetEl, appData);
             runAutomationTick(appData.data, appData.service, appData.files);
        });
    } else {
        // Idle state
        widgetEl.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span style="font-weight:600; font-size:14px;">Formitra Ready</span>
            <button id="fm-widget-start" style="background:#2563eb; border:none; color:white; padding:5px 12px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px; box-shadow:0 2px 4px rgba(37,99,235,0.4);" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">▶ Auto-Fill</button>
        `;
        widgetEl.querySelector('#fm-widget-start').addEventListener('click', () => {
             window.sessionStorage.removeItem('formitra_engine_paused');
             window.sessionStorage.setItem('formitra_auto_mode', JSON.stringify(appData));
             updateWidgetState(widgetEl, appData);
             runAutomationTick(appData.data, appData.service, appData.files);
        });
    }
}

/**
 * Intelligently fill form fields using multiple selector strategies
 * @param {Object} data - Form data to fill
 * @param {String} service - Service type (e.g., 'passport')
 * @param {Array} files - Array of attached file objects
 * @param {Boolean} isAutoMode - Whether running under the automation engine
 */
function fillFormIntelligently(data, service, files = [], isAutoMode = false) {
    console.log(`Formitra AI: Starting intelligent form fill for ${service}`);
    
    // Show top-right visual feedback
    const toast = document.createElement('div');
    toast.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg> Formitra AI is bridging data...`;
    toast.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #0f172a; color: white; padding: 10px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; font-family: sans-serif; z-index: 99999; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 8px; transition: opacity 0.3s; pointer-events: none;';
    const styleBlock = document.createElement('style');
    styleBlock.innerHTML = '@keyframes spin { 100% { transform: rotate(360deg); } }';
    document.head.appendChild(styleBlock);
    document.body.appendChild(toast);

    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2000);

    let filledCount = 0;
    let totalCount = Object.keys(data).length;

    // Iterate through each data field
    for (const [dataKey, dataValue] of Object.entries(data)) {
        if (!dataValue || dataValue === '') continue; // Skip empty values

        // Get selectors for this field
        const selectors = FIELD_SELECTORS[dataKey] || [];
        if (selectors.length === 0) {
            console.warn(`Formitra AI: No selectors found for field ${dataKey}`);
            continue;
        }

        // Try each selector until one matches
        let fieldFilled = false;
        for (const selector of selectors) {
            const element = findElement(selector);
            if (element) {
                fillElement(element, dataValue, dataKey);
                filledCount++;
                fieldFilled = true;
                console.log(`Formitra AI: ✓ Filled ${dataKey} using selector: ${selector}`);
                break;
            }
        }

        if (!fieldFilled) {
            console.warn(`Formitra AI: Could not find element for ${dataKey}`);
        }
    }

    console.log(`Formitra AI: Filled ${filledCount}/${totalCount} fields`);

    // Auto-fill File Attachments if provided
    if (files && files.length > 0) {
        const fileInputs = Array.from(document.querySelectorAll('input[type="file"]'));
        if (fileInputs.length > 0) {
            console.log(`Formitra AI: Auto-filling ${files.length} documents...`);
            let fileIndex = 0;
            fileInputs.forEach(input => {
                if (!input.classList.contains('formitra-filled')) {
                    const fileObj = files[fileIndex % files.length];
                    fillFileInput(input, fileObj);
                    fileIndex++;
                }
            });
        }
    }

    if (!isAutoMode) {
        setTimeout(() => {
            showNextStepsModal();
        }, 1500);
    }
}

/**
 * Automagically backfill demo data to any required empty fields (Mock Portal only)
 */
function backfillDemoData() {
    const requiredInputs = document.querySelectorAll('input[required], select[required]');
    requiredInputs.forEach(el => {
        // Skip if already filled
        if (el.classList.contains('formitra-filled')) return;
        if (el.value !== '' && el.type !== 'radio' && el.type !== 'checkbox') return;
        
        const type = (el.type || '').toLowerCase();
        if (el.tagName.toLowerCase() === 'select') {
            // Pick secondary option, to avoid picking a default disabled placeholder
            const validOptions = Array.from(el.options).filter(o => o.value !== '');
            if (validOptions.length > 0) {
                fillElement(el, validOptions[0].value, el.name);
            }
        } else if (type === 'radio') {
            // If group has no checked, click the first one
            const group = document.querySelectorAll(`input[name="${el.name}"]`);
            const isChecked = Array.from(group).some(r => r.checked);
            if (!isChecked) {
                el.checked = true;
                el.classList.add('formitra-filled');
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        } else if (type === 'date') {
            fillElement(el, '2000-01-01', el.name);
        } else {
            fillElement(el, 'Demo Value', el.name);
        }
        console.log(`Formitra AI: Demo backfilled -> ${el.name}`);
    });
}

/**
 * Auto fill file inputs using DataTransfer to convert Base64 back to File objects
 */
function fillFileInput(input, fileObj) {
    if (!fileObj.base64) return;
    try {
        const byteString = atob(fileObj.base64.split(',')[1]);
        const mimeString = fileObj.base64.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        const file = new File([blob], fileObj.name, { type: mimeString });
        const dt = new DataTransfer();
        dt.items.add(file);
        input.files = dt.files;
        input.classList.add('formitra-filled');
        
        // Visual Field Highlighting
        const originalBg = input.style.backgroundColor;
        const originalTransition = input.style.transition;
        input.style.transition = 'background-color 0.4s ease';
        input.style.backgroundColor = '#dcfce3'; // Emerald 100
        setTimeout(() => {
            input.style.backgroundColor = originalBg;
            setTimeout(() => { input.style.transition = originalTransition; }, 400);
        }, 800);

        input.dispatchEvent(new Event('change', { bubbles: true }));
        console.log(`Formitra AI: ✓ Attached ${fileObj.name} to file input`);
    } catch (e) {
        console.error('Formitra AI: Error attaching file:', e);
    }
}

/**
 * Find element using a selector string (supports #id and querySelector syntax)
 * @param {String} selector - CSS selector
 * @returns {Element|null}
 */
function findElement(selector) {
    if (selector.startsWith('#')) {
        // Direct ID lookup (fastest)
        return document.getElementById(selector.substring(1));
    }
    // CSS selector lookup
    return document.querySelector(selector);
}

/**
 * Fill an element with value and trigger change events
 * @param {Element} element - DOM element to fill
 * @param {*} value - Value to fill
 * @param {String} fieldName - Field name for logging
 */
function fillElement(element, value, fieldName) {
    const tagName = element.tagName.toLowerCase();
    const type = element.type ? element.type.toLowerCase() : '';

    // Special handling for different input types
    if (tagName === 'select') {
        // For select dropdowns, match option value
        const option = Array.from(element.options).find(opt => opt.value === value);
        if (option) {
            element.value = value;
        } else {
            // Try partial match if exact match fails
            const partialOption = Array.from(element.options).find(opt => 
                opt.textContent.toLowerCase().includes(value.toLowerCase())
            );
            if (partialOption) {
                element.value = partialOption.value;
            }
        }
    } else if (type === 'date') {
        // Format date for date inputs (YYYY-MM-DD)
        if (value && value.length > 0) {
            element.value = formatDateForInput(value);
        }
    } else if (type === 'tel' || type === 'number') {
        // For numeric fields, remove non-digits
        element.value = String(value).replace(/\D/g, '');
    } else {
        // Text, email, textarea, etc.
        element.value = String(value);
    }

    // Mark element as filled
    element.classList.add('formitra-filled');

    // Visual Field Highlighting
    const originalBg = element.style.backgroundColor;
    const originalTransition = element.style.transition;
    element.style.transition = 'background-color 0.4s ease';
    element.style.backgroundColor = '#dcfce3'; // Emerald 100
    setTimeout(() => {
        element.style.backgroundColor = originalBg;
        setTimeout(() => { element.style.transition = originalTransition; }, 400);
    }, 800);

    // Trigger change events for framework compatibility
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));

    // Also trigger on-change handlers if any
    if (element.onchange) {
        element.onchange();
    }
}

/**
 * Format date for HTML date input (YYYY-MM-DD)
 * @param {String} dateStr - Date string in various formats
 * @returns {String} - Formatted date
 */
function formatDateForInput(dateStr) {
    if (!dateStr) return '';
    
    // If already in YYYY-MM-DD format, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }

    // Try to parse common date formats
    let date;
    
    // Try parsing as is
    date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
        // Try DD-MM-YYYY format (common in India)
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            date = new Date(parts[2], parts[1] - 1, parts[0]);
        }
    }

    if (isNaN(date.getTime())) {
        console.warn(`Formitra AI: Could not parse date: ${dateStr}`);
        return dateStr;
    }

    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

/**
 * Show next-steps modal.
 */
function showNextStepsModal() {
    // Check if modal already exists
    if (document.getElementById('formitra-otp-modal')) {
        return;
    }

    const modal = document.createElement('div');
    modal.id = 'formitra-otp-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        border-radius: 12px;
        padding: 40px;
        max-width: 500px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        text-align: center;
    `;

    modalContent.innerHTML = `
        <div style="font-size: 40px; margin-bottom: 20px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <h2 style="color: #0f172a; margin-bottom: 15px; font-size: 20px; font-weight: 700;">Data Injection Complete</h2>
        
        <div style="background: #f8fafc; border-left: 4px solid #0ea5e9; padding: 15px; margin: 20px 0; border-radius: 4px; text-align: left; color: #0f172a;">
            <p style="margin: 0; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Payload mapping successful
            </p>
            <p style="margin: 10px 0 0 0; font-size: 13px; color: #475569;">Please review the injected data block. Manual security verification is required to proceed.</p>
        </div>

        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; text-align: left;">
            <p style="margin: 0; font-weight: 600; color: #92400e; display: flex; align-items: center; gap: 8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Protocol Restriction Notice
            </p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #856404;">
                Formitra will never bypass OTP, CAPTCHA, or any security controls. Please:
            </p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px; color: #856404;">
                <li>Resolve all CAPTCHA/OTP challenges locally.</li>
                <li>Archive your generated reference code safely.</li>
            </ul>
        </div>

        <div style="margin-top: 30px;">
            <button onclick="document.getElementById('formitra-otp-modal').remove()" style="
                background-color: #0f172a;
                color: white;
                border: 1px solid #0f172a;
                padding: 10px 24px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: background-color 0.15s;
            " onmouseover="this.style.backgroundColor='#1e293b'" onmouseout="this.style.backgroundColor='#0f172a'">
                Acknowledge & Close
            </button>
        </div>

        <p style="margin-top: 24px; font-size: 11px; color: #94a3b8; font-weight: 500;">
            Powered by Formitra AI
        </p>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    console.log("Formitra AI: Next-steps modal shown");
}
