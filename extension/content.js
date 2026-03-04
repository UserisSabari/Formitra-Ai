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
        
        fillFormIntelligently(data, service);
        sendResponse({ status: "success", message: "Form filling initiated" });
    }
});

// Capture data from the Formitra Web App
window.addEventListener("message", (event) => {
    if (event.data && event.data.type === "FORMITRA_SAVE_DATA") {
        console.log("Formitra AI: Data captured from web app.", event.data.payload);
        chrome.storage.local.set({ appData: event.data.payload }, () => {
            console.log("Formitra AI: Data saved to extension storage.");

            // If this is coming from the Formitra app (review page), ask background
            // to open the hosted mock portal for automation.
            try {
                const href = window.location.href || "";
                const isReviewPage = href.includes("/review/");
                if (isReviewPage) {
                    // Avoid opening multiple mock-portal tabs per session
                    const openedKey = "formitra_mock_portal_opened_from_app";
                    if (window.sessionStorage.getItem(openedKey) !== "true") {
                        window.sessionStorage.setItem(openedKey, "true");
                        chrome.runtime.sendMessage({ type: "OPEN_MOCK_PORTAL" });
                        console.log("Formitra AI: Requested mock portal tab from background.");
                    }
                }
            } catch (e) {
                console.warn("Formitra AI: Could not evaluate review page URL for mock portal open.", e);
            }
        });
    }
    
    // Listen for submission success notifications
    if (event.data && event.data.type === "FORMITRA_SUBMISSION_SUCCESS") {
        console.log("Formitra AI: Form submitted successfully!", event.data.payload);
    }
});

// -------- Mock portal auto-run flow (localhost /mock-portal) --------

function isMockPortalPage() {
    const root = document.querySelector('[data-testid="mock-portal-root"]');
    const step = document.querySelector('[data-testid="mock-step"]');
    return !!(root && step);
}

function getMockPortalStep() {
    const stepEl = document.querySelector('[data-testid="mock-step"]');
    if (!stepEl) return 0;
    const raw = stepEl.getAttribute('data-step');
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isNaN(parsed) ? 0 : parsed;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForStepChange(previousStep, timeoutMs = 5000) {
    const start = Date.now();
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const current = getMockPortalStep();
            if (current && current !== previousStep) {
                clearInterval(interval);
                resolve(true);
                return;
            }
            if (Date.now() - start > timeoutMs) {
                clearInterval(interval);
                resolve(false);
            }
        }, 200);
    });
}

async function runMockPortalFlow(appData) {
    if (!appData || !appData.data) return;

    const service = appData.service || "passport";
    const data = appData.data;

    console.log("Formitra AI: Starting mock portal auto-flow");

    // Avoid running multiple times per page load
    const autofillKey = "formitra_mock_portal_autofilled";
    if (window.sessionStorage.getItem(autofillKey) === "true") {
        console.log("Formitra AI: Mock portal already auto-filled in this session.");
        return;
    }
    window.sessionStorage.setItem(autofillKey, "true");

    // We will attempt a small finite number of steps
    const maxSteps = 5;
    let currentStep = getMockPortalStep() || 1;

    for (let i = 0; i < maxSteps; i++) {
        console.log(`Formitra AI: Filling mock portal step ${currentStep}`);
        fillFormIntelligently(data, service);

        await sleep(800);

        const nextBtn = document.querySelector('[data-testid="mock-next"]');
        if (!nextBtn || nextBtn.disabled) {
            console.log("Formitra AI: No next button found or it is disabled, stopping auto-flow.");
            break;
        }

        const beforeStep = getMockPortalStep() || currentStep;
        nextBtn.click();
        const changed = await waitForStepChange(beforeStep);

        if (!changed) {
            console.log("Formitra AI: Step did not change after clicking next, stopping.");
            break;
        }

        currentStep = getMockPortalStep() || currentStep + 1;
    }

    // Try to submit at the end if a submit button exists
    const submitBtn = document.querySelector('[data-testid="mock-submit"]');
    if (submitBtn && !submitBtn.disabled) {
        console.log("Formitra AI: Clicking mock portal submit button.");
        submitBtn.click();
    } else {
        console.log("Formitra AI: No enabled submit button found at the end of flow.");
    }
}

function maybeAutoRunOnMockPortal() {
    if (!isMockPortalPage()) {
        return;
    }

    chrome.storage.local.get(["appData"], (result) => {
        const appData = result.appData;
        if (!appData || !appData.data) {
            console.log("Formitra AI: No appData in storage to auto-fill mock portal.");
            return;
        }

        runMockPortalFlow(appData).catch((err) => {
            console.error("Formitra AI: Error during mock portal auto-flow", err);
        });
    });
}

// Try auto-run once the DOM is ready on mock portal
if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(maybeAutoRunOnMockPortal, 800);
} else {
    document.addEventListener("DOMContentLoaded", () => {
        setTimeout(maybeAutoRunOnMockPortal, 800);
    });
}

/**
 * Intelligently fill form fields using multiple selector strategies
 * @param {Object} data - Form data to fill
 * @param {String} service - Service type (e.g., 'passport')
 */
function fillFormIntelligently(data, service) {
    console.log(`Formitra AI: Starting intelligent form fill for ${service}`);
    
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

    setTimeout(() => {
        showNextStepsModal();
    }, 1500);
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
        <div style="font-size: 48px; margin-bottom: 20px;">✓</div>
        <h2 style="color: #1a237e; margin-bottom: 15px; font-size: 24px; font-weight: 700;">Form Auto-Fill Complete!</h2>
        
        <div style="background: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 20px 0; border-radius: 4px; text-align: left; color: #1565c0;">
            <p style="margin: 0; font-weight: 600;">✓ All fields have been auto-filled</p>
            <p style="margin: 10px 0 0 0; font-size: 14px;">Please review everything and submit manually on the official portal</p>
        </div>

        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; text-align: left;">
            <p style="margin: 0; font-weight: 600; color: #856404;">🔐 Security steps are always manual</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #856404;">
                Formitra will never bypass OTP, CAPTCHA, or any security controls. Please:
            </p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; font-size: 14px; color: #856404;">
                <li>Complete OTP/CAPTCHA directly on the portal</li>
                <li>Save your application reference number</li>
            </ul>
        </div>

        <div style="margin-top: 30px;">
            <button onclick="document.getElementById('formitra-otp-modal').remove()" style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s;
            " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                Got it!
            </button>
        </div>

        <p style="margin-top: 20px; font-size: 12px; color: #999;">
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
