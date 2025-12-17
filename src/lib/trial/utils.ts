/**
 * Trial System Utilities
 * 
 * Helper functions for managing and checking 14-day free trial status
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Get the number of days remaining in the trial
 * Returns 0 if trial has expired or doesn't exist
 */
export async function getTrialDaysRemaining(userId: string): Promise<number> {
    try {
        const supabase = await createClient();

        const { data, error } = await (supabase as any)
            .from('profiles')
            .select('trial_end')
            .eq('id', userId)
            .maybeSingle();

        if (error || !data || !data.trial_end) {
            return 0;
        }

        const now = new Date();
        const trialEnd = new Date(data.trial_end);
        const diffTime = trialEnd.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return Math.max(0, diffDays);
    } catch (error) {
        console.error('Error calculating trial days:', error);
        return 0;
    }
}

/**
 * Check if user's trial is currently active
 * Returns false if trial has expired or doesn't exist
 */
export async function isTrialActive(userId: string): Promise<boolean> {
    try {
        const supabase = await createClient();

        const { data, error } = await (supabase as any)
            .from('profiles')
            .select('trial_end')
            .eq('id', userId)
            .maybeSingle();

        if (error || !data || !data.trial_end) {
            return false;
        }

        const now = new Date();
        const trialEnd = new Date(data.trial_end);

        return trialEnd > now;
    } catch (error) {
        console.error('Error checking trial status:', error);
        return false;
    }
}

/**
 * Check if user's trial has expired
 * Returns true only if trial_end exists and is in the past
 */
export async function hasTrialExpired(userId: string): Promise<boolean> {
    try {
        const supabase = await createClient();

        const { data, error } = await (supabase as any)
            .from('profiles')
            .select('trial_end')
            .eq('id', userId)
            .maybeSingle();

        if (error || !data || !data.trial_end) {
            return false;
        }

        const now = new Date();
        const trialEnd = new Date(data.trial_end);

        return trialEnd <= now;
    } catch (error) {
        console.error('Error checking trial expiration:', error);
        return false;
    }
}

/**
 * Get trial end date for a user
 * Returns null if no trial exists
 */
export async function getTrialEndDate(userId: string): Promise<Date | null> {
    try {
        const supabase = await createClient();

        const { data, error } = await (supabase as any)
            .from('profiles')
            .select('trial_end')
            .eq('id', userId)
            .maybeSingle();

        if (error || !data || !data.trial_end) {
            return null;
        }

        return new Date(data.trial_end);
    } catch (error) {
        console.error('Error getting trial end date:', error);
        return null;
    }
}
