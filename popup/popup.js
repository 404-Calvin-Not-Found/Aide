document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const elements = {
        loader: document.getElementById('loader'),
        status: document.querySelector('.status'),
        nightModeToggle: document.getElementById('night-mode'),
        container: document.querySelector('.container'),
        summarizeBtn: document.getElementById('summarizePage'),
        analyzeBtn: document.getElementById('analyzeContent'),
        promptInput: document.getElementById('new-prompt'),
        addPromptBtn: document.getElementById('add-prompt'),
        promptList: document.getElementById('prompt-list')
    };

    // Audio Elements
    const sounds = {
        open: document.getElementById('sound-open'),
        close: document.getElementById('sound-close'),
        hover: document.getElementById('sound-hover'),
        success: document.getElementById('sound-success'),
        modeDark: document.getElementById('mode-dark'),
        modeLight: document.getElementById('mode-light')
    };

    // Sound Manager
    const soundManager = {
        play: (soundName, volume = 0.3) => {
            const sound = sounds[soundName];
            if (!sound) {
                console.warn(`Sound not found: ${soundName}`);
                return;
            }
            try {
                sound.volume = Math.min(Math.max(volume, 0), 1);
                sound.currentTime = 0;
                sound.play().catch(e => console.error("Sound error:", e));
            } catch (e) {
                console.error("Sound playback failed:", e);
            }
        }
    };

    // Theme Manager
    const themeManager = {
        init: () => {
            chrome.storage.sync.get(['nightMode'], ({ nightMode }) => {
                if (nightMode) {
                    document.body.classList.add('night-mode');
                    elements.nightModeToggle.checked = true;
                }
            });
        },
        toggle: (enabled) => {
            document.body.classList.toggle('night-mode', enabled);
            chrome.storage.sync.set({ nightMode: enabled });
            soundManager.play(enabled ? 'mode-dark' : 'mode-light', 0.2);
        }
    };

    // UI Effects
    const uiEffects = {
        setupButtonHover: () => {
            document.querySelectorAll('button').forEach(btn => {
                btn.addEventListener('mouseenter', () => {
                    btn.style.transform = 'translateY(-2px)';
                    btn.style.boxShadow = '0 4px 15px rgba(100, 210, 255, 0.3)';
                    soundManager.play('hover', 0.1);
                });

                btn.addEventListener('mouseleave', () => {
                    btn.style.transform = '';
                    btn.style.boxShadow = '';
                });
            });
        },
        showLoader: () => {
            elements.loader.style.display = 'block';
            elements.status.textContent = 'Analyzing page content...';
            elements.loader.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        },
        hideLoader: () => {
            elements.loader.style.display = 'none';
            elements.status.textContent = 'Analysis complete! Highlight text to continue.';
            elements.status.style.color = '#64d2ff';
            elements.status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

            setTimeout(() => {
                elements.status.style.color = '#e0e0e0';
            }, 2000);
        },
        addPrompt: (text) => {
            if (!text.trim()) return;

            const li = document.createElement('li');
            li.textContent = text;
            elements.promptList.appendChild(li);
            elements.promptInput.value = '';

            li.style.opacity = '0';
            setTimeout(() => {
                li.style.opacity = '1';
                li.style.transform = 'translateX(0)';
                li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 10);
        }
    };

    // Window Resize Handler
    const handleResize = () => {
        const maxHeight = Math.min(500, window.screen.availHeight - 100);
        elements.container.style.maxHeight = `${maxHeight}px`;
    };

    // Event Listeners
    elements.nightModeToggle.addEventListener('change', (e) => {
        themeManager.toggle(e.target.checked);
    });

    elements.summarizeBtn.addEventListener('click', () => {
        uiEffects.showLoader();
        soundManager.play('success', 0.3);

        setTimeout(() => {
            uiEffects.hideLoader();
        }, 1500);
    });

    elements.addPromptBtn.addEventListener('click', () => {
        uiEffects.addPrompt(elements.promptInput.value);
    });

    // Initialize
    themeManager.init();
    uiEffects.setupButtonHover();
    soundManager.play('open', 0.2);
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    // Popup closing handler
    chrome.runtime.connect().onDisconnect.addListener(() => {
        soundManager.play('close', 0.2);
    });
});