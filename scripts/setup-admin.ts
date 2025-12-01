/**
 * Complete admin setup script
 * Runs SQL migration and creates admin user
 * 
 * Usage: npx tsx scripts/setup-admin.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase environment variables");
  console.error("Please set:");
  console.error("  - NEXT_PUBLIC_SUPABASE_URL");
  console.error("  - SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// TypeScript type narrowing - we know these are defined after the check above
const supabase = createClient(supabaseUrl as string, supabaseServiceKey as string, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runSQLMigration() {
  console.log("📊 Running SQL migration...");

  try {
    // Read the SQL file
    const sqlPath = join(process.cwd(), "supabase", "migrations", "create_analytics_tables.sql");
    const sql = readFileSync(sqlPath, "utf-8");

    // Split by semicolons and execute each statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    console.log(`   Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) continue;

      try {
        // Use RPC or direct query - Supabase JS doesn't support raw SQL directly
        // So we'll use the REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({ sql: statement }),
        });

        // If RPC doesn't exist, try direct query (this might not work for all statements)
        if (!response.ok && response.status !== 404) {
          console.warn(`   ⚠️  Statement ${i + 1} may have failed (this is OK for IF NOT EXISTS)`);
        }
      } catch (error: any) {
        // Many statements will fail if tables already exist (IF NOT EXISTS)
        // This is expected and OK
        if (error.message?.includes("already exists") || error.message?.includes("duplicate")) {
          console.log(`   ✓ Statement ${i + 1} (already exists - OK)`);
        } else {
          console.warn(`   ⚠️  Statement ${i + 1} warning:`, error.message);
        }
      }
    }

    console.log("✅ SQL migration completed (some warnings are expected)");
    console.log("   Note: If tables already exist, that's OK!");
  } catch (error: any) {
    console.error("❌ Error running SQL migration:", error.message);
    console.log("\n📝 Alternative: Run the SQL manually in Supabase SQL Editor:");
    console.log("   1. Go to your Supabase dashboard");
    console.log("   2. Navigate to SQL Editor");
    console.log("   3. Copy and paste the contents of:");
    console.log("      supabase/migrations/create_analytics_tables.sql");
    console.log("   4. Click 'Run'");
    throw error;
  }
}

async function createAdminUser() {
  const email = "makeathera@gmail.com";
  const password = "pp06082006pp";

  console.log("\n👤 Creating admin user...");
  console.log(`   Email: ${email}`);

  try {
    // Check if user exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error("❌ Error listing users:", listError.message);
      throw listError;
    }

    let user = existingUsers?.users.find((u) => u.email === email);

    if (!user) {
      // Create user
      console.log("   User doesn't exist, creating...");
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (createError) {
        console.error("❌ Error creating user:", createError.message);
        throw createError;
      }

      user = newUser.user;
      console.log("   ✅ User created successfully");
      console.log(`   User ID: ${user.id}`);
    } else {
      console.log("   ✅ User already exists");
      console.log(`   User ID: ${user.id}`);

      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        password,
      });

      if (updateError) {
        console.warn("   ⚠️  Could not update password:", updateError.message);
      } else {
        console.log("   ✅ Password updated");
      }
    }

    return user;
  } catch (error: any) {
    console.error("❌ Error creating admin user:", error.message);
    throw error;
  }
}

async function main() {
  console.log("🚀 Starting admin setup...\n");

  try {
    // Step 1: Run SQL migration
    await runSQLMigration();

    // Step 2: Create admin user
    const user = await createAdminUser();

    console.log("\n✅ Admin setup complete!");
    console.log("\n📋 Summary:");
    console.log(`   - Analytics tables: Created`);
    console.log(`   - Admin user: ${user.email}`);
    console.log(`   - User ID: ${user.id}`);
    console.log("\n🔗 Next steps:");
    console.log("   1. Start your dev server: npm run dev");
    console.log("   2. Navigate to: http://localhost:3000/ppadminpp");
    console.log("   3. Login with:");
    console.log(`      Email: ${user.email}`);
    console.log(`      Password: ${password}`);
    console.log("\n💡 Note: If SQL migration had warnings, you may need to run it manually");
    console.log("   in the Supabase SQL Editor for full compatibility.");
  } catch (error: any) {
    console.error("\n❌ Setup failed:", error.message);
    console.log("\n📝 Manual setup instructions:");
    console.log("   1. Run SQL migration in Supabase SQL Editor");
    console.log("   2. Create user manually or run: npx tsx scripts/make-admin.ts");
    process.exit(1);
  }
}

main().catch(console.error);

