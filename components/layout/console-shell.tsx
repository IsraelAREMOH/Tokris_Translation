"use client";

import type { ReactNode } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Link, usePathname } from "@/i18n/navigation";

type ConsoleLink = { href: string; label: string };

export function ConsoleShell({
  title,
  links,
  children,
}: {
  title: string;
  links: ConsoleLink[];
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 md:flex">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-[-0.02em] text-foreground transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500 active:translate-y-0"
        >
          TOKRIS
          <span className="text-brand-600 dark:text-brand-400">.</span>
        </Link>
        <p className="mt-1.5 text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
          {title}
        </p>
        <nav aria-label={title} className="mt-7 flex flex-col gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-transform duration-200 ease-spring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98] ${
                  active
                    ? "bg-brand-600/10 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
