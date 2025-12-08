'use server';

import { createClient } from '@/lib/supabase/server';

interface Category {
    id: string;
    name: string;
    created_at: string;
}

export async function cleanupDuplicateCategories(): Promise<{ success: boolean; deleted: number; error?: string }> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, deleted: 0, error: 'Not authenticated' };
    }

    try {
        // Fetch all categories for the user, ordered by creation date
        const { data: categories, error: fetchError } = await (supabase as any)
            .from('categories')
            .select('id, name, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (fetchError) {
            return { success: false, deleted: 0, error: fetchError.message };
        }

        if (!categories || categories.length === 0) {
            return { success: true, deleted: 0 };
        }

        // Find duplicates - keep first occurrence of each name
        const seen = new Set<string>();
        const idsToDelete: string[] = [];

        for (const cat of categories as Category[]) {
            const normalizedName = cat.name.toLowerCase().trim();
            if (seen.has(normalizedName)) {
                idsToDelete.push(cat.id);
            } else {
                seen.add(normalizedName);
            }
        }

        if (idsToDelete.length === 0) {
            return { success: true, deleted: 0 };
        }

        // Delete duplicates
        const { error: deleteError } = await (supabase as any)
            .from('categories')
            .delete()
            .in('id', idsToDelete);

        if (deleteError) {
            return { success: false, deleted: 0, error: deleteError.message };
        }

        return { success: true, deleted: idsToDelete.length };
    } catch (e) {
        return { success: false, deleted: 0, error: 'Unexpected error' };
    }
}
