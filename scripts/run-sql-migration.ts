/**
 * Run SQL migration using Supabase Management API
 * This is a more reliable way to run migrations
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables");
  process.exit(1);
}

async function runMigration() {
  console.log("📊 Running SQL migration via Supabase API...\n");

  try {
    const sqlPath = join(process.cwd(), "supabase", "migrations", "create_analytics_tables.sql");
    const sql = readFileSync(sqlPath, "utf-8");

    // Use Supabase REST API to execute SQL
    // Note: This requires the SQL to be executed via the PostgREST API
    // For complex migrations, it's better to use the Supabase dashboard

    console.log("⚠️  Direct SQL execution via API is limited.");
    console.log("📝 Please run the migration manually in Supabase SQL Editor:\n");
    console.log("   1. Go to: https://supabase.com/dashboard");
    console.log("   2. Select your project");
    console.log("   3. Navigate to: SQL Editor");
    console.log("   4. Copy and paste the SQL from:");
    console.log(`      ${sqlPath}\n`);
    console.log("   5. Click 'Run' or press Ctrl+Enter\n");

    // Show the SQL for easy copying
    console.log("📋 SQL to run:\n");
    console.log("─".repeat(60));
    console.log(sql);
    console.log("─".repeat(60));
    console.log("\n✅ After running the SQL, continue with admin user creation.");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

runMigration();

