/**
 * Script to make a user an admin
 * Run with: npx tsx scripts/make-admin.ts
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

// TypeScript type narrowing - we know these are defined after the check above
const supabase = createClient(supabaseUrl as string, supabaseServiceKey as string);

async function makeAdmin() {
  const email = "makeathera@gmail.com";
  const password = "pp06082006pp";

  console.log(`Making ${email} an admin...`);

  // First, check if user exists
  const { data: existingUser, error: findError } = await supabase.auth.admin.listUsers();

  if (findError) {
    console.error("Error finding users:", findError);
    return;
  }

  let user = existingUser?.users.find((u) => u.email === email);

  if (!user) {
    // Create user if doesn't exist
    console.log("User doesn't exist, creating...");
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return;
    }

    user = newUser.user;
    console.log("✅ User created:", user.id);
  } else {
    console.log("✅ User already exists:", user.id);
    
    // Update password if needed
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password,
    });

    if (updateError) {
      console.error("Error updating password:", updateError);
    } else {
      console.log("✅ Password updated");
    }
  }

  console.log("\n✅ Admin setup complete!");
  console.log(`Email: ${email}`);
  console.log(`User ID: ${user.id}`);
  console.log("\nYou can now access the admin panel at: /ppadminpp");
}

makeAdmin().catch(console.error);

