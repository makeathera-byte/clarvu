"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserOrThrow } from "@/lib/api/auth";
import { isAdminEmail } from "@/lib/utils/admin";

async function ensureAdmin() {
  const user = await getUserOrThrow();
  if (!isAdminEmail(user.email)) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function getTrafficStats() {
  try {
    await ensureAdmin();
    // Use admin client to bypass RLS for admin queries
    const supabase = createAdminClient();

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last24hBefore = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    // Visits last 24 hours (with error handling for missing table)
    const { data: visits24h, error: visitsError } = await supabase
      .from("visits")
      .select("id")
      .gte("visited_at", last24h.toISOString());
    
    if (visitsError) {
      if (visitsError.code === "42P01" || 
          visitsError.message?.includes("does not exist") || 
          visitsError.message?.includes("schema cache")) {
        console.error("❌ Analytics tables not found. Error:", visitsError.message);
        // Return default values - don't throw so admin panel still loads
        return {
          visitsLast24h: 0,
          visitsChange24h: 0,
          uniqueVisitorsToday: 0,
          visitorsChange24h: 0,
          visitsLast7Days: Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
            return { date: date.toISOString().split("T")[0], visits: 0 };
          }),
          visitorsLast7Days: Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
            return { date: date.toISOString().split("T")[0], visitors: 0 };
          }),
          visitsByPage: [],
          visitsByDevice: [],
          visitsByCountry: [],
        };
      }
      console.error("Error fetching visits:", visitsError);
      // Return default values for other errors too
      return {
        visitsLast24h: 0,
        visitsChange24h: 0,
        uniqueVisitorsToday: 0,
        visitorsChange24h: 0,
        visitsLast7Days: Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
          return { date: date.toISOString().split("T")[0], visits: 0 };
        }),
        visitorsLast7Days: Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
          return { date: date.toISOString().split("T")[0], visitors: 0 };
        }),
        visitsByPage: [],
        visitsByDevice: [],
        visitsByCountry: [],
      };
    }

  // Visits previous 24 hours (for change calculation)
  const { data: visits24hBefore } = await supabase
    .from("visits")
    .select("id")
    .gte("visited_at", last24hBefore.toISOString())
    .lt("visited_at", last24h.toISOString());

  // Visits last 7 days (grouped by day)
  const { data: visits7Days } = await supabase
    .from("visits")
    .select("visited_at")
    .gte("visited_at", last7Days.toISOString())
    .order("visited_at", { ascending: true });

  // Unique visitors today (distinct users) - use UTC for consistency
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const todayStr = today.toISOString().split("T")[0];
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  
  // Get all visits today
  const { data: visitsToday } = await supabase
    .from("visits")
    .select("user_id, visited_at, device, country")
    .gte("visited_at", todayStr)
    .lt("visited_at", tomorrowStr);
  
  // Calculate unique visitors today
  // For authenticated users: count distinct user_id
  // For anonymous users: count distinct combinations of (date, device, country) as a proxy
  const authenticatedUsers = new Set<string>();
  const anonymousVisitors = new Set<string>();
  
  visitsToday?.forEach((visit) => {
    if (visit.user_id) {
      authenticatedUsers.add(visit.user_id);
    } else {
      // For anonymous, use date + device + country as unique identifier
      const date = new Date(visit.visited_at).toISOString().split("T")[0];
      anonymousVisitors.add(`${date}_${visit.device}_${visit.country}`);
    }
  });
  
  const uniqueVisitorsToday = authenticatedUsers.size + anonymousVisitors.size;
  
  // Unique visitors yesterday (for change calculation) - use UTC
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  
  const { data: visitsYesterday } = await supabase
    .from("visits")
    .select("user_id, visited_at, device, country")
    .gte("visited_at", yesterdayStr)
    .lt("visited_at", todayStr);
  
  const authenticatedUsersYesterday = new Set<string>();
  const anonymousVisitorsYesterday = new Set<string>();
  
  visitsYesterday?.forEach((visit) => {
    if (visit.user_id) {
      authenticatedUsersYesterday.add(visit.user_id);
    } else {
      const date = new Date(visit.visited_at).toISOString().split("T")[0];
      anonymousVisitorsYesterday.add(`${date}_${visit.device}_${visit.country}`);
    }
  });
  
  const uniqueVisitorsYesterday = authenticatedUsersYesterday.size + anonymousVisitorsYesterday.size;
  const visitorsChange24h = uniqueVisitorsYesterday > 0
    ? ((uniqueVisitorsToday - uniqueVisitorsYesterday) / uniqueVisitorsYesterday) * 100
    : 0;

  // Unique visitors last 7 days (for chart)
  const { data: allVisits7Days } = await supabase
    .from("visits")
    .select("user_id, visited_at, device, country")
    .gte("visited_at", last7Days.toISOString())
    .order("visited_at", { ascending: true });
  
  // Group unique visitors by day
  const visitorsByDay: Record<string, Set<string>> = {};
  allVisits7Days?.forEach((visit) => {
    const date = new Date(visit.visited_at).toISOString().split("T")[0];
    if (!visitorsByDay[date]) {
      visitorsByDay[date] = new Set();
    }
    
    if (visit.user_id) {
      visitorsByDay[date].add(`user_${visit.user_id}`);
    } else {
      visitorsByDay[date].add(`anon_${date}_${visit.device}_${visit.country}`);
    }
  });
  
  const visitorsLast7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    return {
      date: dateStr,
      visitors: visitorsByDay[dateStr]?.size || 0,
    };
  });

  // Visits by page
  const { data: visitsByPage } = await supabase
    .from("visits")
    .select("path")
    .gte("visited_at", last7Days.toISOString());

  // Visits by device
  const { data: visitsByDevice, error: deviceError } = await supabase
    .from("visits")
    .select("device")
    .gte("visited_at", last7Days.toISOString());
  
  if (deviceError) {
    console.error("Error fetching device data:", deviceError);
  }

  // Visits by country
  const { data: visitsByCountry } = await supabase
    .from("visits")
    .select("country")
    .gte("visited_at", last7Days.toISOString());

  // Process data
  const visitsLast24h = visits24h?.length || 0;
  const visitsLast24hBefore = visits24hBefore?.length || 0;
  const visitsChange24h = visitsLast24hBefore > 0
    ? ((visitsLast24h - visitsLast24hBefore) / visitsLast24hBefore) * 100
    : 0;

  // Group visits by day
  const visitsByDay: Record<string, number> = {};
  visits7Days?.forEach((visit) => {
    const date = new Date(visit.visited_at).toISOString().split("T")[0];
    visitsByDay[date] = (visitsByDay[date] || 0) + 1;
  });

  const visitsLast7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    return {
      date: dateStr,
      visits: visitsByDay[dateStr] || 0,
    };
  });

  // Count by page
  const pageCounts: Record<string, number> = {};
  visitsByPage?.forEach((visit) => {
    pageCounts[visit.path] = (pageCounts[visit.path] || 0) + 1;
  });

  // Count by device
  const deviceCounts: Record<string, number> = {};
  visitsByDevice?.forEach((visit) => {
    deviceCounts[visit.device] = (deviceCounts[visit.device] || 0) + 1;
  });

  // Count by country
  const countryCounts: Record<string, number> = {};
  visitsByCountry?.forEach((visit) => {
    countryCounts[visit.country] = (countryCounts[visit.country] || 0) + 1;
  });

    return {
      visitsLast24h,
      visitsChange24h,
      visitsLast7Days,
      uniqueVisitorsToday,
      visitorsChange24h,
      visitorsLast7Days,
      visitsByPage: Object.entries(pageCounts)
        .map(([path, count]) => ({ path, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      visitsByDevice: Object.entries(deviceCounts)
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count),
      visitsByCountry: Object.entries(countryCounts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
    };
  } catch (error: any) {
    console.error("Error in getTrafficStats:", error);
    if (error?.message?.includes("Analytics tables not found")) {
      throw error; // Re-throw migration errors
    }
    // Return default values on other errors
    const now = new Date();
    return {
      visitsLast24h: 0,
      visitsChange24h: 0,
      visitsLast7Days: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        return { date: date.toISOString().split("T")[0], visits: 0 };
      }),
      visitsByPage: [],
      visitsByDevice: [],
      visitsByCountry: [],
    };
  }
}

export async function getUserStats() {
  try {
    await ensureAdmin();
    // Use admin client to bypass RLS for admin queries
    const supabase = createAdminClient();

  const now = new Date();
  // Use UTC midnight for today to avoid timezone issues
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Total users from auth.users (using admin client)
  const { data: { users: allUsers }, error: usersError } = await supabase.auth.admin.listUsers();
  const totalUsers = allUsers?.length || 0;

  // New signups today (using UTC date string for comparison)
  const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD format
  const tomorrowStr = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const { data: signupsToday } = await supabase
    .from("signup_events")
    .select("id")
    .gte("signed_up_at", todayStr)
    .lt("signed_up_at", tomorrowStr);

  // Signups last 7 days (grouped by day)
  const { data: signups7Days } = await supabase
    .from("signup_events")
    .select("signed_up_at")
    .gte("signed_up_at", last7Days.toISOString())
    .order("signed_up_at", { ascending: true });

  // Signups yesterday (for change calculation)
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const { data: signupsYesterday } = await supabase
    .from("signup_events")
    .select("id")
    .gte("signed_up_at", yesterdayStr)
    .lt("signed_up_at", todayStr);

  // DAU - users who visited today
  const { data: dauData } = await supabase
    .from("visits")
    .select("user_id")
    .gte("visited_at", todayStr)
    .not("user_id", "is", null);

  const uniqueDau = new Set(dauData?.map((v) => v.user_id) || []).size;

  // WAU - users who visited in last 7 days
  const { data: wauData } = await supabase
    .from("visits")
    .select("user_id")
    .gte("visited_at", last7Days.toISOString())
    .not("user_id", "is", null);

  const uniqueWau = new Set(wauData?.map((v) => v.user_id) || []).size;

  // MAU - users who visited in last 30 days
  const { data: mauData } = await supabase
    .from("visits")
    .select("user_id")
    .gte("visited_at", last30Days.toISOString())
    .not("user_id", "is", null);

  const uniqueMau = new Set(mauData?.map((v) => v.user_id) || []).size;

  // Returning users (visited more than once)
  const { data: allVisits } = await supabase
    .from("visits")
    .select("user_id")
    .not("user_id", "is", null);

  const userVisitCounts: Record<string, number> = {};
  allVisits?.forEach((visit) => {
    if (visit.user_id) {
      userVisitCounts[visit.user_id] = (userVisitCounts[visit.user_id] || 0) + 1;
    }
  });

  const returningUsers = Object.values(userVisitCounts).filter((count) => count > 1).length;

  // Group signups by day
  const signupsByDay: Record<string, number> = {};
  signups7Days?.forEach((signup) => {
    const date = new Date(signup.signed_up_at).toISOString().split("T")[0];
    signupsByDay[date] = (signupsByDay[date] || 0) + 1;
  });

  const signupsLast7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    return {
      date: dateStr,
      signups: signupsByDay[dateStr] || 0,
    };
  });

  const newSignupsToday = signupsToday?.length || 0;
  const newSignupsYesterday = signupsYesterday?.length || 0;
  const signupsChange24h = newSignupsYesterday > 0
    ? ((newSignupsToday - newSignupsYesterday) / newSignupsYesterday) * 100
    : 0;

  // Retention data (simplified)
  const retentionData = {
    newUsers: Object.keys(userVisitCounts).length - returningUsers,
    returningUsers,
  };

    return {
      totalUsers,
      newSignupsToday,
      signupsChange24h,
      signupsLast7Days,
      dau: uniqueDau,
      wau: uniqueWau,
      mau: uniqueMau,
      returningUsers,
      retentionData,
      dauChange: 0, // Can be calculated if needed
    };
  } catch (error: any) {
    console.error("Error in getUserStats:", error);
    if (error?.message?.includes("Analytics tables not found") || error?.message === "Unauthorized") {
      throw error; // Re-throw migration and auth errors
    }
    // Return default values on other errors
    const now = new Date();
    return {
      totalUsers: 0,
      newSignupsToday: 0,
      signupsChange24h: 0,
      signupsLast7Days: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        return { date: date.toISOString().split("T")[0], signups: 0 };
      }),
      dau: 0,
      wau: 0,
      mau: 0,
      returningUsers: 0,
      retentionData: { newUsers: 0, returningUsers: 0 },
      dauChange: 0,
    };
  }
}

export async function getUsageStats() {
  try {
    await ensureAdmin();
    // Use admin client to bypass RLS for admin queries
    const supabase = createAdminClient();

    const now = new Date();
    // Use UTC midnight for today to avoid timezone issues
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const todayStr = today.toISOString().split("T")[0];
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Logs created today (from activity_logs table - actual logs)
    const { data: logsToday, error: logsError } = await supabase
      .from("activity_logs")
      .select("id")
      .gte("created_at", todayStr);
    
    if (logsError) {
      if (logsError.code === "42P01" || 
          logsError.message?.includes("does not exist") || 
          logsError.message?.includes("schema cache")) {
        console.error("❌ activity_logs table not found. Error:", logsError.message);
        // Return default values instead of throwing
        return {
          logsToday: 0,
          summariesGeneratedToday: 0,
          summariesOpenedToday: 0,
          remindersClickedToday: 0,
          routinesGeneratedToday: 0,
          summariesChange24h: 0,
          logsLast7Days: Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
            return {
              date: date.toISOString().split("T")[0],
              logs: 0,
            };
          }),
          routinesLast7Days: Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
            return {
              date: date.toISOString().split("T")[0],
              routines: 0,
            };
          }),
        };
      }
      console.error("Error fetching logs:", logsError);
    }

    // Logs last 7 days (from activity_logs)
    const { data: logs7Days } = await supabase
      .from("activity_logs")
      .select("created_at")
      .gte("created_at", last7Days.toISOString())
      .order("created_at", { ascending: true });

    // Summaries generated today (from usage_events) - use proper date range
    const tomorrowStr = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const { data: summariesToday } = await supabase
      .from("usage_events")
      .select("id")
      .eq("event", "summary_generated")
      .gte("created_at", todayStr)
      .lt("created_at", tomorrowStr);

    // Summaries opened today (from usage_events) - use proper date range
    const { data: summariesOpenedToday } = await supabase
      .from("usage_events")
      .select("id")
      .eq("event", "summary_opened")
      .gte("created_at", todayStr)
      .lt("created_at", tomorrowStr);

    // Reminders clicked today (from usage_events) - use proper date range
    const { data: remindersToday } = await supabase
      .from("usage_events")
      .select("id")
      .eq("event", "reminder_clicked")
      .gte("created_at", todayStr)
      .lt("created_at", tomorrowStr);

    // Routines generated today (from usage_events) - use proper date range
    const { data: routinesToday } = await supabase
      .from("usage_events")
      .select("id")
      .eq("event", "routine_generated")
      .gte("created_at", todayStr)
      .lt("created_at", tomorrowStr);

    // Routines generated last 7 days (for chart)
    const { data: routines7Days } = await supabase
      .from("usage_events")
      .select("created_at")
      .eq("event", "routine_generated")
      .gte("created_at", last7Days.toISOString())
      .order("created_at", { ascending: true });

    // Group logs by day
    const logsByDay: Record<string, number> = {};
    logs7Days?.forEach((log: { created_at: string }) => {
      const date = new Date(log.created_at).toISOString().split("T")[0];
      logsByDay[date] = (logsByDay[date] || 0) + 1;
    });

    const logsLast7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      return {
        date: dateStr,
        logs: logsByDay[dateStr] || 0,
      };
    });

    // Group routines by day
    const routinesByDay: Record<string, number> = {};
    routines7Days?.forEach((routine: { created_at: string }) => {
      const date = new Date(routine.created_at).toISOString().split("T")[0];
      routinesByDay[date] = (routinesByDay[date] || 0) + 1;
    });

    const routinesLast7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      return {
        date: dateStr,
        routines: routinesByDay[dateStr] || 0,
      };
    });

    // Calculate changes (simplified)
    const summariesGeneratedToday = summariesToday?.length || 0;
    const summariesOpenedTodayCount = summariesOpenedToday?.length || 0;
    const remindersClickedToday = remindersToday?.length || 0;
    const routinesGeneratedToday = routinesToday?.length || 0;

    return {
      logsToday: logsToday?.length || 0,
      summariesGeneratedToday,
      summariesOpenedToday: summariesOpenedTodayCount,
      remindersClickedToday,
      routinesGeneratedToday,
      logsLast7Days,
      routinesLast7Days,
      summariesChange24h: 0, // Can be calculated if needed
    };
  } catch (error: any) {
    console.error("Error in getUsageStats:", error);
    // Return default values on error
    return {
      logsToday: 0,
      summariesGeneratedToday: 0,
      summariesOpenedToday: 0,
      remindersClickedToday: 0,
      routinesGeneratedToday: 0,
      summariesChange24h: 0,
      logsLast7Days: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split("T")[0],
          logs: 0,
        };
      }),
      routinesLast7Days: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split("T")[0],
          routines: 0,
        };
      }),
    };
  }
}

export async function getSystemHealth() {
  try {
    await ensureAdmin();
    // Use admin client to bypass RLS for admin queries
    const supabase = createAdminClient();

    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last7DaysStr = last7Days.toISOString().split("T")[0];
    const last7DaysISO = last7Days.toISOString(); // Full ISO string for timestamp comparison

    // Get all error events (various error types)
    const { data: allErrors, error: errorsError } = await supabase
      .from("usage_events")
      .select("created_at, event, value")
      .or("event.eq.error,event.eq.api_error,event.eq.ai_error,event.eq.database_error")
      .gte("created_at", last7DaysStr)
      .order("created_at", { ascending: false });
    
    if (errorsError) {
      if (errorsError.code === "42P01" || 
          errorsError.message?.includes("does not exist") || 
          errorsError.message?.includes("schema cache")) {
        console.error("❌ usage_events table not found. Error:", errorsError.message);
        // Return default values instead of throwing
        return {
          errorsLast7Days: Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
            return {
              date: date.toISOString().split("T")[0],
              errors: 0,
            };
          }),
          totalErrors: 0,
          slowRoutes: [],
          cronSuccessCount: 0,
          databaseHealth: "unknown",
          apiHealth: "unknown",
          aiApiHealth: "unknown",
          totalAiRequests: 0,
          aiSuccessRequests: 0,
          aiErrorRequests: 0,
          aiSuccessRate: "100.00",
          avgAiResponseTime: 0,
          maxAiResponseTime: 0,
          aiRequestsLast7Days: Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
            return {
              date: date.toISOString().split("T")[0],
              requests: 0,
            };
          }),
          topEndpoints: [],
        };
      }
      console.error("Error fetching system health:", errorsError);
    }

    // Group errors by day
    const errorsByDay: Record<string, number> = {};
    allErrors?.forEach((error: { created_at: string }) => {
      const date = new Date(error.created_at).toISOString().split("T")[0];
      errorsByDay[date] = (errorsByDay[date] || 0) + 1;
    });

    const errorsLast7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      return {
        date: dateStr,
        errors: errorsByDay[dateStr] || 0,
      };
    });

    // Slow API routes (events with value > 1000ms, sorted by response time)
    const { data: slowRoutes, error: slowRoutesError } = await supabase
      .from("usage_events")
      .select("event, value, created_at, user_id")
      .gte("value", 1000)
      .gte("created_at", last7DaysStr)
      .order("value", { ascending: false })
      .limit(50);
    
    if (slowRoutesError) {
      console.error("Error fetching slow routes:", slowRoutesError);
    }

    // Cron success events
    const { data: cronEvents, error: cronError } = await supabase
      .from("usage_events")
      .select("created_at")
      .eq("event", "cron_success")
      .gte("created_at", last7DaysStr)
      .order("created_at", { ascending: false });
    
    if (cronError) {
      console.error("Error fetching cron events:", cronError);
    }

    // Test database health by doing a simple query
    const dbHealthStart = Date.now();
    const { error: dbHealthError } = await supabase
      .from("usage_events")
      .select("id")
      .limit(1);
    const dbResponseTime = Date.now() - dbHealthStart;
    const databaseHealth = dbHealthError ? "unhealthy" : dbResponseTime > 1000 ? "slow" : "healthy";

    // Get AI API requests (Groq API calls)
    // Query for all AI-related events
    const { data: aiRequests, error: aiError } = await supabase
      .from("usage_events")
      .select("created_at, value, event")
      .or("event.eq.ai_api_request,event.eq.groq_api_success,event.eq.groq_api_error")
      .gte("created_at", last7DaysISO)
      .order("created_at", { ascending: false });
    
    if (aiError) {
      console.error("Error fetching AI API requests:", aiError);
    }

    // Calculate AI API metrics
    const aiSuccessRequests = (aiRequests || []).filter((r: { event: string }) => 
      r.event === "groq_api_success" || r.event === "ai_api_request"
    );
    const aiErrorRequests = (aiRequests || []).filter((r: { event: string }) => 
      r.event === "groq_api_error"
    );
    const totalAiRequests = aiRequests?.length || 0;
    const aiSuccessRate = totalAiRequests > 0 
      ? ((aiSuccessRequests.length / totalAiRequests) * 100).toFixed(2)
      : "100.00";
    
    // Calculate average AI response time
    const aiResponseTimes = aiSuccessRequests
      .filter((r: { value: number | null }) => r.value !== null && r.value !== undefined)
      .map((r: { value: number }) => r.value as number);
    const avgAiResponseTime = aiResponseTimes.length > 0
      ? Math.round(aiResponseTimes.reduce((a, b) => a + b, 0) / aiResponseTimes.length)
      : 0;
    const maxAiResponseTime = aiResponseTimes.length > 0
      ? Math.max(...aiResponseTimes)
      : 0;

    // Group AI requests by day
    const aiRequestsByDay: Record<string, number> = {};
    (aiRequests || []).forEach((req: { created_at: string }) => {
      const date = new Date(req.created_at).toISOString().split("T")[0];
      aiRequestsByDay[date] = (aiRequestsByDay[date] || 0) + 1;
    });

    const aiRequestsLast7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0];
      return {
        date: dateStr,
        requests: aiRequestsByDay[dateStr] || 0,
      };
    });

    // Get API endpoint usage statistics
    const { data: apiEndpoints, error: endpointsError } = await supabase
      .from("usage_events")
      .select("event, created_at")
      .like("event", "api/%")
      .gte("created_at", last7DaysStr);
    
    if (endpointsError) {
      console.error("Error fetching API endpoints:", endpointsError);
    }

    // Count API endpoint usage
    const endpointCounts: Record<string, number> = {};
    apiEndpoints?.forEach((endpoint: { event: string }) => {
      endpointCounts[endpoint.event] = (endpointCounts[endpoint.event] || 0) + 1;
    });

    const topEndpoints = Object.entries(endpointCounts)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate API health based on error rate
    const totalEvents = allErrors?.length || 0;
    const errorRate = totalEvents > 0 ? (totalEvents / (totalEvents + (cronEvents?.length || 0) + 1)) * 100 : 0;
    const apiHealth = errorRate > 10 ? "unhealthy" : errorRate > 5 ? "degraded" : "healthy";

    // AI API health
    const aiErrorRate = totalAiRequests > 0 
      ? ((aiErrorRequests.length / totalAiRequests) * 100)
      : 0;
    const aiApiHealth = aiErrorRate > 10 ? "unhealthy" : aiErrorRate > 5 ? "degraded" : "healthy";

    return {
      errorsLast7Days,
      totalErrors: allErrors?.length || 0,
      slowRoutes: slowRoutes || [],
      cronSuccessCount: cronEvents?.length || 0,
      databaseHealth,
      databaseResponseTime: dbResponseTime,
      apiHealth,
      errorRate: errorRate.toFixed(2),
      // AI API metrics
      aiApiHealth,
      totalAiRequests,
      aiSuccessRequests: aiSuccessRequests.length,
      aiErrorRequests: aiErrorRequests.length,
      aiSuccessRate,
      avgAiResponseTime,
      maxAiResponseTime,
      aiRequestsLast7Days,
      topEndpoints,
    };
  } catch (error: any) {
    console.error("Error in getSystemHealth:", error);
    // Return default values on error
    return {
      errorsLast7Days: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split("T")[0],
          errors: 0,
        };
      }),
      totalErrors: 0,
      slowRoutes: [],
      cronSuccessCount: 0,
      databaseHealth: "unknown",
      databaseResponseTime: 0,
      apiHealth: "unknown",
      errorRate: "0.00",
      aiApiHealth: "unknown",
      totalAiRequests: 0,
      aiSuccessRequests: 0,
      aiErrorRequests: 0,
      aiSuccessRate: "100.00",
      avgAiResponseTime: 0,
      maxAiResponseTime: 0,
      aiRequestsLast7Days: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split("T")[0],
          requests: 0,
        };
      }),
      topEndpoints: [],
    };
  }
}

