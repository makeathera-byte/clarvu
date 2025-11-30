import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Get the authenticated user or throw a 401 error
 */
export async function getUserOrThrow(): Promise<{ id: string; email?: string }> {
  const supabase = await createClient();
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized");
  }

  return {
    id: user.id,
    email: user.email,
  };
}

/**
 * Check if request has valid service role authorization
 */
export function validateServiceRole(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.replace("Bearer ", "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    return false;
  }

  return token === serviceRoleKey;
}

/**
 * Return 401 unauthorized response
 */
export function unauthorizedResponse() {
  return NextResponse.json(
    { success: false, error: "Unauthorized" },
    { status: 401 }
  );
}

/**
 * Return 403 forbidden response (for service role endpoints)
 */
export function forbiddenResponse() {
  return NextResponse.json(
    { success: false, error: "Forbidden - Service role required" },
    { status: 403 }
  );
}

