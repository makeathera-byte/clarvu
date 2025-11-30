import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserOrThrow, unauthorizedResponse } from "@/lib/api/auth";
import { calculateDurationMinutes } from "@/lib/utils/time";

// Disable caching for this route to ensure fresh tips
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * GET /api/productivity-tips
 * Generate personalized productivity tips based on user's recent activity patterns
 */
export async function GET(request: NextRequest) {
  // Default fallback response - always available
  const defaultTips = [
    "Business Owner Tip: Track your time consistently to unlock personalized productivity insights.",
    "Productivity Principle: Focus on high-leverage activities that drive the most business value.",
    "Time Management: Batch similar tasks to minimize context switching and maximize deep work.",
  ];

  const createDefaultResponse = () => ({
    success: true,
    tips: defaultTips,
    metrics: {
      todayHours: 0,
      contextSwitches: 0,
      avgSessionDuration: 0,
      revenuePercentage: 0,
      peakHour: null,
    },
    timestamp: Date.now(),
  });

  try {
    // Step 1: Get user (with fallback)
    let user;
    try {
      user = await getUserOrThrow();
    } catch (authError: any) {
      console.error("[ProductivityTips] Auth error:", authError);
      if (authError?.message === "Unauthorized") {
        return unauthorizedResponse();
      }
      const response = NextResponse.json(createDefaultResponse());
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response;
    }

    // Step 2: Create Supabase client (with fallback)
    let supabase;
    try {
      supabase = await createClient();
      if (!supabase) {
        throw new Error("Supabase client is null");
      }
    } catch (supabaseError: any) {
      console.error("[ProductivityTips] Supabase client error:", supabaseError);
      const response = NextResponse.json(createDefaultResponse());
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response;
    }

    // Step 3: Get today's logs (with fallback)
    let todayLogs: any[] = [];
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEnd = new Date(today);
      todayEnd.setDate(todayEnd.getDate() + 1);

      const { data, error } = await supabase
        .from("activity_logs")
        .select(`
          *,
          categories (
            id,
            name,
            color,
            icon,
            business_type
          )
        `)
        .eq("user_id", user.id)
        .gte("start_time", today.toISOString())
        .lt("start_time", todayEnd.toISOString())
        .order("start_time", { ascending: false });

      if (error) {
        console.error("[ProductivityTips] Error fetching today's logs:", error);
        const response = NextResponse.json(createDefaultResponse());
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response;
      }

      todayLogs = data || [];
    } catch (queryError: any) {
      console.error("[ProductivityTips] Query error:", queryError);
      const response = NextResponse.json(createDefaultResponse());
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      return response;
    }

    // Step 4: Get week's logs (optional, continue if fails)
    let weekLogs: any[] = [];
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      const todayEnd = new Date(today);
      todayEnd.setDate(todayEnd.getDate() + 1);

      const { data, error } = await supabase
        .from("activity_logs")
        .select(`
          *,
          categories (
            id,
            name,
            color,
            business_type
          )
        `)
        .eq("user_id", user.id)
        .gte("start_time", weekStart.toISOString())
        .lt("start_time", todayEnd.toISOString())
        .order("start_time", { ascending: false });

      if (!error) {
        weekLogs = data || [];
      }
    } catch (weekError: any) {
      console.error("[ProductivityTips] Week logs error (continuing):", weekError);
      // Continue with empty weekLogs
    }

    // Step 5: Get daily summary (optional)
    let dailySummary: any = null;
    try {
      const { data, error } = await supabase
        .from("daily_summaries")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        dailySummary = data;
      }
    } catch (summaryError: any) {
      // Continue without summary
    }

    // Step 6: Calculate metrics safely
    const tips: string[] = [];
    let todayTotalMinutes = 0;
    let revenueMinutes = 0;
    let adminMinutes = 0;

    try {
      todayLogs.forEach((log) => {
        if (!log?.start_time || !log?.end_time) return;
        try {
          const duration = calculateDurationMinutes(log.start_time, log.end_time);
          if (duration > 0) {
            todayTotalMinutes += duration;
            
            const businessType = log.categories?.business_type;
            if (businessType === "revenue") {
              revenueMinutes += duration;
            } else if (businessType === "admin") {
              adminMinutes += duration;
            }
          }
        } catch (err) {
          // Skip this log
        }
      });
    } catch (calcError: any) {
      console.error("[ProductivityTips] Calculation error:", calcError);
      // Continue with zero values
    }

    const todayHours = todayTotalMinutes / 60;
    const now = new Date();
    const hoursIntoDay = now.getHours() + now.getMinutes() / 60;
    const contextSwitches = Math.max(0, todayLogs.length - 1);
    const avgSessionDuration = todayLogs.length > 0 ? todayTotalMinutes / todayLogs.length : 0;
    const revenuePercentage = todayHours > 0 ? (revenueMinutes / 60 / todayHours) * 100 : 0;
    const adminPercentage = todayHours > 0 ? (adminMinutes / 60 / todayHours) * 100 : 0;

    // Step 7: Generate tips
    if (revenuePercentage < 40 && todayHours > 2) {
      tips.push("Business Insight: Less than 40% of your time is revenue-generating. As a business owner, prioritize client work and sales activities that directly impact your bottom line.");
    } else if (revenuePercentage >= 60 && todayHours > 4) {
      tips.push("Excellent! You're spending most of your time on revenue-generating activities. This is the key to sustainable business growth - keep it up!");
    }

    if (contextSwitches > 8 && avgSessionDuration < 25) {
      tips.push("Productivity Tip: Frequent task switching kills focus. As a business owner, block 60-90 minute deep work sessions for high-impact work. Each switch costs you 23 minutes to refocus!");
    } else if (avgSessionDuration > 75 && contextSwitches < 6) {
      tips.push("Great focus discipline! Your longer work sessions show excellent deep work habits. This is how successful business owners maximize their impact.");
    }

    if (adminPercentage > 40 && todayHours > 3) {
      tips.push("Business Owner Warning: You're spending too much time on admin tasks. Consider delegating, automating, or batching these activities. Focus on what only you can do.");
    }

    const currentHour = now.getHours();
    if (currentHour >= 9 && currentHour < 12 && revenuePercentage < 30) {
      tips.push("Morning Power Hour: Your brain is freshest now. Prioritize revenue-generating work in the morning - client calls, sales, high-value creation. Save admin for later.");
    } else if (currentHour >= 14 && currentHour < 16 && todayHours > 5) {
      tips.push("Afternoon Productivity: Post-lunch dip is real. Schedule lighter tasks now or take a 10-minute walk to reset. Protect your morning energy for high-impact work.");
    }

    if (dailySummary?.focus_score) {
      const focusScore = dailySummary.focus_score;
      if (focusScore < 50) {
        tips.push("Focus Score Alert: Your recent focus has been low. Business owners who master deep work see 3x better results. Eliminate distractions and work in focused blocks.");
      } else if (focusScore >= 80) {
        tips.push("Exceptional Focus Score! This level of concentration is what separates top-performing business owners. You're operating at peak efficiency.");
      }
    }

    // Ensure we have at least one tip
    if (tips.length === 0) {
      tips.push(...defaultTips);
    }

    // Return top 3 tips
    const topTips = tips.slice(0, 3);

    const response = NextResponse.json({
      success: true,
      tips: topTips,
      metrics: {
        todayHours: Math.round(todayHours * 10) / 10,
        contextSwitches,
        avgSessionDuration: Math.round(avgSessionDuration),
        revenuePercentage: Math.round(revenuePercentage),
        peakHour: null,
      },
      timestamp: Date.now(), // Add timestamp to help debug caching
    });

    // Set headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;
  } catch (error: any) {
    // Final catch-all - should never reach here, but just in case
    console.error("[ProductivityTips] Unexpected error:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });

    const response = NextResponse.json(createDefaultResponse());
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  }
}
