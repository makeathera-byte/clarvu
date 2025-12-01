/**
 * Verify analytics tables exist and are accessible
 */

import { createAdminClient } from "@/lib/supabase/admin";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function verifyTables() {
  try {
    console.log("🔍 Verifying analytics tables...\n");

    const supabase = createAdminClient();

    // Check visits table
    console.log("Checking 'visits' table...");
    const { data: visits, error: visitsError } = await supabase
      .from("visits")
      .select("id")
      .limit(1);
    
    if (visitsError) {
      if (visitsError.code === "42P01" || visitsError.message?.includes("does not exist")) {
        console.log("❌ 'visits' table does NOT exist");
      } else {
        console.log("⚠️  'visits' table error:", visitsError.message);
      }
    } else {
      console.log("✅ 'visits' table exists and is accessible");
    }

    // Check signup_events table
    console.log("\nChecking 'signup_events' table...");
    const { data: signups, error: signupsError } = await supabase
      .from("signup_events")
      .select("id")
      .limit(1);
    
    if (signupsError) {
      if (signupsError.code === "42P01" || signupsError.message?.includes("does not exist")) {
        console.log("❌ 'signup_events' table does NOT exist");
      } else {
        console.log("⚠️  'signup_events' table error:", signupsError.message);
      }
    } else {
      console.log("✅ 'signup_events' table exists and is accessible");
    }

    // Check usage_events table
    console.log("\nChecking 'usage_events' table...");
    const { data: usage, error: usageError } = await supabase
      .from("usage_events")
      .select("id")
      .limit(1);
    
    if (usageError) {
      if (usageError.code === "42P01" || usageError.message?.includes("does not exist")) {
        console.log("❌ 'usage_events' table does NOT exist");
      } else {
        console.log("⚠️  'usage_events' table error:", usageError.message);
      }
    } else {
      console.log("✅ 'usage_events' table exists and is accessible");
    }

    console.log("\n" + "=".repeat(70));
    console.log("📋 Summary:");
    console.log("=".repeat(70));
    
    if (visitsError?.code === "42P01" || signupsError?.code === "42P01" || usageError?.code === "42P01") {
      console.log("\n❌ Some tables are missing. Please run the SQL migration:");
      console.log("   npx tsx scripts/show-sql-migration.ts");
      console.log("\nThen copy and paste the SQL into Supabase SQL Editor.");
    } else {
      console.log("\n✅ All tables exist and are accessible!");
      console.log("   If you're still seeing 404 errors, check:");
      console.log("   1. SUPABASE_SERVICE_ROLE_KEY is set correctly");
      console.log("   2. Tables have proper RLS policies");
      console.log("   3. Service role key has proper permissions");
    }

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.message.includes("Missing Supabase admin credentials")) {
      console.error("\n💡 Make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local");
    }
  }
}

verifyTables();

