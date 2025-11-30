"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileText, FileJson } from "lucide-react";
import { ActivityLog, DailySummary } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface ExportButtonProps {
  logs: ActivityLog[];
  summaries?: DailySummary[];
  dateRange?: { start: string; end: string };
}

export function ExportButton({ logs, summaries = [], dateRange }: ExportButtonProps) {
  const exportToCSV = () => {
    if (logs.length === 0) {
      alert("No data to export");
      return;
    }

    const headers = ["Date", "Activity", "Category", "Start Time", "End Time", "Duration (minutes)"];
    const rows = logs.map((log) => {
      const startTime = log.start_time ? parseISO(log.start_time) : null;
      const endTime = log.end_time ? parseISO(log.end_time) : null;
      
      let duration = 0;
      if (startTime && endTime) {
        duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      }

      return [
        startTime ? format(startTime, "yyyy-MM-dd") : "",
        log.activity || "",
        log.categories?.name || "Uncategorized",
        startTime ? format(startTime, "HH:mm:ss") : "",
        endTime ? format(endTime, "HH:mm:ss") : "",
        duration.toString(),
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const dateRangeStr = dateRange
      ? `${dateRange.start}_to_${dateRange.end}`
      : format(new Date(), "yyyy-MM-dd");
    
    link.href = URL.createObjectURL(blob);
    link.download = `dayflow-history-${dateRangeStr}.csv`;
    link.click();
  };

  const exportToJSON = () => {
    if (logs.length === 0 && summaries.length === 0) {
      alert("No data to export");
      return;
    }

    const exportData = {
      exportDate: new Date().toISOString(),
      dateRange: dateRange || null,
      logs: logs.map((log) => ({
        id: log.id,
        activity: log.activity,
        category: log.categories?.name || null,
        startTime: log.start_time,
        endTime: log.end_time,
        createdAt: log.created_at,
      })),
      summaries: summaries.map((summary) => ({
        date: summary.date,
        focusScore: summary.focus_score,
        summary: summary.summary,
      })),
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    const dateRangeStr = dateRange
      ? `${dateRange.start}_to_${dateRange.end}`
      : format(new Date(), "yyyy-MM-dd");
    
    link.href = URL.createObjectURL(blob);
    link.download = `dayflow-history-${dateRangeStr}.json`;
    link.click();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToJSON}>
          <FileJson className="h-4 w-4 mr-2" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

