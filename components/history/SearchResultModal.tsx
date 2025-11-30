"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ActivityLog } from "@/lib/types";
import { Clock, Calendar, Tag } from "lucide-react";
import { format } from "date-fns";
import { calculateDurationMinutes } from "@/lib/utils/time";
import { formatDurationMinutes } from "@/lib/utils/time";

interface SearchResultModalProps {
  log: ActivityLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatTime(timeString: string) {
  const date = new Date(timeString);
  return format(date, "h:mm a");
}

function formatDate(timeString: string) {
  const date = new Date(timeString);
  return format(date, "MMMM d, yyyy");
}

export function SearchResultModal({ log, open, onOpenChange }: SearchResultModalProps) {
  if (!log) return null;

  const category = log.categories;
  const categoryName = category?.name || "Uncategorized";
  const categoryColor = category?.color || "#6b7280";
  const duration = log.end_time
    ? calculateDurationMinutes(log.start_time, log.end_time)
    : calculateDurationMinutes(log.start_time, new Date().toISOString());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{log.activity}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Category */}
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Category:</span>
            <Badge
              variant="secondary"
              className="text-xs font-medium"
              style={{
                backgroundColor: `${categoryColor}15`,
                color: categoryColor,
                borderColor: `${categoryColor}40`,
              }}
            >
              {category?.icon && <span className="mr-1.5 text-xs">{category.icon}</span>}
              {categoryName}
            </Badge>
          </div>

          {/* Date */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Date:</span>
            <span className="text-sm font-medium">{formatDate(log.start_time)}</span>
          </div>

          {/* Time Range */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Time:</span>
            <span className="text-sm font-medium">
              {formatTime(log.start_time)}
              {log.end_time ? ` - ${formatTime(log.end_time)}` : " - Ongoing"}
            </span>
          </div>

          {/* Duration */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Duration:</span>
            <span className="text-sm font-medium">{formatDurationMinutes(duration)}</span>
          </div>

          {/* Business Type */}
          {category?.business_type && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Type:</span>
              <Badge variant="outline" className="text-xs capitalize">
                {category.business_type}
              </Badge>
            </div>
          )}

          {/* Created At */}
          {log.created_at && (
            <div className="pt-4 border-t border-border/40">
              <p className="text-xs text-muted-foreground">
                Logged on {format(new Date(log.created_at), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

