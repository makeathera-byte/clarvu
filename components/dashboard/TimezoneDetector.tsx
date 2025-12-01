"use client";

import { useEffect, useState } from "react";
import { getUserTimezone } from "@/lib/utils/timezone";
import { CountrySelectorPrompt } from "./CountrySelectorPrompt";

/**
 * Component that detects and saves user's timezone automatically
 * - Runs on dashboard load
 * - Updates timezone if it has changed (e.g., user travels)
 * - Shows country selector only if detection fails and no timezone is set
 */
export function TimezoneDetector() {
  const [showCountryPrompt, setShowCountryPrompt] = useState(false);
  const [timezoneDetected, setTimezoneDetected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const detectAndSaveTimezone = async () => {
      try {
        setIsChecking(true);
        
        // Get current detected timezone from browser
        const detectedTimezone = getUserTimezone();
        
        if (!detectedTimezone || detectedTimezone === "UTC") {
          // Browser detection failed, check if user has timezone set
          const response = await fetch("/api/user/get-timezone");
          const data = await response.json();
          
          if (!data.timezone || data.timezone === "UTC") {
            // No timezone set and detection failed, show country selector
            setShowCountryPrompt(true);
            setIsChecking(false);
            return;
          } else {
            // User has timezone set but browser detection failed - keep existing
            setTimezoneDetected(true);
            setIsChecking(false);
            return;
          }
        }

        // Check current saved timezone
        const response = await fetch("/api/user/get-timezone");
        const data = await response.json();
        let savedTimezone = data.timezone || "UTC";
        
        // Normalize timezone names (handle old names like "Asia/Calcutta" → "Asia/Kolkata")
        const normalizeTimezone = (tz: string): string => {
          const timezoneMap: Record<string, string> = {
            "Asia/Calcutta": "Asia/Kolkata",
          };
          return timezoneMap[tz] || tz;
        };
        
        const normalizedSaved = normalizeTimezone(savedTimezone);
        const normalizedDetected = normalizeTimezone(detectedTimezone);
        
        // Always update timezone if detected timezone is different from saved
        // This handles cases where user travels or timezone changes
        if (normalizedDetected !== normalizedSaved || savedTimezone !== normalizedSaved) {
          const targetTimezone = normalizedDetected !== normalizedSaved ? detectedTimezone : normalizedSaved;
          console.log(`🔄 Timezone ${savedTimezone !== normalizedSaved ? 'normalized' : 'changed'}: ${savedTimezone} → ${targetTimezone}, updating automatically...`);
          
          // Update timezone automatically
          try {
            const saveResponse = await fetch("/api/user/detect-timezone", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include", // Ensure cookies are sent
              body: JSON.stringify({ 
                timezone: targetTimezone,
                autoUpdate: true // Flag to indicate this is an automatic update
              }),
            });
            
            if (!saveResponse.ok) {
              // If unauthorized, the session might have expired
              if (saveResponse.status === 401) {
                console.warn("⚠️ Session expired, skipping timezone update");
                // Don't show error for expired sessions, just skip the update
                setTimezoneDetected(true);
                return;
              }
              
              const errorData = await saveResponse.json().catch(() => ({ error: "Unknown error" }));
              throw new Error(errorData.error || `HTTP ${saveResponse.status}`);
            }
            
            const saveData = await saveResponse.json();
            if (saveData.success) {
              console.log(`✅ Timezone automatically updated to ${targetTimezone}`);
              setTimezoneDetected(true);
            } else {
              console.error("❌ Failed to update timezone:", saveData.error);
              // If update fails and no timezone was set, show country selector
              if (savedTimezone === "UTC") {
                setShowCountryPrompt(true);
              } else {
                // Keep existing timezone if update fails
                setTimezoneDetected(true);
              }
            }
          } catch (error: any) {
            console.error("❌ Error updating timezone:", error.message);
            // Don't show country prompt on network errors, just keep existing timezone
            setTimezoneDetected(true);
          }
        } else {
          // Timezone matches, no update needed
          setTimezoneDetected(true);
        }
      } catch (error) {
        // Error occurred
        console.error("Error detecting/updating timezone:", error);
        
        // Check if user has a timezone set
        try {
          const response = await fetch("/api/user/get-timezone");
          const data = await response.json();
          
          if (!data.timezone || data.timezone === "UTC") {
            // No timezone set, show country selector
            setShowCountryPrompt(true);
          } else {
            // User has timezone set, keep it
            setTimezoneDetected(true);
          }
        } catch (checkError) {
          // If we can't check, show country selector as fallback
          setShowCountryPrompt(true);
        }
      } finally {
        setIsChecking(false);
      }
    };

    detectAndSaveTimezone();
    
    // Also check periodically (every 5 minutes) to catch timezone changes
    // This is useful if user travels or changes their system timezone
    const interval = setInterval(() => {
      detectAndSaveTimezone();
    }, 5 * 60 * 1000); // 5 minutes
    
    // Check when page becomes visible (user switches back to tab)
    // This catches timezone changes immediately when user returns
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page is now visible, check timezone
        detectAndSaveTimezone();
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Check on window focus (user switches back to window)
    const handleFocus = () => {
      detectAndSaveTimezone();
    };
    
    window.addEventListener("focus", handleFocus);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const handleCountrySelected = async (country: string, timezone: string) => {
    try {
      const response = await fetch("/api/user/detect-timezone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Ensure cookies are sent
        body: JSON.stringify({ timezone, country }),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.warn("⚠️ Session expired, please log in again");
          // Could redirect to login here if needed
          return;
        }
        
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setShowCountryPrompt(false);
        setTimezoneDetected(true);
      } else {
        console.error("Failed to save country/timezone:", data.error);
      }
    } catch (error: any) {
      console.error("Error saving country/timezone:", error.message);
    }
  };

  // Always render consistently to avoid hook order issues
  // Don't show anything while checking (to avoid flickering)
  if (isChecking) {
    return <div style={{ display: "none" }} />;
  }

  // Only show country prompt if detection failed and no timezone is set
  if (showCountryPrompt && !timezoneDetected) {
    return <CountrySelectorPrompt onCountrySelected={handleCountrySelected} />;
  }

  // Timezone is set, no need to show anything
  return <div style={{ display: "none" }} />;
}

