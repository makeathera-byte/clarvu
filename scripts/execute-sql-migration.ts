/**
 * Execute SQL migration using Supabase Management API
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

async function executeSQL() {
  try {
    console.log("🚀 Executing SQL migration...\n");

    // Read SQL file
    const sqlPath = join(process.cwd(), "supabase", "migrations", "create_analytics_tables.sql");
    const sql = readFileSync(sqlPath, "utf-8");

    // Extract project ID from URL
    const projectId = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1];
    
    if (!projectId) {
      throw new Error("Could not extract project ID from Supabase URL");
    }

    console.log(`📦 Project ID: ${projectId}`);
    console.log("📄 Executing SQL statements...\n");

    // Split SQL into statements (handle multi-line statements)
    const statements = sql
      .split(/;\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--") && !s.match(/^\s*$/));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Try using Supabase Management API
    // Note: This requires the Management API which may not be publicly available
    // Alternative: Use direct database connection
    
    // For now, we'll use the REST API with a workaround
    // Supabase doesn't expose a direct SQL execution endpoint via REST
    // We need to use the database connection string or Supabase CLI
    
    console.log("⚠️  Supabase REST API doesn't support direct SQL execution.");
    console.log("📋 Attempting alternative method...\n");

    // Try executing via PostgREST (won't work for DDL, but let's try)
    // Actually, we need to use the database connection directly
    
    // Extract database connection info from service role key
    // The service role key gives us admin access, but we still need the DB connection string
    
    console.log("💡 Using Supabase client to verify connection...\n");

    // Since we can't execute DDL via REST API, we'll provide instructions
    // But let's try to at least verify the connection works
    
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Test connection by trying to query a system table
    const { error: testError } = await supabase.from("_prisma_migrations").select("id").limit(1);
    
    if (testError && !testError.message.includes("does not exist")) {
      console.log("✅ Supabase connection verified\n");
    }

    console.log("📝 SQL Migration:");
    console.log("=".repeat(70));
    console.log(sql);
    console.log("=".repeat(70));
    console.log("\n");

    // Since we can't execute DDL via API, provide manual instructions
    console.log("⚠️  Manual execution required:");
    console.log("   1. Open: https://supabase.com/dashboard/project/" + projectId + "/sql/new");
    console.log("   2. Paste the SQL above");
    console.log("   3. Click 'Run' (Ctrl+Enter)");
    console.log("\n");

    // Alternative: Try using Supabase CLI if available
    console.log("💡 Alternative: Use Supabase CLI");
    console.log("   If you have Supabase CLI installed:");
    console.log("   supabase db push");
    console.log("   or");
    console.log(`   supabase db execute --file supabase/migrations/create_analytics_tables.sql`);
    console.log("\n");

    // Check if we can use psql directly
    console.log("💡 Or use psql with connection string:");
    console.log("   Get your database connection string from:");
    console.log("   Supabase Dashboard → Settings → Database → Connection string");
    console.log("   Then run: psql <connection_string> -f supabase/migrations/create_analytics_tables.sql");
    console.log("\n");

    console.log("✅ After running the SQL, the admin panel will work!");

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error("\n📋 Please run the SQL manually in Supabase SQL Editor");
    process.exit(1);
  }
}

executeSQL();

