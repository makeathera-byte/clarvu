"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface MonthlySummary {
  id: string;
  summary: string;
  insights: string | null;
  month: string;
}

interface MonthlySummaryCardProps {
  summary: MonthlySummary | null;
}

export function MonthlySummaryCard({ summary }: MonthlySummaryCardProps) {
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
            console.log("✅ Logged summary_opened event (monthly)");
          } else {
            console.error("❌ Failed to log summary_opened:", data.error);
          }
        })
        .catch((err) => console.error("❌ Error logging summary opened:", err));
    }
  }, [summary]);

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
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
              Monthly summaries are generated on the 2nd of each month at 3 AM.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const insightsList = parseInsights(summary.insights);
  const improvementsList = insightsList.filter((i) =>
    i.toLowerCase().includes("improve") || i.toLowerCase().includes("suggest")
  );
  const patternList = insightsList.filter(
    (i) =>
      i.toLowerCase().includes("pattern") ||
      i.toLowerCase().includes("trend") ||
      i.toLowerCase().includes("habit")
  );

  return (
    <Card className="border-border/40 bg-[#f7f7f8] dark:bg-stone-900/50 rounded-xl shadow-sm">
      <CardContent className="p-6 space-y-6">
        {/* Month Header */}
        <div className="pb-4 border-b border-border/40">
          <h3 className="text-lg font-semibold text-foreground">
            {formatMonth(summary.month)}
          </h3>
        </div>

        {/* Summary */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">
            Monthly Overview
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary.summary}
          </p>
        </div>

        {/* Long-term Patterns */}
        {patternList.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">
              Long-term Patterns
            </h4>
            <ul className="space-y-2">
              {patternList.map((pattern, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2"
                >
                  <span className="text-muted-foreground/50 mt-1.5">•</span>
                  <span>{pattern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested Improvements */}
        {improvementsList.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">
              Suggested Improvements
            </h4>
            <ul className="space-y-2">
              {improvementsList.map((improvement, index) => (
                <li
                  key={index}
                  className="text-sm text-muted-foreground leading-relaxed flex items-start gap-2"
                >
                  <span className="text-muted-foreground/50 mt-1.5">•</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Remaining Insights */}
        {insightsList.length > improvementsList.length + patternList.length && (
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">
              Productivity Notes
            </h4>
            <ul className="space-y-2">
              {insightsList
                .filter(
                  (i) =>
                    !i.toLowerCase().includes("improve") &&
                    !i.toLowerCase().includes("suggest") &&
                    !i.toLowerCase().includes("pattern") &&
                    !i.toLowerCase().includes("trend") &&
                    !i.toLowerCase().includes("habit")
                )
                .map((insight, index) => (
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
      </CardContent>
    </Card>
  );
}

