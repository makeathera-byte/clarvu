import { getTrafficStats } from "@/app/ppadminpp/actions";
import { VisitsChart } from "@/components/admin/charts/VisitsChart";
import { PageTrafficChart } from "@/components/admin/charts/PageTrafficChart";
import { DevicePieChart } from "@/components/admin/charts/DevicePieChart";
import { CountryChart } from "@/components/admin/charts/CountryChart";

export default async function TrafficPage() {
  let stats;
  
  try {
    stats = await getTrafficStats();
  } catch (error: any) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Traffic Data</h2>
          <p className="text-destructive/90">{error?.message || "An unexpected error occurred"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Traffic Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Visitor patterns and page performance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VisitsChart data={stats.visitsLast7Days} />
        <PageTrafficChart data={stats.visitsByPage} />
        <DevicePieChart data={stats.visitsByDevice} />
        <CountryChart data={stats.visitsByCountry} />
      </div>
    </div>
  );
}

