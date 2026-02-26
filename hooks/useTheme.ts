"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { type Theme, getThemeById, themes } from "@/lib/themes";

interface ThemeContextValue {
  theme: Theme;
  setThemeById: (id: string) => void;
  allThemes: Theme[];
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: themes[0],
  setThemeById: () => {},
  allThemes: themes,
});

export function useThemeContext() {
  return useContext(ThemeContext);
}

export function useThemeProvider() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return themes[0];
    const saved = window.localStorage.getItem("gt-theme");
    return saved ? getThemeById(saved) : themes[0];
  });

  // Apply theme CSS variables whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-gt-bg-base", theme.bg);
    root.style.setProperty("--color-gt-sub-base", theme.sub);
    root.style.setProperty("--color-gt-text-base", theme.text);
    root.style.setProperty("--color-gt-untyped-base", theme.untyped);
    root.style.setProperty("--color-gt-bg", theme.bg);
    root.style.setProperty("--color-gt-sub", theme.sub);
    root.style.setProperty("--color-gt-text", theme.text);
    root.style.setProperty("--color-gt-untyped", theme.untyped);
    root.style.setProperty("--color-gt-error", theme.error);
    root.style.setProperty("--color-gt-extra", theme.extra);
    root.style.setProperty("--color-gt-accent", theme.accent);
    root.style.setProperty("--color-gt-accent2", theme.accent2);
    // Also update the shadcn/tailwind variables that body uses
    root.style.setProperty("--background", theme.bg);
    root.style.setProperty("--foreground", theme.text);
    root.style.setProperty("--card", theme.sub);
    root.style.setProperty("--card-foreground", theme.text);
    root.style.setProperty("--primary", theme.accent);
    root.style.setProperty("--primary-foreground", theme.bg);
    root.style.setProperty("--secondary", theme.sub);
    root.style.setProperty("--secondary-foreground", theme.text);
    root.style.setProperty("--muted", theme.sub);
    root.style.setProperty("--muted-foreground", theme.untyped);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-foreground", theme.bg);
    root.style.setProperty("--destructive", theme.error);
    root.style.setProperty("--ring", theme.accent);
    // Update aurora glow color to match accent
    root.style.setProperty("--aurora-accent", theme.accent);
    root.style.setProperty("--aurora-accent2", theme.accent2);
  }, [theme]);

  const setThemeById = useCallback((id: string) => {
    const t = getThemeById(id);
    setTheme(t);
    localStorage.setItem("gt-theme", id);
  }, []);

  return {
    theme,
    setThemeById,
    allThemes: themes,
  };
}
