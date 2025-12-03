"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
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
import { X, Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTimezoneFromCountry } from "@/lib/utils/timezone";
import { COUNTRIES } from "@/lib/utils/countries";

interface CountryNotificationProps {
  currentCountry?: string | null;
}

/**
 * Notification component that prompts users to select their country
 * if they haven't selected one yet
 */
export function CountryNotification({ currentCountry }: CountryNotificationProps) {
  const router = useRouter();
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Check if country is missing
  const isCountryMissing = !currentCountry || 
    currentCountry === "unknown" || 
    currentCountry === null || 
    currentCountry === "";

  // Check if user has dismissed this notification
  useEffect(() => {
    const dismissed = localStorage.getItem("country-notification-dismissed");
    if (dismissed === "true") {
      setDismissed(true);
    }
  }, []);

  // Don't show if country is set or if dismissed
  if (!isCountryMissing || dismissed) {
    return null;
  }

  const handleSave = async () => {
    if (!selectedCountryCode) return;

    const country = COUNTRIES.find((c) => c.code === selectedCountryCode);
    if (!country) return;

    setIsSaving(true);
    try {
      const timezone = getTimezoneFromCountry(country.code);
      
      const response = await fetch("/api/user/detect-timezone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ timezone, country: country.code }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn("⚠️ Session expired, please log in again");
          return;
        }
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setDismissed(true);
        localStorage.setItem("country-notification-dismissed", "true");
        // Refresh the page to update the UI
        router.refresh();
      } else {
        console.error("Failed to save country/timezone:", data.error);
        alert(data.error || "Failed to save country. Please try again.");
      }
    } catch (error: any) {
      console.error("Error saving country/timezone:", error.message);
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("country-notification-dismissed", "true");
  };

  // Filter countries based on search query
  const filteredCountries = COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCountryData = COUNTRIES.find((c) => c.code === selectedCountryCode);
  const selectedCountryName = selectedCountryData 
    ? `${selectedCountryData.flag} ${selectedCountryData.name}` 
    : "";

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/30 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
              Select Your Country
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Please select your country to ensure accurate timezone settings and proper log resets at midnight in your local time.
            </p>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="country-select-notification" className="text-xs text-blue-800 dark:text-blue-200">
                  Country
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="country-select-notification"
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      disabled={isSaving}
                      className="w-full justify-between rounded-lg h-9 mt-1 font-normal"
                    >
                      {selectedCountryName || "Select your country..."}
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
                              value={country.code}
                              onSelect={() => {
                                setSelectedCountryCode(country.code);
                                setOpen(false);
                                setSearchQuery("");
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedCountryCode === country.code ? "opacity-100" : "opacity-0"
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
              </div>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!selectedCountryCode || isSaving}
                className="rounded-lg h-9"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                disabled={isSaving}
                className="rounded-lg h-9"
              >
                Dismiss
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            disabled={isSaving}
            className="h-6 w-6 p-0 text-blue-600 dark:text-blue-400 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

