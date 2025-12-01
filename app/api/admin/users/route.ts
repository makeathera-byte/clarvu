import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserOrThrow } from "@/lib/api/auth";
import { isAdminEmail } from "@/lib/utils/admin";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserOrThrow();
    if (!isAdminEmail(user.email)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    // Use admin client for all queries to bypass RLS
    const adminClient = createAdminClient();

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "all"; // all, most_active, recently_active, new_users
    const limit = parseInt(searchParams.get("limit") || "100");

    // Get all users from auth.users (source of truth)
    const { data: { users: authUsers }, error: authError } = await adminClient.auth.admin.listUsers();
    
    if (authError || !authUsers || authUsers.length === 0) {
      console.error("Error fetching users from auth:", authError);
      return NextResponse.json({ success: true, data: [] });
    }

    // Get signup events to match with users
    const { data: signups } = await adminClient
      .from("signup_events")
      .select("user_id, email, signed_up_at");

    // Create a map of signup data by user_id
    const signupMap: Record<string, { email: string; signed_up_at: string }> = {};
    signups?.forEach((signup: { user_id: string; email: string; signed_up_at: string }) => {
      signupMap[signup.user_id] = {
        email: signup.email,
        signed_up_at: signup.signed_up_at,
      };
    });

    // Filter users based on filter type
    let filteredUsers = authUsers;
    if (filter === "new_users") {
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filteredUsers = authUsers.filter((user) => {
        const signupData = signupMap[user.id];
        if (signupData) {
          return new Date(signupData.signed_up_at) >= last7Days;
        }
        // If no signup event, use created_at from auth.users
        return new Date(user.created_at) >= last7Days;
      });
    }

    // Limit results
    filteredUsers = filteredUsers.slice(0, limit);

    const userIds = filteredUsers.map((u) => u.id);

    // Extract user metadata
    const userMetadataMap: Record<string, { name?: string; full_name?: string }> = {};
    
    filteredUsers.forEach((authUser) => {
      if (authUser.user_metadata) {
        userMetadataMap[authUser.id] = {
          name: authUser.user_metadata.name || authUser.user_metadata.full_name || "",
          full_name: authUser.user_metadata.full_name || authUser.user_metadata.name || "",
        };
      }
    });

    // Get activity logs count per user (using admin client)
    const { data: logs, error: logsError } = await adminClient
      .from("activity_logs")
      .select("user_id")
      .in("user_id", userIds);
    
    if (logsError) {
      console.error("Error fetching activity logs:", logsError);
      // Continue with empty logs data
    }

    const logsByUser: Record<string, number> = {};
    logs?.forEach((log: { user_id: string }) => {
      logsByUser[log.user_id] = (logsByUser[log.user_id] || 0) + 1;
    });

    // Get last active date from visits (using admin client)
    const { data: visits, error: visitsError } = await adminClient
      .from("visits")
      .select("user_id, visited_at")
      .in("user_id", userIds)
      .order("visited_at", { ascending: false });
    
    if (visitsError) {
      console.error("Error fetching visits:", visitsError);
      // Continue with empty visits data
    }

    const lastActiveByUser: Record<string, string> = {};
    visits?.forEach((visit: { user_id: string | null; visited_at: string }) => {
      if (visit.user_id && (!lastActiveByUser[visit.user_id] || visit.visited_at > lastActiveByUser[visit.user_id])) {
        lastActiveByUser[visit.user_id] = visit.visited_at;
      }
    });

    // Get summary reads (using admin client)
    const { data: summaryReads, error: summaryError } = await adminClient
      .from("usage_events")
      .select("user_id")
      .eq("event", "summary_opened")
      .in("user_id", userIds);
    
    if (summaryError) {
      console.error("Error fetching summary reads:", summaryError);
      // Continue with empty data
    }

    const summaryReadsByUser: Record<string, number> = {};
    summaryReads?.forEach((event: { user_id: string }) => {
      summaryReadsByUser[event.user_id] = (summaryReadsByUser[event.user_id] || 0) + 1;
    });

    // Get reminder clicks (using admin client)
    const { data: reminderClicks, error: reminderError } = await adminClient
      .from("usage_events")
      .select("user_id")
      .eq("event", "reminder_clicked")
      .in("user_id", userIds);
    
    if (reminderError) {
      console.error("Error fetching reminder clicks:", reminderError);
      // Continue with empty data
    }

    const reminderClicksByUser: Record<string, number> = {};
    reminderClicks?.forEach((event: { user_id: string }) => {
      reminderClicksByUser[event.user_id] = (reminderClicksByUser[event.user_id] || 0) + 1;
    });

    // Get routine generations (using admin client)
    const { data: routineEvents, error: routineError } = await adminClient
      .from("usage_events")
      .select("user_id")
      .eq("event", "routine_generated")
      .in("user_id", userIds);
    
    if (routineError) {
      console.error("Error fetching routine events:", routineError);
      // Continue with empty data
    }

    const routinesByUser: Record<string, number> = {};
    routineEvents?.forEach((event: { user_id: string }) => {
      routinesByUser[event.user_id] = (routinesByUser[event.user_id] || 0) + 1;
    });

    // Get total visits per user using pagination to ensure accuracy
    // Supabase has a default limit of 1000 rows, so we paginate to get ALL records
    const visitsByUser: Record<string, number> = {};
    
    // Initialize all user IDs with 0 visits
    userIds.forEach((userId) => {
      visitsByUser[userId] = 0;
    });

    // Fetch visits with pagination to get ALL records
    let hasMore = true;
    let page = 0;
    const pageSize = 1000; // Supabase default limit
    
    while (hasMore) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      const { data: pageVisits, error: visitsError } = await adminClient
        .from("visits")
        .select("user_id")
        .in("user_id", userIds)
        .not("user_id", "is", null)
        .range(from, to);
      
      if (visitsError) {
        console.error("Error fetching user visits:", visitsError);
        break;
      }

      if (!pageVisits || pageVisits.length === 0) {
        hasMore = false;
        break;
      }

      // Count visits in this page
      pageVisits.forEach((visit: { user_id: string | null }) => {
        if (visit.user_id && visitsByUser.hasOwnProperty(visit.user_id)) {
          visitsByUser[visit.user_id] = (visitsByUser[visit.user_id] || 0) + 1;
        }
      });

      // Check if we got fewer results than pageSize (last page)
      if (pageVisits.length < pageSize) {
        hasMore = false;
      } else {
        page++;
      }
    }

    // Combine data from auth.users (source of truth)
    const userData = filteredUsers.map((authUser) => {
      const metadata = userMetadataMap[authUser.id] || {};
      const signupData = signupMap[authUser.id];
      
      return {
        user_id: authUser.id,
        email: authUser.email || signupData?.email || "N/A",
        name: metadata.name || metadata.full_name || "N/A",
        signed_up_at: signupData?.signed_up_at || authUser.created_at,
        total_logs: logsByUser[authUser.id] || 0,
        last_active: lastActiveByUser[authUser.id] || null,
        summary_reads: summaryReadsByUser[authUser.id] || 0,
        reminders_clicked: reminderClicksByUser[authUser.id] || 0,
        routines_generated: routinesByUser[authUser.id] || 0,
        total_visits: visitsByUser[authUser.id] || 0,
      };
    });

    // Apply filters
    interface UserDataItem {
      total_logs: number;
      total_visits: number;
      summary_reads: number;
      last_active: string | null;
      signed_up_at: string;
    }
    
    if (filter === "most_active") {
      userData.sort((a: UserDataItem, b: UserDataItem) => {
        const aScore = a.total_logs * 2 + a.total_visits + a.summary_reads;
        const bScore = b.total_logs * 2 + b.total_visits + b.summary_reads;
        return bScore - aScore;
      });
    } else if (filter === "recently_active") {
      userData.sort((a: UserDataItem, b: UserDataItem) => {
        if (!a.last_active && !b.last_active) return 0;
        if (!a.last_active) return 1;
        if (!b.last_active) return -1;
        return new Date(b.last_active).getTime() - new Date(a.last_active).getTime();
      });
    } else if (filter === "new_users") {
      // Already filtered by date, just sort by signup date
      userData.sort((a: UserDataItem, b: UserDataItem) => 
        new Date(b.signed_up_at).getTime() - new Date(a.signed_up_at).getTime()
      );
    } else {
      // Default: sort by total logs descending
      userData.sort((a: UserDataItem, b: UserDataItem) => b.total_logs - a.total_logs);
    }

    return NextResponse.json({ success: true, data: userData });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching users:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

