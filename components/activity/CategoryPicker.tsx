"use client";

import { useState, useEffect } from "react";
import { getCategories } from "@/app/dashboard/category-actions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  user_id?: string | null;
}

interface CategoryPickerProps {
  selectedCategoryId: string | null;
  onSelect: (categoryId: string) => void;
  disabled?: boolean;
}

export function CategoryPicker({
  selectedCategoryId,
  onSelect,
  disabled = false,
}: CategoryPickerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  
  // Safety check after hooks
  const handleSelect = (categoryId: string) => {
    if (onSelect && typeof onSelect === "function") {
      onSelect(categoryId);
    } else {
      console.error("CategoryPicker: onSelect prop is not a function");
    }
  };

  useEffect(() => {
    async function loadCategories() {
      setLoading(true);
      const { categories: cats } = await getCategories();
      setCategories(cats || []);
      setLoading(false);
    }
    loadCategories();
  }, []);

  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled || loading}
          className={cn(
            "w-full justify-start rounded-xl border-border/40",
            !selectedCategory && "text-muted-foreground"
          )}
        >
          {selectedCategory ? (
            <div className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: selectedCategory.color }}
              />
              <span>{selectedCategory.name}</span>
            </div>
          ) : (
            <span>Select category</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] rounded-xl p-2" align="start">
        <div className="space-y-1">
          {loading ? (
            <div className="p-2 text-sm text-muted-foreground">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="p-2 text-sm text-muted-foreground">No categories found</div>
          ) : (
            categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  handleSelect(category.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/50",
                  selectedCategoryId === category.id && "bg-muted"
                )}
              >
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="flex-1 text-left">{category.name}</span>
                {category.icon && (
                  <span className="text-base">{category.icon}</span>
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

