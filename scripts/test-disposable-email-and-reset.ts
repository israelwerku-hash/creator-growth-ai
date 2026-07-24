import fetch from "node-fetch";

const API_URL = "http://localhost:3000";

async function runTests() {
  console.log("\n=======================================================");
  console.log("🛡️  DISPOSABLE EMAIL & RATE LIMIT SHIELD (RED TEAM)");
  console.log("=======================================================\n");

  let passedTests = 0;
  const totalTests = 3;

  // 1. DISPOSABLE EMAIL TEST
  console.log("[TEST 1] Disposable Email Blocking...");
  try {
    const res1 = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: "attacker@mailinator.com",
        password: "StrongPassword123!",
        name: "Hacker"
      }),
    });
    
    const data1 = await res1.json();
    if (res1.status === 400 && data1.error && data1.error.includes("Disposable or temporary email addresses are not permitted")) {
      console.log(`  ✅ BLOCKED: Mailinator address securely rejected (Status: 400)`);
      passedTests++;
    } else {
      console.log(`  ❌ VULNERABILITY: Disposable email allowed (Status: ${res1.status})`, data1);
    }
  } catch (e) {
    console.log(`  ❌ ERROR during Disposable test`);
  }

  // 2. LEGITIMATE EMAIL TEST
  console.log("\n[TEST 2] Legitimate Email Verification...");
  try {
    const res2 = await fetch(`${API_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: "validuser@gmail.com",
        password: "StrongPassword123!",
        name: "User"
      }),
    });
    
    const data2 = await res2.json();
    if (res2.status === 400 && data2.error && data2.error.includes("Disposable")) {
      console.log(`  ❌ FALSE POSITIVE: Gmail address rejected as disposable!`);
    } else {
      console.log(`  ✅ PASSED: Legitimate domain securely bypassed blocklist (Status: ${res2.status})`);
      passedTests++;
    }
  } catch (e) {
    console.log(`  ❌ ERROR during Legitimate email test`);
  }

  // 3. PASSWORD RESET LIMITER TEST
  console.log("\n[TEST 3] Password Reset Rate Limiting (Brute Force Protection)...");
  try {
    let rateLimited = false;
    for (let i = 0; i < 5; i++) {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "victim@example.com" }),
      });
      if (res.status === 429) {
        rateLimited = true;
        break;
      }
    }
    
    if (rateLimited) {
      console.log(`  ✅ BLOCKED: Forgot-Password flood successfully neutralized by Upstash (Status: 429)`);
      passedTests++;
    } else {
      console.log(`  ❌ VULNERABILITY: Endpoint permitted >3 requests within the 15-minute window!`);
    }
  } catch (e) {
    console.log(`  ❌ ERROR during Rate Limit test`);
  }

  console.log("\n=======================================================");
  console.log("📊 AUDIT SUMMARY");
  console.log("=======================================================");
  console.log(`Total Security Vectors Verified: ${totalTests}`);
  console.log(`Vectors Successfully Hardened: ${passedTests}`);
  
  if (passedTests === totalTests) {
    console.log("\n🛡️  STATUS: 100% SECURE. Disposable and Auth shields are fully fortified.");
  } else {
    console.log("\n⚠️  STATUS: VULNERABLE. Further hardening required.");
    process.exitCode = 1;
  }
}

runTests();
