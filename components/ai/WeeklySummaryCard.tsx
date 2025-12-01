"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface WeeklySummary {
  id: string;
  summary: string;
  insights: string | null;
  week_start: string;
}

interface WeeklySummaryCardProps {
  summary: WeeklySummary | null;
}

export function WeeklySummaryCard({ summary }: WeeklySummaryCardProps) {
  // Log summary opened event when summary is displayed
  useEffect(() => {
    if (summary) {
      fetch("/api/analytics/log-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "summary_opened" }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            console.log("✅ Logged summary_opened event (weekly)");
          } else {
            console.error("❌ Failed to log summary_opened:", data.error);
          }
        })
        .catch((err) => console.error("❌ Error logging summary opened:", err));
    }
  }, [summary]);

  const formatWeekRange = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return {
      start: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      end: end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  };

  const parseInsights = (insights: string | null) => {
    if (!insights) return [];
    return insights
      .split(/\n|•|-\s/)
      .map((i) => i.trim())
      .filter((i) => i.length > 0);
  };

  if (!summary) {
    return (
      <Card className="border-border/40 bg-[#f7f7f8] dark:bg-stone-900/50 rounded-xl shadow-sm">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-2">
              Weekly summaries are generated every Sunday at 3 AM.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const weekRange = formatWeekRange(summary.week_start);
  const insightsList = parseInsights(summary.insights);

  return (
    <Card className="border-border/40 bg-[#f7f7f8] dark:bg-stone-900/50 rounded-xl shadow-sm">
      <CardContent className="p-6 space-y-6">
        {/* Week Header */}
        <div className="pb-4 border-b border-border/40">
          <h3 className="text-lg font-semibold text-foreground">
            Week of {weekRange.start} - {weekRange.end}
          </h3>
        </div>

        {/* Summary */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Summary</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary.summary}
          </p>
        </div>

        {/* Insights */}
        {insightsList.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">Insights</h4>
            <ul className="space-y-2">
              {insightsList.map((insight, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2"
                >
                  <span className="text-muted-foreground/50 mt-1.5">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Placeholder Sections */}
        <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-border/40">
          {/* Best Focus Hours */}
          <div className="rounded-lg border border-border/40 bg-background/50 p-4">
            <h4 className="text-xs font-semibold mb-2 text-foreground">
              Best Focus Hours
            </h4>
            <p className="text-xs text-muted-foreground">
              Analysis coming soon
            </p>
          </div>

          {/* Top 3 Most Productive Days */}
          <div className="rounded-lg border border-border/40 bg-background/50 p-4">
            <h4 className="text-xs font-semibold mb-2 text-foreground">
              Top 3 Most Productive Days
            </h4>
            <p className="text-xs text-muted-foreground">
              Analysis coming soon
            </p>
          </div>
        </div>

        {/* Time Distribution Placeholder */}
        <div className="rounded-lg border border-border/40 bg-background/50 p-4">
          <h4 className="text-xs font-semibold mb-2 text-foreground">
            Time Distribution
          </h4>
          <p className="text-xs text-muted-foreground">
            Visual breakdown coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

