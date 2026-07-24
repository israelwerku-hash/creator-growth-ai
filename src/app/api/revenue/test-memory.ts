import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Find a Creator (or create a dummy one if you don't have one yet)
  const creator = await prisma.creator.findFirst() || await prisma.creator.create({
    data: { id: 'user_test_12345', email: 'test@example.com', name: 'Test Creator' }
  });

  // 2. Create a test Fan
  const fan = await prisma.fan.create({
    data: {
      username: 'fan_123',
      creatorId: creator.id,
      memories: {
        create: {
          keyFact: 'Loves sci-fi movies',
          category: 'Interests'
        }
      }
    },
    include: { memories: true }
  });

  console.log('Successfully created fan and memory:', fan);

  // 3. Retrieve the memory
  const foundFan = await prisma.fan.findUnique({
    where: { id: fan.id },
    include: { memories: true }
  });

  console.log('Retrieved from DB:', foundFan);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());