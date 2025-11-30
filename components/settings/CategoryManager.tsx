"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCategories, createCategory, deleteCategory } from "@/app/dashboard/category-actions";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  user_id: string | null;
}

const PRESET_COLORS = [
  "#4f46e5", // indigo
  "#1d4ed8", // blue
  "#6b7280", // gray
  "#14b8a6", // teal
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#10b981", // green
  "#f97316", // orange
  "#ec4899", // pink
];

export function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(PRESET_COLORS[0]);
  const [newCategoryIcon, setNewCategoryIcon] = useState("");
  const [newCategoryBusinessType, setNewCategoryBusinessType] = useState<
    "revenue" | "admin" | "learning" | "personal" | "break" | "other"
  >("other");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const { categories: cats } = await getCategories();
    setCategories(cats || []);
    setLoading(false);
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    setCreating(true);
    try {
      const result = await createCategory(
        newCategoryName.trim(),
        newCategoryColor,
        newCategoryIcon || undefined,
        newCategoryBusinessType
      );
      if (result?.category) {
        setNewCategoryName("");
        setNewCategoryIcon("");
        setNewCategoryBusinessType("other");
        setShowAddForm(false);
        await loadCategories();
      }
    } catch (error) {
      console.error("Failed to create category:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    const result = await deleteCategory(categoryId);
    if (result?.success) {
      await loadCategories();
    }
  };

  const defaultCategories = categories.filter((cat) => cat.user_id === null);
  const userCategories = categories.filter((cat) => cat.user_id !== null);

  return (
    <Card className="border-border/40 shadow-sm rounded-2xl">
      <CardHeader>
        <CardTitle>Categories</CardTitle>
        <CardDescription>
          Manage your activity categories. Default categories cannot be deleted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default Categories */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Default Categories</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {defaultCategories.map((category: Category) => (
              <div
                key={category.id}
                className="flex items-center gap-3 rounded-xl border border-border/40 p-3"
              >
                <div
                  className="h-4 w-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <span className="flex-1 text-sm font-medium">{category.name}</span>
                {category.icon && <span className="text-base">{category.icon}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* User Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground">Your Categories</h3>
            {!showAddForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(true)}
                className="rounded-xl"
              >
                Add Category
              </Button>
            )}
          </div>

          {userCategories.length === 0 && !showAddForm && (
            <p className="text-sm text-muted-foreground py-4">
              No custom categories yet. Create one to get started.
            </p>
          )}

          {userCategories.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2 mb-4">
              {userCategories.map((category: Category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 rounded-xl border border-border/40 p-3 group"
                >
                  <div
                    className="h-4 w-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="flex-1 text-sm font-medium">{category.name}</span>
                  {category.icon && <span className="text-base">{category.icon}</span>}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCategory(category.id)}
                    className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add Category Form */}
          {showAddForm && (
            <div className="rounded-xl border border-border/40 bg-muted/20 p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Exercise"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCategoryColor(color)}
                      className={cn(
                        "h-8 w-8 rounded-lg border-2 transition-all",
                        newCategoryColor === color
                          ? "border-foreground scale-110"
                          : "border-border/40 hover:border-border"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category-icon">Icon (Optional - Emoji)</Label>
                <Input
                  id="category-icon"
                  value={newCategoryIcon}
                  onChange={(e) => setNewCategoryIcon(e.target.value)}
                  placeholder="🏃"
                  maxLength={2}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-type">Business Type</Label>
                <Select
                  value={newCategoryBusinessType}
                  onValueChange={(value: any) => setNewCategoryBusinessType(value)}
                >
                  <SelectTrigger id="business-type" className="w-full rounded-xl">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="learning">Learning</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="break">Break</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Used for business insights and ROI calculations
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateCategory}
                  disabled={creating || !newCategoryName.trim()}
                  className="flex-1 rounded-xl"
                >
                  {creating ? "Creating..." : "Create Category"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewCategoryName("");
                    setNewCategoryIcon("");
                    setNewCategoryBusinessType("other");
                  }}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

