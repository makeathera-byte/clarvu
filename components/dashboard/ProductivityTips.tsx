"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductivityTip {
  text: string;
  id: string;
}

export function ProductivityTips() {
  const [tips, setTips] = useState<ProductivityTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTips = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
        console.log('[ProductivityTips] Refreshing tips...');
      } else {
        setLoading(true);
      }
      setError(null);

      // Add cache-busting query parameter to ensure fresh data
      const cacheBuster = `?t=${Date.now()}`;
      const response = await fetch(`/api/productivity-tips${cacheBuster}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        // If the API fails, use default tips
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API returned ${response.status}`);
      }
      
      const data = await response.json();

      if (!data.success || !data.tips || !Array.isArray(data.tips)) {
        throw new Error(data.error || "Invalid response from server");
      }

      // Transform tips array into objects with unique IDs based on content and timestamp
      const tipsWithIds: ProductivityTip[] = (data.tips || []).map(
        (tip: string, index: number) => ({
          id: `tip-${Date.now()}-${index}-${tip.substring(0, 20).replace(/\s/g, '-')}`,
          text: tip,
        })
      );

      // Always update tips to ensure fresh data
      setTips((prevTips) => {
        const prevTexts = prevTips.map(t => t.text).join('|');
        const newTexts = tipsWithIds.map(t => t.text).join('|');
        
        // Log if tips changed
        if (prevTexts !== newTexts && prevTips.length > 0) {
          console.log('[ProductivityTips] Tips updated:', { prevCount: prevTips.length, newCount: tipsWithIds.length });
        }
        
        // Always update with new tips (even if same content, IDs will be different)
        return tipsWithIds;
      });
      
      setCurrentTipIndex(0);

      // Auto-rotate tips every 8 seconds if multiple tips
      if (tipsWithIds.length > 1) {
        // Clear existing interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        intervalRef.current = setInterval(() => {
          setCurrentTipIndex((prev) => (prev + 1) % tipsWithIds.length);
        }, 8000);
      }
    } catch (err: any) {
      console.error("Error fetching productivity tips:", err);
      
      // Use fallback tips if API fails
      const fallbackTips: ProductivityTip[] = [
        {
          id: "fallback-1",
          text: "Business Owner Tip: Track your time consistently to unlock personalized productivity insights.",
        },
        {
          id: "fallback-2",
          text: "Productivity Principle: Focus on high-leverage activities that drive the most business value.",
        },
        {
          id: "fallback-3",
          text: "Time Management: Batch similar tasks to minimize context switching and maximize deep work.",
        },
      ];
      
      setTips(fallbackTips);
      setCurrentTipIndex(0);
      setError(null); // Don't show error, just use fallback tips
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchTips();

    // Set up auto-refresh every 5 minutes (300000ms)
    refreshIntervalRef.current = setInterval(() => {
      console.log('[ProductivityTips] Auto-refresh triggered');
      fetchTips(true);
    }, 5 * 60 * 1000); // 5 minutes
    
    console.log('[ProductivityTips] Auto-refresh interval set up (5 minutes)');

    // Cleanup intervals on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, []);

  const handleRefresh = () => {
    fetchTips(true);
  };

  if (loading) {
    return (
      <Card className="border-border/40 shadow-sm rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading productivity tips...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || tips.length === 0) {
    return (
      <Card className="border-border/40 shadow-sm rounded-2xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {error || "No tips available right now"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-7 w-7 p-0"
            >
              <RefreshCw
                className={cn(
                  "h-3 w-3",
                  isRefreshing && "animate-spin"
                )}
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTip = tips[currentTipIndex];

  return (
    <Card className="border-border/40 shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500 dark:text-amber-400" />
            <CardTitle className="text-sm font-semibold">Productivity Tip</CardTitle>
          </div>
          {tips.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {currentTipIndex + 1} / {tips.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-6 w-6 p-0"
                title="Refresh tips"
              >
                <RefreshCw
                  className={cn(
                    "h-3 w-3",
                    isRefreshing && "animate-spin"
                  )}
                />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="relative">
          {/* Tip Content */}
          <div
            key={currentTip.id}
            className="animate-fade-in"
            style={{
              animationDuration: "0.3s",
            }}
          >
            <p className="text-sm text-foreground leading-relaxed">
              {currentTip.text}
            </p>
          </div>

          {/* Navigation dots for multiple tips */}
          {tips.length > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-4 pt-4 border-t border-border/40">
              {tips.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentTipIndex(index);
                    // Reset interval when manually navigating
                    if (intervalRef.current) {
                      clearInterval(intervalRef.current);
                    }
                    intervalRef.current = setInterval(() => {
                      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
                    }, 8000);
                  }}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === currentTipIndex
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  aria-label={`Go to tip ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


