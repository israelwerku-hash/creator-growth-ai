import http from 'http';
import crypto from 'crypto';

const TARGET_URL = "http://localhost:3000";

async function runRedTeamAudit() {
  console.log("=========================================");
  console.log("🔴 RED TEAM PENETRATION AUDIT INITIATED");
  console.log("=========================================\n");

  let allPassed = true;

  // ----------------------------------------------------
  // ATTACK 1: HTTP Header Verification (Clickjacking/XSS)
  // ----------------------------------------------------
  console.log("⚔️  ATTACK 1: Header Verification (Checking Defense Headers)");
  try {
    const res = await fetch(`${TARGET_URL}/`);
    const xFrame = res.headers.get("x-frame-options");
    const csp = res.headers.get("content-security-policy");
    const hsts = res.headers.get("strict-transport-security");
    
    if (xFrame === "DENY" && csp && hsts) {
      console.log(`   ✅ DEFENSE HELD: Headers strictly configured.`);
      console.log(`      - X-Frame-Options: ${xFrame}`);
      console.log(`      - CSP: Active (starts with ${csp.substring(0, 20)}...)`);
      console.log(`      - HSTS: ${hsts}`);
    } else {
      console.log(`   ❌ BREACHED: Missing or weak security headers.`);
      allPassed = false;
    }
  } catch (err) {
    console.log(`   ⚠️  ERROR: Could not reach server. Is it running? (${TARGET_URL})`);
    process.exit(1);
  }
  console.log("");

  // ----------------------------------------------------
  // ATTACK 2: Payload Crash (Memory Exhaustion DoS)
  // ----------------------------------------------------
  console.log("⚔️  ATTACK 2: Massive Payload Injection (DoS Attempt)");
  try {
    // Generate an artificial 1MB payload string to blow past the 50KB limit
    const hugePayload = { data: "A".repeat(1000000) };
    
    const start = Date.now();
    const res = await fetch(`${TARGET_URL}/api/me`, {
      method: "POST", // using POST even though /me is typically GET to force body evaluation
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hugePayload)
    });
    const elapsed = Date.now() - start;

    if (res.status === 413) {
      console.log(`   ✅ DEFENSE HELD: Server intercepted oversized payload instantly (${elapsed}ms).`);
      console.log(`      Returned status: 413 Payload Too Large.`);
    } else {
      console.log(`   ❌ BREACHED: Server accepted or mishandled the payload (Status: ${res.status}).`);
      allPassed = false;
    }
  } catch (err) {
    console.log(`   ❌ BREACHED: Server crashed or reset connection! (${err})`);
    allPassed = false;
  }
  console.log("");

  // ----------------------------------------------------
  // ATTACK 3: Brute Force API Bombardment (Denial of Wallet)
  // ----------------------------------------------------
  console.log("⚔️  ATTACK 3: High-Frequency Flood (Denial of Wallet Attempt on /api/dm-generator)");
  try {
    const NUM_REQUESTS = 35; // The limit is 20, so 35 should trigger the 429
    console.log(`   Firing ${NUM_REQUESTS} simultaneous asynchronous requests...`);
    
    // Fire all at once
    const promises = Array.from({ length: NUM_REQUESTS }).map(() => 
      fetch(`${TARGET_URL}/api/generate-dm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetAccount: "Flood", campaignGoal: "Flood", tone: "Flood", context: "Flood" })
      })
    );
    
    const responses = await Promise.all(promises);
    
    // Count statuses
    const statusCounts = responses.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    if (statusCounts[429] && statusCounts[429] > 0) {
      console.log(`   ✅ DEFENSE HELD: Rate Limiter trapped the flood.`);
      console.log(`      - Allowed requests: ${statusCounts[401] || statusCounts[200] || statusCounts[500] || 0}`);
      console.log(`      - Blocked requests (429): ${statusCounts[429]}`);
    } else {
      console.log(`   ❌ BREACHED: Rate Limiter failed to catch the flood!`);
      console.log(`      Statuses returned:`, statusCounts);
      allPassed = false;
    }
  } catch (err) {
    console.log(`   ❌ BREACHED: Server crashed under load! (${err})`);
    allPassed = false;
  }
  console.log("");

  console.log("=========================================");
  if (allPassed) {
    console.log("🎉 RED TEAM AUDIT COMPLETE: Application is heavily fortified!");
  } else {
    console.log("💥 RED TEAM AUDIT COMPLETE: Vulnerabilities detected.");
  }
  console.log("=========================================");
}

runRedTeamAudit();
