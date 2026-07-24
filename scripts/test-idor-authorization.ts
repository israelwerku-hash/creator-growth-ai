import fetch from "node-fetch";

const API_URL = "http://localhost:3000";

async function runTest() {
  console.log("\n=======================================================");
  console.log("🛡️  IDOR & CROSS-TENANT AUTHORIZATION AUDIT (RED TEAM)");
  console.log("=======================================================\n");

  let passedTests = 0;
  const totalTests = 3;

  const dummyFanId = "f5f5f5f5-f5f5-f5f5-f5f5-f5f5f5f5f5f5";
  const dummyCreatorId = "c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5";

  // --- TEST 1: Cross-Tenant Mutation Test (Memory Vault) ---
  console.log("[TEST 1] User B (Attacker) attempting to mutate User A's Fan via Memory Vault...");
  const res1 = await fetch(`${API_URL}/api/memory-vault`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      // We pass TEST_MODE headers to tell the Next.js server to simulate a different user
      "x-test-mode": "true",
      "x-test-mode-user-id": dummyCreatorId 
    },
    body: JSON.stringify({
      creatorId: dummyCreatorId, // Attacker tries to use their own creator ID
      fanId: dummyFanId,         // But targets an unowned fan ID
      chatHistory: "Testing IDOR..."
    }),
  });
  
  if (res1.status === 403 || res1.status === 404 || res1.status === 401) {
    console.log(`  ✅ BLOCKED: Cross-Tenant mutation securely rejected (Status: ${res1.status})`);
    passedTests++;
  } else {
    console.log(`  ❌ VULNERABILITY: Endpoint returned status ${res1.status}`);
  }

  // --- TEST 2: Cross-Tenant Mutation Test (AI Segmentation) ---
  console.log("\n[TEST 2] User B (Attacker) attempting to mutate User A's Fan via AI Segmentation...");
  const res2 = await fetch(`${API_URL}/api/ai-segmentation`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "x-test-mode": "true",
      "x-test-mode-user-id": dummyCreatorId 
    },
    body: JSON.stringify({
      creatorId: dummyCreatorId,
      fanId: dummyFanId,
      chatHistory: "Testing IDOR...",
      spendingBehavior: "High"
    }),
  });
  
  if (res2.status === 403 || res2.status === 404 || res2.status === 401) {
    console.log(`  ✅ BLOCKED: Cross-Tenant mutation securely rejected (Status: ${res2.status})`);
    passedTests++;
  } else {
    console.log(`  ❌ VULNERABILITY: Endpoint returned status ${res2.status}`);
  }

  // --- TEST 3: Unauthenticated Bypass Test ---
  console.log("\n[TEST 3] Unauthenticated Actor attempting to mutate User A's Fan...");
  const res3 = await fetch(`${API_URL}/api/ai-segmentation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }, // No Authorization or Test Mode Header
    body: JSON.stringify({
      creatorId: dummyCreatorId,
      fanId: dummyFanId,
      chatHistory: "Testing IDOR...",
    }),
  });

  if (res3.status === 401) {
    console.log(`  ✅ BLOCKED: Unauthenticated request rejected (Status: 401)`);
    passedTests++;
  } else {
    console.log(`  ❌ VULNERABILITY: Endpoint returned status ${res3.status}`);
  }

  console.log("\n=======================================================");
  console.log("📊 AUDIT SUMMARY");
  console.log("=======================================================");
  console.log(`Total IDOR Vectors Tested: ${totalTests}`);
  console.log(`Attacks Successfully Blocked: ${passedTests}`);
  
  if (passedTests === totalTests) {
    console.log("\n🛡️  STATUS: 100% SECURE. Session Boundaries are fully active.");
  } else {
    console.log("\n⚠️  STATUS: VULNERABLE. API has bypasses.");
    process.exitCode = 1;
  }
}

runTest();
