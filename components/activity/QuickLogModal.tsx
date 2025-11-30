"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CategoryPicker } from "./CategoryPicker";
import { getCategories } from "@/app/dashboard/category-actions";
import { Loader2 } from "lucide-react";

interface QuickLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialActivity?: string;
  initialCategoryId?: string | null;
}

/**
 * Quick log modal for logging activities from notifications
 * Records activity with current timestamp (no timer)
 */
export function QuickLogModal({
  open,
  onOpenChange,
  initialActivity = "",
  initialCategoryId = null,
}: QuickLogModalProps) {
  const router = useRouter();
  const [activity, setActivity] = useState(initialActivity);
  const [categoryId, setCategoryId] = useState<string | null>(initialCategoryId);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories and last used category
  useEffect(() => {
    async function loadCategories() {
      const { categories: cats } = await getCategories();
      setCategories(cats || []);

      // Load last used category from localStorage
      const lastCategoryId = localStorage.getItem("lastCategoryId");
      if (lastCategoryId && cats?.some((c: any) => c.id === lastCategoryId)) {
        setCategoryId(lastCategoryId);
      } else if (cats && cats.length > 0) {
        // Set default category (Work)
        const workCategory = cats.find((cat: any) => cat.name === "Work");
        setCategoryId(workCategory?.id || cats[0].id);
      }

      // If initialCategoryId provided, use it
      if (initialCategoryId) {
        setCategoryId(initialCategoryId);
      }
    }
    loadCategories();
  }, [initialCategoryId]);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setActivity(initialActivity);
      setError(null);
    }
  }, [open, initialActivity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim() || !categoryId) {
      setError("Please enter an activity and select a category");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the start activity API (now logs immediately with timestamp)
      const response = await fetch("/api/logs/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: activity.trim(),
          categoryId,
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

      // Close modal and refresh
      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Activity</DialogTitle>
          <DialogDescription>
            What are you doing right now?
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activity">Activity</Label>
            <Input
              id="activity"
              placeholder="e.g., Working on DayFlow"
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
              autoFocus
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <CategoryPicker
              selectedCategoryId={categoryId}
              onSelect={(id) => setCategoryId(id)}
              disabled={loading}
            />
          </div>
          {error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging...
                </>
              ) : (
                "Log Activity"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

