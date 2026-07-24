import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Scanning for test stub accounts...");

  const stubs = await prisma.creator.findMany({
    where: {
      OR: [
        { id: { startsWith: "user_test_" } },
        { id: { startsWith: "test-groq-" } },
        { email: { startsWith: "test" } }, // Often used in tests
        { email: { contains: "example.com" } }
      ]
    }
  });

  if (stubs.length === 0) {
    console.log("✅ No test stubs found. Database is clean.");
    return;
  }

  console.log(`Found ${stubs.length} test stub(s). Purging...`);

  const idsToPurge = stubs.map(s => s.id);

  // Prisma relations for Fan, Metric, Goal etc are marked as onDelete: Cascade
  // so deleting the Creator will cascade delete associated records.
  const { count } = await prisma.creator.deleteMany({
    where: {
      id: { in: idsToPurge }
    }
  });

  console.log(`✅ Successfully purged ${count} test stub record(s) and their cascading relations.`);
}

main()
  .catch((e) => {
    console.error("❌ Error purging stubs:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
