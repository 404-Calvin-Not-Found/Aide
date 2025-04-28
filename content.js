// Handle incoming responses from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'showAIResponse') {
        showAIBubble(request.response);
    }
});

// Text selection handler
document.addEventListener("mouseup", (event) => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText.length > 2) {
            chrome.runtime.sendMessage({
                type: "textSelected",
                text: selectedText,
                url: window.location.href
            });
        }
    } else {
        console.error("Chrome extension APIs not available");
    }
});

function showAIBubble(response) {
    // Remove existing bubble if any
    const oldBubble = document.getElementById("aide-bubble");
    if (oldBubble) oldBubble.remove();

    // Create new bubble with HTML formatting
    const bubble = document.createElement("div");
    bubble.id = "aide-bubble";
    bubble.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 300px;
        padding: 12px;
        background: #2563EB;
        color: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 999999;
        font-family: Arial, sans-serif;
        line-height: 1.5;
    `;

    bubble.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px; font-size: 1.1em;">Aide</div>
        <div style="white-space: pre-wrap;">${response}</div>
        <button id="close-bubble" style="margin-top: 12px; padding: 4px 8px; background: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
    `;

    document.body.appendChild(bubble);

    // Close button logic
    bubble.querySelector("#close-bubble").addEventListener("click", () => {
        bubble.remove();
    });
}
// Optional: Add styles dynamically
const style = document.createElement("style");
style.textContent = `
  .aide-bubble {
    position: fixed;
    top: 20px;
    right: 20px;
    max-width: 300px;
    padding: 12px;
    background: #2563EB;
    color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 999999;
    animation: fadeIn 0.3s ease-out;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .aide-close-btn {
    margin-top: 8px;
    background: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
  }
`;
document.head.appendChild(style);