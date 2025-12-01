import { getUserStats } from "@/app/ppadminpp/actions";
import { StatCard } from "@/components/admin/cards/StatCard";
import { SignupChart } from "@/components/admin/charts/SignupChart";
import { UserRetentionChart } from "@/components/admin/charts/UserRetentionChart";
import { UserTable } from "@/components/admin/tables/UserTable";

export default async function UsersPage() {
  let stats;
  
  try {
    stats = await getUserStats();
  } catch (error: any) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading User Data</h2>
          <p className="text-destructive/90">{error?.message || "An unexpected error occurred"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Analytics</h1>
        <p className="text-muted-foreground mt-1">
          User growth and engagement metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
        />
        <StatCard
          title="DAU"
          value={stats.dau}
          subtitle="Daily Active Users"
        />
        <StatCard
          title="WAU"
          value={stats.wau}
          subtitle="Weekly Active Users"
        />
        <StatCard
          title="MAU"
          value={stats.mau}
          subtitle="Monthly Active Users"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SignupChart data={stats.signupsLast7Days} />
        <UserRetentionChart data={stats.retentionData} />
      </div>

      <UserTable />
    </div>
  );
}

