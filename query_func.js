const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const res = await prisma.$queryRawUnsafe("SELECT routine_definition FROM information_schema.routines WHERE routine_name = 'handle_new_user' OR routine_name = 'on_auth_user_created';");
    console.log(JSON.stringify(res, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
