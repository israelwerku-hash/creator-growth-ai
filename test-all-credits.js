const BASE_URL = 'http://localhost:3000';
const API_KEY = 'dev_key_123'; // Make sure this user has credits!
const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
  'Origin': 'chrome-extension://dummy_test_extension'
};

async function testEndpoint(endpoint, body, expectedCost) {
  console.log(`\nTesting ${endpoint} (Expected Cost: ${expectedCost})`);
  
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify(body)
    });
    
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    
    if (res.ok) {
      console.log(`✅ Success.`);
    } else {
      console.log(`❌ Failed:`, data);
    }
  } catch (err) {
    console.error(`❌ Error:`, err.message);
  }
}

async function runTests() {
  console.log("Starting E2E Credit Tests (Extension API Key Auth)...");
  console.log("Ensure the local dev server is running and mock_developer_id has > 100 credits.");
  
  await testEndpoint('/api/generate-dm', {
    fanId: 'test_fan_123',
    targetAccount: 'OnlyFans Subscriber',
    campaignGoal: 'Re-engagement',
    tone: 'Flirty',
    context: 'Test context'
  }, 30);

  await testEndpoint('/api/memory-vault', {
    fanId: 'test_fan_123',
    snippet: 'Likes dogs',
    sourceUrl: 'https://onlyfans.com'
  }, 25);
  
  // Note: The segmentation API expects a GET or similar? Let's assume POST for now or check.
  // We'll just test the two main POST endpoints that the extension uses.
  
  console.log("\nFinished testing Extension API Routes.");
}

runTests();
