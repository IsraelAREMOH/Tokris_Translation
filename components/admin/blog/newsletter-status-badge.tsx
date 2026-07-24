import type { NewsletterStatus } from "@/lib/blog/newsletter/constants";

const STATUS_LABELS: Record<NewsletterStatus, string> = {
  subscribed: "Active",
  unsubscribed: "Unsubscribed",
};

const STATUS_STYLES: Record<NewsletterStatus, string> = {
  subscribed: "bg-brand-600 text-white dark:bg-brand-500 dark:text-brand-950",
  unsubscribed: "border border-border bg-surface text-muted-foreground",
};

export function NewsletterStatusBadge({ status }: { status: NewsletterStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
