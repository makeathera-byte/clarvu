import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Admin API route to reset password for admin users
 * Protected by secret key in query parameter
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password, secret } = await request.json();

    // Verify secret key (use a strong secret in production)
    const expectedSecret = process.env.ADMIN_PASSWORD_RESET_SECRET || "temp-reset-secret-change-in-production";
    
    if (secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Verify email is an admin email
    const { isAdminEmail } = await import("@/lib/utils/admin");
    if (!isAdminEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Email is not an admin email" },
        { status: 403 }
      );
    }

    const adminClient = createAdminClient();

    // Get user by email
    const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      return NextResponse.json(
        { success: false, error: "Error fetching users" },
        { status: 500 }
      );
    }

    const user = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Update user password
    const { data, error } = await adminClient.auth.admin.updateUserById(
      user.id,
      {
        password: password,
      }
    );

    if (error) {
      console.error("Error updating password:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
      email: data.user.email,
    });
  } catch (error: any) {
    console.error("Error in reset password:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

