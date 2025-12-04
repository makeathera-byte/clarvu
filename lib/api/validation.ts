import { z } from "zod";

/**
 * Validation schemas for API endpoints
 */

// Logs
export const startLogSchema = z.object({
  activity: z.string().min(1, "Activity is required").max(500),
  category_id: z.string().uuid("Invalid category ID"),
});

export const endLogSchema = z.object({
  logId: z.string().uuid("Invalid log ID"),
});

export const createTaskSchema = z.object({
  activity: z.string().min(1, "Activity is required").max(500),
  category_id: z.string().uuid("Invalid category ID"),
  start_time: z.string().datetime("Invalid start time").optional(),
  duration_minutes: z.number().int().min(5).max(480).default(30),
  startNow: z.boolean().optional(),
});

export const startTaskSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
});

export const endTaskSchema = z.object({
  taskId: z.string().uuid("Invalid task ID"),
  endedAt: z.string().datetime("Invalid end time").optional(),
});

export const rangeQuerySchema = z.object({
  start: z.string().datetime("Invalid start date"),
  end: z.string().datetime("Invalid end date"),
});

// Categories
export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format (must be hex)"),
  icon: z.string().max(10).optional(),
  business_type: z.enum(["growth", "delivery", "admin", "personal", "necessity", "waste", "revenue", "learning", "break", "other"]).optional(),
});

// Settings
export const updateSettingsSchema = z.object({
  reminder_interval: z.number().int().min(15).max(60),
});

// AI Summaries (internal use)
export const dailySummarySchema = z.object({
  user_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  summary: z.string(),
  focus_score: z.number().int().min(0).max(100).nullable(),
  insights: z.string().nullable().optional(),
});

export const weeklySummarySchema = z.object({
  user_id: z.string().uuid(),
  week_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  summary: z.string(),
  insights: z.string().nullable().optional(),
});

export const monthlySummarySchema = z.object({
  user_id: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  summary: z.string(),
  insights: z.string().nullable().optional(),
});

