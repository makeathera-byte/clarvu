"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DailySummary } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { ChevronRight, TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DailySummaryListProps {
  summaries: DailySummary[];
  onDayClick?: (date: string) => void;
  highImpactOnly?: boolean;
}

export function DailySummaryList({
  summaries,
  onDayClick,
  highImpactOnly = false,
}: DailySummaryListProps) {
  const filteredSummaries = highImpactOnly
    ? summaries.filter((s) => (s.focus_score || 0) >= 70)
    : summaries;

  if (filteredSummaries.length === 0) {
    return (
      <Card className="border-border/40">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No daily summaries found for this period.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const extractBulletPoints = (summary: string | null): string[] => {
    if (!summary) return [];
    
    // Extract bullet points or first 3 sentences
    const lines = summary.split("\n").filter((line) => line.trim());
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

  const getFocusScoreColor = (score: number | null) => {
    if (!score) return "bg-muted";
    if (score >= 80) return "bg-green-500/20 text-green-700 dark:text-green-400";
    if (score >= 60) return "bg-blue-500/20 text-blue-700 dark:text-blue-400";
    if (score >= 40) return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
    return "bg-red-500/20 text-red-700 dark:text-red-400";
  };

  const getFocusScoreIcon = (score: number | null, previousScore: number | null) => {
    if (!score || previousScore === null) return <Minus className="h-3 w-3" />;
    if (score > previousScore + 5) return <TrendingUp className="h-3 w-3" />;
    if (score < previousScore - 5) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  return (
    <Card className="border-border/40">
      <CardHeader>
        <CardTitle className="text-lg">Daily Summaries</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {filteredSummaries.map((summary, index) => {
            const previousSummary = index < filteredSummaries.length - 1
              ? filteredSummaries[index + 1]
              : null;
            
            const date = parseISO(summary.date);
            const bullets = extractBulletPoints(summary.summary);
            const focusScore = summary.focus_score || 0;

            return (
              <AccordionItem
                key={summary.id}
                value={summary.id}
                className="border border-border/40 rounded-lg px-4"
              >
                <div className="flex items-center gap-2 py-4">
                  <AccordionTrigger className="hover:no-underline flex-1">
                    <div className="flex items-start justify-between w-full pr-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Date */}
                        <div className="text-left min-w-[100px]">
                          <div className="text-sm font-medium">
                            {format(date, "MMM d, yyyy")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(date, "EEEE")}
                          </div>
                        </div>

                        {/* Focus Score */}
                        <div className="flex items-center gap-2">
                          <Badge
                            className={cn(
                              "text-xs font-medium",
                              getFocusScoreColor(focusScore)
                            )}
                          >
                            {focusScore > 0 ? `${Math.round(focusScore)}%` : "N/A"}
                          </Badge>
                          {getFocusScoreIcon(focusScore, previousSummary?.focus_score || null)}
                        </div>

                        {/* Bullet Points */}
                        <div className="flex-1 text-left">
                          {bullets.length > 0 ? (
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {bullets.map((bullet, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-muted-foreground/50 mt-1">•</span>
                                  <span className="line-clamp-1">{bullet}</span>
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

                  {/* View Details Button - Outside AccordionTrigger */}
                  {onDayClick && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDayClick(summary.date);
                      }}
                      className="shrink-0"
                      type="button"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <AccordionContent>
                  <div className="pt-4 pb-2 space-y-3">
                    {summary.summary && (
                      <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {summary.summary}
                      </div>
                    )}
                    {!summary.summary && (
                      <p className="text-sm text-muted-foreground italic">
                        No summary generated for this day.
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

