"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatTimeForDisplay } from "@/lib/utils/time";

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

interface AISummaryProps {
  daily: DailySummary | null;
  weekly: WeeklySummary | null;
  monthly: MonthlySummary | null;
  aiSummaryTime?: string | null; // User's AI summary time in HH:mm format
}

export function AISummary({ daily, weekly, monthly, aiSummaryTime = null }: AISummaryProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatWeekStart = (weekStart: string) => {
    const date = new Date(weekStart);
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + 6);
    return `${date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const formatMonth = (monthStr: string) => {
    const date = new Date(monthStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getFocusScoreColor = (score: number | null) => {
    if (!score) return "text-muted-foreground";
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getFocusScoreLabel = (score: number | null) => {
    if (!score) return "N/A";
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader>
        <CardTitle>AI Insights</CardTitle>
        <CardDescription>
          Automated summaries and productivity analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="mt-6 space-y-4">
            {daily ? (
              <>
                {daily.focus_score !== null && (
                  <div className="rounded-xl border border-border/40 bg-muted/30 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Focus Score
                      </span>
                      <span
                        className={`text-2xl font-bold ${getFocusScoreColor(daily.focus_score)}`}
                      >
                        {daily.focus_score}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getFocusScoreLabel(daily.focus_score)} • {formatDate(daily.date)}
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {daily.summary}
                    </p>
                  </div>

                  {daily.insights && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Key Insights</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {daily.insights}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-border/40 p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  No daily summary available yet.
                </p>
                <p className="text-xs text-muted-foreground">
                  Your next summary will be generated at {formatTimeForDisplay(aiSummaryTime)} after you log activities today.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="weekly" className="mt-6 space-y-4">
            {weekly ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground mb-4">
                  Week of {formatWeekStart(weekly.week_start)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {weekly.summary}
                  </p>
                </div>
                {weekly.insights && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Insights</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {weekly.insights}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/40 p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  No weekly summary available yet.
                </p>
                <p className="text-xs text-muted-foreground">
                  Weekly summaries are generated every Sunday at 3 AM.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="monthly" className="mt-6 space-y-4">
            {monthly ? (
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground mb-4">
                  {formatMonth(monthly.month)}
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Summary</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {monthly.summary}
                  </p>
                </div>
                {monthly.insights && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Strategic Insights</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {monthly.insights}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/40 p-8 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  No monthly summary available yet.
                </p>
                <p className="text-xs text-muted-foreground">
                  Monthly summaries are generated on the 2nd of each month at 3 AM.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground text-center">
            AI summaries are generated automatically via Supabase Edge Functions. No data leaves your secure cloud database.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

