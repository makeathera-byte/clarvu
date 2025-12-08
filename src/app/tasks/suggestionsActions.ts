'use server';

import { createClient } from '@/lib/supabase/server';

export interface TaskSuggestion {
    id: string;
    text: string;
    category_id: string | null;
    frequency: number;
    is_global: boolean;
}

export interface GetSuggestionsResult {
    suggestions: TaskSuggestion[];
    error?: string;
}

export interface RecordSuggestionResult {
    success: boolean;
    error?: string;
}

/**
 * Get task suggestions for the current user
 * Includes global suggestions + user's personal suggestions
 * Filtered by query and optionally by category
 * Sorted by relevance, frequency, and time-of-day weighting
 */
export async function getSuggestionsForUser(
    query: string = '',
    categoryId?: string
): Promise<GetSuggestionsResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    console.log('[getSuggestionsForUser] User:', user?.id);
    if (!user) {
        console.log('[getSuggestionsForUser] No user, returning empty');
        return { suggestions: [] };
    }

    try {
        // Build query - use 'as any' to fix Supabase type inference issues
        const { data, error } = await (supabase as any)
            .from('task_suggestions')
            .select('id, text, category_id, frequency, is_global')
            .or(`user_id.eq.${user.id},is_global.eq.true`);

        if (error) {
            console.error('Error fetching suggestions:', error);
            return { suggestions: [], error: error.message };
        }

        if (!data || data.length === 0) {
            return { suggestions: [] };
        }

        // Cast data to our type
        const typedData = data as Array<{
            id: string;
            text: string;
            category_id: string | null;
            frequency: number;
            is_global: boolean;
        }>;

        // Filter by query (case-insensitive partial match)
        const queryLower = query.toLowerCase().trim();
        let filtered = typedData;

        if (queryLower) {
            filtered = typedData.filter(s =>
                s.text.toLowerCase().includes(queryLower)
            );
        }

        // Filter by category if provided
        if (categoryId) {
            filtered = filtered.filter(s => s.category_id === categoryId);
        }

        // Apply time-of-day weighting
        const timeWeight = getTimeOfDayWeight();
        const weighted = filtered.map(s => ({
            ...s,
            score: calculateScore(s as TaskSuggestion, queryLower, timeWeight)
        }));

        // Sort by score (higher is better)
        weighted.sort((a, b) => b.score - a.score);

        // Return top 10 suggestions
        const result: TaskSuggestion[] = weighted.slice(0, 10).map(({ score, ...s }) => s as TaskSuggestion);
        return { suggestions: result };
    } catch (error) {
        console.error('Unexpected error in getSuggestionsForUser:', error);
        return { suggestions: [], error: 'Failed to fetch suggestions' };
    }
}

/**
 * Record that a user used a suggestion (or created a new task)
 * If suggestion exists: increment frequency and update last_used
 * If new: create user suggestion
 */
export async function recordSuggestionUse(
    text: string,
    categoryId?: string | null
): Promise<RecordSuggestionResult> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const textTrimmed = text.trim();
        if (!textTrimmed) {
            return { success: false, error: 'Empty text' };
        }

        // Check if suggestion already exists for this user
        const { data: existing } = await (supabase as any)
            .from('task_suggestions')
            .select('id, frequency')
            .eq('user_id', user.id)
            .eq('text', textTrimmed)
            .maybeSingle();

        if (existing) {
            // Update existing suggestion
            const { error } = await (supabase as any)
                .from('task_suggestions')
                .update({
                    frequency: existing.frequency + 1,
                    last_used: new Date().toISOString(),
                    category_id: categoryId || null,
                })
                .eq('id', existing.id);

            if (error) {
                return { success: false, error: error.message };
            }
        } else {
            // Create new user suggestion
            const { error } = await (supabase as any)
                .from('task_suggestions')
                .insert({
                    user_id: user.id,
                    text: textTrimmed,
                    category_id: categoryId || null,
                    frequency: 1,
                    is_global: false,
                });

            if (error) {
                return { success: false, error: error.message };
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Error recording suggestion use:', error);
        return { success: false, error: 'Failed to record suggestion' };
    }
}

/**
 * Calculate relevance score for a suggestion
 * Higher score = more relevant
 */
function calculateScore(
    suggestion: TaskSuggestion,
    query: string,
    timeWeight: Record<string, number>
): number {
    let score = 0;

    const textLower = suggestion.text.toLowerCase();

    // Exact match bonus
    if (textLower === query) {
        score += 1000;
    }

    // Starts-with bonus
    if (textLower.startsWith(query)) {
        score += 500;
    }

    // Contains bonus
    if (textLower.includes(query)) {
        score += 100;
    }

    // Frequency bonus (user suggestions get higher weight)
    if (!suggestion.is_global) {
        score += suggestion.frequency * 10;
    } else {
        score += suggestion.frequency * 2;
    }

    // Time-of-day bonus (based on suggestion text keywords)
    for (const [keyword, weight] of Object.entries(timeWeight)) {
        if (textLower.includes(keyword)) {
            score += weight;
        }
    }

    return score;
}

/**
 * Get time-of-day weighting for suggestions
 * Returns keyword weights based on current time
 */
function getTimeOfDayWeight(): Record<string, number> {
    const hour = new Date().getHours();

    // Morning (6 AM - 11 AM)
    if (hour >= 6 && hour < 12) {
        return {
            'gym': 50,
            'workout': 50,
            'planning': 40,
            'code': 40,
            'build': 40,
            'study': 30,
        };
    }

    // Afternoon (12 PM - 5 PM)
    if (hour >= 12 && hour < 18) {
        return {
            'client': 50,
            'meeting': 50,
            'delivery': 40,
            'call': 40,
            'email': 30,
            'support': 30,
        };
    }

    // Evening (6 PM - 11 PM)
    if (hour >= 18 && hour < 24) {
        return {
            'edit': 50,
            'content': 50,
            'learning': 40,
            'study': 40,
            'journal': 30,
            'meditation': 30,
        };
    }

    // Night/Early morning (12 AM - 5 AM)
    return {
        'sleep': 50,
        'rest': 40,
    };
}
