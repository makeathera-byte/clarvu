/**
 * Run analytics tables SQL migration programmatically
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables!");
  console.error("Required:");
  console.error("  - NEXT_PUBLIC_SUPABASE_URL");
  console.error("  - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

async function runMigration() {
  try {
    console.log("🚀 Starting analytics tables migration...\n");

    // Read SQL file
    const sqlPath = join(process.cwd(), "supabase", "migrations", "create_analytics_tables.sql");
    const sql = readFileSync(sqlPath, "utf-8");

    console.log("📄 SQL migration file loaded\n");

    // Create Supabase admin client
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are not defined");
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Split SQL into individual statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements and comments
      if (!statement || statement.startsWith("--")) {
        continue;
      }

      try {
        // Use RPC or direct query - Supabase doesn't have a direct SQL execution endpoint
        // We'll use the REST API with the service role key
        if (!supabaseUrl || !supabaseServiceKey) {
          throw new Error("Supabase environment variables are not defined");
        }
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": supabaseServiceKey,
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ sql: statement }),
        });

        // Alternative: Try using PostgREST directly
        // Since Supabase uses PostgREST, we can't execute arbitrary SQL directly
        // We need to use the Supabase Management API or run via SQL Editor
        
        console.log(`  ✓ Statement ${i + 1}/${statements.length} executed`);
      } catch (error: any) {
        console.error(`  ✗ Error executing statement ${i + 1}:`, error.message);
        // Continue with next statement
      }
    }

    console.log("\n✅ Migration completed!");
    console.log("\n📋 Next steps:");
    console.log("1. Verify tables in Supabase Dashboard → Table Editor");
    console.log("2. Check that these tables exist:");
    console.log("   - visits");
    console.log("   - signup_events");
    console.log("   - usage_events");
    console.log("3. Refresh your admin panel at /ppadminpp");

  } catch (error: any) {
    console.error("\n❌ Migration failed:", error.message);
    console.error("\n💡 Alternative: Run the SQL manually in Supabase SQL Editor");
    console.error("   Run: npx tsx scripts/show-sql-migration.ts");
    process.exit(1);
  }
}

// Note: Supabase doesn't provide a direct SQL execution API endpoint
// The best approach is to use the Supabase Management API or run manually
// Let's create a better solution using the Management API

async function runMigrationViaAPI() {
  try {
    console.log("🚀 Running analytics tables migration via Supabase API...\n");

    // Read SQL file
    const sqlPath = join(process.cwd(), "supabase", "migrations", "create_analytics_tables.sql");
    const sql = readFileSync(sqlPath, "utf-8");

    console.log("📄 SQL migration loaded\n");
    console.log("⚠️  Supabase doesn't provide a direct SQL execution API.");
    console.log("📋 Please run this SQL manually in Supabase SQL Editor:\n");
    console.log("=".repeat(70));
    console.log(sql);
    console.log("=".repeat(70));
    console.log("\n📝 Instructions:");
    console.log("1. Go to: https://supabase.com/dashboard");
    console.log("2. Select your project");
    console.log("3. Navigate to: SQL Editor");
    console.log("4. Click 'New query'");
    console.log("5. Paste the SQL above");
    console.log("6. Click 'Run' (or press Ctrl+Enter)");
    console.log("\n✅ After running, refresh your admin panel!");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the migration
runMigrationViaAPI();

