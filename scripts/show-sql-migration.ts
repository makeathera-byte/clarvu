/**
 * Display SQL migration for easy copy-paste
 */

import { readFileSync } from "fs";
import { join } from "path";

const sqlPath = join(process.cwd(), "supabase", "migrations", "create_analytics_tables.sql");

try {
  const sql = readFileSync(sqlPath, "utf-8");
  
  console.log("=".repeat(70));
  console.log("SQL MIGRATION - Copy and paste this into Supabase SQL Editor");
  console.log("=".repeat(70));
  console.log("\n");
  console.log(sql);
  console.log("\n");
  console.log("=".repeat(70));
  console.log("Instructions:");
  console.log("1. Go to: https://supabase.com/dashboard");
  console.log("2. Select your project");
  console.log("3. Navigate to: SQL Editor");
  console.log("4. Click 'New query'");
  console.log("5. Paste the SQL above");
  console.log("6. Click 'Run' (or press Ctrl+Enter)");
  console.log("=".repeat(70));
} catch (error: any) {
  console.error("Error reading SQL file:", error.message);
  process.exit(1);
}

