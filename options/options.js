document.addEventListener('DOMContentLoaded', () => {
    const apiKeySection = document.getElementById('api-key-section');
    const noKeyMessage = document.getElementById('no-key-message');
    const keyInputContainer = document.getElementById('key-input-container');
    const gotKeyButton = document.getElementById('got-key');
    const saveSection = document.getElementById('save-section');
    const apiKeyInput = document.getElementById('api-key');
    const saveButton = document.getElementById('save');
    const statusDiv = document.getElementById('status');

    // Check if key exists
    chrome.storage.sync.get(['apiKey'], (data) => {
        if (data.apiKey) {
            // User already has a key
            noKeyMessage.style.display = 'none';
            keyInputContainer.style.display = 'block';
            apiKeyInput.value = data.apiKey;
            saveSection.style.display = 'block';
        } else {
            // New user flow
            noKeyMessage.style.display = 'block';
        }
    });

    // "I Have My Key" button
    gotKeyButton.addEventListener('click', () => {
        noKeyMessage.style.display = 'none';
        keyInputContainer.style.display = 'block';
        saveSection.style.display = 'block';
        apiKeyInput.focus();
    });

    // Save settings
    saveButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey || !apiKey.startsWith('AIza')) {
            showStatus('Please enter a valid API key', 'error');
            return;
        }

        chrome.storage.sync.set({
            apiKey: apiKey,
            theme: document.getElementById('theme').value
        }, () => {
            showStatus('Settings saved successfully!', 'success');
            setTimeout(() => window.close(), 1500); // Close options page
        });
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';

        setTimeout(() => {
            statusDiv.style.opacity = '0';
            setTimeout(() => {
                statusDiv.style.display = 'none';
                statusDiv.style.opacity = '1';
            }, 300);
        }, 3000);
    }
});