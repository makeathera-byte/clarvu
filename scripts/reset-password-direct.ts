/**
 * Direct password reset script
 * Make sure to set SUPABASE_SERVICE_ROLE_KEY in your environment
 * Run with: npx tsx scripts/reset-password-direct.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

async function resetPassword() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing environment variables:");
    console.error("   - NEXT_PUBLIC_SUPABASE_URL");
    console.error("   - SUPABASE_SERVICE_ROLE_KEY");
    console.error("\nPlease set these in your .env.local file");
    process.exit(1);
  }

  const email = "pavlepavloviccontent@gmail.com";
  const newPassword = "pp06082006pp";

  try {
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get user by email
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError) {
      console.error("❌ Error listing users:", listError.message);
      return;
    }

    const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      return;
    }

    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);

    // Update user password
    const { data, error } = await adminClient.auth.admin.updateUserById(
      user.id,
      {
        password: newPassword,
      }
    );

    if (error) {
      console.error("❌ Error updating password:", error.message);
      return;
    }

    console.log("\n✅ Password reset successfully!");
    console.log(`   User: ${data.user.email}`);
    console.log(`   New password: ${newPassword}`);
    console.log("\n📝 You can now log in with these credentials.");
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  }
}

resetPassword();

