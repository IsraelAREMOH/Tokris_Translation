import { ArrowLeft, ArrowRight } from "lucide-react";

import { Link } from "@/i18n/navigation";

export type PrevNextItem = { href: string; title: string };

export function PrevNextNav({
  previous,
  next,
  previousLabel,
  nextLabel,
}: {
  previous: PrevNextItem | null;
  next: PrevNextItem | null;
  previousLabel: string;
  nextLabel: string;
}) {
  if (!previous && !next) return null;

  return (
    <nav aria-label="Article navigation" className="grid gap-3 sm:grid-cols-2">
      {previous ? (
        <Link
          href={previous.href}
          className="group flex flex-col gap-1 rounded-xl border border-border bg-surface p-4 shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0"
        >
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            {previousLabel}
          </span>
          <span className="line-clamp-2 font-display text-sm font-semibold text-foreground transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-300">
            {previous.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={next.href}
          className="group flex flex-col items-end gap-1 rounded-xl border border-border bg-surface p-4 text-right shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0"
        >
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            {nextLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
          <span className="line-clamp-2 font-display text-sm font-semibold text-foreground transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-300">
            {next.title}
          </span>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  );
}
