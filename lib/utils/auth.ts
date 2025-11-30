/**
 * Authentication utility functions
 * Shared auth helpers for API routes and server actions
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Require authenticated user in API route
 * Returns user or throws Response for 401
 */
export async function requireUser(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return user;
}

/**
 * Validate service role key for internal API routes
 * Should NEVER be called from client components
 */
export function validateServiceRole(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
    return false;
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.substring(7);
  return token === serviceRoleKey;
}

/**
 * Require service role for internal API routes
 */
export function requireServiceRole(request: NextRequest) {
  if (!validateServiceRole(request)) {
    return Response.json(
      { success: false, error: "Unauthorized: Service role required" },
      { status: 401 }
    );
  }
  return null; // Success
}

