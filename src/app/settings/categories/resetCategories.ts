'use server';

import { createClient } from '@/lib/supabase/server';

// Default categories for new users (8 categories)
const NEW_CATEGORIES = [
    { name: 'Business', color: '#2563eb', type: 'growth', is_default: true },
    { name: 'Growth', color: '#22c55e', type: 'growth', is_default: true },
    { name: 'Product / Build', color: '#8b5cf6', type: 'delivery', is_default: true },
    { name: 'Operations / Admin', color: '#6b7280', type: 'admin', is_default: true },
    { name: 'Learning / Skill', color: '#4f46e5', type: 'personal', is_default: true },
    { name: 'Personal / Health', color: '#facc15', type: 'personal', is_default: true },
    { name: 'Routine', color: '#fb923c', type: 'necessity', is_default: true },
    { name: 'Waste / Distraction', color: '#ef4444', type: 'waste', is_default: true },
];

export async function resetToDefaultCategories() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        // Delete all existing categories for this user
        await (supabase as any)
            .from('categories')
            .delete()
            .eq('user_id', user.id);

        // Insert new default categories
        const categoriesToInsert = NEW_CATEGORIES.map(cat => ({
            ...cat,
            user_id: user.id,
        }));

        const { error } = await (supabase as any)
            .from('categories')
            .insert(categoriesToInsert);

        if (error) {
            console.error('Error inserting categories:', error);
            return { success: false, error: error.message };
        }

        return { success: true, message: 'Categories reset to defaults' };
    } catch (error) {
        console.error('Error resetting categories:', error);
        return { success: false, error: 'Failed to reset categories' };
    }
}
