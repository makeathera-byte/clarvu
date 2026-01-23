/**
 * Environment variable validation and type-safe access
 * Validates required environment variables at runtime
 */

interface EnvConfig {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: string;
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
}

function validateEnv(): EnvConfig {
    const errors: string[] = [];

    // Check required environment variables
    if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        errors.push('NEXT_PUBLIC_GOOGLE_CLIENT_ID is required');
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        errors.push('NEXT_PUBLIC_SUPABASE_URL is required');
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is required');
    }

    // In development, throw errors immediately
    if (process.env.NODE_ENV === 'development' && errors.length > 0) {
        throw new Error(
            `Missing required environment variables:\n${errors.map(e => `  - ${e}`).join('\n')}`
        );
    }

    // In production, log errors but don't crash
    if (process.env.NODE_ENV === 'production' && errors.length > 0) {
        console.error('⚠️ Missing required environment variables:');
        errors.forEach(error => console.error(`  - ${error}`));
    }

    return {
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    };
}

// Export validated environment config
export const env = validateEnv();

// Type-safe getters for specific variables
export const getGoogleClientId = (): string => env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
export const getSupabaseUrl = (): string => env.NEXT_PUBLIC_SUPABASE_URL;
export const getSupabaseAnonKey = (): string => env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
