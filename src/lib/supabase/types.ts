// Database types for Clarvu
// Generated from Supabase schema

export type CategoryType = 'business' | 'growth' | 'product' | 'admin' | 'learning' | 'personal' | 'routine' | 'waste';
export type TaskStatus = 'scheduled' | 'in_progress' | 'completed';

export interface Profile {
    id: string;
    full_name: string | null;
    theme_name: string;
    wallpaper_url: string | null;
    primary_color: string;
    accent_color: string;
    onboarding_complete: boolean;
    is_admin: boolean;
    last_login: string | null;
    country: string | null;
    timezone: string | null;
    avatar_url: string | null;
    provider: string;
    created_at: string;
    updated_at: string;
}

export interface Category {
    id: string;
    user_id: string;
    name: string;
    color: string;
    type: CategoryType;
    is_default: boolean;
    created_at: string;
}

export interface Task {
    id: string;
    user_id: string;
    title: string;
    category_id: string | null;
    status: TaskStatus;
    start_time: string | null;
    end_time: string | null;
    duration_minutes: number | null;
    created_at: string;
    updated_at: string;
}

export interface ActiveTimer {
    id: string;
    task_id: string;
    user_id: string;
    started_at: string;
    ends_at: string | null;
    remaining_seconds: number | null;
    is_running: boolean;
    created_at: string;
}

export interface AnalyticsEvent {
    id: string;
    user_id: string;
    event_type: string;
    details: Record<string, unknown> | null;
    created_at: string;
}

export interface UserIntegration {
    id: string;
    user_id: string;
    provider: 'google_calendar';
    access_token: string | null;
    refresh_token: string | null;
    token_expiry: string | null;
    created_at: string;
    updated_at: string;
}

export interface CalendarEvent {
    id: string;
    user_id: string;
    external_id: string | null;
    title: string | null;
    description: string | null;
    start_time: string | null;
    end_time: string | null;
    source: string;
    created_at: string;
}

// Database schema type for Supabase client
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: Omit<Profile, 'created_at' | 'updated_at'> & {
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    full_name?: string | null;
                    theme_name?: string;
                    wallpaper_url?: string | null;
                    primary_color?: string;
                    accent_color?: string;
                    onboarding_complete?: boolean;
                    is_admin?: boolean;
                    last_login?: string | null;
                    country?: string | null;
                    timezone?: string | null;
                    avatar_url?: string | null;
                    provider?: string;
                    updated_at?: string;
                };
            };
            categories: {
                Row: Category;
                Insert: Omit<Category, 'id' | 'created_at'> & {
                    id?: string;
                    created_at?: string;
                };
                Update: Partial<Omit<Category, 'id' | 'user_id'>>;
            };
            tasks: {
                Row: Task;
                Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'> & {
                    id?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Omit<Task, 'id' | 'user_id'>>;
            };
            active_timers: {
                Row: ActiveTimer;
                Insert: Omit<ActiveTimer, 'id' | 'created_at'> & {
                    id?: string;
                    created_at?: string;
                };
                Update: Partial<Omit<ActiveTimer, 'id' | 'user_id'>>;
            };
            analytics_events: {
                Row: AnalyticsEvent;
                Insert: Omit<AnalyticsEvent, 'id' | 'created_at'> & {
                    id?: string;
                    created_at?: string;
                };
                Update: Partial<Omit<AnalyticsEvent, 'id' | 'user_id'>>;
            };
            user_integrations: {
                Row: UserIntegration;
                Insert: Omit<UserIntegration, 'id' | 'created_at' | 'updated_at'> & {
                    id?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: Partial<Omit<UserIntegration, 'id' | 'user_id'>>;
            };
            calendar_events: {
                Row: CalendarEvent;
                Insert: Omit<CalendarEvent, 'id' | 'created_at'> & {
                    id?: string;
                    created_at?: string;
                };
                Update: Partial<Omit<CalendarEvent, 'id' | 'user_id'>>;
            };
        };
    };
}
