const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const createFunctionSql = `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public."Creator" (id, email, name, tier, "aiCredits", has_completed_onboarding, has_completed_pricing)
        VALUES (
          new.id, 
          new.email, 
          COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Creator'),
          'FREE',
          25,
          false,
          false
        )
        ON CONFLICT (id) DO NOTHING;
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;
    await prisma.$executeRawUnsafe(createFunctionSql);
    console.log("Function created.");

    await prisma.$executeRawUnsafe("DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;");
    
    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    `);
    console.log("Trigger created.");
    
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
