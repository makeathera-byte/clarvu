"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { updateAISummaryTime } from "@/app/settings/reminderActions";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import { getUserTimezone, getTimezoneFromCountry } from "@/lib/utils/timezone";
import { COUNTRIES } from "@/lib/utils/countries";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface AISummarySettingsFormProps {
  initialTime: string | null; // "HH:mm" format or null
  initialCountry?: string | null; // Country code (e.g., "RS", "US")
}

/**
 * AI Summary Time Settings Form
 * Allows users to set when their daily AI summary should be generated
 */
export function AISummarySettingsForm({ initialTime, initialCountry }: AISummarySettingsFormProps) {
  const [summaryTime, setSummaryTime] = useState(initialTime || "22:00");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [timezone, setTimezone] = useState<string>("UTC");
  const [selectedCountry, setSelectedCountry] = useState<string>(initialCountry?.toUpperCase().trim() || "");
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use initialCountry from props if available, otherwise fetch from API
    if (initialCountry && initialCountry !== "unknown" && initialCountry !== null && initialCountry !== "") {
      const countryCode = initialCountry.toUpperCase().trim();
      setSelectedCountry(countryCode);
      console.log("✅ Set country from props:", countryCode);
    }
    
    // Fetch current timezone and country from server (to get latest data)
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/user/get-timezone", {
          credentials: "include", // Ensure cookies are sent
        });
        
        if (!response.ok) {
          // Handle non-OK responses
          const errorData = await response.json().catch(() => ({}));
          if (errorData.requiresLogin) {
            setError("Your session has expired. Please refresh the page and log in again.");
            return;
          }
        }
        
        const data = await response.json();
        console.log("📥 Fetched settings from API:", data); // Debug log
        
        if (data.requiresLogin) {
          setError("Your session has expired. Please refresh the page and log in again.");
          return;
        }
        
        if (data.success) {
          // Set timezone
          if (data.timezone && data.timezone !== "UTC") {
            setTimezone(data.timezone);
          } else {
            // Try browser detection as fallback
            const detectedTimezone = getUserTimezone();
            if (detectedTimezone && detectedTimezone !== "UTC") {
              setTimezone(detectedTimezone);
            }
          }
          
          // Set country if available (normalize to uppercase for comparison)
          // Only update if we don't already have a country from props
          if (!selectedCountry && data.country && data.country !== "unknown" && data.country !== null && data.country !== "") {
            const countryCode = data.country.toUpperCase().trim();
            setSelectedCountry(countryCode);
            console.log("✅ Set country from API:", countryCode, "Full data:", data); // Debug log
          } else if (data.country && data.country !== "unknown" && data.country !== null && data.country !== "") {
            // Update if API has a different country (more recent)
            const countryCode = data.country.toUpperCase().trim();
            if (countryCode !== selectedCountry) {
              setSelectedCountry(countryCode);
              console.log("✅ Updated country from API:", countryCode);
            }
          } else {
            console.log("⚠️ No country found in API response. Data:", data); // Debug log
          }
        } else {
          // Try browser detection as fallback
          const detectedTimezone = getUserTimezone();
          if (detectedTimezone && detectedTimezone !== "UTC") {
            setTimezone(detectedTimezone);
          }
        }
      } catch (error: any) {
        console.error("❌ Error fetching settings:", error); // Debug log
        
        // If session expired, show message to user
        if (error?.message?.includes("Session expired") || error?.message?.includes("Unauthorized")) {
          setError("Your session has expired. Please refresh the page and log in again.");
        }
        
        // Fallback to browser detection
        const detectedTimezone = getUserTimezone();
        if (detectedTimezone && detectedTimezone !== "UTC") {
          setTimezone(detectedTimezone);
        }
      }
    };

    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCountry]); // Only depend on initialCountry, not selectedCountry to avoid loops

  const handleCountryChange = async (countryCode: string) => {
    setSelectedCountry(countryCode);
    // Derive timezone from country immediately for UI feedback
    const timezone = getTimezoneFromCountry(countryCode);
    setTimezone(timezone);
    setOpen(false);
    setSearchQuery("");
    
    // Auto-save timezone when country is selected
    // API will derive timezone from country automatically, but we send it for immediate UI update
    try {
      const response = await fetch("/api/user/detect-timezone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          country: countryCode, 
          // timezone will be derived from country by API, but send it for verification
          timezone,
          autoUpdate: false 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.requiresLogin) {
          setError("Your session has expired. Please refresh the page and log in again.");
          return;
        }
        throw new Error(errorData.error || "Failed to save country");
      }
      
      const data = await response.json();
      
      if (data.requiresLogin) {
        setError("Your session has expired. Please refresh the page and log in again.");
        return;
      }
      
      if (data.success) {
        console.log("✅ Country and timezone saved:", countryCode, timezone, "Response:", data);
        
        // Update state immediately from response
        if (data.country) {
          const savedCountry = data.country.toUpperCase().trim();
          setSelectedCountry(savedCountry);
          console.log("✅ Updated selectedCountry from response:", savedCountry);
        }
        
        // Verify it was saved by fetching again after a short delay
        setTimeout(async () => {
          const verifyResponse = await fetch("/api/user/get-timezone", {
            credentials: "include",
          });
          const verifyData = await verifyResponse.json();
          console.log("🔍 Verification fetch result:", verifyData);
          if (verifyData.success && verifyData.country) {
            const savedCountry = verifyData.country.toUpperCase().trim();
            if (savedCountry === countryCode.toUpperCase()) {
              console.log("✅ Verified country saved correctly:", savedCountry);
              setSelectedCountry(savedCountry); // Ensure UI is updated
            } else {
              console.warn("⚠️ Country mismatch. Expected:", countryCode, "Got:", savedCountry);
              setSelectedCountry(savedCountry); // Update to what's actually saved
            }
          } else {
            console.warn("⚠️ Country not found after save. Response:", verifyData);
            // If country was in the save response, use that
            if (data.country) {
              setSelectedCountry(data.country.toUpperCase().trim());
            }
          }
        }, 500);
      } else {
        console.error("❌ Failed to save country:", data.error);
        setError(data.error || "Failed to save country");
      }
    } catch (err) {
      console.error("❌ Error saving timezone:", err);
    }
  };

  // Filter countries based on search query
  const filteredCountries = COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCountryData = COUNTRIES.find((c) => c.code === selectedCountry);
  const selectedCountryName = selectedCountryData ? `${selectedCountryData.flag} ${selectedCountryData.name}` : "";

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    
    try {
      // Ensure time is in HH:mm format (HTML5 time input returns HH:mm, but handle edge cases)
      let timeToSave = summaryTime || "22:00";
      
      // If time input returns format with seconds (HH:mm:ss), extract just HH:mm
      if (timeToSave.includes(":")) {
        const parts = timeToSave.split(":");
        if (parts.length >= 2) {
          timeToSave = `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
        }
      }
      
      // Save time
      const result = await updateAISummaryTime(timeToSave);
      
      // Also save country and timezone if country is selected
      // IMPORTANT: Always derive timezone from country when country is provided
      if (selectedCountry) {
        const countryTimezone = getTimezoneFromCountry(selectedCountry);
        setTimezone(countryTimezone); // Update local state immediately
        try {
          const countryResponse = await fetch("/api/user/detect-timezone", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ 
              // Don't send timezone - let API derive it from country
              country: selectedCountry,
              autoUpdate: false 
            }),
          });
          const countryData = await countryResponse.json();
          if (countryData.success) {
            console.log("✅ Country saved successfully:", selectedCountry, "Response:", countryData);
            // Update state from response
            if (countryData.country) {
              setSelectedCountry(countryData.country.toUpperCase().trim());
            }
          } else {
            console.error("❌ Failed to save country:", countryData.error);
            setError(countryData.error || "Failed to save country");
          }
        } catch (countryError) {
          console.error("❌ Error saving country:", countryError);
          // Don't fail the whole save if country save fails
        }
      }
      
      if (result.success) {
        setSaved(true);
        // Re-fetch settings to ensure UI is updated
        const refreshResponse = await fetch("/api/user/get-timezone", {
          credentials: "include",
        });
        const refreshData = await refreshResponse.json();
        console.log("🔄 Refresh fetch result:", refreshData);
        if (refreshData.success && refreshData.country) {
          const refreshedCountry = refreshData.country.toUpperCase().trim();
          setSelectedCountry(refreshedCountry);
          console.log("✅ Refreshed country from server:", refreshedCountry);
        } else if (refreshData.success && !refreshData.country) {
          console.warn("⚠️ No country in refresh response, keeping current selection");
        } else {
          console.warn("⚠️ Refresh failed:", refreshData);
        }
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error || "Failed to save settings");
      }
    } catch (error: any) {
      console.error("Failed to save AI summary time:", error);
      setError(error.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border/40 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle>AI Summary Settings</CardTitle>
        <CardDescription>
          Configure when your daily AI summary should be generated
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ai-summary-time">Daily Summary Time</Label>
          <Input
            id="ai-summary-time"
            type="time"
            value={summaryTime}
            onChange={(e) => setSummaryTime(e.target.value)}
            className="rounded-xl"
          />
          <p className="text-xs text-muted-foreground">
            Your daily AI summary will be generated at this time each day in your timezone ({timezone}). Default: 10:00 PM
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            You&apos;ll receive a notification when your summary is ready.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country-select">Country (for timezone)</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                id="country-select"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between rounded-xl font-normal"
              >
                {selectedCountryName || "Select your country to set timezone..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command>
                <CommandInput 
                  placeholder="Search country..." 
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {filteredCountries.map((country) => (
                      <CommandItem
                        key={country.code}
                        value={`${country.name} ${country.code}`}
                        onSelect={() => handleCountryChange(country.code)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCountryData?.code === country.code ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span className="mr-2">{country.flag}</span>
                        {country.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground">
            If timezone detection failed, select your country to set the correct timezone.
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <div>
            {saved && (
              <p className="text-xs text-green-600 dark:text-green-400">Settings saved!</p>
            )}
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save AI Summary Settings"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

