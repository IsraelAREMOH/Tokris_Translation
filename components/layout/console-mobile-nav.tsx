"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Link, usePathname } from "@/i18n/navigation";

type ConsoleLink = { href: string; label: string };
type ConsoleNavGroup = { label: string; links: ConsoleLink[] };
type ConsoleNavItem = ConsoleLink | ConsoleNavGroup;

function isGroup(item: ConsoleNavItem): item is ConsoleNavGroup {
  return "links" in item;
}

/**
 * Console-specific mobile drawer — the public site's MobileNav isn't reused
 * here since it hardcodes "Log in"/"Request a quote" CTAs that make no
 * sense inside an already-authenticated console. Same interaction pattern
 * (hamburger toggle, slide-down drawer) as that component, but renders
 * whatever ConsoleShell's own `links` are (flat or grouped) plus sign-out,
 * matching the desktop sidebar's content exactly.
 *
 * Closing the drawer on navigation is done by ConsoleShell passing
 * `key={pathname}` where this is rendered — that remounts this component
 * fresh (open resets to its initial `false`) on every route change, instead
 * of a useEffect calling setState on pathname change (the pattern the
 * public MobileNav uses, which react-hooks/set-state-in-effect flags).
 */
export function ConsoleMobileNav({
  links,
  title,
}: {
  links: ConsoleNavItem[];
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function linkClass(active: boolean) {
    return `rounded-lg px-3 py-2.5 text-sm font-medium transition-transform duration-200 ease-spring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98] ${
      active
        ? "bg-brand-600/10 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300"
        : "text-muted-foreground hover:text-foreground"
    }`;
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="console-mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-90"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div
        id="console-mobile-nav"
        className={`fixed inset-x-0 top-14 z-40 origin-top border-b border-border bg-floating px-4 pt-3 pb-6 shadow-floating transition-[transform,opacity] duration-300 ease-spring ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-3 opacity-0"
        }`}
      >
        <nav aria-label={title} className="flex max-h-[65vh] flex-col gap-5 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {links.filter((item): item is ConsoleLink => !isGroup(item)).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={pathname === link.href ? "page" : undefined}
                className={linkClass(pathname === link.href)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {links.filter(isGroup).map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <p className="px-3 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/70">
                {group.label}
              </p>
              {group.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={linkClass(pathname === link.href)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="mt-4 border-t border-border pt-4">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
