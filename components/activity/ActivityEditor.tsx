"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CategoryPicker } from "./CategoryPicker";
import { X, Check, Loader2, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ActivityEditorProps {
  logId: string;
  currentActivity: string;
  currentCategoryId: string | null;
  suggestions: string[];
  onSave: (activity: string, categoryId: string | null) => Promise<void>;
  onClose: () => void;
}

export function ActivityEditor({
  logId,
  currentActivity,
  currentCategoryId,
  suggestions,
  onSave,
  onClose,
}: ActivityEditorProps) {
  const [activity, setActivity] = useState(currentActivity);
  const [categoryId, setCategoryId] = useState<string | null>(currentCategoryId);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (!activity.trim()) {
      setFilteredSuggestions(suggestions.slice(0, 5));
      return;
    }

    const query = activity.toLowerCase();
    const filtered = suggestions
      .filter((suggestion) => 
        suggestion.toLowerCase().includes(query) && 
        suggestion.toLowerCase() !== query
      )
      .slice(0, 5);
    
    setFilteredSuggestions(filtered);
    setShowSuggestions(filtered.length > 0 && activity.trim().length > 0);
  }, [activity, suggestions]);

  const handleSave = async () => {
    if (!activity.trim()) {
      setError("Activity name cannot be empty");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onSave(activity.trim(), categoryId);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setActivity(suggestion);
    setShowSuggestions(false);
  };

  const hasChanges = 
    activity.trim() !== currentActivity.trim() || 
    categoryId !== currentCategoryId;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Activity</DialogTitle>
          <DialogDescription>
            Update the activity name and category
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Activity Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Activity Name</label>
            <div className="relative">
              <Input
                value={activity}
                onChange={(e) => {
                  setActivity(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSave();
                  } else if (e.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
                placeholder="What are you doing?"
                autoFocus
                className="pr-10"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-popover border rounded-lg shadow-lg max-h-48 overflow-auto">
                  <div className="p-1">
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                      Suggestions
                    </div>
                    {filteredSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {suggestions.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Start typing to see suggestions from your previous activities
              </p>
            )}
          </div>

          {/* Category Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <CategoryPicker
              selectedCategoryId={categoryId}
              onSelect={(id) => {
                setCategoryId(id);
                setError(null);
              }}
              disabled={isSaving}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
              <div className="text-sm text-destructive font-medium">{error}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

