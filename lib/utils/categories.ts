/**
 * Category utility functions
 * Common category operations and mappings
 */

import { Category } from "@/lib/types";

/**
 * Get category color with fallback
 */
export function getCategoryColor(category: Category | null | undefined, fallback = "#6b7280"): string {
  return category?.color || fallback;
}

/**
 * Get category name with fallback
 */
export function getCategoryName(category: Category | null | undefined, fallback = "Uncategorized"): string {
  return category?.name || fallback;
}

/**
 * Infer business type from category name
 */
export function inferBusinessType(categoryName: string | undefined | null): "revenue" | "admin" | "learning" | "personal" | "break" | "other" {
  if (!categoryName) return "other";
  
  const lowerName = categoryName.toLowerCase();
  
  if (lowerName.includes("work") || lowerName.includes("deep work") || 
      lowerName.includes("coding") || lowerName.includes("design") || 
      lowerName.includes("writing")) {
    return "revenue";
  }
  
  if (lowerName.includes("admin") || lowerName.includes("email") || 
      lowerName.includes("meeting") || lowerName.includes("planning")) {
    return "admin";
  }
  
  if (lowerName.includes("learning") || lowerName.includes("study")) {
    return "learning";
  }
  
  if (lowerName.includes("personal") || lowerName.includes("social") || 
      lowerName.includes("entertainment")) {
    return "personal";
  }
  
  if (lowerName.includes("break") || lowerName.includes("lunch") || 
      lowerName.includes("rest")) {
    return "break";
  }
  
  return "other";
}

/**
 * Get business type from category
 */
export function getBusinessType(category: Category | null | undefined): "revenue" | "admin" | "learning" | "personal" | "break" | "other" {
  if (category?.business_type) {
    return category.business_type;
  }
  return inferBusinessType(category?.name);
}

/**
 * Default category colors
 */
export const DEFAULT_CATEGORY_COLORS = {
  work: "#3b82f6",
  "deep work": "#8b5cf6",
  admin: "#f59e0b",
  personal: "#10b981",
  break: "#ef4444",
  learning: "#06b6d4",
  waste: "#6b7280",
  other: "#9ca3af",
} as const;

/**
 * Get default color for category name
 */
export function getDefaultCategoryColor(categoryName: string): string {
  const lowerName = categoryName.toLowerCase();
  for (const [key, color] of Object.entries(DEFAULT_CATEGORY_COLORS)) {
    if (lowerName.includes(key)) {
      return color;
    }
  }
  return DEFAULT_CATEGORY_COLORS.other;
}

