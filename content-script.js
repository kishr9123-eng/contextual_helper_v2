console.log("✅ Content script loaded!");

// Remove old popup
function removePopup() {
  const oldPopup = document.querySelector(".cs-popup");
  if (oldPopup) oldPopup.remove();
}

// Show a temporary loading popup
function showLoadingPopup(x, y) {
  removePopup();

  const popup = document.createElement("div");
  popup.className = "cs-popup";
  popup.style.position = "absolute";
  popup.style.background = "#fff";
  popup.style.border = "1px solid #ddd";
  popup.style.padding = "10px";
  popup.style.borderRadius = "6px";
  popup.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
  popup.style.zIndex = 999999;
  popup.innerText = "Loading...";

  popup.style.top = `${y + 10}px`;
  popup.style.left = `${x + 10}px`;
  document.body.appendChild(popup);

  setTimeout(() => {
    document.addEventListener("click", removePopup, { once: true });
  }, 0);
}

// Show popup with the response from the backend
function showPopup(selectedText, response, x, y) {
  removePopup();

  const popup = document.createElement("div");
  popup.className = "cs-popup";
  popup.style.position = "absolute";
  popup.style.background = "#fff";
  popup.style.border = "1px solid #ddd";
  popup.style.padding = "10px";
  popup.style.borderRadius = "6px";
  popup.style.boxShadow = "0 2px 8px rgba(0,0,0,0.15)";
  popup.style.zIndex = 999999;

  const answerP = document.createElement("p");
  answerP.innerText = response.answer || "";
  popup.appendChild(answerP);

  const BACKEND_URL = "http://127.0.0.1:8000/api/llm";

  if (response.actions && Array.isArray(response.actions)) {
    response.actions.forEach((action) => {
      const btn = document.createElement("button");
      btn.innerText = action.label;
      btn.style.margin = "5px";
      btn.onclick = async () => {
        try {
          const res = await fetch(BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: selectedText,
              action: action.id,
            }),
          });

          if (!res.ok) throw new Error("Backend error " + res.status);
          const data = await res.json();
          answerP.innerText = data.answer; // update popup text
        } catch (err) {
          answerP.innerText = "❌ Error fetching backend";
          console.error(err);
        }
      };
      popup.appendChild(btn);
    });
  }

  popup.style.top = `${y + 10}px`;
  popup.style.left = `${x + 10}px`;
  document.body.appendChild(popup);

  setTimeout(() => {
    document.addEventListener("click", removePopup, { once: true });
  }, 0);
}

// --- Main listener for text selection ---
document.addEventListener("mouseup", (event) => {
  const selection = window.getSelection().toString().trim();
  if (!selection) return;

  // Immediately show a loading popup
  showLoadingPopup(event.pageX, event.pageY);

  // Send message to background script
  chrome.runtime.sendMessage(
    { type: "SHOW_MENU", text: selection },
    (response) => {
      console.log(
        "📩 Response from background:",
        response,
        chrome.runtime.lastError
      );

      if (chrome.runtime.lastError || !response) {
        showPopup(
          selection,
          { answer: "❌ Backend unavailable", actions: [] },
          event.pageX,
          event.pageY
        );
        return;
      }

      if (response.status === "error") {
        showPopup(
          selection,
          { answer: "❌ Backend unavailable", actions: [] },
          event.pageX,
          event.pageY
        );
      } else {
        showPopup(selection, response, event.pageX, event.pageY);
      }
    }
  );
});
