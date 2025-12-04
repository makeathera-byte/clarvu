"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { calculateDurationMinutes } from "@/lib/utils/time";
import type { ActivityLog } from "@/lib/types";

interface TodaysTasksBannerProps {
  tasks: ActivityLog[];
  onTaskClick?: (taskId: string) => void;
}

/**
 * Compact banner showing all today's tasks
 * Completed tasks are shown with strikethrough
 */
export function TodaysTasksBanner({ tasks, onTaskClick }: TodaysTasksBannerProps) {
  const [expanded, setExpanded] = useState(false);

  if (tasks.length === 0) {
    return null;
  }

  const completedTasks = tasks.filter(t => t.status === "completed" || t.end_time);
  const pendingTasks = tasks.filter(t => !t.status || (t.status !== "completed" && !t.end_time));
  const inProgressTasks = tasks.filter(t => t.status === "in_progress");

  const getStatusIcon = (task: ActivityLog) => {
    const status = task.status || (task.end_time ? "completed" : "in_progress");
    
    if (status === "completed") {
      return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
    }
    if (status === "in_progress") {
      return <Clock className="h-3.5 w-3.5 text-blue-500 animate-pulse" />;
    }
    if (status === "scheduled") {
      return <Calendar className="h-3.5 w-3.5 text-amber-500" />;
    }
    return null;
  };

  const displayTasks = expanded ? tasks : tasks.slice(0, 5);

  return (
    <Card className="mb-4 border-border/40 shadow-sm rounded-2xl">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Today&apos;s Tasks
              </h3>
              <Badge variant="secondary" className="text-xs">
                {tasks.length} total
              </Badge>
              {inProgressTasks.length > 0 && (
                <Badge variant="default" className="text-xs bg-blue-500">
                  {inProgressTasks.length} active
                </Badge>
              )}
              {completedTasks.length > 0 && (
                <Badge variant="outline" className="text-xs border-green-500 text-green-700 dark:text-green-400">
                  {completedTasks.length} done
                </Badge>
              )}
            </div>
            {tasks.length > 5 && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {expanded ? "Show Less" : `Show All (${tasks.length})`}
              </button>
            )}
          </div>

          {/* Tasks List */}
          <div className="space-y-2">
            {displayTasks.map((task) => {
              const status = task.status || (task.end_time ? "completed" : "in_progress");
              const category = task.categories;
              const categoryColor = category?.color || "#6b7280";
              const isCompleted = status === "completed";
              
              return (
                <div
                  key={task.id}
                  onClick={() => onTaskClick?.(task.id)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-lg border border-border/40 transition-all cursor-pointer",
                    "hover:bg-accent hover:border-border/60",
                    isCompleted && "opacity-60"
                  )}
                >
                  {getStatusIcon(task)}
                  <span
                    className={cn(
                      "flex-1 text-sm font-medium",
                      isCompleted && "line-through text-muted-foreground"
                    )}
                  >
                    {task.activity}
                  </span>
                  {category && (
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: `${categoryColor}15`,
                        color: categoryColor,
                        borderColor: `${categoryColor}40`,
                      }}
                    >
                      {category.icon && (
                        <span className="mr-1 text-xs">{category.icon}</span>
                      )}
                      {category.name}
                    </Badge>
                  )}
                  {task.end_time && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {Math.round(calculateDurationMinutes(task.start_time, task.end_time))}m
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {!expanded && tasks.length > 5 && (
            <div className="text-center">
              <button
                onClick={() => setExpanded(true)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                + {tasks.length - 5} more tasks
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

