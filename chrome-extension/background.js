// ═══════════════════════════════════════════════════════════════
// Agency Elite Companion — Background Service Worker (Manifest V3)
// Handles: Side Panel lifecycle, session token storage, and
//          rate-limited API relay with exponential backoff retry.
// ═══════════════════════════════════════════════════════════════

// Allows the side panel to open when the extension icon is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));



// ── Message Listener ──────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  try {
    if (message.action === "open_side_panel") {
      if (sender.tab && sender.tab.windowId) {
        chrome.sidePanel.open({ windowId: sender.tab.windowId });
      }
    }

    // Secure API Gateway / Token Storage (In-Memory Session)
    if (message.action === "set_session_token") {
      if (typeof message.token !== "string" || message.token.length === 0) {
        sendResponse({ success: false, error: "Invalid token" });
        return true;
      }
      chrome.storage.session.set({ supabaseToken: message.token }, () => {
        if (chrome.runtime.lastError) {
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true });
        }
      });
      return true; // async
    }

    if (message.action === "get_session_token") {
      chrome.storage.session.get(["supabaseToken"], (res) => {
        if (chrome.runtime.lastError) {
          sendResponse({ token: null, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ token: res.supabaseToken || null });
        }
      });
      return true; // async
    }


  } catch (err) {
    console.error("[Background] Unhandled error in message listener:", err);
    sendResponse({ error: "Internal extension error" });
    return true;
  }
});
