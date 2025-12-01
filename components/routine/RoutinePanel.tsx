"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// LocalStorage key for routine backup
const ROUTINE_STORAGE_KEY = "dayflow_routine_backup";

interface RoutineBlock {
  type: string;
  start: string;
  end: string;
  duration: number;
}

interface Routine {
  morning: RoutineBlock[];
  afternoon: RoutineBlock[];
  evening: RoutineBlock[];
  suggested_breaks?: Array<{ time: string; duration: number }>;
}

interface RoutineResponse {
  routine: Routine;
  explanation: string;
  hasEnoughData?: boolean;
  patterns?: any;
  cached?: boolean;
  message?: string;
}

interface RoutinePanelProps {
  routineData: RoutineResponse | null;
}

export function RoutinePanel({ routineData: initialRoutineData }: RoutinePanelProps) {
  // Try to load from localStorage first as backup
  const getStoredRoutine = (): RoutineResponse | null => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(ROUTINE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check if it's from today
        const today = new Date().toISOString().split("T")[0];
        if (parsed.date === today && parsed.routine) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error reading from localStorage:", e);
    }
    return null;
  };

  const storeRoutine = (routine: RoutineResponse) => {
    if (typeof window === "undefined") return;
    try {
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify({
        ...routine,
        date: today,
        storedAt: new Date().toISOString(),
      }));
    } catch (e) {
      console.warn("Error saving to localStorage:", e);
    }
  };

  // Initialize with stored routine if no initial data
  const storedRoutine = getStoredRoutine();
  const [routineData, setRoutineData] = useState<RoutineResponse | null>(
    initialRoutineData || storedRoutine
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch routine on mount if not provided or if it doesn't have enough data
  useEffect(() => {
    // Check if we have valid routine data
    const hasValidRoutine = routineData && 
                           routineData.hasEnoughData && 
                           routineData.routine &&
                           (routineData.routine.morning?.length > 0 || 
                            routineData.routine.afternoon?.length > 0 || 
                            routineData.routine.evening?.length > 0);
    
    // Always fetch if we don't have valid routine data
    // This handles cases where:
    // 1. initialRoutineData is null
    // 2. initialRoutineData doesn't have enough data
    // 3. Server-side fetch failed due to schema cache issues
    if (!hasValidRoutine) {
      // Small delay to ensure component is mounted
      const timer = setTimeout(() => {
        fetchRoutine(false); // Fetch silently on mount
      }, 100);
      return () => clearTimeout(timer);
    } else if (routineData) {
      // If we have valid routine data, also store it as backup
      storeRoutine(routineData);
    }
  }, []); // Only run on mount

  const fetchRoutine = async (showLoading = true, isGenerate = false) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      // Use GET to fetch existing routine, POST to generate new one
      const method = isGenerate ? "POST" : "GET";
      const response = await fetch("/api/routine", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError(data.error || "You're generating routines too frequently. Try again later.");
        } else {
          setError(data.error || "Failed to generate routine. Please try again.");
        }
        return;
      }

      if (data.success && data.data) {
        // If we have routine data with enough data, set it
        if (data.data.hasEnoughData && data.data.routine) {
          setRoutineData(data.data);
          // Store in localStorage as backup
          storeRoutine(data.data);
          // Clear any previous errors
          setError(null);
          
          // If this was a generation, log that it was saved
          if (isGenerate) {
            if (data.data.saved) {
              console.log("✅ Routine generated and saved successfully");
              // Force a refresh after a short delay to ensure it's loaded from database
              setTimeout(() => {
                fetchRoutine(false, false); // Fetch (not generate) to get from database
              }, 1000);
            } else {
              console.warn("⚠️ Routine generated but may not have been saved to database - using localStorage backup");
              // Store in localStorage as backup since database save may have failed
              storeRoutine(data.data);
            }
          }
        } else if (isGenerate) {
          // If generating and got no data, show error
          setError(data.data?.message || "Failed to generate routine. Please try again.");
        } else {
          // If fetching (not generating) and no data, only set to null if we don't have existing data
          // This prevents clearing a routine that was loaded from server but client fetch failed
          if (!routineData || !routineData.hasEnoughData) {
            setRoutineData(null);
          }
        }
      } else {
        if (isGenerate) {
          setError("Failed to generate routine. Please try again.");
        } else {
          // If fetching and no success, only clear if we don't have existing data
          if (!routineData || !routineData.hasEnoughData) {
            setRoutineData(null);
          }
        }
      }
    } catch (err: any) {
      console.error("Error generating routine:", err);
      setError("Failed to generate routine. Please try again.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleGenerate = () => {
    fetchRoutine(true, true); // true = isGenerate
  };

  const handleRegenerate = () => {
    fetchRoutine(true, true); // true = isGenerate
  };

  if (!routineData || !routineData.hasEnoughData) {
    return (
      <Card className="border-border/40 bg-[#f7f7f8] dark:bg-stone-900/50 rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Your Ideal Day</CardTitle>
            <Button
              variant="default"
              size="sm"
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-xl"
            >
              <Sparkles
                className={cn("h-4 w-4 mr-2", loading && "animate-pulse")}
              />
              {loading ? "Generating..." : "Generate Routine"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            {error ? (
              <div className="space-y-4">
                <p className="text-sm text-destructive">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  Track at least 7 days of activities for personalized routine suggestions.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Click "Generate Routine" to create your personalized daily routine based on your activity patterns.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getBlockColor = (type: string) => {
    switch (type) {
      case "deep_work":
        return "bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300";
      case "admin":
        return "bg-gray-500/20 border-gray-500/30 text-gray-700 dark:text-gray-300";
      case "shallow_work":
        return "bg-purple-500/20 border-purple-500/30 text-purple-700 dark:text-purple-300";
      case "learning":
        return "bg-green-500/20 border-green-500/30 text-green-700 dark:text-green-300";
      case "break":
        return "bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300";
      case "personal":
        return "bg-teal-500/20 border-teal-500/30 text-teal-700 dark:text-teal-300";
      default:
        return "bg-stone-500/20 border-stone-500/30 text-stone-700 dark:text-stone-300";
    }
  };

  const getBlockLabel = (type: string) => {
    switch (type) {
      case "deep_work":
        return "Deep Work";
      case "admin":
        return "Admin";
      case "shallow_work":
        return "Shallow Work";
      case "learning":
        return "Learning";
      case "break":
        return "Break";
      case "personal":
        return "Personal";
      default:
        return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
  };

  const renderTimeBlocks = (blocks: RoutineBlock[], period: string) => {
    if (blocks.length === 0) {
      return (
        <p className="text-sm text-muted-foreground/70 py-4">
          No specific recommendations for this period.
        </p>
      );
    }

    return (
      <div className="space-y-2">
        {blocks.map((block, index) => (
          <div
            key={index}
            className={`rounded-xl border p-4 ${getBlockColor(block.type)}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">{getBlockLabel(block.type)}</span>
              <span className="text-xs opacity-70">
                {block.start} - {block.end}
              </span>
            </div>
            <div className="text-xs opacity-70">{block.duration} minutes</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="border-border/40 bg-[#f7f7f8] dark:bg-stone-900/50 rounded-xl shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Your Ideal Day</CardTitle>
            {routineData.cached && (
              <span className="text-xs text-muted-foreground/70">(Cached)</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRegenerate}
            disabled={loading}
            className="rounded-xl text-xs"
          >
            <RefreshCw
              className={cn("h-3 w-3 mr-1", loading && "animate-spin")}
            />
            {loading ? "Generating..." : "Regenerate"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Info Message */}
        {routineData.message && (
          <div className="rounded-xl border border-border/40 bg-background/50 p-3">
            <p className="text-xs text-muted-foreground">{routineData.message}</p>
          </div>
        )}

        {/* Explanation */}
        {routineData.explanation && (
          <div className="rounded-xl border border-border/40 bg-background/50 p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {routineData.explanation}
            </p>
          </div>
        )}

        {/* Morning Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Morning</h3>
          {renderTimeBlocks(routineData.routine.morning, "morning")}
        </div>

        {/* Afternoon Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Afternoon</h3>
          {renderTimeBlocks(routineData.routine.afternoon, "afternoon")}
        </div>

        {/* Evening Section */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-foreground">Evening</h3>
          {renderTimeBlocks(routineData.routine.evening, "evening")}
        </div>

        {/* Suggested Breaks */}
        {routineData.routine.suggested_breaks &&
          routineData.routine.suggested_breaks.length > 0 && (
            <div className="pt-4 border-t border-border/40">
              <h3 className="text-sm font-semibold mb-3 text-foreground">
                Suggested Breaks
              </h3>
              <div className="space-y-2">
                {routineData.routine.suggested_breaks.map((breakItem, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-border/40 bg-background/50 p-3 flex items-center justify-between"
                  >
                    <span className="text-sm text-muted-foreground">
                      {breakItem.time}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {breakItem.duration} minutes
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="pt-4 border-t border-border/40">
          <p className="text-xs text-muted-foreground/70 text-center">
            This routine is based on your activity patterns from the past 7 days. Click "Regenerate" to update it with your latest data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
