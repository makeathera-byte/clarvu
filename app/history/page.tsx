import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getDailySummaries,
  getWeeklySummaries,
  getMonthlySummaries,
  getPastLogs,
  getUserCategories,
} from "./actions";
import { HistoryFilters, HistoryFiltersState } from "@/components/history/HistoryFilters";
import { DailySummaryList } from "@/components/history/DailySummaryList";
import { WeeklySummaryList } from "@/components/history/WeeklySummaryList";
import { MonthlySummaryList } from "@/components/history/MonthlySummaryList";
import { SummaryStatsCards } from "@/components/history/SummaryStatsCards";
import { FocusScoreTrendChart } from "@/components/history/charts/FocusScoreTrendChart";
import { ProductivityTrendChart } from "@/components/history/charts/ProductivityTrendChart";
import { TimeDistributionBarChart } from "@/components/history/charts/TimeDistributionBarChart";
import { CategoryPieChart } from "@/components/history/charts/CategoryPieChart";
import { DayDetailModal } from "@/components/history/DayDetailModal";
import { HistoryPageClient } from "@/components/history/HistoryPageClient";
import { compareTodayToYesterday } from "@/lib/insights/comparisons";
import { parseISO } from "date-fns";

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch initial data
  const [dailySummaries, weeklySummaries, monthlySummaries, categories] = await Promise.all([
    getDailySummaries(30),
    getWeeklySummaries(12),
    getMonthlySummaries(6),
    getUserCategories(),
  ]);

  // Get logs for the last 30 days for charts
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const recentLogs = await getPastLogs(
    thirtyDaysAgo.toISOString(),
    today.toISOString()
  );

  // Initial filter state (default to last 30 days)
  const initialFilters: HistoryFiltersState = {
    dateRangePreset: "30d",
    startDate: thirtyDaysAgo.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0],
    summaryType: "all",
    categoryId: null,
    highImpactOnly: false,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">History & Analytics</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review your productivity trends, AI summaries, and insights over time
          </p>
        </div>

        {/* Client Component for Interactive Features */}
        <HistoryPageClient
          initialDailySummaries={dailySummaries}
          initialWeeklySummaries={weeklySummaries}
          initialMonthlySummaries={monthlySummaries}
          initialRecentLogs={recentLogs}
          categories={categories}
          initialFilters={initialFilters}
        />
      </div>
    </div>
  );
}

