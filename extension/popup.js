document.addEventListener('DOMContentLoaded', () => {
    const contentAreaEl = document.getElementById('contentArea');
    const fillBtn = document.getElementById('fillBtn');
    const clearBtn = document.getElementById('clearBtn');
    const importBtn = document.getElementById('importBtn');

    // SVG Icons
    const ICONS = {
        import: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>`,
        loader: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`,
        execute: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
        alertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
        search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`
    };

    function renderEmptyState(errorMsg = null) {
        contentAreaEl.innerHTML = `
            <div class="no-data">
                ${ICONS.search}
                <p>No Application Data</p>
                <small>Navigate to the Formitra client application and select "Import" to securely transfer your records.</small>
                ${errorMsg ? `<div class="error">${ICONS.alertTriangle} <span>${errorMsg}</span></div>` : ''}
            </div>
        `;
        fillBtn.style.display = 'none';
        clearBtn.style.display = 'none';
        importBtn.style.display = 'flex';
    }

    function renderAppData(appData) {
        const { service, state, data, files } = appData || {};
        
        const applicantName = data?.givenName 
            ? `${data.givenName} ${data.surname || ''}`
            : data?.firstName 
                ? `${data.firstName} ${data.lastName || ''}`
                : 'Pending Identification';

        const fileCount = files ? files.length : 0;
        const fieldCount = data ? Object.keys(data).length : 0;

        contentAreaEl.innerHTML = `
            ${state ? `
            <div id="stateInfo">
                <div class="state-badge">
                    <span>Target Jurisdiction</span>
                    <span class="state-value">${state}</span>
                </div>
            </div>` : ''}

            <div class="applicant-info">
                <div class="info-row">
                    <span class="info-label">Applicant ID</span>
                    <span class="info-value">${applicantName}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Service Focus</span>
                    <span class="info-value" style="text-transform: capitalize;">${service || 'General'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Payload Size</span>
                    <span class="info-value">${fieldCount} Registered Fields</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Attachments</span>
                    <span class="info-value">
                        ${fileCount > 0 
                            ? `<span class="file-badge">${fileCount} Verified Documents</span>` 
                            : '<span style="color: #94a3b8; font-size: 11px;">No Attachments</span>'}
                    </span>
                </div>
            </div>
        `;

        importBtn.style.display = 'none';
        fillBtn.style.display = 'flex';
        clearBtn.style.display = 'block';
    }

    function withActiveTab(callback) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs?.[0];
            if (!tab?.id) return callback(null);
            callback(tab);
        });
    }

    importBtn.addEventListener('click', () => {
        importBtn.disabled = true;
        importBtn.innerHTML = `${ICONS.loader} Extracting Data...`;

        withActiveTab((tab) => {
            if (!tab) {
                importBtn.disabled = false;
                importBtn.innerHTML = `${ICONS.import} Import Local Data`;
                renderEmptyState('Active portal interface disconnected.');
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
                        const files = tryParse('formitra_files') || [];

                        if (appData?.data) {
                            return { ...appData, files };
                        }

                        const formData = tryParse('formitra_form_data');
                        if (!formData) return null;
                        
                        return {
                            service: 'passport',
                            state: formData.state || formData.state2 || '',
                            data: formData,
                            files: files
                        };
                    },
                },
                (results) => {
                    importBtn.disabled = false;
                    importBtn.innerHTML = `${ICONS.import} Import Local Data`;

                    if (chrome.runtime.lastError) {
                        renderEmptyState(`System Error: ${chrome.runtime.lastError.message}`);
                        return;
                    }

                    const extracted = results?.[0]?.result || null;
                    if (!extracted?.data) {
                        renderEmptyState('No valid dataset detected on the current active window. Validate your Formitra application session.');
                        return;
                    }

                    chrome.storage.local.set({ appData: extracted }, () => {
                        renderAppData(extracted);
                    });
                }
            );
        });
    });

    fillBtn.addEventListener('click', () => {
        fillBtn.disabled = true;
        fillBtn.innerHTML = `${ICONS.loader} Processing...`;

        chrome.storage.local.get(['appData'], (result) => {
            const { service, state, data, files } = result.appData || {};
            if (!data) {
                fillBtn.innerHTML = `${ICONS.execute} Execute Auto-Fill`;
                fillBtn.disabled = false;
                renderEmptyState('No dataset in secure storage. Please perform an import.');
                return;
            }

            withActiveTab((tab) => {
                if (!tab) return;

                chrome.tabs.sendMessage(
                    tab.id,
                    { action: 'FILL_FORM', service, state, data, files },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            console.error('Error:', chrome.runtime.lastError);
                            contentAreaEl.innerHTML += `<div class="error">${ICONS.alertTriangle} <span>Injection failed. Target portal forms not fully loaded. Refresh and try again.</span></div>`;
                        } else {
                            console.log('Form filling started', response);
                        }

                        fillBtn.innerHTML = `${ICONS.execute} Execute Auto-Fill`;
                        fillBtn.disabled = false;
                    }
                );
            });
        });
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Confirm standard erasure of all captured data in local extension storage?')) {
            chrome.storage.local.remove(['appData'], () => {
                renderEmptyState();
            });
        }
    });

    chrome.storage.local.get(['appData'], (result) => {
        if (result.appData?.data) {
            renderAppData(result.appData);
        } else {
            renderEmptyState();
        }
    });
});
