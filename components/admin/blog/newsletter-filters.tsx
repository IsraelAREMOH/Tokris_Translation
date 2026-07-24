import { Download } from "lucide-react";

import { SearchInput } from "@/components/admin/search-input";
import { NEWSLETTER_STATUSES } from "@/lib/blog/newsletter/constants";
import { Link } from "@/i18n/navigation";

const STATUS_LABELS: Record<string, string> = {
  subscribed: "Active",
  unsubscribed: "Unsubscribed",
};

export function NewsletterFilters({ status }: { status?: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput placeholder="Search by email…" />
        <Link
          href="/admin/blog/newsletter/export"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Link>
      </div>

      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {[undefined, ...NEWSLETTER_STATUSES].map((value) => {
          const active = value === status;
          return (
            <Link
              key={value ?? "all"}
              href={
                value
                  ? { pathname: "/admin/blog/newsletter", query: { status: value } }
                  : "/admin/blog/newsletter"
              }
              aria-current={active ? "true" : undefined}
              className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] ${
                active
                  ? "border-brand-600 bg-brand-600 text-white shadow-brand dark:border-brand-400 dark:bg-brand-400 dark:text-brand-950"
                  : "border-border bg-surface text-muted-foreground shadow-elevated hover:text-foreground"
              }`}
            >
              {value ? STATUS_LABELS[value] : "All"}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
