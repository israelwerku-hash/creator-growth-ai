const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addCredits() {
  await prisma.creator.update({
    where: { id: 'mock_developer_id' },
    data: { aiCredits: 1000 }
  });
  console.log('Credits updated successfully.');
  await prisma.$disconnect();
}

addCredits().catch(console.error);
