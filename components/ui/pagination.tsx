import { Link } from "@/i18n/navigation";

/**
 * URL-driven pagination (no client JS) — mirrors the status-filter pattern
 * already used by /admin/projects (Link with a `query` object). Shared by
 * admin list pages and public blog archives alike.
 */
export function Pagination({
  page,
  pageSize,
  total,
  basePath,
  searchParams = {},
  previousLabel = "Previous",
  nextLabel = "Next",
  pageLabel = (current: number, count: number) => `Page ${current} of ${count}`,
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
  previousLabel?: string;
  nextLabel?: string;
  pageLabel?: (current: number, count: number) => string;
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (pageCount <= 1) return null;

  function hrefFor(targetPage: number) {
    const query: Record<string, string> = {};
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) query[key] = value;
    }
    if (targetPage > 1) query.page = String(targetPage);
    return Object.keys(query).length > 0 ? { pathname: basePath, query } : basePath;
  }

  const linkClass = (disabled: boolean) =>
    `inline-flex h-9 items-center rounded-full border border-border bg-surface px-3.5 text-sm font-medium shadow-elevated transition-transform duration-200 ease-spring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
      disabled
        ? "pointer-events-none opacity-40"
        : "text-foreground hover:-translate-y-0.5 active:translate-y-0"
    }`;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-3">
      <Link
        href={hrefFor(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={linkClass(page <= 1)}
      >
        {previousLabel}
      </Link>
      <span className="text-sm text-muted-foreground">{pageLabel(page, pageCount)}</span>
      <Link
        href={hrefFor(Math.min(pageCount, page + 1))}
        aria-disabled={page >= pageCount}
        className={linkClass(page >= pageCount)}
      >
        {nextLabel}
      </Link>
    </nav>
  );
}
