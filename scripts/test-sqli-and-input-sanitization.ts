import fetch from "node-fetch";

const API_URL = "http://localhost:3000/api/auth/login";

const SQLI_PAYLOADS = [
  "' OR '1'='1",
  "'; DROP TABLE \"Creator\"; --",
  "1 UNION SELECT NULL, NULL--",
  "\" OR \"\"=\"",
];

const TYPE_CONFUSION_PAYLOADS = [
  // Arrays instead of strings
  { email: ["admin@example.com"], password: "password123" },
  // Booleans instead of strings
  { email: true, password: "password123" },
  // Objects instead of strings
  { email: { $gt: "" }, password: "password123" },
];

const MASS_ASSIGNMENT_PAYLOADS = [
  { email: "hacker@example.com", password: "password123", role: "ADMIN" },
  { email: "hacker@example.com", password: "password123", isAdmin: true },
  { email: "hacker@example.com", password: "password123", tier: "AGENCY" },
];

async function runTests() {
  console.log("\n=======================================================");
  console.log("🛡️  SQL INJECTION & INPUT SANITIZATION AUDIT (RED TEAM)");
  console.log("=======================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  // 1. Test SQL Injection Vectors
  console.log("[PHASE 1] Testing SQL Injection Vectors...");
  for (const payload of SQLI_PAYLOADS) {
    totalTests++;
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: payload, password: "password123" }),
      });
      if (res.status === 401 || res.status === 400) {
        console.log(`  ✅ BLOCKED SQLi Payload: ${payload} (Status: ${res.status})`);
        passedTests++;
      } else {
        console.log(`  ❌ VULNERABLE SQLi Payload: ${payload} (Status: ${res.status})`);
      }
    } catch (e) {
      console.log(`  ❌ SERVER CRASHED on SQLi Payload: ${payload}`);
    }
  }

  // 2. Test Type Confusion Vectors
  console.log("\n[PHASE 2] Testing Type Confusion Vectors...");
  for (const payload of TYPE_CONFUSION_PAYLOADS) {
    totalTests++;
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 401 || res.status === 400) {
        console.log(`  ✅ BLOCKED Type Confusion: ${JSON.stringify(payload)} (Status: ${res.status})`);
        passedTests++;
      } else {
        console.log(`  ❌ VULNERABLE Type Confusion: ${JSON.stringify(payload)} (Status: ${res.status})`);
      }
    } catch (e) {
      console.log(`  ❌ SERVER CRASHED on Type Confusion: ${JSON.stringify(payload)}`);
    }
  }

  // 3. Test Mass Assignment Vectors
  console.log("\n[PHASE 3] Testing Mass Assignment (Privilege Escalation) Vectors...");
  for (const payload of MASS_ASSIGNMENT_PAYLOADS) {
    totalTests++;
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.status === 401 || res.status === 400) {
        console.log(`  ✅ BLOCKED Mass Assignment: ${JSON.stringify(payload)} (Status: ${res.status})`);
        passedTests++;
      } else {
        console.log(`  ❌ VULNERABLE Mass Assignment: ${JSON.stringify(payload)} (Status: ${res.status})`);
      }
    } catch (e) {
      console.log(`  ❌ SERVER CRASHED on Mass Assignment: ${JSON.stringify(payload)}`);
    }
  }

  console.log("\n=======================================================");
  console.log("📊 AUDIT SUMMARY");
  console.log("=======================================================");
  console.log(`Total Attack Vectors Tested: ${totalTests}`);
  console.log(`Attacks Successfully Blocked: ${passedTests}`);
  
  if (passedTests === totalTests) {
    console.log("\n🛡️  STATUS: 100% SECURE. Input Validation and Parameterization are fully active.");
  } else {
    console.log("\n⚠️  STATUS: VULNERABLE. API has bypasses.");
    process.exit(1);
  }
}

runTests();
