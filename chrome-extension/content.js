// ═══════════════════════════════════════════════════════════════
// Agency Elite Companion — Content Script
// Injects a floating action button on target platforms and
// scrapes the current fan identifier from the page context.
// ═══════════════════════════════════════════════════════════════

/**
 * Scrapes the Fan ID from the current page URL or DOM.
 * Built with multiple fallback layers to handle DOM structure changes,
 * malformed HTML, and platform UI updates without crashing.
 *
 * @returns {string} A sanitized fan identifier, or "Unknown Fan" as a safe fallback.
 */
function scrapeFanId() {
  try {
    // Strategy 1: Extract numeric chat ID from URL path
    // OnlyFans URLs typically contain /my/chats/chat/12345
    const match = window.location.href.match(/chat\/(\d+)/);
    if (match && match[1] && match[1].length > 0) {
      return sanitizeScrapedValue(match[1]);
    }

    // Strategy 2: Extract username from URL path (/u/username or /username)
    const usernameMatch = window.location.pathname.match(/\/(?:u\/)?([a-zA-Z0-9._-]+)\/?$/);
    if (usernameMatch && usernameMatch[1] && usernameMatch[1].length > 1) {
      const candidate = usernameMatch[1];
      // Exclude known non-username path segments
      const excluded = ["my", "chats", "chat", "settings", "notifications", "explore"];
      if (!excluded.includes(candidate.toLowerCase())) {
        return sanitizeScrapedValue(candidate);
      }
    }

    // Strategy 3: Look for a specific DOM element (chat header name)
    const selectors = [
      ".b-chat__header__name",
      "[data-name='chat-header'] span",
      ".g-user-name",
    ];

    for (const selector of selectors) {
      try {
        const el = document.querySelector(selector);
        if (el && el.textContent) {
          const text = el.textContent.trim();
          if (text.length > 0 && text.length < 100) {
            return sanitizeScrapedValue(text);
          }
        }
      } catch (_selectorErr) {
        // Individual selector failure is non-fatal; try next
      }
    }
  } catch (err) {
    console.warn("[Agency Elite] scrapeFanId encountered an error:", err?.message || err);
  }

  return "Unknown Fan";
}

/**
 * Sanitizes a scraped value to prevent XSS or injection via malformed DOM content.
 * Strips HTML tags, trims whitespace, and caps length.
 *
 * @param {string} value - The raw scraped string.
 * @returns {string} A cleaned, safe string.
 */
function sanitizeScrapedValue(value) {
  if (typeof value !== "string") return "Unknown Fan";
  // Strip any HTML tags
  const stripped = value.replace(/<[^>]*>/g, "").trim();
  // Cap length to prevent oversized payloads
  if (stripped.length > 80) {
    return stripped.substring(0, 80);
  }
  return stripped || "Unknown Fan";
}

/**
 * Injects the floating action button into the page.
 * Uses an idempotency guard to prevent duplicate injections.
 */
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
    try {
      const fanId = scrapeFanId();
      // Save the scraped ID to extension storage so the side panel can pick it up
      chrome.storage.local.set({ currentFanId: fanId }, () => {
        if (chrome.runtime.lastError) {
          console.warn("[Agency Elite] Storage error:", chrome.runtime.lastError.message);
          return;
        }
        // Tell background script to open the side panel
        chrome.runtime.sendMessage({ action: "open_side_panel" });
      });
    } catch (err) {
      console.warn("[Agency Elite] Button click handler error:", err?.message || err);
    }
  });

  document.body.appendChild(btn);
}

// Observe DOM mutations to ensure the button stays on the screen during client-side navigation
const observer = new MutationObserver(() => {
  try {
    injectFloatingButton();
  } catch (_err) {
    // Silently handle injection failures during rapid DOM mutations
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Initial injection
injectFloatingButton();
