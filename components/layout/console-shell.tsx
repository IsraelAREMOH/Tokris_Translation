"use client";

import type { ReactNode } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { ToastProvider } from "@/components/admin/toast-provider";
import { ConsoleMobileNav } from "@/components/layout/console-mobile-nav";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";
import { Link, usePathname } from "@/i18n/navigation";

type ConsoleLink = { href: string; label: string };
type ConsoleNavGroup = { label: string; links: ConsoleLink[] };
type ConsoleNavItem = ConsoleLink | ConsoleNavGroup;

function isGroup(item: ConsoleNavItem): item is ConsoleNavGroup {
  return "links" in item;
}

function isLink(item: ConsoleNavItem): item is ConsoleLink {
  return !isGroup(item);
}

function NavLink({ link, active }: { link: ConsoleLink; active: boolean }) {
  return (
    <Link
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
}

export function ConsoleShell({
  title,
  links,
  children,
}: {
  title: string;
  links: ConsoleNavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ConfirmDialogProvider>
    <div className="flex min-h-dvh">
      <aside className="hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-border bg-surface px-4 py-6 md:flex">
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
        <nav aria-label={title} className="mt-7 flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            {links.filter(isLink).map((link) => (
              <NavLink
                key={link.href}
                link={link}
                active={pathname === link.href}
              />
            ))}
          </div>
          {links.filter(isGroup).map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <p className="px-3 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/70">
                {group.label}
              </p>
              {group.links.map((link) => (
                <NavLink
                  key={link.href}
                  link={link}
                  active={pathname === link.href}
                />
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2">
            <ConsoleMobileNav key={pathname} links={links} title={title} />
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <div className="hidden md:block">
              <SignOutButton />
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 sm:px-8">{children}</main>
      </div>

      <ToastProvider />
    </div>
    </ConfirmDialogProvider>
  );
}
