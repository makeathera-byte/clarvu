"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

interface ThemeInitializerProps {
  theme: string | null;
}

/**
 * Initializes theme from database preference on mount
 */
export function ThemeInitializer({ theme }: ThemeInitializerProps) {
  const { setTheme } = useTheme();

  useEffect(() => {
    if (theme && (theme === "light" || theme === "dark" || theme === "system")) {
      setTheme(theme);
    }
  }, [theme, setTheme]);

  return null;
}

