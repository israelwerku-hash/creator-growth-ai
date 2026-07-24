const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Applying Supabase Auth trigger...");

  try {
    await prisma.$executeRawUnsafe(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public."Creator" (id, email, name, tier, "aiCredits", has_completed_onboarding, has_completed_pricing, "updatedAt")
        VALUES (
          new.id,
          new.email,
          COALESCE(new.raw_user_meta_data->>'name', 'Creator'),
          'FREE',
          50,
          false,
          false,
          NOW()
        );
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    console.log("Function created.");

    await prisma.$executeRawUnsafe(`
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    `);
    console.log("Old trigger dropped (if existed).");

    await prisma.$executeRawUnsafe(`
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    `);
    console.log("New trigger created.");

    console.log("Successfully applied auto-provisioning trigger!");
  } catch (error) {
    console.error("Error applying trigger:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
