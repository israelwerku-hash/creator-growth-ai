// test-engine.ts
import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
import { PrismaClient } from '@prisma/client';
import { safeGenerateReply, updateEngagementAndStreak, getReplySuggestions } from './src/services/aiMemory';

const prisma = new PrismaClient();

async function runSmokeTest() {
  console.log('--- 🚀 Starting Engine Smoke Test ---');

  // --- Seed test data ---
  console.log('\n[Setup] Creating test Creator & Fan...');
  const creator = await prisma.creator.create({
    data: { id: `smoke-creator-${Date.now()}`, email: `test-${Date.now()}@smoke.test`, name: 'Smoke Test Creator' },
  });
  const fan = await prisma.fan.create({
    data: {
      creatorId: creator.id,
      username: 'smoke-test-fan',
      displayName: 'Smoke Fan',
      isPriority: true,
    },
  });
  // Add a test message (long enough to trigger the >50 char bonus)
  await prisma.message.create({
    data: {
      fanId: fan.id,
      content: 'Hey! I absolutely love your content, keep up the amazing work you do every day!',
    },
  });
  console.log(`[Setup] Created Fan: ${fan.id}`);

  try {
    // 1. Test Translation & Memory Pipeline
    console.log('\n[1/3] Testing Translation & Memory...');
    const replyResult = await safeGenerateReply(fan.id, '¿Cómo estás?');
    console.log('Result:', replyResult);

    // 2. Test Streak & Engagement Logic
    console.log('\n[2/3] Testing Engagement & Streaks...');
    const streakResult = await updateEngagementAndStreak(fan.id);
    console.log('Streak Data:', streakResult);

    // 3. Test Smart Replies
    console.log('\n[3/3] Testing Smart-Reply Suggestions...');
    const suggestions = await getReplySuggestions(fan.id, 'Do you like football?');
    console.log('Suggestions:', suggestions);

    console.log('\n--- ✅ Smoke Test Complete! ---');
  } catch (error) {
    console.error('\n--- ❌ Smoke Test Failed ---');
    console.error(error);
  } finally {
    // --- Cleanup test data ---
    console.log('\n[Cleanup] Removing test data...');
    await prisma.message.deleteMany({ where: { fanId: fan.id } });
    await prisma.fanMemory.deleteMany({ where: { fanId: fan.id } });
    await prisma.fan.delete({ where: { id: fan.id } });
    await prisma.creator.delete({ where: { id: creator.id } });
    await prisma.$disconnect();
    console.log('[Cleanup] Done.');
  }
}

runSmokeTest();