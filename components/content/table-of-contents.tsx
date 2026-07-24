"use client";

import { useEffect, useState } from "react";

import type { TocEntry } from "@/lib/blog/editor/toc";

export function TableOfContents({ entries, label }: { entries: TocEntry[]; label: string }) {
  const [activeId, setActiveId] = useState<string | null>(entries[0]?.id ?? null);

  useEffect(() => {
    if (entries.length === 0 || typeof IntersectionObserver === "undefined") return;

    const elements = entries
      .map((entry) => document.getElementById(entry.id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    // Watches which heading is in the top ~30% of the viewport — the same
    // "subscribe to an external system, setState in the callback" pattern
    // as hooks/use-in-view.ts, just tracking many elements instead of one.
    const observer = new IntersectionObserver(
      (observedEntries) => {
        const visible = observedEntries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <nav
      aria-label={label}
      className="flex flex-col gap-0.5 rounded-xl border border-border bg-surface p-4 shadow-elevated"
    >
      <p className="mb-1.5 px-2.5 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </p>
      {entries.map((entry) => (
        <a
          key={entry.id}
          href={`#${entry.id}`}
          aria-current={activeId === entry.id ? "location" : undefined}
          className={`rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
            entry.level === 3 ? "pl-5 text-[13px]" : ""
          } ${
            activeId === entry.id
              ? "bg-brand-600/10 font-medium text-brand-700 dark:text-brand-300"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {entry.text}
        </a>
      ))}
    </nav>
  );
}
