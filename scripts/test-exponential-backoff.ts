import http from 'http';

const TARGET_URL = "http://localhost:3000/api/auth/login";
const TEST_EMAIL = `bruteforce_test_${Date.now()}@example.com`;
const TEST_PASSWORD = "wrongpassword123";

async function runBackoffTest() {
  console.log("=========================================");
  console.log("🔴 RED TEAM: EXPONENTIAL BACKOFF TEST");
  console.log(`Targeting: ${TEST_EMAIL}`);
  console.log("=========================================\n");

  let passed = true;

  for (let i = 1; i <= 12; i++) {
    console.log(`Firing Attempt ${i}/12...`);
    const start = Date.now();
    
    try {
      const res = await fetch(TARGET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
      });
      
      const elapsed = Date.now() - start;
      const data = await res.json();
      
      console.log(`   ⏱️  Time: ${elapsed}ms | Status: ${res.status} | Response: ${data.error}`);
      
      // Verification logic
      if (res.status !== 401 || data.error !== "Invalid credentials") {
        console.log(`   ❌ ERROR: State leaked! Response wasn't the generic 401.`);
        passed = false;
      }
      
      // Delay Verification
      if (i <= 5) {
        if (elapsed > 8000) {
          console.log(`   ❌ ERROR: Attempt ${i} took too long (${elapsed}ms). Should be instant/hash time.`);
          passed = false;
        }
      } else {
        const expectedDelay = Math.pow(2, i - 5) * 1000;
        // Check if elapsed is roughly expectedDelay (allow 500ms buffer for setTimeout imprecision)
        if (elapsed < expectedDelay - 500) {
          console.log(`   ❌ ERROR: Backoff failed! Attempt ${i} took ${elapsed}ms, expected ~${expectedDelay}ms.`);
          passed = false;
        }
      }

    } catch (err) {
      console.log(`   ❌ ERROR: Connection failed: ${err}`);
      passed = false;
    }
    console.log("");
  }

  console.log("=========================================");
  if (passed) {
    console.log("🎉 SUCCESS: Exponential Backoff & Zero State Leakage held strong!");
  } else {
    console.log("💥 FAILED: Vulnerabilities detected in the backoff system.");
  }
  console.log("=========================================");
}

runBackoffTest();
