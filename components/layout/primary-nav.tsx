"use client";

import { Link, usePathname } from "@/i18n/navigation";

type NavItem = { href: string; label: string };

/** Desktop nav — split out from SiteHeader (a server component fetching
 * translations) purely so it can call usePathname() for active-state
 * highlighting, the same "pass pre-translated labels down as props" split
 * MobileNav already uses. */
export function PrimaryNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-3.5 py-2 text-sm font-medium transition-transform duration-200 ease-spring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-95 ${
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
  );
}
