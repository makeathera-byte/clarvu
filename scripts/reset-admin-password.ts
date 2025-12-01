/**
 * Script to reset admin password
 * Run with: npx tsx scripts/reset-admin-password.ts
 */

import { createAdminClient } from "@/lib/supabase/admin";

async function resetAdminPassword() {
  const email = "pavlepavloviccontent@gmail.com";
  const newPassword = "pp06082006pp";

  try {
    const adminClient = createAdminClient();

    // Get user by email
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      return;
    }

    const user = users.find((u) => u.email === email);

    if (!user) {
      console.error(`User with email ${email} not found`);
      return;
    }

    console.log(`Found user: ${user.email} (ID: ${user.id})`);

    // Update user password
    const { data, error } = await adminClient.auth.admin.updateUserById(
      user.id,
      {
        password: newPassword,
      }
    );

    if (error) {
      console.error("Error updating password:", error);
      return;
    }

    console.log("✅ Password reset successfully!");
    console.log(`User: ${data.user.email}`);
    console.log(`New password: ${newPassword}`);
    console.log("\nYou can now log in with these credentials.");
  } catch (error: any) {
    console.error("Error:", error.message);
  }
}

resetAdminPassword();

