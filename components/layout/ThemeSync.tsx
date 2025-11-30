"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { createClient } from "@/lib/supabase/client";

/**
 * Syncs theme preference from database on mount
 */
export function ThemeSync() {
  const { setTheme } = useTheme();

  useEffect(() => {
    async function loadTheme() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        const { data: settings } = await supabase
          .from("user_settings")
          .select("theme")
          .eq("user_id", user.id)
          .maybeSingle();

        if (settings?.theme && ["light", "dark", "system"].includes(settings.theme)) {
          setTheme(settings.theme);
        }
      } catch (error) {
        // Silently fail - theme will use default (system)
        console.warn("Failed to load theme preference:", error);
      }
    }

    loadTheme();
  }, [setTheme]);

  return null;
}

