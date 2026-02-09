// background.js - Manages messaging between the web app and content script

chrome.runtime.onInstalled.addListener(() => {
    console.log("Formitra AI Assistant: Background installed.");
});

// We can use a message listener to receive data from the bridge script
chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    if (request.data) {
        chrome.storage.local.set({ appData: request.data }, () => {
            console.log("Formitra AI: Data saved to extension storage.");
            sendResponse({ success: true });
        });
    }
});
