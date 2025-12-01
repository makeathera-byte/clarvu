import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Log warning instead of throwing - allows build to continue
    console.warn(
      "Missing Supabase environment variables. Please create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. See SETUP.md for instructions."
    );
    // Return a minimal mock that prevents errors but won't work
    // Server components should check for this case
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ select: () => ({ data: null, error: null }) }),
        update: () => ({ eq: () => ({ data: null, error: null }) }),
      }),
    } as any;
  }

  // Validate URL format
  try {
    const url = new URL(supabaseUrl);
    if (!url.hostname.includes('supabase.co')) {
      console.warn("⚠️ Supabase URL doesn't look correct:", supabaseUrl);
    }
  } catch (e) {
    console.error("❌ Invalid Supabase URL format:", supabaseUrl);
  }

  const cookieStore = await cookies();

  try {
    return createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
  } catch (error: any) {
    console.error("❌ Failed to create Supabase client:", error.message);
    // Return mock client to prevent crashes
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: { message: "Supabase connection failed" } }),
      },
      from: () => ({
        select: () => ({ data: [], error: { message: "Supabase connection failed" } }),
        insert: () => ({ select: () => ({ data: null, error: { message: "Supabase connection failed" } }) }),
        update: () => ({ eq: () => ({ data: null, error: { message: "Supabase connection failed" } }) }),
      }),
    } as any;
  }
}

