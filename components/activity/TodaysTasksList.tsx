"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, CheckCircle2, Calendar, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { calculateDurationMinutes } from "@/lib/utils/time";
import type { ActivityLog } from "@/lib/types";

interface TodaysTasksListProps {
  tasks: ActivityLog[];
  onStartTask: (taskId: string) => void;
  onViewTimer?: (taskId: string) => void;
}

/**
 * List of today's tasks with status badges and hover actions
 */
export function TodaysTasksList({
  tasks,
  onStartTask,
  onViewTimer,
}: TodaysTasksListProps) {
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  const getStatusBadge = (task: ActivityLog) => {
    const status = task.status || (task.end_time ? "completed" : "in_progress");
    
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-xs">
            Pending
          </Badge>
        );
      case "scheduled":
        return (
          <Badge variant="secondary" className="text-xs">
            <Calendar className="mr-1 h-3 w-3" />
            Scheduled
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs">
            In Progress
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="text-xs border-green-500 text-green-700 dark:text-green-400">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatTime = (timeString: string) => {
    return format(new Date(timeString), "h:mm a");
  };

  const getTimeRange = (task: ActivityLog) => {
    if (task.end_time) {
      return `${formatTime(task.start_time)} - ${formatTime(task.end_time)}`;
    }
    return `Started at ${formatTime(task.start_time)}`;
  };

  if (tasks.length === 0) {
    return (
      <Card className="border-border/40 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle>Today&apos;s Tasks</CardTitle>
          <CardDescription>Your tasks will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No tasks created yet. Create your first task to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/40 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle>Today&apos;s Tasks</CardTitle>
        <CardDescription>
          {tasks.length} task{tasks.length !== 1 ? "s" : ""} today
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map((task) => {
          const status = task.status || (task.end_time ? "completed" : "in_progress");
          const category = task.categories;
          const categoryColor = category?.color || "#6b7280";
          const canStart = status === "pending" || status === "scheduled";
          const isInProgress = status === "in_progress";
          const isHovered = hoveredTaskId === task.id;

          return (
            <div
              key={task.id}
              className={cn(
                "group rounded-xl border border-border/40 bg-card transition-all duration-200 overflow-hidden",
                "hover:shadow-md hover:border-border/60"
              )}
              onMouseEnter={() => setHoveredTaskId(task.id)}
              onMouseLeave={() => setHoveredTaskId(null)}
            >
              <div className="flex">
                {/* Color bar */}
                <div
                  className="w-1.5 flex-shrink-0 rounded-l-xl"
                  style={{ backgroundColor: categoryColor }}
                />
                
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Task Name and Category */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={cn(
                          "font-semibold text-foreground",
                          status === "completed" && "line-through text-muted-foreground"
                        )}>
                          {task.activity}
                        </h4>
                        {category && (
                          <Badge
                            variant="secondary"
                            className="text-xs font-medium"
                            style={{
                              backgroundColor: `${categoryColor}15`,
                              color: categoryColor,
                              borderColor: `${categoryColor}40`,
                            }}
                          >
                            {category.icon && (
                              <span className="mr-1.5 text-xs">{category.icon}</span>
                            )}
                            {category.name}
                          </Badge>
                        )}
                        {getStatusBadge(task)}
                      </div>

                      {/* Time Range */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="font-mono text-xs">
                            {getTimeRange(task)}
                          </span>
                        </div>
                        {task.end_time && (
                          <div className="flex items-center gap-1.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                            <span className="font-mono text-xs font-medium">
                              {Math.round(calculateDurationMinutes(task.start_time, task.end_time))}m
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hover Actions */}
                    <div
                      className={cn(
                        "flex items-center gap-1 transition-opacity",
                        (isHovered || isInProgress) ? "opacity-100" : "opacity-0"
                      )}
                    >
                      {canStart && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onStartTask(task.id)}
                          className="h-8 rounded-lg"
                        >
                          <Play className="mr-1.5 h-3.5 w-3.5" />
                          Start Task
                        </Button>
                      )}
                      {isInProgress && onViewTimer && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewTimer(task.id)}
                          className="h-8 rounded-lg"
                        >
                          <Clock className="mr-1.5 h-3.5 w-3.5" />
                          View Timer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

