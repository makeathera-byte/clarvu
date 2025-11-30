"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { BrowserActivityMonitor, ActivityEvent } from "./BrowserActivityMonitor";
import { ContextHint } from "./ContextHint";
import { detectContext } from "@/lib/context/detector";
import { getQuickContextSuggestion } from "@/lib/suggestions/smartSuggestions";
import { detectRealTimeContextSwitch } from "@/lib/insights/businessMetrics";

// Re-export ActivityEvent for convenience
export type { ActivityEvent };

interface ActivityMonitorWrapperProps {
  onContextChange?: (context: ActivityEvent) => void;
  onContextSwitch?: (from: string, to: string) => void;
  enabled?: boolean;
}

/**
 * Activity Monitor Wrapper
 * Integrates BrowserActivityMonitor with ContextHint UI
 * Provides a complete monitoring solution with visual feedback
 */
export function ActivityMonitorWrapper({
  onContextChange,
  onContextSwitch,
  enabled = true,
}: ActivityMonitorWrapperProps) {
  const [currentEvent, setCurrentEvent] = useState<ActivityEvent | null>(null);
  const [contextHint, setContextHint] = useState<{
    message: string;
    suggestion?: string;
    type: "info" | "suggestion" | "switch" | "idle";
    visible: boolean;
  }>({
    message: "",
    visible: false,
    type: "info",
  });
  const [suggestedActivity, setSuggestedActivity] = useState<string | null>(null);
  
  const previousContextRef = useRef<{ task: string | null; category: string | null } | null>(null);
  const idleHintShownRef = useRef(false);
  const lastEventRef = useRef<ActivityEvent | null>(null);
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize the handler to prevent infinite loops
  const handleActivityChange = useCallback((event: ActivityEvent) => {
    // Throttle events - only process meaningful changes
    if (throttleTimerRef.current) {
      return;
    }

    // Check if event is meaningfully different from last one
    const lastEvent = lastEventRef.current;
    if (lastEvent) {
      const isSame = 
        lastEvent.isIdle === event.isIdle &&
        lastEvent.windowFocused === event.windowFocused &&
        lastEvent.activeTab === event.activeTab;
      
      if (isSame) {
        return; // Skip duplicate events
      }
    }

    lastEventRef.current = event;
    
    // Throttle: Only process events every 2 seconds
    throttleTimerRef.current = setTimeout(() => {
      throttleTimerRef.current = null;
    }, 2000);

    setCurrentEvent(event);
    
    // Detect context from tab title
    const context = detectContext(event.activeTab, event.isIdle);
    
    // Check for context switch
    if (previousContextRef.current) {
      const switchResult = detectRealTimeContextSwitch(
        previousContextRef.current,
        { task: context.likelyTask, category: context.categoryId }
      );

      if (switchResult.isSwitch && switchResult.from && switchResult.to) {
        setContextHint({
          message: "Task switch detected",
          suggestion: `Did you switch from "${switchResult.from}" to "${switchResult.to}"?`,
          type: "switch",
          visible: true,
        });

        if (onContextSwitch) {
          onContextSwitch(switchResult.from, switchResult.to);
        }
      }
    }

    // Update previous context only if task changed
    if (context.likelyTask && 
        (!previousContextRef.current || previousContextRef.current.task !== context.likelyTask)) {
      previousContextRef.current = {
        task: context.likelyTask,
        category: context.categoryId,
      };
    }

    // Show idle hint (only once)
    if (event.isIdle && !idleHintShownRef.current) {
      setContextHint({
        message: "You've been idle for 3 minutes",
        suggestion: "Want to log this break time?",
        type: "idle",
        visible: true,
      });
      idleHintShownRef.current = true;
    } else if (!event.isIdle) {
      idleHintShownRef.current = false;
    }

    // Show context suggestion if confidence is high (debounce to avoid flicker)
    if (!event.isIdle && context.confidence >= 60) {
      const suggestion = getQuickContextSuggestion(event.activeTab, event.isIdle);
      if (suggestion && suggestion.activity) {
        setSuggestedActivity(suggestion.activity);
        setContextHint((prev) => {
          // Only update if different
          if (prev.suggestion === suggestion.activity && prev.visible) {
            return prev;
          }
          return {
            message: "We think you're doing:",
            suggestion: suggestion.activity,
            type: "suggestion",
            visible: true,
          };
        });
      }
    }

    if (onContextChange) {
      onContextChange(event);
    }
  }, [onContextChange, onContextSwitch]);

  // Cleanup throttle timer
  useEffect(() => {
    return () => {
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, []);

  const handleAcceptSuggestion = () => {
    // This will be handled by parent component
    setContextHint({ ...contextHint, visible: false });
  };

  const handleDismissHint = () => {
    setContextHint({ ...contextHint, visible: false });
  };

  return (
    <>
      <BrowserActivityMonitor
        onActivityChange={handleActivityChange}
        enabled={enabled}
      />
      <ContextHint
        message={contextHint.message}
        suggestion={contextHint.suggestion}
        visible={contextHint.visible}
        type={contextHint.type}
        onAccept={contextHint.type === "suggestion" ? handleAcceptSuggestion : undefined}
        onDismiss={handleDismissHint}
      />
    </>
  );
}

/**
 * Hook to get suggested activity from context
 */
export function useContextSuggestion() {
  // This would be managed by ActivityMonitorWrapper
  // For now, return a placeholder
  return null;
}

