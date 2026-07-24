const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$executeRawUnsafe("DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;");
    console.log("Trigger dropped.");
    
    await prisma.$executeRawUnsafe("DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;");
    console.log("Function dropped.");
    
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
