"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActivityLog } from "@/lib/types";
import { SearchResultModal } from "./SearchResultModal";
import { format } from "date-fns";
import { calculateDurationMinutes } from "@/lib/utils/time";
import { formatDurationMinutes } from "@/lib/utils/time";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HistorySearchProps {
  logs: ActivityLog[];
  onFilteredLogsChange?: (filteredLogs: ActivityLog[]) => void;
  resetKey?: string | number; // Key to reset search when filters change
}

function formatTime(timeString: string) {
  const date = new Date(timeString);
  return format(date, "h:mm a");
}

function formatDate(timeString: string) {
  const date = new Date(timeString);
  return format(date, "MMM d, yyyy");
}

export function HistorySearch({ logs, onFilteredLogsChange, resetKey }: HistorySearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Reset search when resetKey changes (filters changed)
  useEffect(() => {
    setSearchQuery("");
  }, [resetKey]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    const filtered = logs.filter((log) => {
      const activityMatch = log.activity?.toLowerCase().includes(query);
      const categoryMatch = log.categories?.name?.toLowerCase().includes(query);
      return activityMatch || categoryMatch;
    });

    // Limit to top 10 results for performance
    return filtered.slice(0, 10);
  }, [logs, searchQuery]);

  // Update parent component via useEffect, not during render
  useEffect(() => {
    if (!searchQuery.trim()) {
      onFilteredLogsChange?.(logs);
    } else {
      onFilteredLogsChange?.(filteredLogs);
    }
  }, [filteredLogs, logs, searchQuery, onFilteredLogsChange]);

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedLog(null);
    setIsModalOpen(false);
  };

  const handleResultClick = (log: ActivityLog) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        // Keep search query but close dropdown is handled by the component itself
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showResults = searchQuery.trim().length > 0 && filteredLogs.length > 0;

  return (
    <>
      <div ref={searchContainerRef} className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
        <Input
          type="text"
          placeholder="Search activities or categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 z-10"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute z-50 w-full mt-2 rounded-lg border border-border/40 bg-popover shadow-lg max-h-96 overflow-y-auto">
            <div className="p-2">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-border/40 mb-1">
                {filteredLogs.length} {filteredLogs.length === 1 ? "result" : "results"} found
              </div>
              <div className="space-y-1">
                {filteredLogs.map((log) => {
                  const category = log.categories;
                  const categoryColor = category?.color || "#6b7280";
                  const duration = log.end_time
                    ? calculateDurationMinutes(log.start_time, log.end_time)
                    : calculateDurationMinutes(log.start_time, new Date().toISOString());

                  return (
                    <button
                      key={log.id}
                      onClick={() => handleResultClick(log)}
                      className="w-full text-left p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors border border-transparent hover:border-border/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate mb-1">
                            {log.activity}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(log.start_time)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {formatTime(log.start_time)}
                                {log.end_time ? ` - ${formatTime(log.end_time)}` : " - Ongoing"}
                              </span>
                            </div>
                            <span>•</span>
                            <span>{formatDurationMinutes(duration)}</span>
                          </div>
                        </div>
                        {category && (
                          <Badge
                            variant="secondary"
                            className="text-xs flex-shrink-0"
                            style={{
                              backgroundColor: `${categoryColor}15`,
                              color: categoryColor,
                              borderColor: `${categoryColor}40`,
                            }}
                          >
                            {category.icon && <span className="mr-1">{category.icon}</span>}
                            {category.name}
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* No Results Message */}
        {searchQuery.trim().length > 0 && filteredLogs.length === 0 && (
          <div className="absolute z-50 w-full mt-2 rounded-lg border border-border/40 bg-popover shadow-lg p-4">
            <div className="text-sm text-muted-foreground text-center">
              No results found for "{searchQuery}"
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <SearchResultModal
        log={selectedLog}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}

