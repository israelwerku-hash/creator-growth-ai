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

async function runIngestionTest() {
  console.log("\n===================================================");
  console.log("SCENARIO D: SCRAPER INGESTION (Extension Auto Sync)");
  console.log("===================================================");

  // 1. Look up the target user
  let user = await prisma.creator.findFirst({
    where: { email: TARGET_EMAIL }
  });

  if (!user) {
    console.error(`❌ User with email ${TARGET_EMAIL} not found in database.`);
    await prisma.$disconnect();
    return;
  }
  
  console.log(`✅ Found user: ${user.id} (${user.email})`);

  // 2. Ensure user has an API Key
  if (!user.apiKey) {
    const newKey = `sk_live_${crypto.randomBytes(16).toString('hex')}`;
    user = await prisma.creator.update({
      where: { id: user.id },
      data: { apiKey: newKey }
    });
    console.log(`✅ Generated new API key for user.`);
  }

  const API_KEY = user.apiKey;

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    'Origin': 'chrome-extension://local-test'
  };

  const payload = {
    "username": "alex_superfan",
    "displayName": "Alex (Superfan)",
    "totalSpent": 1450,
    "latestContext": "Loves exclusive custom PPV content"
  };

  console.log(`\nTesting: [Extension Sync] -> /api/fans as ${TARGET_EMAIL}`);
  
  try {
    const res = await fetch(`${BASE_URL}/api/fans`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      console.log(`✅ HTTP Status 200 OK`);
      
      const data = await res.json();
      console.log(`✅ Ingestion Result:`, data);
      
      // Verify DB Fan
      const fan = await prisma.fan.findFirst({
        where: { creatorId: user.id, username: 'alex_superfan' },
        include: { memories: true }
      });

      if (fan) {
        console.log(`✅ DB Verified: Fan record found for alex_superfan (Total Spent: $${fan.totalSpend})`);
        
        if (fan.memories && fan.memories.length > 0) {
           const latestMem = fan.memories[fan.memories.length - 1];
           console.log(`✅ DB Verified: FanMemory logged -> "${latestMem.keyFact}"`);
        } else {
           console.error(`❌ DB Verification Failed: No FanMemory found.`);
        }
      } else {
        console.error(`❌ DB Verification Failed: Fan record not found.`);
      }

    } else {
      const data = await res.text();
      console.error(`❌ HTTP Status ${res.status}:`, data);
    }
  } catch (err) {
    console.error(`❌ Network Error:`, err.message);
  } finally {
    await prisma.$disconnect();
  }
}

runIngestionTest();
