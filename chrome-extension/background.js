// Allows the side panel to open when the extension icon is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Listen for messages from the content script or side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "open_side_panel") {
    // Open the side panel for the specific window
    chrome.sidePanel.open({ windowId: sender.tab.windowId });
  }

  // Secure API Gateway / Token Storage (In-Memory)
  if (message.action === "set_session_token") {
    chrome.storage.session.set({ supabaseToken: message.token }, () => {
      sendResponse({ success: true });
    });
    return true; // async
  }

  if (message.action === "get_session_token") {
    chrome.storage.session.get(["supabaseToken"], (res) => {
      sendResponse({ token: res.supabaseToken || null });
    });
    return true; // async
  }
});
