"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor, Check } from "lucide-react";
import { updateThemePreference } from "@/app/settings/reminderActions";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface ThemeSelectorProps {
  initialTheme?: string | null;
}

export function ThemeSelector({ initialTheme = "system" }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    // Set theme from user preference if available
    if (initialTheme && initialTheme !== "system") {
      setTheme(initialTheme);
    }
  }, [initialTheme, setTheme]);

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      // Update in database
      const result = await updateThemePreference(newTheme);
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Update next-themes
      setTheme(newTheme);

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save theme preference");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) {
    return (
      <Card className="border-border/40 shadow-sm rounded-2xl">
        <CardHeader>
          <CardTitle>Theme Preference</CardTitle>
          <CardDescription>Choose your preferred color theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentTheme = theme || initialTheme || "system";

  const themeOptions = [
    {
      value: "light" as const,
      label: "Light",
      icon: Sun,
      description: "Light mode for bright environments",
    },
    {
      value: "dark" as const,
      label: "Dark",
      icon: Moon,
      description: "Dark mode for low-light environments",
    },
    {
      value: "system" as const,
      label: "System",
      icon: Monitor,
      description: "Follow your system preference",
    },
  ];

  return (
    <Card className="border-border/40 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle>Theme Preference</CardTitle>
        <CardDescription>Choose your preferred color theme</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = currentTheme === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                disabled={saving}
                className={cn(
                  "relative rounded-xl border-2 p-4 text-left transition-all",
                  "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border/40",
                  saving && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "rounded-lg p-2",
                      isSelected ? "bg-primary/10" : "bg-muted/50"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{option.label}</p>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {saved && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 p-3">
            <p className="text-xs text-green-600 dark:text-green-400">
              Theme preference saved!
            </p>
          </div>
        )}

        {saving && (
          <p className="text-xs text-muted-foreground text-center">
            Saving theme preference...
          </p>
        )}
      </CardContent>
    </Card>
  );
}

