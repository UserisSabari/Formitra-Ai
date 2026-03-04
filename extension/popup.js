// popup.js - Extension popup interface with state awareness
document.addEventListener('DOMContentLoaded', () => {
    const statusEl = document.getElementById('status');
    const stateEl = document.getElementById('stateInfo');
    const fillBtn = document.getElementById('fillBtn');
    const clearBtn = document.getElementById('clearBtn');
    const importBtn = document.getElementById('importBtn');

    function renderEmptyState(extraMessageHtml = '') {
        statusEl.innerHTML = `
            <div class="no-data">
                <p>No data ready</p>
                <small>Open the Formitra web app tab and click “Import from this tab”.</small>
                ${extraMessageHtml}
            </div>
        `;
        stateEl.innerHTML = '';
        fillBtn.style.display = 'none';
        clearBtn.style.display = 'none';
    }

    function renderAppData(appData) {
        const { service, state, data } = appData || {};

        statusEl.innerHTML = `
            <div class="status-item">
                <span class="label">Service:</span>
                <span class="value">${service || 'Unknown'}</span>
            </div>
            <div class="status-item">
                <span class="label">Fields:</span>
                <span class="value">${data ? Object.keys(data).length : 0} collected</span>
            </div>
        `;

        if (state) {
            stateEl.innerHTML = `
                <div class="state-badge">
                    📍 ${state}
                </div>
            `;
        } else {
            stateEl.innerHTML = '';
        }

        fillBtn.style.display = 'block';
        clearBtn.style.display = 'block';
    }

    function withActiveTab(callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs?.[0];
            if (!tab?.id) return callback(null);
            callback(tab);
        });
    }

    // Import button: read Formitra localStorage from current tab.
    importBtn.addEventListener('click', () => {
        importBtn.disabled = true;
        importBtn.textContent = 'Importing...';

        withActiveTab((tab) => {
            if (!tab) {
                importBtn.disabled = false;
                importBtn.textContent = 'Import from this tab';
                renderEmptyState('<div class="error">No active tab found.</div>');
                return;
            }

            chrome.scripting.executeScript(
                {
                    target: { tabId: tab.id },
                    func: () => {
                        const tryParse = (key) => {
                            try {
                                const raw = window.localStorage.getItem(key);
                                return raw ? JSON.parse(raw) : null;
                            } catch {
                                return null;
                            }
                        };

                        const appData = tryParse('formitra_app_data');
                        if (appData?.data) return appData;

                        const formData = tryParse('formitra_form_data');
                        if (!formData) return null;
                        return {
                            service: 'passport',
                            state: formData.state || '',
                            data: formData,
                        };
                    },
                },
                (results) => {
                    importBtn.disabled = false;
                    importBtn.textContent = 'Import from this tab';

                    if (chrome.runtime.lastError) {
                        renderEmptyState(`<div class="error">Import failed: ${chrome.runtime.lastError.message}</div>`);
                        return;
                    }

                    const extracted = results?.[0]?.result || null;
                    if (!extracted?.data) {
                        renderEmptyState('<div class="error">No Formitra data found on this tab.</div>');
                        return;
                    }

                    chrome.storage.local.set({ appData: extracted }, () => {
                        renderAppData(extracted);
                    });
                }
            );
        });
    });

    // Fill Form button click handler (works on portal tabs where content.js is injected)
    fillBtn.addEventListener('click', () => {
        fillBtn.disabled = true;
        fillBtn.textContent = 'Filling...';

        chrome.storage.local.get(['appData'], (result) => {
            const { service, state, data } = result.appData || {};
            if (!data) {
                fillBtn.textContent = 'Fill Application';
                fillBtn.disabled = false;
                renderEmptyState('<div class="error">No saved data. Import first.</div>');
                return;
            }

            withActiveTab((tab) => {
                if (!tab) return;

                chrome.tabs.sendMessage(
                    tab.id,
                    { action: 'FILL_FORM', service, state, data },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            console.error('Error:', chrome.runtime.lastError);
                            statusEl.innerHTML += '<div class="error">Open the official portal tab and refresh, then try again.</div>';
                        } else {
                            console.log('Form filling started', response);
                        }

                        fillBtn.textContent = 'Fill Application';
                        fillBtn.disabled = false;
                    }
                );
            });
        });
    });

    // Clear Data button click handler
    clearBtn.addEventListener('click', () => {
        if (confirm('Clear all saved data?')) {
            chrome.storage.local.remove(['appData'], () => {
                renderEmptyState();
            });
        }
    });

    // Initial render
    chrome.storage.local.get(['appData'], (result) => {
        if (result.appData?.data) renderAppData(result.appData);
        else renderEmptyState();
    });
});
