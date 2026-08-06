import { SearchX } from "lucide-react";
import type { ReactNode } from "react";

/** Shared "nothing here" treatment for zero-result search and empty
 * category/tag archives — a branded badge instead of bare text, reused by
 * the blog landing page and both archive pages so the empty state doesn't
 * read as a dead end. */
export function BlogEmptyState({ message, children }: { message: string; children?: ReactNode }) {
  return (
    <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-brand-600/25 bg-brand-600/[0.03] px-6 py-12 text-center dark:border-brand-400/20 dark:bg-brand-400/[0.04]">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-600/10 text-brand-700 dark:bg-brand-400/15 dark:text-brand-300">
        <SearchX className="h-5 w-5" />
      </span>
      <p className="text-sm text-muted-foreground">{message}</p>
      {children}
    </div>
  );
}
