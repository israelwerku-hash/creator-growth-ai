import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

// Load environment variables
config();

// Enable test mode to bypass Next.js cookies() in requireAuth()
process.env.TEST_MODE = "true";

import { POST as aiSegmentationHandler } from "../src/app/api/ai-segmentation/route";
import { POST as generateDmHandler } from "../src/app/api/generate-dm/route";
import { POST as languageTranslatorHandler } from "../src/app/api/language-translator/route";
import { POST as memoryVaultHandler } from "../src/app/api/memory-vault/route";

const prisma = new PrismaClient();

// Helper to simulate a Next.js App Router Request
async function invokeHandler(handler: Function, payload: any) {
  const req = new Request("http://localhost:3000/api/test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Add a dummy IP for the rate limiter
      "x-forwarded-for": "127.0.0.1",
    },
    body: JSON.stringify(payload),
  });

  const response = await handler(req);
  const data = await response.json();
  
  return {
    status: response.status,
    data,
  };
}

async function runTests() {
  console.log("=========================================");
  console.log("🤖 STARTING GROQ API ROUTE INTEGRATION TESTS");
  console.log("=========================================\n");

  let creatorId = "";
  const results: Record<string, { passed: boolean; message?: string }> = {};

  try {
    // 1. Setup Test User
    console.log("[Setup] Creating temporary test user with AI credits...");
    const creator = await prisma.creator.create({
      data: {
        id: `test-groq-${Date.now()}`,
        email: `groq-test-${Date.now()}@example.com`,
        name: "Groq Test User",
        aiCredits: 1000,
        role: "ADMIN" // Ensure RBAC passes
      }
    });
    creatorId = creator.id;
    process.env.TEST_MODE_USER_ID = creatorId;
    console.log(`[Setup] Created user: ${creatorId}\n`);

    // ---------------------------------------------------------
    // 2. Test ai-segmentation
    // ---------------------------------------------------------
    console.log("Testing [POST /api/ai-segmentation]...");
    const segRes = await invokeHandler(aiSegmentationHandler, {
      creatorId,
      fanId: "dummy-fan-id",
      chatHistory: "User buys a lot of videos and talks every day.",
      spendingBehavior: "High spender, bought $500 last month."
    });

    if (segRes.status === 200 && segRes.data.success) {
      const data = segRes.data.data;
      console.log(`   Output Snippet: ${JSON.stringify(data).substring(0, 150)}...`);
      
      // Semantic Verification
      if (Array.isArray(data.segments) && data.segments.length > 0 && typeof data.engagementScore === 'number') {
        console.log("   ✅ Semantic Alignment: PASSED");
        results["ai-segmentation"] = { passed: true };
      } else {
        console.error("   ❌ Semantic Alignment: FAILED (Invalid segment array or score)");
        results["ai-segmentation"] = { passed: false, message: "Semantic verification failed" };
      }
    } else {
      console.error("❌ FAILED:", segRes.data);
      results["ai-segmentation"] = { passed: false, message: JSON.stringify(segRes.data) };
    }

    // ---------------------------------------------------------
    // 3. Test generate-dm
    // ---------------------------------------------------------
    console.log("\nTesting [POST /api/generate-dm]...");
    const dmRes = await invokeHandler(generateDmHandler, {
      targetAccount: "Fitness Influencer",
      campaignGoal: "Sell workout program",
      tone: "casual",
      context: "They recently asked about my diet."
    });

    if (dmRes.status === 200 && !dmRes.data.error) {
      console.log(`   Output Snippet: ${JSON.stringify(dmRes.data).substring(0, 150)}...`);
      
      // Semantic Verification
      const msg = dmRes.data.messageBody;
      if (msg && msg.length > 10 && typeof dmRes.data.includesCallToAction === 'boolean') {
        console.log("   ✅ Semantic Alignment: PASSED");
        results["generate-dm"] = { passed: true };
      } else {
        console.error("   ❌ Semantic Alignment: FAILED (Missing or extremely short message body)");
        results["generate-dm"] = { passed: false, message: "Semantic verification failed" };
      }
    } else {
      console.error("❌ FAILED:", dmRes.data);
      results["generate-dm"] = { passed: false, message: JSON.stringify(dmRes.data) };
    }

    // ---------------------------------------------------------
    // 4. Test language-translator
    // ---------------------------------------------------------
    console.log("\nTesting [POST /api/language-translator]...");
    const sourceText = "Thank you for supporting my channel!";
    const langRes = await invokeHandler(languageTranslatorHandler, {
      textToTranslate: sourceText,
      targetLanguage: "Spanish"
    });

    if (langRes.status === 200 && !langRes.data.error) {
      console.log(`   Output Snippet: ${JSON.stringify(langRes.data).substring(0, 150)}...`);
      
      // Semantic Verification
      const translated = langRes.data.data?.translatedText || "";
      const isDifferent = translated !== sourceText;
      const hasSpanish = translated.toLowerCase().includes("gracias") || translated.toLowerCase().includes("canal");
      
      if (translated.length > 0 && isDifferent && hasSpanish) {
        console.log("   ✅ Semantic Alignment: PASSED");
        results["language-translator"] = { passed: true };
      } else {
        console.error("   ❌ Semantic Alignment: FAILED (Translation seems invalid or identical to source)");
        results["language-translator"] = { passed: false, message: "Semantic verification failed" };
      }
    } else {
      console.error("❌ FAILED:", langRes.data);
      results["language-translator"] = { passed: false, message: JSON.stringify(langRes.data) };
    }

    // ---------------------------------------------------------
    // 5. Test memory-vault
    // ---------------------------------------------------------
    console.log("\nTesting [POST /api/memory-vault]...");
    const memRes = await invokeHandler(memoryVaultHandler, {
      creatorId,
      fanId: "dummy-fan-id",
      chatHistory: "I really want a custom video of you playing guitar! I'd pay $100 easily."
    });

    if (memRes.status === 200 && memRes.data.success) {
      const data = memRes.data.data;
      console.log(`   Output Snippet: ${JSON.stringify(data).substring(0, 150)}...`);
      
      // Semantic Verification
      if (Array.isArray(data.keyInterests) && data.keyInterests.length > 0 && data.spendingSentiment !== 'unknown') {
        console.log("   ✅ Semantic Alignment: PASSED");
        results["memory-vault"] = { passed: true };
      } else {
        console.error("   ❌ Semantic Alignment: FAILED (Missing interests or unknown spending sentiment)");
        results["memory-vault"] = { passed: false, message: "Semantic verification failed" };
      }
    } else {
      console.error("❌ FAILED:", memRes.data);
      results["memory-vault"] = { passed: false, message: JSON.stringify(memRes.data) };
    }

  } catch (error: any) {
    console.error("Fatal test suite error:", error);
  } finally {
    // Cleanup
    if (creatorId) {
      console.log(`\n[Cleanup] Removing temporary user ${creatorId}...`);
      await prisma.creator.delete({ where: { id: creatorId } });
    }
    await prisma.$disconnect();

    // Final Summary
    console.log("\n=========================================");
    console.log("📊 TEST RUN SUMMARY (WITH SEMANTIC VERIFICATION)");
    console.log("=========================================");
    
    let allPassed = true;
    for (const [route, result] of Object.entries(results)) {
      if (result.passed) {
        console.log(`✅ ${route}: PASSED`);
      } else {
        console.log(`❌ ${route}: FAILED -> ${result.message}`);
        allPassed = false;
      }
    }

    if (allPassed && Object.keys(results).length === 4) {
      console.log("\n🎉 ALL ROUTES PASSED BOTH ZOD & SEMANTIC VERIFICATION SUCCESSFULLY");
      process.exit(0);
    } else {
      console.log("\n⚠️ SOME ROUTES FAILED OR WERE SKIPPED");
      process.exit(1);
    }
  }
}

runTests();
