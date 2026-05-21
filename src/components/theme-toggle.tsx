"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/components/theme-provider";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      aria-label="Toggle color theme"
      aria-pressed={theme === "dark"}
      className={className ?? "kp-icon-button"}
      onClick={toggleTheme}
      suppressHydrationWarning
      type="button"
    >
      <Moon className="kp-theme-toggle-icon kp-theme-toggle-icon--moon size-4" />
      <Sun className="kp-theme-toggle-icon kp-theme-toggle-icon--sun size-4" />
    </button>
  );
}
