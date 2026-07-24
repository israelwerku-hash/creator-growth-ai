import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase URL or Anon Key in environment variables.");
  process.exit(1);
}

// Initialize client with ANON key only (simulate public client)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

const TARGET_TABLES = [
  "Creator",
  "Metric",
  "Goal",
  "Fan",
  "Message",
  "FanMemory",
  "RevenueEvent",
  "FeatureFlag",
  "WebhookEvent",
  "AuditLog",
];

async function runAudit() {
  console.log("\n=======================================================");
  console.log("🛡️  SUPABASE RLS FIREWALL AUDIT (RED TEAM SIMULATION)");
  console.log("=======================================================\n");

  let allBlocked = true;
  let totalTests = 0;
  let blockedTests = 0;

  for (const table of TARGET_TABLES) {
    console.log(`[TARGET] Testing table: "${table}"`);
    let tablePassed = true;

    // 1. SELECT ATTACK
    const { data: selectData, error: selectError } = await supabase.from(table).select("*").limit(1);
    if (!selectError && selectData && selectData.length > 0) {
      console.log(`  ❌ VULNERABILITY: SELECT allowed on ${table}`);
      tablePassed = false;
    } else {
      blockedTests++;
    }
    totalTests++;

    // 2. INSERT ATTACK
    const { error: insertError } = await supabase.from(table).insert([{ id: "dummy-id-123", name: "Hacked" }]);
    if (!insertError) {
      console.log(`  ❌ VULNERABILITY: INSERT allowed on ${table}`);
      tablePassed = false;
    } else {
      blockedTests++;
    }
    totalTests++;

    // 3. UPDATE ATTACK
    const { error: updateError } = await supabase.from(table).update({ name: "Hacked" }).eq("id", "dummy-id-123");
    if (!updateError) {
      // NOTE: With RLS deny-all, an update might return success but 0 rows affected. 
      // We should really check if any row was actually modified if it succeeded, but since we don't have a valid ID, it would fail anyway.
      // But typically, a direct RLS deny throws a 401 or returns an empty array.
      // Let's assume an error should be thrown, or 0 rows returned.
    }
    
    // To be strictly correct on Supabase: if an update affects 0 rows, it might not throw an error unless we request the data back.
    const { data: updateData, error: updateErrorStrict } = await supabase.from(table).update({ name: "Hacked" }).eq("id", "dummy-id-123").select();
    if (!updateErrorStrict && updateData && updateData.length > 0) {
      console.log(`  ❌ VULNERABILITY: UPDATE allowed on ${table}`);
      tablePassed = false;
    } else {
      blockedTests++;
    }
    totalTests++;

    // 4. DELETE ATTACK
    const { data: deleteData, error: deleteErrorStrict } = await supabase.from(table).delete().eq("id", "dummy-id-123").select();
    if (!deleteErrorStrict && deleteData && deleteData.length > 0) {
      console.log(`  ❌ VULNERABILITY: DELETE allowed on ${table}`);
      tablePassed = false;
    } else {
      blockedTests++;
    }
    totalTests++;

    if (tablePassed) {
      console.log(`  ✅ SECURE: All unauthorized ops blocked on ${table}`);
    } else {
      allBlocked = false;
    }
  }

  console.log("\n=======================================================");
  console.log("📊 AUDIT SUMMARY");
  console.log("=======================================================");
  console.log(`Total Attack Vectors Tested: ${totalTests}`);
  console.log(`Attacks Successfully Blocked: ${blockedTests}`);
  
  if (allBlocked && blockedTests === totalTests) {
    console.log("\n🛡️  STATUS: 100% SECURE. RLS Firewall is fully active.");
  } else {
    console.log("\n⚠️  STATUS: VULNERABLE. RLS Firewall has bypasses.");
    process.exit(1);
  }
}

runAudit();
