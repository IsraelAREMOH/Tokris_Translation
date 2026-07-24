import type { BlogPostStatus } from "@/lib/blog/types";

const STATUS_LABELS: Record<BlogPostStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

const STATUS_STYLES: Record<BlogPostStatus, string> = {
  draft: "border border-border bg-surface text-muted-foreground",
  scheduled: "bg-accent-200 text-accent-800 dark:bg-accent-500/25 dark:text-accent-200",
  published: "bg-brand-600 text-white dark:bg-brand-500 dark:text-brand-950",
  archived: "bg-danger/10 text-danger",
};

export function PostStatusBadge({ status }: { status: BlogPostStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
