// A lightweight script to inject a floating action button on target platforms

function scrapeFanId() {
  // Placeholder logic to extract Fan ID from URL or DOM
  // On OnlyFans, the URL in messages usually contains the chat/user ID, e.g., /my/chats/chat/12345
  const match = window.location.href.match(/chat\/(\d+)/);
  if (match && match[1]) {
    return match[1];
  }
  
  // Fallback: look for a specific DOM element (placeholder selector)
  const nameElement = document.querySelector('.b-chat__header__name');
  if (nameElement) {
    return nameElement.textContent.trim();
  }

  return "Unknown Fan";
}

function injectFloatingButton() {
  if (document.getElementById("agency-elite-companion-btn")) return;

  const btn = document.createElement("button");
  btn.id = "agency-elite-companion-btn";
  btn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#A855F7" stroke="#A855F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 17L12 22L22 17" stroke="#A855F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M2 12L12 17L22 12" stroke="#A855F7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Launch Companion
  `;

  // Styling the floating button
  Object.assign(btn.style, {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    zIndex: "999999",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    backdropFilter: "blur(12px)",
    color: "#fff",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "12px 20px",
    borderRadius: "100px",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 0 20px rgba(168, 85, 247, 0.3)",
    transition: "all 0.2s ease"
  });

  btn.addEventListener("mouseover", () => {
    btn.style.transform = "scale(1.05)";
    btn.style.boxShadow = "0 0 30px rgba(168, 85, 247, 0.5)";
  });

  btn.addEventListener("mouseout", () => {
    btn.style.transform = "scale(1)";
    btn.style.boxShadow = "0 0 20px rgba(168, 85, 247, 0.3)";
  });

  btn.addEventListener("click", () => {
    const fanId = scrapeFanId();
    // Save the scraped ID to extension storage so the side panel can pick it up
    chrome.storage.local.set({ currentFanId: fanId }, () => {
      // Tell background script to open the side panel
      chrome.runtime.sendMessage({ action: "open_side_panel" });
    });
  });

  document.body.appendChild(btn);
}

// Observe DOM mutations to ensure the button stays on the screen during client-side navigation
const observer = new MutationObserver(() => {
  injectFloatingButton();
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial injection
injectFloatingButton();
