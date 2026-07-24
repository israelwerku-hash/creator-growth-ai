// Configuration
const BACKEND_URL = "http://localhost:3000";

// Tab Switching Logic
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const panes = document.querySelectorAll(".tab-pane");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs and panes
      tabs.forEach(t => t.classList.remove("active"));
      panes.forEach(p => p.classList.remove("active"));

      // Add active class to clicked tab and corresponding pane
      tab.classList.add("active");
      const targetId = tab.getAttribute("data-target");
      document.getElementById(targetId).classList.add("active");
    });
  });

  // Load scraped fan ID from storage
  chrome.storage.local.get(["currentFanId"], (result) => {
    const fanIdElement = document.getElementById("current-fan-id");
    if (result.currentFanId) {
      fanIdElement.textContent = result.currentFanId;
    } else {
      fanIdElement.textContent = "Not Detected";
    }
  });

  // Listen for storage changes in case the user navigates to a new chat
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local" && changes.currentFanId) {
      document.getElementById("current-fan-id").textContent = changes.currentFanId.newValue;
    }
  });

  // Handle DM Generation Form Submit
  const dmForm = document.getElementById("dm-form");
  const generateBtn = document.getElementById("generate-btn");
  const outputContainer = document.getElementById("output-container");
  const dmOutput = document.getElementById("dm-output");
  const copyBtn = document.getElementById("copy-btn");

  dmForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const targetAccount = document.getElementById("current-fan-id").textContent;
    const campaignGoal = document.getElementById("goal-input").value;
    const tone = document.getElementById("tone-input").value;
    const context = document.getElementById("context-input").value;

    // UI Loading State
    generateBtn.disabled = true;
    generateBtn.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
      </svg>
      Generating...
    `;
    outputContainer.classList.add("hidden");

    // We can inject a CSS animation class dynamically if not defined
    if (!document.getElementById("spin-style")) {
      const style = document.createElement("style");
      style.id = "spin-style";
      style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }

    try {
      // NOTE: In production, you would fetch the Supabase session token from your web app
      // and pass it in the Authorization header to secure this endpoint.
      const response = await fetch(`${BACKEND_URL}/api/generate-dm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer PLACEHOLDER_SUPABASE_TOKEN"
        },
        body: JSON.stringify({
          targetAccount: targetAccount === "Loading..." || targetAccount === "Not Detected" ? "OnlyFans Subscriber" : targetAccount,
          campaignGoal,
          tone,
          context
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate outreach via API.");
      }

      dmOutput.textContent = data.message;
      outputContainer.classList.remove("hidden");

    } catch (error) {
      console.error(error);
      dmOutput.textContent = `Error: ${error.message}`;
      outputContainer.classList.remove("hidden");
    } finally {
      // Restore Button State
      generateBtn.disabled = false;
      generateBtn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        Generate AI Outreach
      `;
    }
  });

  // Handle Copy Button
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(dmOutput.textContent);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = "Copied!";
      copyBtn.style.color = "var(--emerald-accent)";
      copyBtn.style.borderColor = "var(--emerald-accent)";
      
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.color = "";
        copyBtn.style.borderColor = "";
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  });
});
