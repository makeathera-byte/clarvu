/**
 * Simple script to reset admin password via API
 * Run with: npx tsx scripts/reset-admin-password-simple.ts
 */

async function resetAdminPassword() {
  const email = "pavlepavloviccontent@gmail.com";
  const password = "pp06082006pp";
  const secret = "temp-reset-secret-change-in-production"; // Change this in production

  try {
    // Get the base URL from environment or use localhost
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    
    const response = await fetch(`${baseUrl}/api/admin/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        secret,
      }),
    });

    const data = await response.json();

    if (data.success) {
      console.log("✅ Password reset successfully!");
      console.log(`User: ${data.email}`);
      console.log(`New password: ${password}`);
      console.log("\nYou can now log in with these credentials.");
    } else {
      console.error("❌ Error:", data.error);
    }
  } catch (error: any) {
    console.error("Error:", error.message);
    console.log("\nMake sure your Next.js server is running on port 3000");
  }
}

resetAdminPassword();

