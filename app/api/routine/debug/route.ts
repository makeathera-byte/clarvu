import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow } from "@/lib/api/auth";
import { successResponse, errorResponse } from "@/lib/api/responses";

/**
 * GET /api/routine/debug
 * Debug endpoint to check routine_summaries table status
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getUserOrThrow();
    const supabase = await createClient();

    const today = new Date();
    const todayDateStr = today.toISOString().split("T")[0];

    // Check all routines for this user
    const allRoutines = await supabase
      .from("routine_summaries")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(10);

    // Check today's routine specifically
    const todayRoutine = await supabase
      .from("routine_summaries")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", todayDateStr)
      .maybeSingle();

    return successResponse({
      today: todayDateStr,
      allRoutines: allRoutines.data || [],
      allRoutinesError: allRoutines.error,
      todayRoutine: todayRoutine.data,
      todayRoutineError: todayRoutine.error,
      user_id: user.id,
    });
  } catch (error: any) {
    return errorResponse(error.message || "Debug check failed", 500);
  }
}

