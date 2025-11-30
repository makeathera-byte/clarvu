// Auto-detect placeholder architecture
// This is designed to be AI-ready but doesn't implement actual detection yet

export interface ActivityDetection {
  app: string | null;
  windowTitle: string | null;
  suggestion: string | null;
  confidence?: number;
}

/**
 * Detect current activity from system/app context
 * Placeholder implementation - ready for future integration
 */
export async function detectCurrentActivity(): Promise<ActivityDetection> {
  // Future implementations might include:
  // - Browser extension for active tab detection
  // - Desktop app integration for window title reading
  // - ML models for activity prediction
  // - Calendar integration
  
  // For now, return null values
  return {
    app: null,
    windowTitle: null,
    suggestion: null,
    confidence: 0,
  };
}

/**
 * Get suggested activity based on detected context
 */
export async function getSuggestedActivity(): Promise<string | null> {
  const detection = await detectCurrentActivity();
  return detection.suggestion;
}

/**
 * Check if auto-detect is available
 */
export function isAutoDetectAvailable(): boolean {
  // Placeholder - will check for browser extension or desktop app
  return false;
}

