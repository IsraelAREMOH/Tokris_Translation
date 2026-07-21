// Visual mapping for the manual V1 lifecycle:
// Request Submitted -> Under Review -> Translating -> Quality Check
// -> Completed -> Delivered
const STATUS_STYLES: Record<string, string> = {
  "Request Submitted":
    "bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300",
  "Under Review":
    "bg-accent-200 text-accent-700 dark:bg-accent-500/25 dark:text-accent-200",
  Translating:
    "bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300",
  "Quality Check":
    "bg-brand-200 text-brand-800 dark:bg-brand-500/25 dark:text-brand-200",
  Completed: "bg-brand-600 text-white dark:bg-brand-500 dark:text-brand-950",
  Delivered: "border border-border bg-surface text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  const styles =
    STATUS_STYLES[status] ?? "border border-border bg-surface text-muted-foreground";

  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${styles}`}
    >
      {status}
    </span>
  );
}
