"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CategoryPicker } from "./CategoryPicker";
import { getQuickSuggestions, getSuggestions } from "@/lib/suggestions";
import { getQuickContextSuggestion } from "@/lib/suggestions/smartSuggestions";
import { getCategories } from "@/app/dashboard/category-actions";
import { Loader2 } from "lucide-react";

/**
 * Activity Input Component - Simple instant logging (no timer)
 * Logs activity immediately with current timestamp
 */
export function ActivityInput() {
  const router = useRouter();
  const [activity, setActivity] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [contextSuggestion, setContextSuggestion] = useState<{
    activity: string;
    categoryId: string | null;
    confidence: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load categories and restore last used category
  useEffect(() => {
    async function loadCategories() {
      const { categories: cats } = await getCategories();
      setCategories(cats || []);

      // Restore last used category from localStorage
      const lastCategoryId = localStorage.getItem("lastCategoryId");
      if (lastCategoryId && cats?.some((c: any) => c.id === lastCategoryId)) {
        setCategoryId(lastCategoryId);
      } else if (cats && cats.length > 0) {
        // Set default category (Work)
        const workCategory = cats.find((cat: any) => cat.name === "Work");
        setCategoryId(workCategory?.id || cats[0].id);
      }
    }
    loadCategories();
  }, []);

  // Check for context-based suggestions periodically
  useEffect(() => {
    const checkContextSuggestion = () => {
      const activeTab = document.title || "";
      const suggestion = getQuickContextSuggestion(activeTab, false);
      
      if (suggestion && suggestion.confidence >= 60) {
        const categoryMap: Record<string, string> = {
          deep_work: "Deep Work",
          revenue: "Work",
          admin: "Admin",
          personal: "Personal",
          break: "Break",
          learning: "Learning",
        };
        
        const categoryName = suggestion.categoryId 
          ? categoryMap[suggestion.categoryId] || null
          : null;
        
        const matchedCategory = categories.find(
          (cat: any) => cat.name === categoryName
        );
        
        setContextSuggestion({
          activity: suggestion.activity,
          categoryId: matchedCategory?.id || null,
          confidence: suggestion.confidence,
        });
      } else {
        setContextSuggestion(null);
      }
    };

    checkContextSuggestion();
    const interval = setInterval(checkContextSuggestion, 5000);
    return () => clearInterval(interval);
  }, [categories]);

  // Suggestions effect
  useEffect(() => {
    if (!activity || activity.length < 1) {
      setSuggestions([]);
      setSuggestionsOpen(false);
      return;
    }

    const quick = getQuickSuggestions(activity);
    setSuggestions(quick);
    setSuggestionsOpen(quick.length > 0);

    getSuggestions(activity).then((userSuggestions) => {
      if (userSuggestions.length > 0) {
        setSuggestions(userSuggestions);
      }
    });
  }, [activity]);

  const handleLogActivity = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!activity.trim() || !categoryId) {
      return;
    }

    setLoading(true);
    try {
      // Log activity instantly via API
      const response = await fetch("/api/logs/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: activity.trim(),
          category_id: categoryId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to log activity");
      }

      // Save category preference
      if (categoryId) {
        localStorage.setItem("lastCategoryId", categoryId);
      }

      // Reset form
      setActivity("");
      setContextSuggestion(null);
      
      // Refresh page data
      router.refresh();
      
      // Focus input for next entry
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error: any) {
      console.error("Failed to log activity:", error);
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setActivity(suggestion);
    setSuggestionsOpen(false);
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
    // Auto-submit if category is selected
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleLogActivity();
    }
  };

  return (
    <Card className="border-border/40 shadow-sm rounded-2xl">
      <CardContent className="p-6 space-y-4">
        {/* Context-based suggestion banner */}
        {contextSuggestion && contextSuggestion.confidence >= 60 && (
          <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground">We think you're doing:</span>
              <span className="text-sm font-medium">{contextSuggestion.activity}</span>
              {contextSuggestion.confidence >= 75 && (
                <span className="text-xs text-muted-foreground">(High confidence)</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setActivity(contextSuggestion.activity);
                if (contextSuggestion.categoryId) {
                  setCategoryId(contextSuggestion.categoryId);
                }
                setContextSuggestion(null);
                setTimeout(() => handleLogActivity(), 100);
              }}
              className="h-7 text-xs rounded-lg"
            >
              Use
            </Button>
          </div>
        )}

        <form onSubmit={handleLogActivity} className="space-y-4">
          <div className="space-y-2 relative">
            <Label htmlFor="activity">What are you doing?</Label>
            <Input
              ref={inputRef}
              id="activity"
              type="text"
              placeholder="e.g., Working on DayFlow"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="rounded-xl"
              autoFocus
              onFocus={() => {
                if (suggestions.length > 0) {
                  setSuggestionsOpen(true);
                }
              }}
              onBlur={() => {
                // Delay closing to allow clicking on suggestions
                setTimeout(() => setSuggestionsOpen(false), 200);
              }}
            />
            {suggestions.length > 0 && suggestionsOpen && (
              <div className="absolute z-50 w-full mt-1 rounded-xl border border-border/40 bg-popover shadow-lg">
                <div className="py-1">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    Suggestions
                  </div>
                  {suggestions.slice(0, 8).map((suggestion) => (
                    <div
                      key={suggestion}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur before click
                        handleSuggestionSelect(suggestion);
                      }}
                      className="relative flex cursor-pointer select-none items-center rounded-lg px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <CategoryPicker
              selectedCategoryId={categoryId}
              onSelect={(id) => setCategoryId(id)}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !activity.trim() || !categoryId}
            className="w-full rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging...
              </>
            ) : (
              "Log Activity"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
