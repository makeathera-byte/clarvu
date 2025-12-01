import { getSystemHealth } from "@/app/ppadminpp/actions";
import { StatCard } from "@/components/admin/cards/StatCard";
import { ErrorsChart } from "@/components/admin/charts/ErrorsChart";
import { AiRequestsChart } from "@/components/admin/charts/AiRequestsChart";
import { SlowRoutesTable } from "@/components/admin/tables/SlowRoutesTable";
import { TopEndpointsTable } from "@/components/admin/tables/TopEndpointsTable";

export default async function SystemHealthPage() {
  let health;
  
  try {
    health = await getSystemHealth();
  } catch (error: any) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading System Health</h2>
          <p className="text-destructive/90">{error?.message || "An unexpected error occurred"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Health</h1>
        <p className="text-muted-foreground mt-1">
          System performance and error monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Errors (7d)"
          value={health.totalErrors}
        />
        <StatCard
          title="Cron Success Count"
          value={health.cronSuccessCount}
        />
        <StatCard
          title="Slow Routes"
          value={health.slowRoutes.length}
        />
        <StatCard
          title="Database Health"
          value={health.databaseHealth || "unknown"}
          subtitle={`${health.databaseResponseTime || 0}ms`}
        />
      </div>

      {/* AI API Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="AI API Requests (7d)"
          value={health.totalAiRequests || 0}
        />
        <StatCard
          title="AI Success Rate"
          value={`${health.aiSuccessRate || "100.00"}%`}
          subtitle={`${health.aiSuccessRequests || 0} success, ${health.aiErrorRequests || 0} errors`}
        />
        <StatCard
          title="Avg AI Response Time"
          value={`${health.avgAiResponseTime || 0}ms`}
          subtitle={`Max: ${health.maxAiResponseTime || 0}ms`}
        />
        <div className="rounded-xl border border-border/40 bg-card dark:bg-card/80 p-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">AI API Health</p>
              <p className="text-lg font-semibold mt-1 capitalize text-foreground">
                {health.aiApiHealth || "unknown"}
              </p>
              {health.aiSuccessRate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Success: {health.aiSuccessRate}%
                </p>
              )}
            </div>
            <div className={`h-3 w-3 rounded-full ${
              health.aiApiHealth === "healthy" ? "bg-green-500 dark:bg-green-400" :
              health.aiApiHealth === "degraded" ? "bg-yellow-500 dark:bg-yellow-400" :
              health.aiApiHealth === "unhealthy" ? "bg-red-500 dark:bg-red-400" :
              "bg-gray-500 dark:bg-gray-400"
            }`} />
          </div>
        </div>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border/40 bg-card dark:bg-card/80 p-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">API Health</p>
              <p className="text-lg font-semibold mt-1 capitalize text-foreground">
                {health.apiHealth || "unknown"}
              </p>
              {health.errorRate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Error Rate: {health.errorRate}%
                </p>
              )}
            </div>
            <div className={`h-3 w-3 rounded-full ${
              health.apiHealth === "healthy" ? "bg-green-500 dark:bg-green-400" :
              health.apiHealth === "degraded" ? "bg-yellow-500 dark:bg-yellow-400" :
              health.apiHealth === "unhealthy" ? "bg-red-500 dark:bg-red-400" :
              "bg-gray-500 dark:bg-gray-400"
            }`} />
          </div>
        </div>
        <div className="rounded-xl border border-border/40 bg-card dark:bg-card/80 p-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Database Status</p>
              <p className="text-lg font-semibold mt-1 capitalize text-foreground">
                {health.databaseHealth || "unknown"}
              </p>
              {health.databaseResponseTime !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  Response: {health.databaseResponseTime}ms
                </p>
              )}
            </div>
            <div className={`h-3 w-3 rounded-full ${
              health.databaseHealth === "healthy" ? "bg-green-500 dark:bg-green-400" :
              health.databaseHealth === "slow" ? "bg-yellow-500 dark:bg-yellow-400" :
              health.databaseHealth === "unhealthy" ? "bg-red-500 dark:bg-red-400" :
              "bg-gray-500 dark:bg-gray-400"
            }`} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorsChart data={health.errorsLast7Days} />
        <AiRequestsChart data={health.aiRequestsLast7Days || []} />
      </div>

      <SlowRoutesTable data={health.slowRoutes} />
      <TopEndpointsTable data={health.topEndpoints || []} />
    </div>
  );
}

