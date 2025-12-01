import { createAdminClient } from "@/lib/supabase/admin";

export async function logSignup(user_id: string, email: string, country?: string) {
  try {
    // Use admin client to bypass RLS for server-side inserts
    const supabase = createAdminClient();
    
    // Check if already logged (prevent duplicates)
    const { data: existing } = await supabase
      .from("signup_events")
      .select("id")
      .eq("user_id", user_id)
      .single();
    
    if (existing) {
      console.log("⚠️ Signup already logged for:", email);
      return;
    }
    
    const signupData: {
      user_id: string;
      email: string;
      signed_up_at: string;
      country?: string;
    } = {
      user_id,
      email,
      signed_up_at: new Date().toISOString(),
    };
    
    // Add country if provided
    if (country && country !== "unknown") {
      signupData.country = country.toUpperCase();
    }
    
    const { error } = await supabase.from("signup_events").insert(signupData);
    
    if (error) {
      console.error("❌ Error logging signup:", error);
      throw error; // Re-throw to see the actual error
    } else {
      console.log("✅ Signup logged successfully:", email, country ? `(country: ${country})` : "");
    }
  } catch (error) {
    // Log the error but don't break the app
    console.error("❌ Error in logSignup function:", error);
    throw error; // Re-throw so callers can see the error
  }
}

