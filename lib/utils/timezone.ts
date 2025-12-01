/**
 * Utility functions for timezone handling
 */

import { COUNTRIES } from "./countries";

/**
 * Get timezone from country code
 * Maps country codes to common timezones
 */
export function getTimezoneFromCountry(countryCode: string): string {
  const country = COUNTRIES.find((c) => c.code.toUpperCase() === countryCode.toUpperCase());
  return country?.timezone || "UTC";
}

/**
 * Get country code from timezone
 * Maps timezones back to country codes (returns first match)
 */
export function getCountryFromTimezone(timezone: string): string {
  if (!timezone || timezone === "UTC") {
    return "unknown";
  }
  
  // Find countries that match this timezone
  const matchingCountries = COUNTRIES.filter((c) => c.timezone === timezone);
  
  if (matchingCountries.length > 0) {
    // Return the first matching country code
    // For timezones with multiple countries, we'll use the first one
    return matchingCountries[0].code;
  }
  
  return "unknown";
}

/**
 * Get user's timezone from browser
 * Returns IANA timezone string (e.g., "America/New_York")
 * Handles edge cases and validates the timezone
 */
export function getUserTimezone(): string {
  try {
    if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
      const options = Intl.DateTimeFormat().resolvedOptions();
      const timezone = options.timeZone;
      
      // Validate that we got a valid timezone
      if (timezone && typeof timezone === "string" && timezone.length > 0) {
        // Test if the timezone is valid by trying to format a date
        try {
          const testDate = new Date();
          const formatter = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone,
            hour: "2-digit",
          });
          formatter.format(testDate);
          return timezone;
        } catch (e) {
          console.warn("Invalid timezone detected:", timezone, e);
          return "UTC";
        }
      }
    }
  } catch (error) {
    console.error("Error detecting timezone:", error);
  }
  
  return "UTC";
}

/**
 * Convert a time in user's timezone to UTC
 * @param timeString - Time in "HH:mm" format
 * @param timezone - IANA timezone string (e.g., "America/New_York")
 * @returns Date object in UTC
 */
export function convertToUTC(timeString: string, timezone: string): Date {
  const [hours, minutes] = timeString.split(":").map(Number);
  
  // Create a date for today in the user's timezone
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
  
  // Create date string in user's timezone
  const dateTimeString = `${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
  
  // Parse as if it's in the user's timezone
  // We'll use a library or manual calculation
  // For now, use a simple approach with Date
  const localDate = new Date(dateTimeString);
  
  // Get offset for the timezone
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "longOffset",
  });
  
  // Calculate UTC time
  // This is a simplified version - in production, use a library like date-fns-tz
  const utcDate = new Date(localDate.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(localDate.toLocaleString("en-US", { timeZone: timezone }));
  const offset = utcDate.getTime() - tzDate.getTime();
  
  return new Date(localDate.getTime() - offset);
}

/**
 * Check if current time in user's timezone matches the target time
 * @param targetTime - Time in "HH:mm" format
 * @param timezone - IANA timezone string
 * @returns true if current time matches target time (within 30 minute window)
 */
export function isTimeForSummary(targetTime: string, timezone: string): boolean {
  const now = new Date();
  
  // Get current time in user's timezone
  const userTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  const utcTime = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
  
  // Calculate offset
  const offset = userTime.getTime() - utcTime.getTime();
  const currentInTimezone = new Date(now.getTime() + offset);
  
  const [targetHour, targetMinute] = targetTime.split(":").map(Number);
  const currentHour = currentInTimezone.getHours();
  const currentMinute = currentInTimezone.getMinutes();
  
  const targetMinutes = targetHour * 60 + targetMinute;
  const currentMinutes = currentHour * 60 + currentMinute;
  
  // Check if we're past the target time today and within 30 minutes
  const minutesSinceTarget = currentMinutes - targetMinutes;
  return minutesSinceTarget >= 0 && minutesSinceTarget < 30;
}

