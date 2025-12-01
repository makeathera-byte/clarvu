/**
 * Run SQL migration using direct database connection
 */

import { readFileSync } from "fs";
import { join } from "path";
import * as dotenv from "dotenv";
import { Client } from "pg";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing environment variables!");
  process.exit(1);
}

async function runMigration() {
  let client: Client | null = null;

  try {
    console.log("🚀 Running SQL migration via direct database connection...\n");

    // Extract project reference from URL
    const projectMatch = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/);
    if (!projectMatch) {
      throw new Error("Could not extract project ID from Supabase URL");
    }
    const projectRef = projectMatch[1];

    // Construct database connection string
    // Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
    // We need the database password - it's usually in the connection string from Supabase dashboard
    
    console.log("📋 Project Reference: " + projectRef);
    console.log("⚠️  To use direct database connection, we need the database password.");
    console.log("💡 Getting connection string from Supabase...\n");

    // Try to construct connection using service role key
    // The service role key can be used for REST API but not direct DB connection
    // We need the actual database password
    
    // Alternative: Use Supabase REST API to execute via a function
    // Or use the Management API if available
    
    console.log("🔍 Attempting to use Supabase Management API...\n");

    // Try using the Supabase Management API
    // The Management API endpoint for running SQL is:
    // POST https://api.supabase.com/v1/projects/{project_ref}/database/query
    
    const managementApiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
    
    // Read SQL file
    const sqlPath = join(process.cwd(), "supabase", "migrations", "create_analytics_tables.sql");
    const sql = readFileSync(sqlPath, "utf-8");

    console.log("📄 SQL migration loaded\n");
    console.log("🌐 Attempting to execute via Management API...\n");

    // Try Management API (requires access token, not service role key)
    // The Management API uses a different authentication method
    // We'd need the Supabase access token from the dashboard
    
    // Since we don't have the access token, let's try a different approach
    // We can use the Supabase client to create a function that executes SQL
    // Or we can provide instructions for getting the connection string
    
    console.log("💡 Management API requires Supabase access token.");
    console.log("📝 Alternative: Use database connection string\n");
    
    console.log("🔗 To get your database connection string:");
    console.log("   1. Go to: https://supabase.com/dashboard/project/" + projectRef + "/settings/database");
    console.log("   2. Find 'Connection string' section");
    console.log("   3. Copy the 'URI' or 'Connection pooling' connection string");
    console.log("   4. It looks like: postgresql://postgres.[ref]:[password]@...");
    console.log("\n");

    // If we had the connection string, we could do:
    /*
    const connectionString = process.env.DATABASE_URL; // Would need to be set
    client = new Client({ connectionString });
    await client.connect();
    await client.query(sql);
    await client.end();
    */

    // For now, let's try using the Supabase client with service role to create tables
    // via REST API - but this won't work for DDL statements
    
    console.log("⚡ Trying alternative method: Using Supabase client...\n");

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if tables already exist
    console.log("🔍 Checking if tables already exist...\n");
    
    const { data: visitsCheck, error: visitsError } = await supabase
      .from("visits")
      .select("id")
      .limit(1);
    
    if (!visitsError || !visitsError.message.includes("does not exist")) {
      console.log("✅ 'visits' table already exists!");
    } else {
      console.log("❌ 'visits' table does not exist");
    }

    const { data: signupsCheck, error: signupsError } = await supabase
      .from("signup_events")
      .select("id")
      .limit(1);
    
    if (!signupsError || !signupsError.message.includes("does not exist")) {
      console.log("✅ 'signup_events' table already exists!");
    } else {
      console.log("❌ 'signup_events' table does not exist");
    }

    const { data: usageCheck, error: usageError } = await supabase
      .from("usage_events")
      .select("id")
      .limit(1);
    
    if (!usageError || !usageError.message.includes("does not exist")) {
      console.log("✅ 'usage_events' table already exists!");
    } else {
      console.log("❌ 'usage_events' table does not exist");
    }

    console.log("\n");

    // Since we can't execute DDL via REST API, provide the SQL
    console.log("📋 SQL Migration (copy and paste into Supabase SQL Editor):");
    console.log("=".repeat(70));
    console.log(sql);
    console.log("=".repeat(70));
    console.log("\n");
    console.log("🔗 Direct link to SQL Editor:");
    console.log(`   https://supabase.com/dashboard/project/${projectRef}/sql/new\n`);

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error("\n📋 Please run the SQL manually in Supabase SQL Editor");
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

runMigration();

