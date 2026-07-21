import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Link } from "@/i18n/navigation";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(48rem_34rem_at_80%_-8%,rgb(56_152_139/0.15),transparent_62%),radial-gradient(40rem_28rem_at_-8%_108%,rgb(208_145_62/0.11),transparent_62%)]"
      />
      <div
        aria-hidden
        className="bg-noise absolute inset-0 -z-10 opacity-[0.04]"
      />
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-[-0.02em] text-foreground transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500 active:translate-y-0"
        >
          TOKRIS
          <span className="text-brand-600 dark:text-brand-400">.</span>
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-floating p-8 shadow-floating">
          {children}
        </div>
      </main>
    </div>
  );
}
