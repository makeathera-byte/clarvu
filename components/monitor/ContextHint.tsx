"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContextHintProps {
  message: string;
  suggestion?: string;
  onAccept?: () => void;
  onDismiss?: () => void;
  visible: boolean;
  type?: "info" | "suggestion" | "switch" | "idle";
}

/**
 * Context Hint Component
 * Small floating component that shows context-aware hints
 * Appears in bottom-left corner with fade animations
 */
export function ContextHint({
  message,
  suggestion,
  onAccept,
  onDismiss,
  visible,
  type = "info",
}: ContextHintProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsAnimating(true);
      // Small delay for smooth fade-in
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      // Wait for fade-out animation
      setTimeout(() => setIsAnimating(false), 300);
    }
  }, [visible]);

  if (!visible && !isAnimating) {
    return null;
  }

  const getTypeStyles = () => {
    switch (type) {
      case "suggestion":
        return "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800";
      case "switch":
        return "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800";
      case "idle":
        return "bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800";
      default:
        return "bg-background/95 border-border/40";
    }
  };

  return (
    <div
      className={cn(
        "fixed bottom-6 left-6 z-50 max-w-sm transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}
    >
      <Card
        className={cn(
          "border shadow-lg rounded-xl backdrop-blur-sm",
          getTypeStyles()
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {type === "suggestion" && (
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground mb-1">{message}</p>
              {suggestion && (
                <p className="text-xs text-muted-foreground mb-2">{suggestion}</p>
              )}
              {onAccept && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onAccept}
                  className="mt-2 rounded-lg text-xs"
                >
                  Accept
                </Button>
              )}
            </div>
            {onDismiss && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 rounded-lg flex-shrink-0"
                onClick={onDismiss}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

