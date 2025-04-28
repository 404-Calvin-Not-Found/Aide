// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'textSelected') {
        processWithGemini(request.text, request.url)
            .then(response => {
                const formattedResponse = formatAIResponse(response);
                chrome.tabs.sendMessage(sender.tab.id, {
                    type: 'showAIResponse',
                    response: formattedResponse
                });
            })
            .catch(error => {
                console.error("Gemini Error:", error);
                const errorMsg = getFriendlyErrorMessage(error);
                chrome.tabs.sendMessage(sender.tab.id, {
                    type: 'showAIResponse',
                    response: errorMsg
                });
            });
    }
    return true;
});

async function processWithGemini(text, context) {
    // Hardcoded API key (temporary)
    const API_KEY = "AIzaSyBGEYrlR0vXoKs0cXItkwmqJdx_mdIUid4";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    const prompt = {
        contents: [{
            parts: [{
                text: `Analyze this text from a webpage (URL: ${context}):\n\n"${text}"\n\n
Provide the response in this EXACT format without any asterisks or markdown:

Summary: [1-2 sentence summary]

Key Points:
- [First key point]
- [Second key point]
- [Third key point]

Related Concepts:
- [First related concept]
- [Second related concept]

Verification: [Brief fact-checking notes]`
            }]
        }]
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(prompt)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error("Unexpected response format from Gemini API");
    }

    return data.candidates[0].content.parts[0].text;
}

function formatAIResponse(rawResponse) {
    // Clean and format the response
    return rawResponse
        // Keep bold formatting but remove asterisks
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

        // Convert other markdown to HTML
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>')

        // Standardize bullet points and spacing
        .replace(/^-\s/gm, '• ')
        .replace(/^•\s/gm, '• ')

        // Ensure proper line breaks
        .replace(/(Summary:|Key Points:|Related Concepts:|Verification:)/g, '\n\n$1')
        .replace(/(\n•)/g, '\n$1')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function getFriendlyErrorMessage(error) {
    const errorString = error.message.toLowerCase();

    if (errorString.includes("api key")) {
        return "🔑 Invalid API Key - Please check your extension settings";
    } else if (errorString.includes("network") || errorString.includes("failed to fetch")) {
        return "🌐 Network Error - Please check your internet connection";
    } else if (errorString.includes("quota")) {
        return "⚠️ API Limit Reached - Try again later";
    } else if (errorString.includes("gemini api error")) {
        return "⚠️ AI Service Error - Please try again";
    } else if (errorString.includes("not configured")) {
        return "⚙️ API Key Missing - Please set up your API key in settings";
    }

    return "⚠️ An unexpected error occurred";
}