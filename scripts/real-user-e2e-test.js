require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = `e2e_test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const API_KEY = 'dev_key_123'; // Extension API key

let sessionCookie = '';
let testUserId = '';

async function fetchCredits(userId) {
  const user = await prisma.creator.findUnique({
    where: { id: userId },
    select: { aiCredits: true }
  });
  return user?.aiCredits || 0;
}

async function verifyDbDeduction(userId, expectedCost, actionName) {
  const initialCredits = await fetchCredits(userId);
  return {
    initial: initialCredits,
    validate: async () => {
      const finalCredits = await fetchCredits(userId);
      const diff = initialCredits - finalCredits;
      
      const logEntry = await prisma.auditLog.findFirst({
        where: { actor: userId, action: `CREDIT_CONSUMPTION_${actionName}` },
        orderBy: { timestamp: 'desc' }
      });

      if (diff === expectedCost && logEntry) {
        console.log(`✅ DB Verified: -${expectedCost} credits. Log found.`);
        return true;
      } else {
        console.error(`❌ DB Verification Failed. Expected -${expectedCost}, got -${diff}. Log found: ${!!logEntry}`);
        return false;
      }
    }
  };
}

async function runScenarioA() {
  console.log("\n==============================================");
  console.log("SCENARIO A: WEB DASHBOARD USER (Session Auth)");
  console.log("==============================================");

  // 1. Sign up test user via Supabase JS
  console.log(`Signing up test user: ${TEST_EMAIL}...`);
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (signUpError && signUpError.message !== "User already registered") {
     console.error("Supabase client auth failed:", signUpError);
     return false;
  }
  
  // 2. Login via Next.js API to trigger @supabase/ssr cookie generation
  console.log(`Logging in via API to acquire session cookies...`);
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3000' },
    body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD })
  });
  
  if (!loginRes.ok) {
     console.error("Login API failed:", await loginRes.text());
     return false;
  }
  
  const setCookieHeader = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get('set-cookie')].filter(Boolean);
  if (setCookieHeader && setCookieHeader.length > 0) {
    // Next.js might return multiple chunked cookies. Join them properly for the Cookie header.
    sessionCookie = setCookieHeader.map(c => c.split(';')[0]).join('; ');
  } else {
    console.error("No Set-Cookie returned from login API");
    return false;
  }
  
  const user = await prisma.creator.findUnique({ where: { email: TEST_EMAIL } });
  testUserId = user?.id || signUpData?.user?.id;
  


  if (!testUserId) {
    console.error("User not found in DB after signup.");
    return false;
  }

  // Ensure creator record exists and has credits
  await prisma.creator.upsert({
    where: { id: testUserId },
    update: { aiCredits: 1000 },
    create: {
      id: testUserId, email: TEST_EMAIL, name: 'E2E Tester', role: 'CREATOR', tier: 'PRO', aiCredits: 1000
    }
  });

  // Seed a Fan for test user
  const webFanId = 'e2e_web_fan_' + Date.now();
  await prisma.fan.create({
    data: { id: webFanId, creatorId: testUserId, username: 'web_fan', segment: 'active' }
  });

  const headers = {
    'Content-Type': 'application/json',
    'Cookie': sessionCookie,
    'Origin': 'http://localhost:3000'
  };

  await executeEndpointTest('DM Generation (Web Session)', '/api/generate-dm', headers, testUserId, 30, 'DM_GENERATION', {
    fanId: webFanId, targetAccount: 'E2E Test', campaignGoal: 'Test', tone: 'Test', context: 'Test'
  });

  await executeEndpointTest('Memory Vault (Web Session)', '/api/memory-vault', headers, testUserId, 25, 'MEMORY_VAULT', {
    fanId: webFanId, snippet: 'Likes to test', sourceUrl: 'https://test.com'
  });

  await executeEndpointTest('AI Segmentation (Web Session)', '/api/ai-segmentation', headers, testUserId, 20, 'SEGMENTATION', {
    creatorId: testUserId, fanId: webFanId, chatHistory: ['hello'], spendingBehavior: 'Whale'
  });

  await executeEndpointTest('AI Translator (Web Session)', '/api/language-translator', headers, testUserId, 20, 'TRANSLATOR', {
    textToTranslate: 'Hello', targetLanguage: 'Spanish'
  });
  
  return true;
}

async function runScenarioB() {
  console.log("\n===================================================");
  console.log("SCENARIO B: CHROME EXTENSION USER (API Key Auth)");
  console.log("===================================================");

  const mockDevId = 'mock_developer_id';
  
  // Ensure mock_developer_id has credits
  await prisma.creator.upsert({
    where: { id: mockDevId },
    update: { aiCredits: 1000, apiKey: API_KEY },
    create: { id: mockDevId, email: 'mock_developer_id@dev.local', name: 'Mock Dev', role: 'CREATOR', tier: 'PRO', aiCredits: 1000, apiKey: API_KEY }
  });

  // Seed a Fan for mock dev
  const extFanId = 'e2e_ext_fan_' + Date.now();
  await prisma.fan.create({
    data: { id: extFanId, creatorId: mockDevId, username: 'ext_fan', segment: 'active' }
  });

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
    'Origin': 'chrome-extension://dummy_e2e_extension'
  };

  await executeEndpointTest('DM Generation (API Key)', '/api/generate-dm', headers, mockDevId, 30, 'DM_GENERATION', {
    fanId: extFanId, targetAccount: 'E2E Test', campaignGoal: 'Test', tone: 'Test', context: 'Test'
  });

  await executeEndpointTest('Memory Vault (API Key)', '/api/memory-vault', headers, mockDevId, 25, 'MEMORY_VAULT', {
    fanId: extFanId, snippet: 'Likes to test', sourceUrl: 'https://test.com'
  });

  await executeEndpointTest('AI Segmentation (API Key)', '/api/ai-segmentation', headers, mockDevId, 20, 'SEGMENTATION', {
    creatorId: mockDevId, fanId: extFanId, chatHistory: ['hello'], spendingBehavior: 'Whale'
  });

  await executeEndpointTest('AI Translator (API Key)', '/api/language-translator', headers, mockDevId, 20, 'TRANSLATOR', {
    textToTranslate: 'Hello', targetLanguage: 'Spanish'
  });
}

async function executeEndpointTest(testName, endpoint, headers, userId, expectedCost, actionName, body) {
  console.log(`\nTesting: [${testName}] -> ${endpoint}`);
  const dbAssertion = await verifyDbDeduction(userId, expectedCost, actionName);
  
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    if (res.ok) {
      console.log(`✅ HTTP Status 200 OK`);
      await dbAssertion.validate();
    } else {
      const data = await res.text();
      console.error(`❌ HTTP Status ${res.status}:`, data);
    }
  } catch (err) {
    console.error(`❌ Network Error:`, err.message);
  }
}

async function runScenarioC() {
  console.log("\n===================================================");
  console.log("SCENARIO C: UNIFIED ECOSYSTEM WORKFLOW");
  console.log("===================================================");

  if (!testUserId || !sessionCookie) {
    console.error("Skipping Scenario C: Web Session failed to initialize.");
    return;
  }

  // 1. Seed a Fan Memory vector
  const ecoFanId = 'e2e_eco_fan_' + Date.now();
  await prisma.fan.create({
    data: { id: ecoFanId, creatorId: testUserId, username: 'eco_fan', segment: 'active' }
  });

  await prisma.fanMemory.create({
    data: { 
      fanId: ecoFanId, 
      keyFact: "He loves PPV content",
      category: "Preference"
    }
  });

  const headers = {
    'Content-Type': 'application/json',
    'Cookie': sessionCookie,
    'Origin': 'http://localhost:3000'
  };

  console.log(`\nTesting: [Ecosystem Workflow] -> /api/generate-dm`);
  const dbAssertion = await verifyDbDeduction(testUserId, 30, 'DM_GENERATION');
  
  try {
    const res = await fetch(`${BASE_URL}/api/generate-dm`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        fanId: ecoFanId, 
        targetAccount: 'Ecosystem Test', 
        campaignGoal: 'Upsell PPV', 
        tone: 'Flirty & Playful', 
        context: 'Use ecosystem features'
      })
    });
    
    if (res.ok) {
      console.log(`✅ HTTP Status 200 OK`);
      await dbAssertion.validate();
      
      const data = await res.json();
      console.log(`✅ Ecosystem DM Result:`, data.messageBody);
      
      // Verify generated text incorporates the memory vector context (if LLM obeyed)
      if (data.messageBody && data.messageBody.toLowerCase().includes('ppv')) {
        console.log(`✅ Ecosystem Memory Vector Inclusion Confirmed.`);
      } else {
        console.warn(`⚠️ Ecosystem Memory Vector might not be explicitly mentioned. Result: ${data.messageBody}`);
      }
    } else {
      const data = await res.text();
      console.error(`❌ HTTP Status ${res.status}:`, data);
    }
  } catch (err) {
    console.error(`❌ Network Error:`, err.message);
  }
}

async function run() {
  const isWebOk = await runScenarioA();
  if (isWebOk) {
    await runScenarioB();
    await runScenarioC();
  }
  
  console.log("\nTest Suite Completed.");
  await prisma.$disconnect();
}

run();
