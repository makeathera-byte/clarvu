"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UsageEventsChartProps {
  logsToday: number;
  summariesGeneratedToday: number;
  summariesOpenedToday: number;
  remindersClickedToday: number;
  routinesGeneratedToday?: number;
}

export function UsageEventsChart({
  logsToday,
  summariesGeneratedToday,
  summariesOpenedToday,
  remindersClickedToday,
  routinesGeneratedToday = 0,
}: UsageEventsChartProps) {
  return (
    <Card className="border-border/40 shadow-sm rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg">Usage Events Today</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <span className="font-medium">Logs Created</span>
            <span className="text-2xl font-bold">{logsToday}</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <span className="font-medium">AI Summaries Generated</span>
            <span className="text-2xl font-bold">{summariesGeneratedToday}</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <span className="font-medium">Summaries Opened</span>
            <span className="text-2xl font-bold">{summariesOpenedToday}</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <span className="font-medium">Reminders Clicked</span>
            <span className="text-2xl font-bold">{remindersClickedToday}</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <span className="font-medium">Routines Generated</span>
            <span className="text-2xl font-bold">{routinesGeneratedToday}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

