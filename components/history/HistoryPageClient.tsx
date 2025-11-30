"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  DailySummary,
  WeeklySummary,
  MonthlySummary,
  ActivityLog,
  Category,
} from "@/lib/types";
import { HistoryFilters, HistoryFiltersState } from "./HistoryFilters";
import { DailySummaryList } from "./DailySummaryList";
import { WeeklySummaryList } from "./WeeklySummaryList";
import { MonthlySummaryList } from "./MonthlySummaryList";
import { SummaryStatsCards } from "./SummaryStatsCards";
import { FocusScoreTrendChart } from "./charts/FocusScoreTrendChart";
import { ProductivityTrendChart } from "./charts/ProductivityTrendChart";
import { TimeDistributionBarChart } from "./charts/TimeDistributionBarChart";
import { CategoryPieChart } from "./charts/CategoryPieChart";
import { DayDetailModal } from "./DayDetailModal";
import { HistorySearch } from "./HistorySearch";
import { ExportButton } from "./ExportButton";
import { PeriodComparison } from "./PeriodComparison";
import { ProductivityInsights } from "./ProductivityInsights";
import { QuickFilters } from "./QuickFilters";
import { StreakTracker } from "./StreakTracker";
import { PaginationControls } from "./PaginationControls";
import { compareTodayToYesterday } from "@/lib/insights/comparisons";
import { parseISO, subDays, format } from "date-fns";

interface HistoryPageClientProps {
  initialDailySummaries: DailySummary[];
  initialWeeklySummaries: WeeklySummary[];
  initialMonthlySummaries: MonthlySummary[];
  initialRecentLogs: ActivityLog[];
  categories: Category[];
  initialFilters: HistoryFiltersState;
}

export function HistoryPageClient({
  initialDailySummaries,
  initialWeeklySummaries,
  initialMonthlySummaries,
  initialRecentLogs,
  categories,
  initialFilters,
}: HistoryPageClientProps) {
  const [filters, setFilters] = useState<HistoryFiltersState>(initialFilters);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDayLogs, setSelectedDayLogs] = useState<ActivityLog[]>([]);
  const [previousDayLogs, setPreviousDayLogs] = useState<ActivityLog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDaySummary, setSelectedDaySummary] = useState<DailySummary | null>(null);
  const [previousDaySummary, setPreviousDaySummary] = useState<DailySummary | null>(null);
  const [searchFilteredLogs, setSearchFilteredLogs] = useState<ActivityLog[]>(initialRecentLogs);
  const [previousPeriodLogs, setPreviousPeriodLogs] = useState<ActivityLog[]>([]);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dailySummaryPage, setDailySummaryPage] = useState(1);
  const itemsPerPage = 10;
  const [currentLogs, setCurrentLogs] = useState<ActivityLog[]>(initialRecentLogs);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const isInitialMount = useRef(true);
  const prevFilterRef = useRef<string>("");
  
  // Initialize currentLogs with initialRecentLogs on mount only
  useEffect(() => {
    if (isInitialMount.current && initialRecentLogs.length > 0) {
      setCurrentLogs(initialRecentLogs);
      prevFilterRef.current = `${filters.startDate}-${filters.endDate}`;
      isInitialMount.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Filter summaries based on filters
  const filteredDailySummaries = useMemo(() => {
    let filtered = initialDailySummaries;

    // Filter by date range
    if (filters.startDate && filters.endDate) {
      filtered = filtered.filter((summary) => {
        const summaryDate = parseISO(summary.date);
        const start = parseISO(filters.startDate);
        const end = parseISO(filters.endDate);
        end.setHours(23, 59, 59, 999);
        return summaryDate >= start && summaryDate <= end;
      });
    }

    // Filter by summary type
    if (filters.summaryType !== "all" && filters.summaryType !== "daily") {
      filtered = [];
    }

    // Filter by high impact
    if (filters.highImpactOnly) {
      filtered = filtered.filter((s) => (s.focus_score || 0) >= 70);
    }

    return filtered;
  }, [initialDailySummaries, filters]);

  const filteredWeeklySummaries = useMemo(() => {
    if (filters.summaryType !== "all" && filters.summaryType !== "weekly") {
      return [];
    }
    return initialWeeklySummaries;
  }, [initialWeeklySummaries, filters]);

  const filteredMonthlySummaries = useMemo(() => {
    if (filters.summaryType !== "all" && filters.summaryType !== "monthly") {
      return [];
    }
    return initialMonthlySummaries;
  }, [initialMonthlySummaries, filters]);

  // Fetch logs when date range changes (but not on initial mount if we have initial logs)
  useEffect(() => {
    if (!filters.startDate || !filters.endDate) return;
    
    const filterKey = `${filters.startDate}-${filters.endDate}`;
    
    // Skip if same filter as before or if initial mount with initial logs
    if (prevFilterRef.current === filterKey || (isInitialMount.current && initialRecentLogs.length > 0)) {
      return;
    }
    
    prevFilterRef.current = filterKey;
    setLoadingLogs(true);
    
    const start = new Date(filters.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);

    console.log("[HistoryPageClient] Fetching logs:", {
      start: start.toISOString(),
      end: end.toISOString(),
    });

    fetch(`/api/history/logs?start=${start.toISOString()}&end=${end.toISOString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("[HistoryPageClient] Logs fetched:", data.logs?.length || 0, "logs");
        if (data.error) {
          console.error("[HistoryPageClient] API error:", data.error);
          setCurrentLogs([]);
        } else {
          setCurrentLogs(data.logs || []);
        }
      })
      .catch((err) => {
        console.error("[HistoryPageClient] Error fetching logs:", err);
        setCurrentLogs([]);
      })
      .finally(() => {
        setLoadingLogs(false);
      });
  }, [filters.startDate, filters.endDate, initialRecentLogs]);

  // Filter logs based on filters
  const filteredLogs = useMemo(() => {
    let filtered = currentLogs;

    // Filter by category
    if (filters.categoryId) {
      filtered = filtered.filter((log) => log.category_id === filters.categoryId);
    }

    return filtered;
  }, [currentLogs, filters.categoryId]);

  // Get logs for charts (last 30 days or filtered range)
  const chartLogs = useMemo(() => {
    return filteredLogs;
  }, [filteredLogs]);

  // Get selected day logs for pie chart
  const selectedDayLogsForChart = useMemo(() => {
    if (!selectedDate) return [];
    return filteredLogs.filter((log) => {
      if (!log.start_time) return false;
      return log.start_time.startsWith(selectedDate);
    });
  }, [selectedDate, filteredLogs]);

  // Handle day click
  const handleDayClick = useCallback(async (date: string) => {
    setSelectedDate(date);
    setIsModalOpen(true);

    try {
      // Fetch logs for selected day
      const dayResponse = await fetch(`/api/history/logs-for-date?date=${date}`);
      const dayData = await dayResponse.json();
      setSelectedDayLogs(dayData.logs || []);

      // Find summary for selected day
      const summary = initialDailySummaries.find((s) => s.date === date) || null;
      setSelectedDaySummary(summary);

      // Get previous day for comparison
      const previousDate = subDays(parseISO(date), 1);
      const previousDateStr = previousDate.toISOString().split("T")[0];
      
      const prevResponse = await fetch(`/api/history/logs-for-date?date=${previousDateStr}`);
      const prevData = await prevResponse.json();
      setPreviousDayLogs(prevData.logs || []);

      const prevSummary = initialDailySummaries.find((s) => s.date === previousDateStr) || null;
      setPreviousDaySummary(prevSummary);
    } catch (error) {
      console.error("Error fetching day details:", error);
      setSelectedDayLogs([]);
      setPreviousDayLogs([]);
    }
  }, [initialDailySummaries]);

  // Calculate comparison
  const comparison = useMemo(() => {
    if (selectedDayLogs.length === 0 || previousDayLogs.length === 0) {
      return undefined;
    }
    return compareTodayToYesterday(
      selectedDayLogs,
      previousDayLogs,
      selectedDaySummary,
      previousDaySummary
    );
  }, [selectedDayLogs, previousDayLogs, selectedDaySummary, previousDaySummary]);

  // Load previous period for comparison when filters change
  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      const start = parseISO(filters.startDate);
      const end = parseISO(filters.endDate);
      const periodLength = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      setLoadingComparison(true);
      fetch(`/api/history/previous-period?start=${filters.startDate}&end=${filters.endDate}&days=${periodLength}`)
        .then((res) => res.json())
        .then((data) => {
          setPreviousPeriodLogs(data.logs || []);
        })
        .catch((err) => {
          console.error("Error fetching previous period:", err);
          setPreviousPeriodLogs([]);
        })
        .finally(() => {
          setLoadingComparison(false);
        });
    }
  }, [filters.startDate, filters.endDate]);

  // Update search filtered logs when filtered logs change
  useEffect(() => {
    // Only update if we're not loading (to avoid flickering)
    if (!loadingLogs) {
      setSearchFilteredLogs(filteredLogs);
      setDailySummaryPage(1); // Reset to first page when filters change
    }
  }, [filteredLogs, loadingLogs]);

  // Paginate daily summaries
  const paginatedDailySummaries = useMemo(() => {
    const startIndex = (dailySummaryPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDailySummaries.slice(startIndex, endIndex);
  }, [filteredDailySummaries, dailySummaryPage]);

  const totalDailyPages = Math.ceil(filteredDailySummaries.length / itemsPerPage);

  // Get period labels for comparison
  const periodLabels = useMemo(() => {
    if (!filters.startDate || !filters.endDate) return { current: "Current Period", previous: "Previous Period" };
    
    const start = parseISO(filters.startDate);
    const end = parseISO(filters.endDate);
    const periodLength = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const previousStart = subDays(start, periodLength);
    const previousEnd = subDays(end, periodLength);
    
    return {
      current: `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`,
      previous: `${format(previousStart, "MMM d")} - ${format(previousEnd, "MMM d, yyyy")}`,
    };
  }, [filters.startDate, filters.endDate]);

  return (
    <>
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          {loadingLogs ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Loading logs...</span>
            </div>
          ) : (
            <HistorySearch 
              logs={filteredLogs} 
              onFilteredLogsChange={setSearchFilteredLogs}
              resetKey={`${filters.startDate}-${filters.endDate}-${filters.categoryId}`}
            />
          )}
        </div>
        <ExportButton
          logs={searchFilteredLogs}
          summaries={filteredDailySummaries}
          dateRange={{
            start: filters.startDate,
            end: filters.endDate,
          }}
        />
      </div>

      {/* Quick Filters */}
      <QuickFilters
        currentFilters={filters}
        onFilterSelect={(newFilters) => {
          setFilters((prev) => ({ ...prev, ...newFilters }));
        }}
      />

      {/* Filters */}
      <HistoryFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />

      {/* Insights and Streak Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductivityInsights logs={searchFilteredLogs} summaries={filteredDailySummaries} />
        <StreakTracker logs={searchFilteredLogs} />
      </div>

      {/* Summary Stats Cards */}
      <SummaryStatsCards
        summaries={filteredDailySummaries}
        logs={searchFilteredLogs}
        comparison={comparison}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FocusScoreTrendChart summaries={filteredDailySummaries} />
        <ProductivityTrendChart logs={chartLogs} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TimeDistributionBarChart logs={chartLogs} />
        {selectedDate && selectedDayLogsForChart.length > 0 ? (
          <CategoryPieChart
            logs={selectedDayLogsForChart}
            title="Selected Day Categories"
            description={`Category breakdown for ${selectedDate}`}
          />
        ) : (
          <CategoryPieChart
            logs={searchFilteredLogs}
            title="Overall Category Distribution"
            description="Time spent by category across selected period"
          />
        )}
      </div>

      {/* Period Comparison */}
      {previousPeriodLogs.length > 0 && searchFilteredLogs.length > 0 && (
        <PeriodComparison
          currentPeriodLogs={searchFilteredLogs}
          previousPeriodLogs={previousPeriodLogs}
          currentLabel={periodLabels.current}
          previousLabel={periodLabels.previous}
        />
      )}

      {/* Summary Lists */}
      {(filters.summaryType === "all" || filters.summaryType === "daily") && (
        <>
          <DailySummaryList
            summaries={paginatedDailySummaries}
            onDayClick={handleDayClick}
            highImpactOnly={filters.highImpactOnly}
          />
          {totalDailyPages > 1 && (
            <PaginationControls
              currentPage={dailySummaryPage}
              totalPages={totalDailyPages}
              onPageChange={setDailySummaryPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredDailySummaries.length}
            />
          )}
        </>
      )}

      {(filters.summaryType === "all" || filters.summaryType === "weekly") && (
        <WeeklySummaryList summaries={filteredWeeklySummaries} />
      )}

      {(filters.summaryType === "all" || filters.summaryType === "monthly") && (
        <MonthlySummaryList summaries={filteredMonthlySummaries} />
      )}

      {/* Day Detail Modal */}
      {selectedDate && (
        <DayDetailModal
          date={selectedDate}
          logs={selectedDayLogs}
          summary={selectedDaySummary}
          previousLogs={previousDayLogs}
          previousSummary={previousDaySummary}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </>
  );
}

