"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { categories: [], error: "Unauthorized" };
  }

  // Get global categories (user_id is null) and user-specific categories
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order("user_id", { ascending: true, nullsFirst: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return { categories: [], error: error.message };
  }

  return { categories: data || [] };
}

export async function createCategory(
  name: string,
  color: string,
  icon?: string,
  businessType?: "revenue" | "admin" | "learning" | "personal" | "break" | "other"
) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      name: name.trim(),
      color,
      icon: icon || null,
      business_type: businessType || "other",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { category: data };
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Only allow deleting user's own categories (not global ones)
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error deleting category:", error);
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

