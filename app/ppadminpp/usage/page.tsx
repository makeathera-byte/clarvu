import { getUsageStats } from "@/app/ppadminpp/actions";
import { StatCard } from "@/components/admin/cards/StatCard";
import { LogsChart } from "@/components/admin/charts/LogsChart";
import { UsageEventsChart } from "@/components/admin/charts/UsageEventsChart";
import { RoutinesChart } from "@/components/admin/charts/RoutinesChart";

export default async function UsagePage() {
  let stats;
  
  try {
    stats = await getUsageStats();
  } catch (error: any) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Usage Data</h2>
          <p className="text-destructive/90">{error?.message || "An unexpected error occurred"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usage Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Feature usage and engagement metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Logs Created Today"
          value={stats.logsToday}
        />
        <StatCard
          title="AI Summaries Generated"
          value={stats.summariesGeneratedToday}
        />
        <StatCard
          title="Summaries Opened"
          value={stats.summariesOpenedToday}
        />
        <StatCard
          title="Reminders Clicked"
          value={stats.remindersClickedToday}
        />
        <StatCard
          title="Routines Generated"
          value={stats.routinesGeneratedToday || 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LogsChart data={stats.logsLast7Days} />
        <RoutinesChart data={stats.routinesLast7Days || []} />
        <UsageEventsChart
          logsToday={stats.logsToday}
          summariesGeneratedToday={stats.summariesGeneratedToday}
          summariesOpenedToday={stats.summariesOpenedToday}
          remindersClickedToday={stats.remindersClickedToday}
          routinesGeneratedToday={stats.routinesGeneratedToday || 0}
        />
      </div>
    </div>
  );
}

