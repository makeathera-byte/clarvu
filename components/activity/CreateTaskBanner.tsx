"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CategoryPicker } from "./CategoryPicker";
import { Plus, Loader2, Clock } from "lucide-react";
import { getCategories } from "@/app/dashboard/category-actions";

interface CreateTaskBannerProps {
  onCreateTask: (data: {
    activity: string;
    category_id: string;
    duration_minutes: number;
    startNow?: boolean;
  }) => Promise<void>;
}

/**
 * Inline banner for creating tasks quickly
 * Press Enter to create task, supports custom duration
 */
export function CreateTaskBanner({ onCreateTask }: CreateTaskBannerProps) {
  const [activity, setActivity] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [showDuration, setShowDuration] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      const { categories: cats } = await getCategories();
      setCategories(cats || []);
      
      // Set default category if available
      if (cats && cats.length > 0 && !categoryId) {
        const workCategory = cats.find((cat: any) => 
          cat.name === "Business (Growth)" || cat.name === "Work"
        );
        setCategoryId(workCategory?.id || cats[0].id);
      }
    }
    loadCategories();
  }, [categoryId]);

  const handleCreate = async () => {
    if (!activity.trim() || !categoryId) {
      return;
    }

    setLoading(true);
    try {
      await onCreateTask({
        activity: activity.trim(),
        category_id: categoryId,
        duration_minutes: durationMinutes,
        startNow: false,
      });
      
      // Reset form but keep category and duration
      setActivity("");
      inputRef.current?.focus();
    } catch (error: any) {
      console.error("Failed to create task:", error);
      alert(error.message || "Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading && activity.trim() && categoryId) {
        handleCreate();
      }
    }
  };

  return (
    <Card className="mb-4 border-border/40 shadow-sm rounded-2xl">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full space-y-2">
            <Label htmlFor="quick-task-input" className="text-xs text-muted-foreground">
              Create New Task
            </Label>
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                id="quick-task-input"
                type="text"
                placeholder="Type task name and press Enter..."
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="rounded-xl flex-1"
                autoFocus
              />
              {showDuration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    min={5}
                    max={480}
                    step={5}
                    disabled={loading}
                    className="w-20 rounded-xl"
                    placeholder="30"
                  />
                  <span className="text-xs text-muted-foreground">min</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <CategoryPicker
                selectedCategoryId={categoryId}
                onSelect={(id) => setCategoryId(id)}
                disabled={loading}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDuration(!showDuration)}
                className="text-xs"
              >
                <Clock className="h-3 w-3 mr-1" />
                {showDuration ? "Hide" : "Custom"} Duration
              </Button>
            </div>
          </div>
          <Button
            onClick={handleCreate}
            disabled={loading || !activity.trim() || !categoryId}
            className="rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

