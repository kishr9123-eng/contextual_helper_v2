// background.js
console.log("✅ Background script loaded!");

// Fired when the extension is installed/updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("📦 Extension installed/updated.");
});

// A good practice is to make constants for things that might change.
const BACKEND_URL = "http://127.0.0.1:8000/api/llm";

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "SHOW_MENU") {
    console.log("📩 Got selection:", message.text);

    try {
      const response = await fetch(BACKEND_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        // Default action is "summarize" (just to get the actions list back)
        body: JSON.stringify({
          text: message.text,
          action: "summarize"
        })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();

      // ✅ Send both answer and actions back to content script
      sendResponse({
        status: "ok",
        answer: data.answer,
        actions: data.actions || [] // fallback empty array if not present
      });
    } catch (err) {
      console.error("❌ Backend fetch failed:", err);
      sendResponse({
        status: "error",
        message: "Backend unavailable"
      });
    }
  }

  // Keep message channel open for async sendResponse
  return true;
});
