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

// Listen for global keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
    if (command === "trigger-autofill") {
        console.log("Formitra AI: Keyboard shortcut triggered!");
        chrome.storage.local.get(['appData'], (result) => {
            const appData = result.appData;
            if (!appData || !appData.data) {
                console.log("Formitra AI: No data to auto-fill.");
                return;
            }

            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length === 0) return;
                
                // Send standard message to content script
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "FILL_FORM",
                    data: appData.data,
                    service: appData.service,
                    files: appData.files || []
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('Error:', chrome.runtime.lastError);
                    } else {
                        console.log('Form filling started via shortcut', response);
                    }
                });
            });
        });
    }
});
