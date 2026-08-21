// Configuration
const BACKEND_URL = "https://ataraxi-a.netlify.app";

// Tab Switching Logic
document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const panes = document.querySelectorAll(".tab-pane");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      panes.forEach(p => p.classList.remove("active"));
      tab.classList.add("active");
      const targetId = tab.getAttribute("data-target");
      document.getElementById(targetId).classList.add("active");
    });
  });

  // --- CUSTOM DROPDOWN CLASS ---
  class CustomDropdown {
    constructor(elementId, onChange) {
      this.wrapper = document.getElementById(`wrapper-${elementId}`);
      this.trigger = document.getElementById(`trigger-${elementId}`);
      this.optionsList = document.getElementById(`options-${elementId}`);
      this.hiddenInput = document.getElementById(elementId);
      this.onChangeCallback = onChange;
      
      if (this.trigger) {
        this.trigger.addEventListener('click', () => {
          const isShowing = this.optionsList.classList.contains('show');
          document.querySelectorAll('.custom-select-options').forEach(el => el.classList.remove('show'));
          document.querySelectorAll('.custom-select-wrapper').forEach(el => el.classList.remove('open'));
          if (!isShowing) {
            this.optionsList.classList.add('show');
            this.wrapper.classList.add('open');
          }
        });
      }
      
      document.addEventListener('click', (e) => {
        if (this.wrapper && !this.wrapper.contains(e.target)) {
          this.optionsList.classList.remove('show');
          this.wrapper.classList.remove('open');
        }
      });
    }
    
    setOptions(options) {
      if (!this.optionsList) return;
      this.optionsList.innerHTML = '';
      if (options.length === 0) {
        this.trigger.textContent = "No options";
        return;
      }
      options.forEach(opt => {
        const div = document.createElement('div');
        div.className = 'custom-select-option';
        div.textContent = opt.label;
        div.dataset.value = opt.value;
        div.addEventListener('click', () => {
          this.hiddenInput.value = opt.value;
          this.trigger.textContent = opt.label;
          this.optionsList.classList.remove('show');
          this.wrapper.classList.remove('open');
          if (this.onChangeCallback) this.onChangeCallback(opt.value);
          this.hiddenInput.dispatchEvent(new Event('change'));
        });
        this.optionsList.appendChild(div);
      });
    }
    
    setValue(val) {
      if (!this.optionsList) return;
      const opt = this.optionsList.querySelector(`[data-value="${val}"]`);
      if (opt) {
        this.hiddenInput.value = val;
        this.trigger.textContent = opt.textContent;
      }
    }
  }

  // --- ELEMENT REFERENCES ---
  const fanSelect = document.getElementById("fanSelect");
  const dmFanSelect = document.getElementById("dm-fan-id");
  const vaultForm = document.getElementById("vault-form");
  const vaultInput = document.getElementById("vault-input");
  const vaultList = document.getElementById("vault-list");
  
  const vaultFanDropdown = new CustomDropdown('fanSelect');
  const dmFanDropdown = new CustomDropdown('dm-fan-id');
  const goalDropdown = new CustomDropdown('goal-input');
  goalDropdown.setOptions([
    { label: 'PPV Upsell', value: 'PPV Upsell' },
    { label: 'Re-engagement', value: 'Re-engagement' },
    { label: 'Custom Request', value: 'Custom Request' },
    { label: 'Tipping Conversion', value: 'Tipping Conversion' }
  ]);
  const toneDropdown = new CustomDropdown('tone-input');
  toneDropdown.setOptions([
    { label: 'Flirty & Playful', value: 'Flirty & Playful' },
    { label: 'Direct & Confident', value: 'Direct & Confident' },
    { label: 'Girlfriend Experience', value: 'Girlfriend Experience' },
    { label: 'Teasing', value: 'Teasing' }
  ]);

  let fansData = [];

  // --- FAN FETCHING & DROPDOWN POPULATION ---
  async function fetchFans(apiKey) {
    try {
      const res = await fetch(`${BACKEND_URL}/api/fans`, {
        headers: { "x-api-key": apiKey }
      });
      const data = await res.json();
      if (res.ok && data.success && data.fans && data.fans.length > 0) {
        fansData = data.fans;
        populateFanDropdowns();
      } else {
        setDropdownError();
        console.error("Fetch fans failed or returned no fans:", data);
      }
    } catch (e) {
      setDropdownError();
      console.error("Network error fetching fans:", e);
    }
  }

  function setDropdownError() {
    vaultFanDropdown.setOptions([{ label: 'No fans found / Check API Key', value: '' }]);
    dmFanDropdown.setOptions([{ label: 'No fans found / Check API Key', value: '' }]);
  }

  function populateFanDropdowns() {
    const currentVaultFan = fanSelect.value;
    const options = fansData.map(fan => ({
      label: `${fan.displayName || fan.username} ($${fan.totalSpend})`,
      value: fan.id
    }));
    vaultFanDropdown.setOptions(options);
    dmFanDropdown.setOptions(options);

    // Auto-select first fan (or restore previous selection)
    if (fansData.length > 0) {
      if (currentVaultFan && fansData.some(f => f.id === currentVaultFan)) {
        vaultFanDropdown.setValue(currentVaultFan);
        dmFanDropdown.setValue(currentVaultFan);
      } else {
        vaultFanDropdown.setValue(fansData[0].id);
        dmFanDropdown.setValue(fansData[0].id);
      }
      fanSelect.dispatchEvent(new Event("change"));
    }
  }

  // --- FAN SELECT CHANGE HANDLER ---
  fanSelect.addEventListener("change", (e) => {
    const fanId = e.target.value;
    // Sync DM Gen dropdown
    dmFanSelect.value = fanId;

    if (!fanId) {
      renderEmptyVault();
      return;
    }

    const fan = fansData.find(f => f.id === fanId);
    if (fan && fan.memories && fan.memories.length > 0) {
      renderMemories(fan.memories);
    } else {
      renderEmptyVault();
    }

    fetchStats(fanId);
  });

  // Sync Vault dropdown when DM Gen dropdown changes
  dmFanSelect.addEventListener("change", (e) => {
    fanSelect.value = e.target.value;
  });

  function escapeHTML(str) {
    if (!str) return "";
    return str.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderMemories(memories) {
    vaultList.className = "";
    vaultList.innerHTML = memories.map(mem => `
      <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; margin-bottom: 8px; font-size: 13px; color: #e5e5e5; border: 1px solid ${mem.isPriority ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'};">
        <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
          <span style="color: #a1a1aa; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;">${escapeHTML(mem.category || 'General')}</span>
          <span style="color: #a1a1aa; font-size: 10px;">${new Date(mem.createdAt).toLocaleDateString()}</span>
        </div>
        <div>${escapeHTML(mem.keyFact)}</div>
      </div>
    `).join("");
  }

  function renderEmptyVault() {
    vaultList.className = "empty-state";
    vaultList.innerHTML = `
      <svg class="icon empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
      <p>No memory records found.</p>
      <span>Log intimacy contexts and spend history to build AI memory.</span>
    `;
  }

  // --- SETTINGS LOGIC ---
  const apiKeyInput = document.getElementById("api-key-input");
  const saveSettingsBtn = document.getElementById("save-settings-btn");
  const connectionPill = document.getElementById("connection-pill");
  const pillDot = document.getElementById("pill-dot");
  const pillText = document.getElementById("pill-text");
  const apiKeyHint = document.getElementById("api-key-hint");

  let storedKey = "";

  function setConnectionState(status) {
    if (status === "connected") {
      connectionPill.style.background = "rgba(128, 0, 32, 0.15)";
      connectionPill.style.color = "#e4e4e7";
      connectionPill.style.border = "1px solid rgba(128, 0, 32, 0.3)";
      connectionPill.style.boxShadow = "0 0 10px rgba(128, 0, 32, 0.1)";
      pillDot.style.background = "#34d399";
      pillText.textContent = "Connected";
    } else {
      connectionPill.style.background = "rgba(161, 161, 170, 0.08)";
      connectionPill.style.color = "#71717a";
      connectionPill.style.border = "1px solid rgba(255, 255, 255, 0.06)";
      connectionPill.style.boxShadow = "none";
      pillDot.style.background = "#52525b";
      pillText.textContent = "Disconnected";
    }
  }

  function setButtonState(state) {
    // Reset common properties first
    saveSettingsBtn.disabled = false;
    saveSettingsBtn.style.opacity = "1";
    saveSettingsBtn.style.background = "#800020";
    saveSettingsBtn.style.color = "#ffffff";
    apiKeyInput.style.borderColor = "";
    apiKeyHint.style.color = "#a1a1aa";
    apiKeyHint.textContent = "Found in your web dashboard settings.";

    switch (state) {
      case "idle":
        saveSettingsBtn.innerHTML = "Saved";
        saveSettingsBtn.style.background = "rgba(128, 0, 32, 0.1)";
        saveSettingsBtn.style.color = "#a1a1aa";
        saveSettingsBtn.style.opacity = "0.7";
        saveSettingsBtn.disabled = true;
        break;
      case "modified":
        saveSettingsBtn.innerHTML = "Save Changes";
        saveSettingsBtn.style.background = "#800020";
        saveSettingsBtn.style.color = "#ffffff";
        break;
      case "saving":
        saveSettingsBtn.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> Validating key...`;
        saveSettingsBtn.style.background = "rgba(128, 0, 32, 0.3)";
        saveSettingsBtn.style.color = "#ffffff";
        saveSettingsBtn.disabled = true;
        break;
      case "success":
        saveSettingsBtn.innerHTML = "Saved!";
        saveSettingsBtn.style.background = "#34d399";
        saveSettingsBtn.style.color = "#000000";
        break;
      case "error":
        saveSettingsBtn.innerHTML = "Save Changes";
        saveSettingsBtn.style.background = "#800020";
        saveSettingsBtn.style.color = "#ffffff";
        apiKeyInput.style.borderColor = "#ef4444";
        apiKeyHint.style.color = "#ef4444";
        apiKeyHint.textContent = "Invalid API key. Check your key and try again.";
        apiKeyInput.classList.add("shake-animation");
        setTimeout(() => apiKeyInput.classList.remove("shake-animation"), 400);
        break;
    }
  }

  // Load saved API key and fetch fans
  chrome.storage.local.get(["extension_api_key"], (result) => {
    if (result.extension_api_key) {
      storedKey = result.extension_api_key;
      apiKeyInput.value = storedKey;
      setButtonState("idle");
      setConnectionState("connected");
      fetchFans(storedKey);
    } else {
      setButtonState("modified");
      setConnectionState("disconnected");
      setDropdownError();
    }
  });

  apiKeyInput.addEventListener("input", () => {
    if (apiKeyInput.value.trim() === storedKey && storedKey !== "") {
      setButtonState("idle");
    } else {
      setButtonState("modified");
    }
  });

  saveSettingsBtn.addEventListener("click", async () => {
    const key = apiKeyInput.value.trim();
    if (!key) return;

    setButtonState("saving");

    try {
      // Validate key by attempting to fetch fans
      const testResponse = await fetch(`${BACKEND_URL}/api/fans`, {
        headers: { "x-api-key": key }
      });

      if (testResponse.status === 401 || testResponse.status === 403) {
        throw new Error("Invalid key");
      }

      const testData = await testResponse.json();

      // Success
      chrome.storage.local.set({ extension_api_key: key }, () => {
        storedKey = key;
        setButtonState("success");
        setConnectionState("connected");

        // Populate fans from the validation response
        if (testData.success && testData.fans && testData.fans.length > 0) {
          fansData = testData.fans;
          populateFanDropdowns();
        }

        setTimeout(() => {
          setButtonState("idle");
        }, 2000);
      });
    } catch (err) {
      setConnectionState("disconnected");
      setButtonState("error");
    }
  });

  // Helper to get API key
  async function getApiKey() {
    return new Promise((resolve) => {
      chrome.storage.local.get(["extension_api_key"], (result) => {
        resolve(result.extension_api_key || "");
      });
    });
  }

  // Helper to handle auth errors
  function handleAuthError() {
    setConnectionState("disconnected");
    setButtonState("error");
    document.querySelector('.tab[data-target="settings"]').click();
  }

  // --- MEMORY VAULT SAVE LOGIC ---
  vaultForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fanId = fanSelect.value;
    const snippet = vaultInput.value.trim();
    if (!snippet || !fanId) return;

    const submitBtn = document.getElementById("save-vault-btn");
    submitBtn.textContent = "Saving...";
    submitBtn.disabled = true;

    try {
      const apiKey = await getApiKey();
      const fan = fansData.find(f => f.id === fanId);

      const response = await fetch(`${BACKEND_URL}/api/fans`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          username: fan ? fan.username : fanId,
          latestContext: snippet
        })
      });

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }

      if (response.ok) {
        vaultInput.value = "";
        // Re-fetch fans to get updated memories
        await fetchFans(apiKey);
      }
    } catch (error) {
      console.error("Vault save error:", error);
    } finally {
      submitBtn.textContent = "Save to Vault";
      submitBtn.disabled = false;
    }
  });

  // --- DM GENERATION LOGIC ---
  const dmForm = document.getElementById("dm-form");
  const generateBtn = document.getElementById("generate-btn");
  const outputContainer = document.getElementById("output-container");
  const dmOutput = document.getElementById("dm-output");
  const copyBtn = document.getElementById("copy-btn");

  dmForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dmFanId = dmFanSelect.value;
    const campaignGoal = document.getElementById("goal-input").value;
    const tone = document.getElementById("tone-input").value;
    const context = document.getElementById("context-input").value;

    generateBtn.disabled = true;
    generateBtn.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
      </svg>
      Initializing...
    `;
    outputContainer.classList.add("hidden");

    if (!document.getElementById("spin-style")) {
      const style = document.createElement("style");
      style.id = "spin-style";
      style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }

    const finishLoading = () => {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        Generate AI Outreach
      `;
    };

    const handleError = (error) => {
      console.error(error);
      dmOutput.textContent = `Error: ${error.message}`;
      outputContainer.classList.remove("hidden");
      finishLoading();
    };

    try {
      const apiKey = await getApiKey();
      const fan = fansData.find(f => f.id === dmFanId);

      const response = await fetch(`${BACKEND_URL}/api/generate-dm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "Authorization": apiKey ? `Bearer ${apiKey}` : "",
          "Origin": "chrome-extension://" + chrome.runtime.id,
        },
        body: JSON.stringify({
          fanId: dmFanId,
          targetAccount: fan ? fan.username : dmFanId,
          campaignGoal,
          tone,
          context
        })
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        throw new Error("Unauthorized. Please check your API Key.");
      }

      if (response.status === 402) {
        throw new Error(data.error || "Insufficient credits. Please upgrade your plan.");
      }

      if (!response.ok && response.status !== 202) {
        throw new Error(data.error || "Failed to generate outreach via API.");
      }

      // QStash async flow
      if (response.status === 202 && data.jobId) {
        generateBtn.innerHTML = `
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
          Queued...
        `;

        const pollJob = async () => {
          try {
            const pollRes = await fetch(`${BACKEND_URL}/api/jobs/${data.jobId}`, {
              headers: { "x-api-key": apiKey, "Authorization": apiKey ? `Bearer ${apiKey}` : "" }
            });
            if (!pollRes.ok) throw new Error("Polling failed");
            
            const jobData = await pollRes.json();
            if (jobData.status === "COMPLETED") {
              const resObj = jobData.result || {};
              const resultText = resObj.output || resObj.messageBody || "";
              const creditsInfo = resObj.creditsRemaining !== undefined ? `\n\n[Credits remaining: ${resObj.creditsRemaining}]` : "";
              dmOutput.textContent = resultText + creditsInfo;
              outputContainer.classList.remove("hidden");
              finishLoading();
            } else if (jobData.status === "FAILED") {
              throw new Error(jobData.error || "Job failed during generation.");
            } else {
              // PENDING / PROCESSING
              setTimeout(pollJob, 2000);
            }
          } catch (e) {
            handleError(e);
          }
        };

        setTimeout(pollJob, 2000);
      } else {
        // Synchronous fallback (just in case)
        const resultText = data.output || data.messageBody || data.generatedDm || data.text || data.message || "";
        const creditsInfo = data.creditsRemaining !== undefined ? `\n\n[Credits remaining: ${data.creditsRemaining}]` : "";
        dmOutput.textContent = resultText + creditsInfo;
        outputContainer.classList.remove("hidden");
        finishLoading();
      }

    } catch (error) {
      handleError(error);
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

  // Handle Insert Button
  const insertBtn = document.getElementById("insert-btn");
  if (insertBtn) {
    insertBtn.addEventListener("click", () => {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "insert_text", text: dmOutput.textContent });
      });
      insertBtn.textContent = "Inserted!";
      setTimeout(() => insertBtn.textContent = "Insert into Chat", 2000);
    });
  }

  // --- STATS / SEGMENTATION LOGIC ---
  const refreshStatsBtn = document.getElementById("refresh-stats-btn");
  const statTier = document.getElementById("stat-tier");
  const statLtv = document.getElementById("stat-ltv");

  async function fetchStats(fanId) {
    if (!fanId) return;
    statTier.textContent = "Loading...";
    statLtv.textContent = "...";
    try {
      const apiKey = await getApiKey();
      const response = await fetch(`${BACKEND_URL}/api/segmentation?fanId=${fanId}`, {
        headers: { "Authorization": apiKey ? `Bearer ${apiKey}` : "" }
      });
      if (response.status === 401 || response.status === 403) {
        handleAuthError();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        statTier.textContent = data.segment || "New";
        statLtv.textContent = data.ltv ? `$${data.ltv}` : "$0";
      } else {
        statTier.textContent = "Unknown";
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
      statTier.textContent = "Error";
    }
  }

  refreshStatsBtn.addEventListener("click", () => {
    fetchStats(fanSelect.value);
  });

  // Listen for storage changes from content script scraping
  chrome.storage.onChanged.addListener(async (changes, namespace) => {
    if (namespace === "local" && changes.currentFanId) {
      // A content script detected a new fan. Re-fetch fans to include new data.
      const apiKey = await getApiKey();
      if (apiKey) {
        await fetchFans(apiKey);
        // Try to select the newly scraped fan
        const newUsername = changes.currentFanId.newValue;
        const matchingFan = fansData.find(f => f.username === newUsername);
        if (matchingFan) {
          fanSelect.value = matchingFan.id;
          fanSelect.dispatchEvent(new Event("change"));
        }
      }
    }
  });
});
