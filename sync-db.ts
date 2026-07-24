import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function forcePremiumSync() {
  const targetEmail = "israelwerku@gmail.com"; // The email from your successful checkout screen!

  console.log(`🚀 Forcing local profile sync for ${targetEmail}...`);

  try {
    // Look for the user or create a fresh entry if the table is blank
    const updatedCreator = await prisma.creator.upsert({
      where: { email: targetEmail },
      update: {
        tier: "PRO" // This matches your selected Pro Strategy Hub tier!
      },
      create: {
        id: "user_test_12345", // Keeping your default placeholder matching your UI
        email: targetEmail,
        name: "Israel",
        tier: "PRO"
      }
    });

    console.log("✅ Success! Database row created and upgraded directly:");
    console.log(updatedCreator);

  } catch (error) {
    console.error("❌ Synching execution failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

forcePremiumSync();