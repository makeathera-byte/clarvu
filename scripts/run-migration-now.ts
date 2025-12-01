/**
 * Attempt to run SQL migration using Supabase Management API
 */

import { readFileSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables!");
  process.exit(1);
}

async function runMigration() {
  try {
    console.log("🚀 Attempting to create tables programmatically...\n");

    // Extract project reference
    const projectMatch = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
    if (!projectMatch) {
      throw new Error("Could not extract project ID");
    }
    const projectRef = projectMatch[1];

    console.log(`📦 Project: ${projectRef}\n`);

    // Read SQL
    const sqlPath = join(process.cwd(), "supabase", "migrations", "create_analytics_tables.sql");
    const sql = readFileSync(sqlPath, "utf-8");

    // Try Supabase Management API
    // Note: This typically requires an access token, not service role key
    const managementApiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
    
    console.log("🌐 Attempting Management API...\n");

    try {
      const response = await fetch(managementApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ query: sql }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("✅ Migration successful via Management API!");
        return;
      } else {
        console.log("⚠️  Management API response:", result);
        console.log("   Status:", response.status);
      }
    } catch (apiError: any) {
      console.log("⚠️  Management API not available:", apiError.message);
    }

    // Try alternative: Use Supabase client to execute via RPC
    console.log("\n🔄 Trying alternative method...\n");

    const { createClient } = await import("@supabase/supabase-js");
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are not defined");
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Try to create tables via a function (won't work, but let's try)
    // Actually, we can't execute DDL via REST API
    
    console.log("❌ Cannot execute DDL (CREATE TABLE) via REST API.");
    console.log("📋 Please run the SQL manually:\n");
    
    console.log("=".repeat(70));
    console.log("SQL MIGRATION");
    console.log("=".repeat(70));
    console.log(sql);
    console.log("=".repeat(70));
    console.log("\n");

    console.log("🔗 Direct link:");
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);

    // Try using Supabase CLI via npx
    console.log("💡 Trying Supabase CLI...\n");
    
    try {
      const { execSync } = await import("child_process");
      console.log("📝 Attempting to use Supabase CLI...");
      // This would require Supabase CLI to be configured
      console.log("   (Supabase CLI requires local setup)\n");
    } catch (e) {
      // CLI not available
    }

    console.log("📋 Manual Steps:");
    console.log("   1. Open: https://supabase.com/dashboard/project/" + projectRef + "/sql/new");
    console.log("   2. Paste the SQL above");
    console.log("   3. Click 'Run'");
    console.log("\n");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

runMigration();

