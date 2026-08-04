chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SYNC_FAN_DATA") {
    // Retrieve stored API Key from storage
    chrome.storage.local.get(["cg_api_key"], async (result) => {
      const apiKey = result.cg_api_key;
      
      if (!apiKey) {
        console.warn("[Creator Growth AI] No API Key configured. Skipping sync.");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/fans", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey
          },
          body: JSON.stringify(message.payload)
        });

        if (!response.ok) {
          console.error("[Creator Growth AI] Failed to sync fan data:", response.status, response.statusText);
        } else {
          console.log("[Creator Growth AI] Successfully synced fan data.");
        }
      } catch (error) {
        console.error("[Creator Growth AI] Error during sync request:", error);
      }
    });
  }
});
