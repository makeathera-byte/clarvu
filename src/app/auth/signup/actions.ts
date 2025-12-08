'use server';

import { createClient } from '@/lib/supabase/server';

export interface SignupFormData {
    fullName: string;
    email: string;
    password: string;
    themeName: string;
    country: string;
    timezone: string;
}

export interface SignupResult {
    success: boolean;
    error?: string;
}

export async function signUpAction(formData: SignupFormData): Promise<SignupResult> {
    const supabase = await createClient();

    // Validate input
    if (!formData.email || !formData.password || !formData.fullName) {
        return { success: false, error: 'All fields are required' };
    }

    if (formData.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
            data: {
                full_name: formData.fullName,
                theme_name: formData.themeName,
                country: formData.country,
                timezone: formData.timezone,
            },
        },
    });

    if (error) {
        return { success: false, error: error.message };
    }

    if (!data.user) {
        return { success: false, error: 'Signup failed - no user returned' };
    }

    // The database trigger will automatically create default categories
    // We'll wait a moment for the trigger to complete, then create/update the profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // Upsert the profile with all signup fields (creates if doesn't exist, updates if it does)
    const profileData = {
        id: data.user.id,
        full_name: formData.fullName,
        theme_name: formData.themeName,
        country: formData.country,
        timezone: formData.timezone,
        onboarding_complete: false,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData as any, {
            onConflict: 'id'
        });

    if (profileError) {
        console.error('Profile upsert error:', profileError);
        return { success: false, error: `Failed to create profile: ${profileError.message}` };
    }

    // Verify default categories were created, create them if not (fallback)
    const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', data.user.id)
        .limit(1);

    if (categoriesError) {
        console.error('Error checking categories:', categoriesError);
        // Don't fail signup if category check fails, but log it
    } else if (!categories || categories.length === 0) {
        console.warn('Default categories not created by trigger, creating manually');
        // Create 8 business-focused default categories
        const defaultCategories = [
            { user_id: data.user.id, name: 'Business', color: '#2563eb', type: 'growth', is_default: true },
            { user_id: data.user.id, name: 'Growth', color: '#22c55e', type: 'growth', is_default: true },
            { user_id: data.user.id, name: 'Product / Build', color: '#8b5cf6', type: 'delivery', is_default: true },
            { user_id: data.user.id, name: 'Operations / Admin', color: '#6b7280', type: 'admin', is_default: true },
            { user_id: data.user.id, name: 'Learning / Skill', color: '#4f46e5', type: 'personal', is_default: true },
            { user_id: data.user.id, name: 'Personal / Health', color: '#facc15', type: 'personal', is_default: true },
            { user_id: data.user.id, name: 'Routine', color: '#fb923c', type: 'necessity', is_default: true },
            { user_id: data.user.id, name: 'Waste / Distraction', color: '#ef4444', type: 'waste', is_default: true },
        ];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: insertError } = await supabase
            .from('categories')
            .insert(defaultCategories as any);

        if (insertError) {
            console.error('Error creating default categories:', insertError);
            // Don't fail signup if category creation fails, but log it
        }
    }

    // Return success - let the client handle the verification modal
    return { success: true };
}
