/**
 * Time utility functions
 */

/**
 * Calculate duration in minutes between two timestamps
 */
export function calculateDurationMinutes(startTime: string | Date, endTime: string | Date | null): number {
  if (!endTime) return 0;
  
  const start = typeof startTime === "string" ? new Date(startTime) : startTime;
  const end = typeof endTime === "string" ? new Date(endTime) : endTime;
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }
  
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60)));
}

/**
 * Format time from HH:mm format to readable time (e.g., "22:00" -> "10:00 PM")
 */
export function formatTimeForDisplay(timeStr: string | null): string {
  if (!timeStr) return "10:00 PM"; // Default
  
  try {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timeStr; // Return as-is if parsing fails
  }
}

/**
 * Format duration in minutes to readable format (e.g., 90 -> "1h 30m", 45 -> "45m")
 */
export function formatDurationMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
