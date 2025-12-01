/**
 * Date utilities for timezone-aware date calculations
 * Ensures logs reset at midnight in each user's local timezone
 */

/**
 * Get the start of "today" in the user's timezone, converted to UTC
 * @param timezone - IANA timezone string (e.g., "America/New_York")
 * @returns Date object representing midnight in the user's timezone (as UTC)
 */
export function getTodayStartUTC(timezone: string = "UTC"): Date {
  if (timezone === "UTC") {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return today;
  }

  const now = new Date();
  
  // Get current date in the user's timezone (YYYY-MM-DD format)
  const dateFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  
  const dateStr = dateFormatter.format(now); // e.g., "2024-12-01"
  const [year, month, day] = dateStr.split("-").map(Number);
  
  // Find the UTC timestamp that represents midnight in the timezone
  // Strategy: Iteratively adjust a UTC time until it shows as midnight in the timezone
  
  const tzFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  
  // Start with UTC midnight for the date
  let candidate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  
  // Iteratively adjust until we find the UTC time that shows as midnight in the timezone
  for (let i = 0; i < 48; i++) { // Max 48 hours adjustment (covers all timezones)
    const parts = tzFormatter.formatToParts(candidate);
    const tzYear = parseInt(parts.find(p => p.type === "year")?.value || "0");
    const tzMonth = parseInt(parts.find(p => p.type === "month")?.value || "0");
    const tzDay = parseInt(parts.find(p => p.type === "day")?.value || "0");
    const tzHour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
    const tzMinute = parseInt(parts.find(p => p.type === "minute")?.value || "0");
    
    // Check if we've found midnight on the correct date
    if (tzYear === year && tzMonth === month && tzDay === day && tzHour === 0 && tzMinute === 0) {
      return candidate;
    }
    
    // Calculate adjustment needed
    // If showing as 5 AM, we need to go back 5 hours
    // If showing as yesterday, we need to go forward
    let hourAdjust = -tzHour;
    let dayAdjust = 0;
    
    if (tzYear < year || (tzYear === year && tzMonth < month) || (tzYear === year && tzMonth === month && tzDay < day)) {
      dayAdjust = 1; // Need to go forward a day
    } else if (tzYear > year || (tzYear === year && tzMonth > month) || (tzYear === year && tzMonth === month && tzDay > day)) {
      dayAdjust = -1; // Need to go back a day
    }
    
    // Adjust candidate
    candidate = new Date(
      candidate.getTime() + (hourAdjust * 60 * 60 * 1000) + (dayAdjust * 24 * 60 * 60 * 1000)
    );
  }
  
  // Fallback: if iteration fails, return UTC midnight (shouldn't happen, but safety)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

/**
 * Get the end of "today" in the user's timezone, converted to UTC
 * @param timezone - IANA timezone string
 * @returns Date object representing end of today (midnight tomorrow) in the user's timezone (as UTC)
 */
export function getTodayEndUTC(timezone: string = "UTC"): Date {
  const todayStart = getTodayStartUTC(timezone);
  // Add 24 hours to get tomorrow's midnight
  return new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
}

/**
 * Get "today" date range in user's timezone as UTC timestamps
 * @param timezone - IANA timezone string
 * @returns Object with start and end of today in UTC
 */
export function getTodayRangeUTC(timezone: string = "UTC") {
  return {
    start: getTodayStartUTC(timezone),
    end: getTodayEndUTC(timezone),
  };
}

/**
 * Check if a UTC timestamp falls within "today" in the user's timezone
 * @param utcTimestamp - ISO timestamp string in UTC
 * @param timezone - IANA timezone string
 * @returns boolean
 */
export function isTodayInTimezone(utcTimestamp: string, timezone: string = "UTC"): boolean {
  const timestamp = new Date(utcTimestamp);
  const { start, end } = getTodayRangeUTC(timezone);
  return timestamp >= start && timestamp < end;
}

/**
 * Get "yesterday" date range in user's timezone as UTC timestamps
 * @param timezone - IANA timezone string
 * @returns Object with start and end of yesterday in UTC
 */
export function getYesterdayRangeUTC(timezone: string = "UTC") {
  const todayStart = getTodayStartUTC(timezone);
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
  const yesterdayEnd = todayStart;
  
  return {
    start: yesterdayStart,
    end: yesterdayEnd,
  };
}
