import { getTrafficStats, getUserStats, getUsageStats } from "@/app/ppadminpp/actions";
import { StatCard } from "@/components/admin/cards/StatCard";
import { VisitsChart } from "@/components/admin/charts/VisitsChart";
import { VisitorsChart } from "@/components/admin/charts/VisitorsChart";
import { SignupChart } from "@/components/admin/charts/SignupChart";
import { LogsChart } from "@/components/admin/charts/LogsChart";
import { UserRetentionChart } from "@/components/admin/charts/UserRetentionChart";
import { redirect } from "next/navigation";

export default async function AdminOverviewPage() {
  let trafficStats, userStats, usageStats;
  
  try {
    [trafficStats, userStats, usageStats] = await Promise.all([
      getTrafficStats(),
      getUserStats(),
      getUsageStats(),
    ]);
  } catch (error: any) {
    // If unauthorized, redirect to login
    if (error?.message === "Unauthorized" || error?.message?.includes("Unauthorized")) {
      redirect("/auth/login");
    }
    
    // If tables don't exist, show a helpful message
    if (error?.message?.includes("relation") || 
        error?.message?.includes("does not exist") || 
        error?.message?.includes("schema cache") ||
        error?.message?.includes("Analytics tables not found")) {
      return (
        <div className="space-y-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-6">
            <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-200 mb-2">
              SQL Migration Required
            </h2>
            <p className="text-amber-700 dark:text-amber-300 mb-4">
              The analytics tables haven't been created yet. Please run the SQL migration first.
            </p>
            <div className="space-y-2">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Steps:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-amber-700 dark:text-amber-300">
                <li>Go to your Supabase dashboard</li>
                <li>Navigate to SQL Editor</li>
                <li>Run: <code className="bg-amber-100 dark:bg-amber-900 px-2 py-1 rounded">npx tsx scripts/show-sql-migration.ts</code> to see the SQL</li>
                <li>Copy and paste the SQL into Supabase SQL Editor</li>
                <li>Click "Run"</li>
              </ol>
            </div>
            <div className="mt-4 p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <p className="text-xs font-mono text-amber-800 dark:text-amber-200 break-all">
                {error?.message}
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    // For other errors, show error message
    console.error("Admin page error:", error);
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Admin Panel</h2>
          <p className="text-destructive/90">{error?.message || "An unexpected error occurred"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">
          Real-time analytics and insights
        </p>
      </div>

      {/* High-level stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Visitors Today"
          value={trafficStats.uniqueVisitorsToday || 0}
          change={trafficStats.visitorsChange24h || 0}
        />
        <StatCard
          title="Visits Today"
          value={trafficStats.visitsLast24h}
          change={trafficStats.visitsChange24h}
        />
        <StatCard
          title="Signups Today"
          value={userStats.newSignupsToday}
          change={userStats.signupsChange24h}
        />
        <StatCard
          title="Active Users Today"
          value={userStats.dau}
          change={userStats.dauChange}
        />
        <StatCard
          title="AI Summaries Today"
          value={usageStats.summariesGeneratedToday}
          change={usageStats.summariesChange24h}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VisitorsChart data={trafficStats.visitorsLast7Days || []} />
        <VisitsChart data={trafficStats.visitsLast7Days} />
        <SignupChart data={userStats.signupsLast7Days} />
        <LogsChart data={usageStats.logsLast7Days} />
        <UserRetentionChart data={userStats.retentionData} />
      </div>
    </div>
  );
}

