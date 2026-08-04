require('dotenv').config();

// Override DATABASE_URL with DIRECT_URL for CLI scripts to avoid pooler exhaustion
if (process.env.DIRECT_URL) {
  process.env.DATABASE_URL = process.env.DIRECT_URL;
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

const BASE_URL = 'http://localhost:3000';
const TARGET_EMAIL = 'israelwerku@gmail.com';

async function runE2ELoop() {
  console.log("\n===================================================");
  console.log("E2E DATA LOOP TEST: Scrape -> Segment -> Gen -> Translate");
  console.log("===================================================\n");

  let user = await prisma.creator.findFirst({
    where: { email: TARGET_EMAIL }
  });

  if (!user) {
    console.error(`❌ User with email ${TARGET_EMAIL} not found in database.`);
    await prisma.$disconnect();
    return;
  }
  
  if (!user.apiKey) {
    const newKey = `sk_live_${crypto.randomBytes(16).toString('hex')}`;
    user = await prisma.creator.update({
      where: { id: user.id },
      data: { apiKey: newKey }
    });
  }

  const API_KEY = user.apiKey;
  const initialCredits = user.aiCredits;
  let currentCredits = initialCredits;

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    'Authorization': `Bearer ${API_KEY}`,
    'Origin': 'chrome-extension://local-test' // Bypass CSRF
  };

  const testFanUsername = `sophia_test_${Date.now()}`;
  let fanId = "";
  let generatedDm = "";

  try {
    // ----------------------------------------------------
    // STEP 1: MOCK EXTENSION SCRAPE (POST /api/fans)
    // ----------------------------------------------------
    console.log(`[STEP 1] Mock Extension Scrape -> POST /api/fans`);
    const scrapePayload = {
      username: testFanUsername,
      displayName: 'Sophia (Gym Girl)',
      totalSpent: 450,
      latestContext: 'Loves gym content, always asks for workout videos.'
    };

    const scrapeRes = await fetch(`${BASE_URL}/api/fans`, {
      method: 'POST',
      headers,
      body: JSON.stringify(scrapePayload)
    });

    if (!scrapeRes.ok) throw new Error(`Scrape Failed: ${await scrapeRes.text()}`);
    const scrapeData = await scrapeRes.json();
    console.log(`✅ Step 1 Passed: Fan Scraped successfully. Fan ID: ${scrapeData.fanId}`);
    fanId = scrapeData.fanId;

    // ----------------------------------------------------
    // STEP 2: VERIFY VAULT & SEGMENTATION (GET /api/fans)
    // ----------------------------------------------------
    console.log(`\n[STEP 2] Verify Vault & Segmentation -> GET /api/fans`);
    const vaultRes = await fetch(`${BASE_URL}/api/fans`, {
      method: 'GET',
      headers
    });

    if (!vaultRes.ok) throw new Error(`Vault Fetch Failed: ${await vaultRes.text()}`);
    const vaultData = await vaultRes.json();
    
    const fetchedFan = vaultData.fans.find(f => f.username === testFanUsername);
    if (!fetchedFan) throw new Error(`Verification Failed: ${testFanUsername} not found in fans list.`);
    
    const memory = fetchedFan.memories && fetchedFan.memories[0];
    if (!memory || !memory.keyFact.includes('gym')) {
      throw new Error(`Verification Failed: Memory vector missing or incorrect. Found: ${memory?.keyFact}`);
    }
    
    console.log(`✅ Step 2 Passed: Fan verified in DB. Spend: $${fetchedFan.totalSpend}. Memory: "${memory.keyFact}"`);

    // ----------------------------------------------------
    // STEP 3: MOCK DM GENERATION (POST /api/generate-dm)
    // ----------------------------------------------------
    console.log(`\n[STEP 3] Mock DM Generation -> POST /api/generate-dm`);
    const dmPayload = {
      fanId: fanId,
      targetAccount: testFanUsername,
      campaignGoal: 'Upsell PPV',
      tone: 'Flirty',
      context: 'They want to see my new gym outfit.'
    };

    const dmRes = await fetch(`${BASE_URL}/api/generate-dm`, {
      method: 'POST',
      headers,
      body: JSON.stringify(dmPayload)
    });

    if (!dmRes.ok) throw new Error(`DM Gen Failed: ${await dmRes.text()}`);
    const dmData = await dmRes.json();
    generatedDm = dmData.output || dmData.generatedDm || dmData.messageBody || dmData.text;
    
    if (!generatedDm || generatedDm.length < 5) {
      throw new Error("DM Gen Failed: Returned empty or invalid string.");
    }
    
    console.log(`✅ Step 3 Passed: AI Generated DM:`);
    console.log(`   "${generatedDm.substring(0, 150)}..."`);

    // ----------------------------------------------------
    // STEP 4: MOCK TRANSLATOR (POST /api/language-translator)
    // ----------------------------------------------------
    console.log(`\n[STEP 4] Mock Translator -> POST /api/language-translator`);
    const translatePayload = {
      textToTranslate: generatedDm,
      targetLanguage: 'Spanish'
    };

    const translateRes = await fetch(`${BASE_URL}/api/language-translator`, {
      method: 'POST',
      headers,
      body: JSON.stringify(translatePayload)
    });

    if (!translateRes.ok) throw new Error(`Translation Failed: ${await translateRes.text()}`);
    const translateData = await translateRes.json();
    
    if (!translateData.data || !translateData.data.translatedText) {
      throw new Error(`Translation Failed: Missing translatedText in response. Received: ${JSON.stringify(translateData)}`);
    }
    
    console.log(`✅ Step 4 Passed: Translated to Spanish:`);
    console.log(`   "${translateData.data.translatedText.substring(0, 150)}..."`);
    
    // Check credits
    const updatedUser = await prisma.creator.findFirst({ where: { id: user.id } });
    const creditsUsed = initialCredits - updatedUser.aiCredits;
    console.log(`\n✅ E2E LOOP COMPLETE! Total Credits Consumed: ${creditsUsed}`);

  } catch (err) {
    console.error(`\n❌ E2E Loop Failed:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ELoop();
