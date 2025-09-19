// background.js
console.log("✅ Background script loaded!");

// Fired when the extension is installed/updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("📦 Extension installed/updated.");
});

// A good practice is to make constants for things that might change.
const BACKEND_URL = "http://127.0.0.1:8000/api/llm";

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SHOW_MENU") {
    console.log("📩 Got selection:", message.text);

    fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: message.text,
        action: "summarize", // default action
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Backend error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("✅ Backend response:", data);
        sendResponse({
          status: "ok",
          answer: data.answer,
          actions: data.actions || [],
        });
      })
      .catch((err) => {
        console.error("❌ Backend fetch failed:", err);
        sendResponse({
          status: "error",
          answer: "❌ Backend unavailable",
          actions: [],
        });
      });
    // 👈 keep message channel open until sendResponse is called
  }
  return true;
});
