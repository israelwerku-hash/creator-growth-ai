let debounceTimer;

const scrapeFanData = () => {
  // Generic selectors - adjust these to match the exact DOM structure of the target platform
  const usernameEl = document.querySelector(".chat-header-username, .g-user-realname, [data-test='user-name']");
  const handleEl = document.querySelector(".chat-header-handle, .g-user-username, [data-test='user-handle']");
  const spendEl = document.querySelector(".chat-spend-stats, .user-total-spend");
  const messageEls = document.querySelectorAll(".chat-message-text, .b-chat__message__text");

  if (!usernameEl || !handleEl) return null;

  const displayName = usernameEl.innerText.trim();
  const username = handleEl.innerText.trim().replace("@", "");
  
  // Parse spend string (e.g., "$1,450.00")
  let totalSpent = 0;
  if (spendEl) {
    const rawSpend = spendEl.innerText.replace(/[^0-9.]/g, "");
    totalSpent = parseFloat(rawSpend) || 0;
  }

  // Extract the latest message for context
  let latestContext = "";
  if (messageEls.length > 0) {
    latestContext = messageEls[messageEls.length - 1].innerText.trim();
  }

  return {
    username,
    displayName,
    totalSpent,
    latestContext
  };
};

const handleMutations = (mutations) => {
  clearTimeout(debounceTimer);
  
  // 2-second debounce filter
  debounceTimer = setTimeout(() => {
    const data = scrapeFanData();
    if (data) {
      chrome.runtime.sendMessage({
        type: "SYNC_FAN_DATA",
        payload: data
      });
    }
  }, 2000); 
};

// Use MutationObserver to watch the DOM for active chat windows
const observer = new MutationObserver(handleMutations);
observer.observe(document.body, { childList: true, subtree: true });
