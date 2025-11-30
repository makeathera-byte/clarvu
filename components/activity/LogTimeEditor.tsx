"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LogTimeEditorProps {
  logId: string;
  startTime: string;
  endTime: string | null;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onUpdate?: () => void;
  onClose?: () => void; // For backward compatibility
}

const TIME_ADJUSTMENTS = [5, 10, 15, 20];

export function LogTimeEditor({ 
  logId, 
  startTime, 
  endTime, 
  isOpen = true,
  onOpenChange,
  onUpdate,
  onClose 
}: LogTimeEditorProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startAdjustment, setStartAdjustment] = useState(0);
  const [endAdjustment, setEndAdjustment] = useState(0);

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatTimeFull = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  // Calculate preview times
  const getPreviewStartTime = () => {
    const newTime = new Date(startTime);
    newTime.setMinutes(newTime.getMinutes() + startAdjustment);
    return newTime;
  };

  const getPreviewEndTime = () => {
    if (!endTime) return null;
    const newTime = new Date(endTime);
    newTime.setMinutes(newTime.getMinutes() + endAdjustment);
    return newTime;
  };

  const adjustStartTime = (minutes: number) => {
    setStartAdjustment((prev) => prev + minutes);
    setError(null);
  };

  const adjustEndTime = (minutes: number) => {
    if (endTime) {
      setEndAdjustment((prev) => prev + minutes);
      setError(null);
    }
  };

  const resetAdjustments = () => {
    setStartAdjustment(0);
    setEndAdjustment(0);
    setError(null);
  };

  const applyChanges = async () => {
    if (startAdjustment === 0 && endAdjustment === 0) {
      if (onClose) onClose();
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/logs/${logId}/update-time`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adjust_start_minutes: startAdjustment,
          adjust_end_minutes: endAdjustment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update time");
      }

      if (onUpdate) {
        onUpdate();
      }
      if (onOpenChange) {
        onOpenChange(false);
      }
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || "Failed to update time. Please try again.");
      console.error("Error updating log time:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open && !isUpdating) {
      resetAdjustments();
      if (onOpenChange) {
        onOpenChange(false);
      }
      if (onClose) {
        onClose();
      }
    }
  };

  const handleCancelClick = () => {
    resetAdjustments();
    if (onClose) onClose();
    if (onOpenChange) onOpenChange(false);
  };

  const previewStart = getPreviewStartTime();
  const previewEnd = getPreviewEndTime();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Edit Activity Time
          </DialogTitle>
          <DialogDescription>
            Adjust the start or end time using the buttons below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Start Time Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Start Time</label>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Current</div>
                <div className="font-mono text-sm">{formatTime(startTime)}</div>
              </div>
            </div>
            
            {startAdjustment !== 0 && (
              <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-3 border border-blue-200 dark:border-blue-900">
                <div className="text-xs text-muted-foreground mb-1">New Start Time</div>
                <div className="font-mono text-lg font-semibold text-blue-700 dark:text-blue-300">
                  {formatTimeFull(previewStart.toISOString())}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  {startAdjustment > 0 ? "+" : ""}{startAdjustment} minutes
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Decrease buttons */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Earlier</div>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_ADJUSTMENTS.map((minutes) => (
                    <Button
                      key={`start-${minutes}`}
                      variant="outline"
                      size="sm"
                      onClick={() => adjustStartTime(-minutes)}
                      disabled={isUpdating}
                      className="gap-1"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      {minutes}m
                    </Button>
                  ))}
                </div>
              </div>

              {/* Increase buttons */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground">Later</div>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_ADJUSTMENTS.map((minutes) => (
                    <Button
                      key={`start+${minutes}`}
                      variant="outline"
                      size="sm"
                      onClick={() => adjustStartTime(minutes)}
                      disabled={isUpdating}
                      className="gap-1"
                    >
                      {minutes}m
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* End Time Section */}
          {endTime && (
            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">End Time</label>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Current</div>
                  <div className="font-mono text-sm">{formatTime(endTime)}</div>
                </div>
              </div>

              {endAdjustment !== 0 && (
                <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-3 border border-green-200 dark:border-green-900">
                  <div className="text-xs text-muted-foreground mb-1">New End Time</div>
                  <div className="font-mono text-lg font-semibold text-green-700 dark:text-green-300">
                    {formatTimeFull(previewEnd!.toISOString())}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {endAdjustment > 0 ? "+" : ""}{endAdjustment} minutes
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Decrease buttons */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Earlier</div>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_ADJUSTMENTS.map((minutes) => (
                      <Button
                        key={`end-${minutes}`}
                        variant="outline"
                        size="sm"
                        onClick={() => adjustEndTime(-minutes)}
                        disabled={isUpdating}
                        className="gap-1"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        {minutes}m
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Increase buttons */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Later</div>
                  <div className="grid grid-cols-2 gap-2">
                    {TIME_ADJUSTMENTS.map((minutes) => (
                      <Button
                        key={`end+${minutes}`}
                        variant="outline"
                        size="sm"
                        onClick={() => adjustEndTime(minutes)}
                        disabled={isUpdating}
                        className="gap-1"
                      >
                        {minutes}m
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <div className="text-sm text-destructive font-medium">{error}</div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={resetAdjustments}
              disabled={isUpdating || (startAdjustment === 0 && endAdjustment === 0)}
              className="gap-2"
            >
              Reset
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancelClick}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button
                onClick={applyChanges}
                disabled={isUpdating || (startAdjustment === 0 && endAdjustment === 0)}
                className="gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
