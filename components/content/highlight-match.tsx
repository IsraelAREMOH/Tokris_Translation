import { Fragment, type ReactNode } from "react";

/** Wraps case-insensitive occurrences of `term` in <mark> — used by search
 * results to show why a card matched. Generic (not blog-specific). */
export function highlightMatch(text: string, term: string): ReactNode {
  const trimmed = term.trim();
  if (!trimmed) return text;

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  if (parts.length === 1) return text;

  return parts.map((part, index) =>
    part.toLowerCase() === trimmed.toLowerCase() ? (
      <mark
        key={index}
        className="rounded bg-accent-300/50 px-0.5 text-foreground dark:bg-accent-500/40"
      >
        {part}
      </mark>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
}
