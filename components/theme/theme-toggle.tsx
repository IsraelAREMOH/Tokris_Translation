"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const t = useTranslations("themeToggle");
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? t("toLight") : t("toDark")}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-90"
    >
      {/* Both icons stay mounted; the dark: variants drive the swap so the
          server and client render identical markup (no hydration flash). */}
      <Sun className="absolute h-4 w-4 rotate-0 scale-100 opacity-100 transition-[transform,opacity] duration-300 ease-spring dark:-rotate-90 dark:scale-0 dark:opacity-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 opacity-0 transition-[transform,opacity] duration-300 ease-spring dark:rotate-0 dark:scale-100 dark:opacity-100" />
    </button>
  );
}
