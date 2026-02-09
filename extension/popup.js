// popup.js - Extension popup interface with state awareness
document.addEventListener('DOMContentLoaded', () => {
    const statusEl = document.getElementById('status');
    const stateEl = document.getElementById('stateInfo');
    const fillBtn = document.getElementById('fillBtn');
    const clearBtn = document.getElementById('clearBtn');

    // Load saved data from extension storage
    chrome.storage.local.get(['appData'], (result) => {
        if (result.appData) {
            const { service, state, data } = result.appData;
            
            // Display service and state info
            statusEl.innerHTML = `
                <div class="status-item">
                    <span class="label">Service:</span>
                    <span class="value">${service || 'Unknown'}</span>
                </div>
                <div class="status-item">
                    <span class="label">Fields:</span>
                    <span class="value">${Object.keys(data).length || 0} collected</span>
                </div>
            `;

            if (state) {
                stateEl.innerHTML = `
                    <div class="state-badge">
                        📍 ${state}
                    </div>
                `;
            }

            fillBtn.style.display = 'block';
            clearBtn.style.display = 'block';

            // Fill Form button click handler
            fillBtn.addEventListener('click', () => {
                fillBtn.disabled = true;
                fillBtn.textContent = 'Filling...';

                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    if (tabs && tabs[0]) {
                        chrome.tabs.sendMessage(
                            tabs[0].id,
                            {
                                action: "FILL_FORM",
                                service: service,
                                state: state,
                                data: data
                            },
                            (response) => {
                                if (chrome.runtime.lastError) {
                                    console.error('Error:', chrome.runtime.lastError);
                                    fillBtn.textContent = 'Fill Application';
                                    fillBtn.disabled = false;
                                    statusEl.innerHTML += '<div class="error">Error: Could not communicate with page</div>';
                                } else {
                                    console.log('Form filling started', response);
                                    fillBtn.textContent = '✓ Filling...';
                                    
                                    // Re-enable after 2 seconds
                                    setTimeout(() => {
                                        fillBtn.textContent = 'Fill Application';
                                        fillBtn.disabled = false;
                                    }, 2000);
                                }
                            }
                        );
                    }
                });
            });

            // Clear Data button click handler
            clearBtn.addEventListener('click', () => {
                if (confirm('Clear all saved data?')) {
                    chrome.storage.local.remove(['appData'], () => {
                        statusEl.textContent = 'Data cleared. Ready for new application.';
                        stateEl.innerHTML = '';
                        fillBtn.style.display = 'none';
                        clearBtn.style.display = 'none';
                    });
                }
            });
        } else {
            statusEl.innerHTML = `
                <div class="no-data">
                    <p>No data ready</p>
                    <small>Fill out a form on the Formitra app to begin</small>
                </div>
            `;
        }
    });
});
