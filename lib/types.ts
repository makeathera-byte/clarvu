/**
 * Shared TypeScript types for DayFlow
 * Centralized type definitions for consistency across the codebase
 */

import { Database } from "./supabase/database.types";

// Activity Log types
export interface ActivityLog {
  id: string;
  user_id: string;
  activity: string;
  start_time: string;
  end_time: string | null;
  category_id: string | null;
  created_at?: string;
  updated_at?: string;
  categories?: Category | null;
}

// Category types
export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  user_id: string | null;
  created_at?: string;
  updated_at?: string;
  business_type?: "revenue" | "admin" | "learning" | "personal" | "break" | "other" | null;
}

// User Settings types
export interface UserSettings {
  id?: string;
  user_id: string;
  reminder_interval?: number;
  notifications_enabled?: boolean;
  smart_reminders_enabled?: boolean;
  min_reminder_interval_minutes?: number;
  max_reminder_interval_minutes?: number;
  quiet_hours_start?: string | null;
  quiet_hours_end?: string | null;
  reminder_mode?: "low" | "medium" | "high";
  created_at?: string;
  updated_at?: string;
}

// AI Summary types
export interface DailySummary {
  id: string;
  user_id: string;
  date: string;
  summary: string | null;
  focus_score: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface WeeklySummary {
  id: string;
  user_id: string;
  week_start: string;
  summary: string | null;
  insights: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MonthlySummary {
  id: string;
  user_id: string;
  month: string;
  summary: string | null;
  insights: string | null;
  created_at?: string;
  updated_at?: string;
}

// Business Insights types
export interface BusinessInsights {
  revenueTime: {
    total_revenue_minutes: number;
    percentage_of_day: number;
  };
  adminTime: {
    total_admin_minutes: number;
    admin_ratio: number;
  };
  contextSwitches: number;
  highImpactTasks: ActivityLog[];
  roiScore: {
    average_daily_score: number;
    trend?: "up" | "down" | "stable";
  };
}

// Routine types
export interface Routine {
  routine: {
    morning: RoutineBlock[];
    afternoon: RoutineBlock[];
    evening: RoutineBlock[];
  };
  explanation: string;
}

export interface RoutineBlock {
  type: "deep_work" | "shallow_work" | "admin" | "break" | "learning" | "meeting";
  start: string;
  end: string;
}

// Activity Event types (for monitoring)
export interface ActivityEvent {
  isIdle: boolean;
  lastActiveAt: Date;
  activeTab: string;
  likelyContext: string | null;
  windowFocused: boolean;
}

// Reminder types
export interface ReminderSettings {
  notifications_enabled: boolean;
  smart_reminders_enabled: boolean;
  min_reminder_interval_minutes: number;
  max_reminder_interval_minutes: number;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  reminder_interval?: number;
}

// Context detection types
export interface DetectedContext {
  likelyTask: string | null;
  categoryId: string | null;
  confidence: number; // 0-100
}

// Smart suggestion types
export interface SmartSuggestion {
  activity: string;
  categoryId: string | null;
  confidence: number; // 0-100
  source: "context" | "history" | "time_of_day" | "idle" | "default";
}

// Logs summary (for reminders)
export interface LogsSummary {
  lastLogTime: string | null;
  logsTodayCount: number;
  lastActivity: string | null;
  lastCategory: string | null;
  hasLogsToday: boolean;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper: Extract types from Supabase if available
export type DatabaseActivityLog = Database["public"]["Tables"]["activity_logs"]["Row"];
export type DatabaseCategory = Database["public"]["Tables"]["categories"]["Row"];

