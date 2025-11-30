"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export interface ActivityEvent {
  isIdle: boolean;
  lastActiveAt: Date;
  activeTab: string;
  likelyContext: string | null;
  windowFocused: boolean;
}

interface BrowserActivityMonitorProps {
  onActivityChange: (event: ActivityEvent) => void;
  idleThreshold?: number; // milliseconds, default 3 minutes
  enabled?: boolean;
}

/**
 * Browser Activity Monitor
 * Tracks tab visibility, window focus, keyboard/mouse activity, and idle state
 * Privacy-safe: No browser history access, no clipboard access, no background workers
 */
export function BrowserActivityMonitor({
  onActivityChange,
  idleThreshold = 3 * 60 * 1000, // 3 minutes default
  enabled = true,
}: BrowserActivityMonitorProps) {
  const [isIdle, setIsIdle] = useState(false);
  const [lastActiveAt, setLastActiveAt] = useState(new Date());
  const [activeTab, setActiveTab] = useState<string>("");
  const [windowFocused, setWindowFocused] = useState(true);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<Date>(new Date());

  // Reset idle timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    const now = new Date();
    lastActivityRef.current = now;
    setLastActiveAt(now);

    if (isIdle) {
      setIsIdle(false);
    }

    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
    }, idleThreshold);
  }, [idleThreshold, isIdle]);

  // Track keyboard activity
  useEffect(() => {
    if (!enabled) return;

    const handleKeyboard = () => resetIdleTimer();
    const handleMouse = () => resetIdleTimer();
    const handleScroll = () => resetIdleTimer();
    const handleClick = () => resetIdleTimer();
    const handleTouch = () => resetIdleTimer();

    // Listen to activity events
    window.addEventListener("keydown", handleKeyboard, { passive: true });
    window.addEventListener("mousedown", handleMouse, { passive: true });
    window.addEventListener("mousemove", handleMouse, { passive: true, once: false });
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });
    window.addEventListener("touchstart", handleTouch, { passive: true });

    // Initial timer
    resetIdleTimer();

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
      window.removeEventListener("mousedown", handleMouse);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("touchstart", handleTouch);
      
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [enabled, resetIdleTimer]);

  // Track document visibility (tab active/inactive)
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      setWindowFocused(isVisible);
      
      if (isVisible) {
        resetIdleTimer();
      } else {
        // Tab is hidden - consider idle
        setIsIdle(true);
      }
    };

    const handleFocus = () => {
      setWindowFocused(true);
      resetIdleTimer();
    };

    const handleBlur = () => {
      setWindowFocused(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    // Initial state
    setWindowFocused(document.visibilityState === "visible");

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled, resetIdleTimer]);

  // Track active tab title (from document.title)
  useEffect(() => {
    if (!enabled) return;

    const updateActiveTab = () => {
      // Get current tab title (safe, no privacy concerns)
      const title = document.title || "";
      setActiveTab(title);
    };

    // Initial title
    updateActiveTab();

    // Watch for title changes
    const observer = new MutationObserver(updateActiveTab);
    observer.observe(document.querySelector("title") || document.head, {
      childList: true,
      subtree: true,
    });

    // Also poll every 5 seconds (for SPA title changes)
    const intervalId = setInterval(updateActiveTab, 5000);

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, [enabled]);

  // Emit activity events when meaningful state changes
  // Only emit on idle state changes, tab changes, or focus changes (not on every lastActiveAt update)
  const prevStateRef = useRef({ isIdle, activeTab, windowFocused });
  
  useEffect(() => {
    if (!enabled) return;

    // Only emit if meaningful state changed
    const stateChanged = 
      prevStateRef.current.isIdle !== isIdle ||
      prevStateRef.current.activeTab !== activeTab ||
      prevStateRef.current.windowFocused !== windowFocused;

    if (!stateChanged) {
      return;
    }

    prevStateRef.current = { isIdle, activeTab, windowFocused };

    const event: ActivityEvent = {
      isIdle,
      lastActiveAt,
      activeTab,
      likelyContext: null, // Will be set by context detector
      windowFocused,
    };

    onActivityChange(event);
  }, [isIdle, activeTab, windowFocused, enabled, onActivityChange, lastActiveAt]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}

