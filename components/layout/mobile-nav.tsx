"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Link, usePathname } from "@/i18n/navigation";

type NavItem = { href: string; label: string };

export function MobileNav({
  items,
  loginLabel,
  quoteLabel,
  openLabel,
  closeLabel,
}: {
  items: NavItem[];
  loginLabel: string;
  quoteLabel: string;
  openLabel: string;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever a navigation completes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? closeLabel : openLabel}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-90"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div
        id="mobile-nav"
        className={`fixed inset-x-0 top-16 z-40 origin-top border-b border-border bg-floating px-4 pt-3 pb-6 shadow-floating transition-[transform,opacity] duration-300 ease-spring ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {items.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-transform duration-200 ease-spring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98] ${
                  active
                    ? "bg-brand-600/10 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
          <Link
            href="/login"
            className="rounded-full border border-border bg-surface px-5 py-2.5 text-center text-sm font-medium text-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
          >
            {loginLabel}
          </Link>
          <Link
            href="/quote"
            className="rounded-full bg-brand-600 px-5 py-2.5 text-center text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
          >
            {quoteLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
