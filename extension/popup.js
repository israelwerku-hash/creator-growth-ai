document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const saveBtn = document.getElementById("saveBtn");
  const statusEl = document.getElementById("status");
  
  const fanSelect = document.getElementById("fanSelect");
  const memoryList = document.getElementById("memoryList");
  const newMemoryText = document.getElementById("newMemoryText");
  const saveMemoryBtn = document.getElementById("saveMemoryBtn");

  let fansData = [];

  // Load existing key when popup opens
  chrome.storage.local.get(["cg_api_key"], (result) => {
    if (result.cg_api_key) {
      apiKeyInput.value = result.cg_api_key;
      fetchFans(result.cg_api_key);
    } else {
      fanSelect.innerHTML = '<option value="">No fans found / Check API Key</option>';
      console.error("No API key found in storage.");
    }
  });

  async function fetchFans(apiKey) {
    try {
      const res = await fetch("http://localhost:3000/api/fans", {
        headers: { "x-api-key": apiKey }
      });
      const data = await res.json();
      if (res.ok && data.success && data.fans && data.fans.length > 0) {
        fansData = data.fans;
        populateFanDropdown();
      } else {
        fanSelect.innerHTML = '<option value="">No fans found / Check API Key</option>';
        console.error("Fetch fans failed or returned no fans:", data);
      }
    } catch (e) {
      fanSelect.innerHTML = '<option value="">No fans found / Check API Key</option>';
      console.error("Network error fetching fans:", e);
    }
  }

  function populateFanDropdown() {
    let selectedUsername = fanSelect.value;
    fanSelect.innerHTML = '';
    
    fansData.forEach(fan => {
      const opt = document.createElement("option");
      opt.value = fan.username;
      opt.textContent = `${fan.displayName || fan.username} ($${fan.totalSpend})`;
      fanSelect.appendChild(opt);
    });

    if (fansData.length > 0) {
      if (selectedUsername && fansData.some(f => f.username === selectedUsername)) {
        fanSelect.value = selectedUsername;
      } else {
        fanSelect.value = fansData[0].username;
      }
      fanSelect.dispatchEvent(new Event('change'));
    }
  }

  fanSelect.addEventListener("change", (e) => {
    const username = e.target.value;
    if (!username) {
      memoryList.innerHTML = '<div style="color: #52525B; font-size: 11px; text-align: center;">No fan selected</div>';
      return;
    }

    const fan = fansData.find(f => f.username === username);
    if (!fan || !fan.memories || fan.memories.length === 0) {
      memoryList.innerHTML = '<div style="color: #52525B; font-size: 11px; text-align: center;">No memories found.</div>';
      return;
    }

    memoryList.innerHTML = "";
    fan.memories.forEach(mem => {
      const div = document.createElement("div");
      div.className = "memory-item";
      if (mem.isPriority) div.style.borderColor = "rgba(245, 158, 11, 0.4)";
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
          <span style="color: #A1A1AA; font-size: 9px; text-transform: uppercase;">${mem.category}</span>
          <span style="color: #A1A1AA; font-size: 9px;">${new Date(mem.createdAt).toLocaleDateString()}</span>
        </div>
        <div style="color: #E4E4E7; word-wrap: break-word;">${mem.keyFact}</div>
      `;
      memoryList.appendChild(div);
    });
  });

  saveMemoryBtn.addEventListener("click", async () => {
    const username = fanSelect.value;
    const text = newMemoryText.value.trim();
    const apiKey = apiKeyInput.value.trim();

    if (!username || !text || !apiKey) return;

    saveMemoryBtn.disabled = true;
    saveMemoryBtn.innerText = "SAVING...";

    try {
      const res = await fetch("http://localhost:3000/api/fans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({
          username: username,
          latestContext: text
        })
      });
      
      const data = await res.json();
      if (data.success) {
        newMemoryText.value = "";
        await fetchFans(apiKey); // Refresh data
      }
    } catch (e) {
      console.error(e);
    } finally {
      saveMemoryBtn.disabled = false;
      saveMemoryBtn.innerText = "Save to Vault";
    }
  });

  // Save key on button click
  saveBtn.addEventListener("click", () => {
    const key = apiKeyInput.value.trim();
    
    // Disable button during save
    saveBtn.disabled = true;
    saveBtn.style.opacity = "0.7";
    saveBtn.innerText = "SAVING...";

    chrome.storage.local.set({ cg_api_key: key }, () => {
      // Restore button
      saveBtn.disabled = false;
      saveBtn.style.opacity = "1";
      saveBtn.innerText = "SAVE CONFIGURATION";

      // Show success message
      statusEl.style.display = "block";
      
      // Fetch fans now that we have a key
      fetchFans(key);

      // Hide success message after 2.5 seconds
      setTimeout(() => {
        statusEl.style.display = "none";
      }, 2500);
    });
  });
});
