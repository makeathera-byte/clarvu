"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MonthlySummary } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { Calendar, ArrowRight } from "lucide-react";

interface MonthlySummaryListProps {
  summaries: MonthlySummary[];
}

export function MonthlySummaryList({ summaries }: MonthlySummaryListProps) {
  if (summaries.length === 0) {
    return (
      <Card className="border-border/40">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No monthly summaries found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatMonth = (month: string) => {
    try {
      // Assuming month is in format "YYYY-MM"
      const date = parseISO(`${month}-01`);
      return format(date, "MMMM yyyy");
    } catch {
      return month;
    }
  };

  const extractInsights = (insights: string | null): string[] => {
    if (!insights) return [];
    
    const lines = insights.split("\n").filter((line) => line.trim());
    const bullets: string[] = [];
    
    for (const line of lines) {
      if (line.match(/^[-•*]\s+/) || line.match(/^\d+\.\s+/)) {
        bullets.push(line.replace(/^[-•*\d.]\s+/, "").trim());
      } else if (bullets.length < 3 && line.trim().length > 20) {
        bullets.push(line.trim());
      }
      if (bullets.length >= 3) break;
    }
    
    return bullets.slice(0, 3);
  };

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="text-lg">Monthly Summaries</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {summaries.map((summary) => {
            const monthName = formatMonth(summary.month);
            const insights = extractInsights(summary.insights);

            return (
              <AccordionItem
                key={summary.id}
                value={summary.id}
                className="border border-border/40 rounded-lg px-4"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-start justify-between w-full pr-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Month */}
                      <div className="text-left min-w-[140px]">
                        <div className="text-sm font-medium">
                          {monthName}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Monthly Overview
                        </div>
                      </div>

                      {/* Insights Preview */}
                      <div className="flex-1 text-left">
                        {insights.length > 0 ? (
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {insights.map((insight, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-muted-foreground/50 mt-1">•</span>
                                <span className="line-clamp-1">{insight}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {summary.summary || "No summary available"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 pb-2 space-y-4">
                    {summary.summary && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Summary</h4>
                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {summary.summary}
                        </div>
                      </div>
                    )}
                    {summary.insights && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Key Insights</h4>
                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {summary.insights}
                        </div>
                      </div>
                    )}
                    {!summary.summary && !summary.insights && (
                      <p className="text-sm text-muted-foreground italic">
                        No summary generated for this month.
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}

