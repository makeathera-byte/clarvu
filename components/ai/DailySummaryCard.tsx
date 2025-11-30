"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatTimeForDisplay } from "@/lib/utils/time";

interface DailySummary {
  id: string;
  summary: string;
  focus_score: number | null;
  insights: string | null;
  date: string;
}

interface DailySummaryCardProps {
  summary: DailySummary | null;
}

export function DailySummaryCard({ summary, aiSummaryTime = null }: DailySummaryCardProps) {
  const getFocusScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getFocusScoreBgColor = (score: number | null) => {
    if (!score) return "bg-muted/50";
    if (score >= 80) return "bg-green-50 dark:bg-green-950/30";
    if (score >= 60) return "bg-blue-50 dark:bg-blue-950/30";
    if (score >= 40) return "bg-yellow-50 dark:bg-yellow-950/30";
    return "bg-red-50 dark:bg-red-950/30";
  };

  const getFocusScoreLabel = (score: number | null) => {
    if (!score) return "N/A";
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!summary) {
    return (
      <Card className="border-border/40 bg-[#f7f7f8] dark:bg-stone-900/50 rounded-xl shadow-sm">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-2">
              Your AI summary will be generated at {formatTimeForDisplay(aiSummaryTime)}.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Start logging activities to generate insights.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Parse insights into array if they're separated by newlines or bullets
  const insightsList = summary.insights
    ? summary.insights
        .split(/\n|•|-\s/)
        .map((i) => i.trim())
        .filter((i) => i.length > 0)
        .slice(0, 3)
    : [];

  return (
    <Card className="border-border/40 bg-[#f7f7f8] dark:bg-stone-900/50 rounded-xl shadow-sm">
      <CardContent className="p-6 space-y-6">
        {/* Focus Score */}
        {summary.focus_score !== null && (
          <div
            className={`rounded-xl border border-border/40 ${getFocusScoreBgColor(
              summary.focus_score
            )} p-6`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Focus Score
              </span>
              <span
                className={`text-4xl font-bold ${getFocusScoreColor(summary.focus_score)}`}
              >
                {summary.focus_score}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {getFocusScoreLabel(summary.focus_score)}
            </p>
          </div>
        )}

        {/* Summary */}
        <div>
          <h4 className="text-sm font-semibold mb-3 text-foreground">Summary</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary.summary}
          </p>
        </div>

        {/* Key Insights */}
        {insightsList.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 text-foreground">
              2-3 Key Insights
            </h4>
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

        {/* Update Badge */}
        <div className="pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground/70 text-center">
            AI updated at {formatTimeForDisplay(aiSummaryTime)} • {formatDate(summary.date)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

