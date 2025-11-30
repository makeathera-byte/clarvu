"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailySummaryCard } from "@/components/ai/DailySummaryCard";
import { WeeklySummaryCard } from "@/components/ai/WeeklySummaryCard";
import { MonthlySummaryCard } from "@/components/ai/MonthlySummaryCard";
import { TimelineChart } from "@/components/charts/TimelineChart";
import { WeeklyHeatmap } from "@/components/charts/WeeklyHeatmap";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { ComparisonCard } from "@/components/ai/ComparisonCard";
import { BusinessInsightsPanel } from "@/components/insights/BusinessInsightsPanel";
import { RoutinePanel } from "@/components/routine/RoutinePanel";

interface ActivityLog {
  id: string;
  activity: string;
  start_time: string;
  end_time: string | null;
  category_id: string | null;
  categories?: {
    id: string;
    name: string;
    color: string;
    icon: string | null;
  } | null | {
    id: string;
    name: string;
    color: string;
    icon: string | null;
  }[];
}

interface DailySummary {
  id: string;
  summary: string;
  focus_score: number | null;
  insights: string | null;
  date: string;
}

interface WeeklySummary {
  id: string;
  summary: string;
  insights: string | null;
  week_start: string;
}

interface MonthlySummary {
  id: string;
  summary: string;
  insights: string | null;
  month: string;
}

interface BusinessInsights {
  revenueTime: {
    total_revenue_minutes: number;
    percentage_of_day_spent_on_revenue_work: number;
  };
  adminTime: {
    total_admin_minutes: number;
    admin_ratio: number;
  };
  contextSwitches: number;
  highImpactTasks: any[];
  roiScore: {
    average_daily_roi_score: number;
    roi_score_trend: number;
  };
}

interface RoutineData {
  routine: {
    morning: Array<{
      type: string;
      start: string;
      end: string;
      duration: number;
    }>;
    afternoon: Array<{
      type: string;
      start: string;
      end: string;
      duration: number;
    }>;
    evening: Array<{
      type: string;
      start: string;
      end: string;
      duration: number;
    }>;
    suggested_breaks?: Array<{ time: string; duration: number }>;
  };
  explanation: string;
  hasEnoughData?: boolean;
}

interface DashboardTabsProps {
  logs: any[]; // Flexible type to handle Supabase response structure
  dailySummary: DailySummary | null;
  weeklySummary: WeeklySummary | null;
  monthlySummary: MonthlySummary | null;
  businessInsights: BusinessInsights | null;
  routineData: RoutineData | null;
  yesterdaySummary?: DailySummary | null;
  todayRevenueMinutes?: number;
  yesterdayRevenueMinutes?: number;
  todayContextSwitches?: number;
  yesterdayContextSwitches?: number;
  aiSummaryTime?: string | null; // User's AI summary time
}

export function DashboardTabs({
  logs,
  dailySummary,
  weeklySummary,
  monthlySummary,
  businessInsights,
  routineData,
  yesterdaySummary = null,
  todayRevenueMinutes = 0,
  yesterdayRevenueMinutes = 0,
  todayContextSwitches = 0,
  yesterdayContextSwitches = 0,
  aiSummaryTime = null,
}: DashboardTabsProps) {
  // Filter logs for today only (for pie chart)
  const todayLogs = logs.filter((log) => {
    if (!log.start_time) return false;
    const logDate = new Date(log.start_time);
    const today = new Date();
    return (
      logDate.getDate() === today.getDate() &&
      logDate.getMonth() === today.getMonth() &&
      logDate.getFullYear() === today.getFullYear()
    );
  });
  return (
    <Tabs defaultValue="daily" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="daily">Daily</TabsTrigger>
        <TabsTrigger value="weekly">Weekly</TabsTrigger>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="business">Business</TabsTrigger>
        <TabsTrigger value="routine">Routine</TabsTrigger>
      </TabsList>

      {/* Daily Tab */}
      <TabsContent value="daily" className="mt-6 space-y-6">
        <DailySummaryCard summary={dailySummary} aiSummaryTime={aiSummaryTime} />
        <div className="grid gap-6 lg:grid-cols-2">
          <ComparisonCard
            todaySummary={dailySummary}
            yesterdaySummary={yesterdaySummary}
            todayRevenueMinutes={todayRevenueMinutes}
            yesterdayRevenueMinutes={yesterdayRevenueMinutes}
            todayContextSwitches={todayContextSwitches}
            yesterdayContextSwitches={yesterdayContextSwitches}
          />
          <CategoryPieChart logs={todayLogs} />
        </div>
        <TimelineChart logs={logs} />
      </TabsContent>

      {/* Weekly Tab */}
      <TabsContent value="weekly" className="mt-6 space-y-6">
        <WeeklySummaryCard summary={weeklySummary} />
        <WeeklyHeatmap logs={logs} />
      </TabsContent>

      {/* Monthly Tab */}
      <TabsContent value="monthly" className="mt-6 space-y-6">
        <MonthlySummaryCard summary={monthlySummary} />
      </TabsContent>

      {/* Business Insights Tab */}
      <TabsContent value="business" className="mt-6 space-y-6">
        <BusinessInsightsPanel insights={businessInsights} />
      </TabsContent>

      {/* Routine Tab */}
      <TabsContent value="routine" className="mt-6 space-y-6">
        <RoutinePanel routineData={routineData} />
      </TabsContent>
    </Tabs>
  );
}

