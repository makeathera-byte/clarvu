"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogTimeEditor } from "./LogTimeEditor";
import { ActivityEditor } from "./ActivityEditor";
import {
  Clock,
  Trash2,
  Edit2,
  Search,
  Filter,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { calculateDurationMinutes } from "@/lib/utils/time";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
}

interface ActivityLog {
  id: string;
  activity: string;
  category?: string | null;
  category_id?: string | null;
  categories?: Category | null;
  start_time: string;
  end_time: string | null;
  created_at: string;
}

interface TimelineProps {
  logs: ActivityLog[];
}

type SortOption = "time-asc" | "time-desc" | "duration-asc" | "duration-desc";

function formatTime(timeString: string) {
  const date = new Date(timeString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatTimeFull(timeString: string) {
  const date = new Date(timeString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function calculateDuration(startTime: string, endTime: string | null) {
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : Date.now();
  const diff = Math.floor((end - start) / 1000);

  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatDurationMinutes(minutes: number) {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function getRelativeTime(timeString: string) {
  const date = new Date(timeString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function Timeline({ logs }: TimelineProps) {
  const router = useRouter();
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("time-desc");
  const [isDeleting, setIsDeleting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Load activity suggestions
  useEffect(() => {
    async function loadSuggestions() {
      try {
        const response = await fetch("/api/logs/suggestions");
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.data?.suggestions || []);
        }
      } catch (error) {
        console.error("Error loading suggestions:", error);
      }
    }
    loadSuggestions();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const catMap = new Map<string, Category>();
    logs.forEach((log) => {
      if (log.categories) {
        catMap.set(log.categories.id, log.categories);
      }
    });
    return Array.from(catMap.values());
  }, [logs]);

  // Filter and sort logs
  const filteredAndSortedLogs = useMemo(() => {
    let filtered = [...logs];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((log) =>
        log.activity.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (log) => log.categories?.id === selectedCategory || log.category_id === selectedCategory
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "time-asc":
          return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
        case "time-desc":
          return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
        case "duration-asc": {
          const aDur = calculateDurationMinutes(a.start_time, a.end_time);
          const bDur = calculateDurationMinutes(b.start_time, b.end_time);
          return aDur - bDur;
        }
        case "duration-desc": {
          const aDur = calculateDurationMinutes(a.start_time, a.end_time);
          const bDur = calculateDurationMinutes(b.start_time, b.end_time);
          return bDur - aDur;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [logs, searchQuery, selectedCategory, sortBy]);

  const handleUpdate = () => {
    router.refresh();
    setEditingLogId(null);
  };

  const handleDelete = async () => {
    if (!deletingLogId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/logs/${deletingLogId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete log");
      }

      router.refresh();
      setDeletingLogId(null);
    } catch (error: any) {
      console.error("Error deleting log:", error);
      alert(error.message || "Failed to delete activity log");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveActivity = async (logId: string, activity: string, categoryId: string | null) => {
    try {
      const response = await fetch(`/api/logs/${logId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          activity: activity.trim(),
          category_id: categoryId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update activity");
      }

      router.refresh();
      setEditingActivityId(null);
    } catch (error: any) {
      console.error("Error updating activity:", error);
      throw error; // Re-throw so ActivityEditor can handle it
    }
  };

  const totalDuration = useMemo(() => {
    return filteredAndSortedLogs.reduce((total, log) => {
      return total + calculateDurationMinutes(log.start_time, log.end_time);
    }, 0);
  }, [filteredAndSortedLogs]);

  if (logs.length === 0) {
    return (
      <Card className="border-border/40 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle>Today&apos;s Timeline</CardTitle>
          <CardDescription>Your activity logs will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No activities logged yet. Start tracking your day!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/40 shadow-sm rounded-2xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Today&apos;s Timeline</CardTitle>
              <CardDescription>
                {filteredAndSortedLogs.length} of {logs.length} activit
                {logs.length !== 1 ? "ies" : "y"}
                {totalDuration > 0 && ` • ${formatDurationMinutes(totalDuration)} total`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    {selectedCategory
                      ? categories.find((c) => c.id === selectedCategory)?.name || "Category"
                      : "All Categories"}
                    {selectedCategory && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategory(null);
                        }}
                        className="h-5 w-5 p-0 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                    <div className="flex items-center gap-2 w-full">
                      {!selectedCategory && <Check className="h-4 w-4" />}
                      <span className={!selectedCategory ? "font-medium" : ""}>All Categories</span>
                    </div>
                  </DropdownMenuItem>
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        {selectedCategory === category.id && <Check className="h-4 w-4" />}
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className={selectedCategory === category.id ? "font-medium" : ""}>
                          {category.name}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortBy("time-desc")}>
                  <div className="flex items-center gap-2 w-full">
                    {sortBy === "time-desc" && <Check className="h-4 w-4" />}
                    <ArrowDown className="h-4 w-4" />
                    <span>Newest First</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("time-asc")}>
                  <div className="flex items-center gap-2 w-full">
                    {sortBy === "time-asc" && <Check className="h-4 w-4" />}
                    <ArrowUp className="h-4 w-4" />
                    <span>Oldest First</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("duration-desc")}>
                  <div className="flex items-center gap-2 w-full">
                    {sortBy === "duration-desc" && <Check className="h-4 w-4" />}
                    <span>Longest Duration</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy("duration-asc")}>
                  <div className="flex items-center gap-2 w-full">
                    {sortBy === "duration-asc" && <Check className="h-4 w-4" />}
                    <span>Shortest Duration</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Timeline Items */}
          {filteredAndSortedLogs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {searchQuery || selectedCategory
                  ? "No activities match your filters"
                  : "No activities logged yet"}
              </p>
              {(searchQuery || selectedCategory) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="mt-3"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAndSortedLogs.map((log: ActivityLog) => {
                const isActive = !log.end_time;
                const category = log.categories;
                const categoryName = category?.name || log.category || "Uncategorized";
                const categoryColor = category?.color || "#6b7280";
                const isEditing = editingLogId === log.id;
                const isEditingActivity = editingActivityId === log.id;
                const duration = calculateDurationMinutes(log.start_time, log.end_time);

                return (
                  <div
                    key={log.id}
                    className="group rounded-xl border border-border/40 bg-card transition-all duration-300 hover:shadow-md hover:border-border/60 overflow-hidden"
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
                            {/* Activity Name */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4
                                className="font-semibold text-foreground cursor-pointer hover:text-primary transition-colors"
                                onClick={() => setEditingActivityId(log.id)}
                              >
                                {log.activity}
                              </h4>
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-medium"
                                  style={{
                                    backgroundColor: `${categoryColor}15`,
                                    color: categoryColor,
                                    borderColor: `${categoryColor}40`,
                                  }}
                                >
                                  {category?.icon && (
                                    <span className="mr-1.5 text-xs">{category.icon}</span>
                                  )}
                                  {categoryName}
                                </Badge>
                                {isActive && (
                                  <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-xs">
                                    Active
                                  </Badge>
                                )}
                              </div>

                            {/* Time and Duration */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="font-mono text-xs">
                                  {formatTime(log.start_time)}
                                  {log.end_time && ` - ${formatTime(log.end_time)}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                                <span className="font-mono text-xs font-medium">
                                  {calculateDuration(log.start_time, log.end_time)}
                                </span>
                              </div>
                              {log.end_time && (
                                <span className="text-xs text-muted-foreground/70">
                                  {getRelativeTime(log.end_time)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingLogId(log.id)}
                              className="h-8 w-8 p-0"
                              title="Edit time"
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => setEditingActivityId(log.id)}
                                >
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit Activity
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setEditingLogId(log.id)}
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Edit Time
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeletingLogId(log.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Editor Dialog */}
      {editingActivityId && (
        <ActivityEditor
          logId={editingActivityId}
          currentActivity={
            filteredAndSortedLogs.find((l) => l.id === editingActivityId)?.activity || ""
          }
          currentCategoryId={
            filteredAndSortedLogs.find((l) => l.id === editingActivityId)?.category_id || null
          }
          suggestions={suggestions}
          onSave={(activity, categoryId) =>
            handleSaveActivity(editingActivityId, activity, categoryId)
          }
          onClose={() => setEditingActivityId(null)}
        />
      )}

      {/* Time Editor Dialog */}
      {editingLogId && (
        <LogTimeEditor
          logId={editingLogId}
          startTime={
            filteredAndSortedLogs.find((l) => l.id === editingLogId)?.start_time || ""
          }
          endTime={
            filteredAndSortedLogs.find((l) => l.id === editingLogId)?.end_time || null
          }
          onUpdate={handleUpdate}
          onClose={() => setEditingLogId(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingLogId} onOpenChange={() => setDeletingLogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this activity log? This action cannot be undone.
            </AlertDialogDescription>
            {deletingLogId && (
              <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                <strong>
                  {
                    filteredAndSortedLogs.find((l) => l.id === deletingLogId)?.activity
                  }
                </strong>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
