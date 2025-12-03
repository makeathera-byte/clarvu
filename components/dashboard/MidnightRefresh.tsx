"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface MidnightRefreshProps {
  timezone?: string;
}

/**
 * Client component that automatically refreshes the dashboard at midnight
 * in the user's local timezone to ensure logs reset properly
 */
export function MidnightRefresh({ timezone = "UTC" }: MidnightRefreshProps) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    /**
     * Calculate the next midnight in the user's timezone
     */
    const getNextMidnight = (): Date => {
      const now = new Date();
      
      // Get current date in user's timezone
      const dateFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      
      const dateStr = dateFormatter.format(now); // e.g., "2024-12-01"
      const [year, month, day] = dateStr.split("-").map(Number);
      
      // Create a date for tomorrow at midnight in the user's timezone
      const tomorrow = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));
      
      // Adjust to find the UTC time that represents midnight tomorrow in the timezone
      const tzFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      
      // Iteratively find the UTC time that shows as midnight tomorrow in the timezone
      for (let i = 0; i < 48; i++) {
        const parts = tzFormatter.formatToParts(tomorrow);
        const tzYear = parseInt(parts.find(p => p.type === "year")?.value || "0");
        const tzMonth = parseInt(parts.find(p => p.type === "month")?.value || "0");
        const tzDay = parseInt(parts.find(p => p.type === "day")?.value || "0");
        const tzHour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
        const tzMinute = parseInt(parts.find(p => p.type === "minute")?.value || "0");
        
        const targetYear = month === 12 ? year + 1 : year;
        const targetMonth = month === 12 ? 1 : month + 1;
        const targetDay = day + 1;
        
        if (tzYear === targetYear && tzMonth === targetMonth && tzDay === targetDay && tzHour === 0 && tzMinute === 0) {
          return tomorrow;
        }
        
        // Adjust candidate
        const hourAdjust = -tzHour;
        let dayAdjust = 0;
        
        if (tzYear < targetYear || (tzYear === targetYear && tzMonth < targetMonth) || 
            (tzYear === targetYear && tzMonth === targetMonth && tzDay < targetDay)) {
          dayAdjust = 1;
        } else if (tzYear > targetYear || (tzYear === targetYear && tzMonth > targetMonth) || 
                   (tzYear === targetYear && tzMonth === targetMonth && tzDay > targetDay)) {
          dayAdjust = -1;
        }
        
        tomorrow.setTime(tomorrow.getTime() + (hourAdjust * 60 * 60 * 1000) + (dayAdjust * 24 * 60 * 60 * 1000));
      }
      
      // Fallback: add 24 hours to current time
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    };

    /**
     * Schedule refresh at next midnight
     */
    const scheduleMidnightRefresh = () => {
      const nextMidnight = getNextMidnight();
      const now = new Date();
      const msUntilMidnight = nextMidnight.getTime() - now.getTime();
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Schedule refresh at midnight
      timeoutRef.current = setTimeout(() => {
        console.log("[MidnightRefresh] Refreshing at midnight in timezone:", timezone);
        router.refresh();
        
        // Schedule next midnight refresh
        scheduleMidnightRefresh();
      }, Math.max(0, msUntilMidnight));
      
      console.log(`[MidnightRefresh] Scheduled refresh in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);
    };

    // Also check every minute if we've passed midnight (in case the page was open during the transition)
    intervalRef.current = setInterval(() => {
      const now = new Date();
      const dateFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      
      const parts = dateFormatter.formatToParts(now);
      const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
      const minute = parseInt(parts.find(p => p.type === "minute")?.value || "0");
      
      // If it's just past midnight (00:00-00:01), refresh
      if (hour === 0 && minute <= 1) {
        console.log("[MidnightRefresh] Detected midnight, refreshing...");
        router.refresh();
        scheduleMidnightRefresh();
      }
    }, 60000); // Check every minute

    // Initial schedule
    scheduleMidnightRefresh();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [router, timezone]);

  // This component doesn't render anything
  return null;
}

