// background.js - Manages messaging between the web app and content script

chrome.runtime.onInstalled.addListener(() => {
    console.log("Formitra AI Assistant: Background installed.");
});

// Receive data from external pages (if we ever use an external bridge)
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    if (request.data) {
        chrome.storage.local.set({ appData: request.data }, () => {
            console.log("Formitra AI: Data saved to extension storage (external).");
            sendResponse({ success: true });
        });
    }
});

// Internal messages from content scripts / popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request?.type === "OPEN_MOCK_PORTAL") {
        // Open the hosted mock portal where automation runs end‑to‑end
        chrome.tabs.create(
            {
                url: "https://formitra-ai.vercel.app/mock-portal",
                active: true,
            },
            () => {
                if (chrome.runtime.lastError) {
                    console.error("Formitra AI: Failed to open mock portal", chrome.runtime.lastError);
                } else {
                    console.log("Formitra AI: Mock portal tab opened.");
                }
                sendResponse({ ok: !chrome.runtime.lastError });
            }
        );

        // Indicate we will respond asynchronously
        return true;
    }

    return false;
});
