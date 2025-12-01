"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { X, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getTimezoneFromCountry } from "@/lib/utils/timezone";
import { COUNTRIES } from "@/lib/utils/countries";

interface CountrySelectorPromptProps {
  onCountrySelected: (country: string, timezone: string) => void;
}

export function CountrySelectorPrompt({ onCountrySelected }: CountrySelectorPromptProps) {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>("");
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Check if user has already dismissed this prompt
  useEffect(() => {
    const dismissed = localStorage.getItem("country-selector-dismissed");
    if (dismissed === "true") {
      setDismissed(true);
    }
  }, []);

  const handleSave = () => {
    if (!selectedCountryCode) return;

    const country = COUNTRIES.find((c) => c.code === selectedCountryCode);
    if (country) {
      const timezone = getTimezoneFromCountry(country.code);
      onCountrySelected(country.code, timezone);
      setDismissed(true);
      localStorage.setItem("country-selector-dismissed", "true");
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("country-selector-dismissed", "true");
  };

  // Filter countries based on search query
  const filteredCountries = COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCountryData = COUNTRIES.find((c) => c.code === selectedCountryCode);
  const selectedCountryName = selectedCountryData ? `${selectedCountryData.flag} ${selectedCountryData.name}` : "";

  if (dismissed) {
    return null;
  }

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950/30 animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
              Help us set your timezone
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
              We couldn&apos;t automatically detect your location. Please select your country so we can generate your AI summary at the right time.
            </p>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="country-select" className="text-xs text-amber-800 dark:text-amber-200">
                  Country
                </Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      id="country-select"
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
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
                disabled={!selectedCountryCode}
                className="rounded-lg h-9"
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="rounded-lg h-9"
              >
                Skip
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-amber-600 dark:text-amber-400"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

