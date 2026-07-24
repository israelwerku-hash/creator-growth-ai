const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuplicates() {
  try {
    console.log("🔍 Scanning Creator table for duplicate emails...");

    // Group by email and count occurrences
    const duplicates = await prisma.creator.groupBy({
      by: ['email'],
      _count: {
        email: true,
      },
      having: {
        email: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    if (duplicates.length === 0) {
      console.log("✅ SUCCESS: Zero duplicate user records found! The @unique constraint is working perfectly.");
    } else {
      console.error(`❌ ERROR: Found ${duplicates.length} emails with duplicate records!`);
      console.error(duplicates);
      process.exit(1);
    }
  } catch (error) {
    console.error("Database query failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();
