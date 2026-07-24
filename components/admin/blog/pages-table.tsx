import { Eye, PenLine } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import type { CmsPage } from "@/lib/cms/pages/queries";

const EDIT_MODE_TARGET: Record<CmsPage["edit_mode"], string | null> = {
  code: null,
  site_content: "/admin/content",
  rich_text: null,
};

function PageStatusBadge({ status }: { status: CmsPage["status"] }) {
  const styles =
    status === "published"
      ? "bg-brand-600 text-white dark:bg-brand-500 dark:text-brand-950"
      : "border border-border bg-surface text-muted-foreground";
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${styles}`}
    >
      {status === "published" ? "Published" : "Draft"}
    </span>
  );
}

export function PagesTable({ pages }: { pages: CmsPage[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-elevated">
      <table className="w-full min-w-[720px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            {["Page", "Status", "Last updated", "Last editor", ""].map((heading) => (
              <th
                key={heading}
                scope="col"
                className="px-5 py-3.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => {
            const editHref = EDIT_MODE_TARGET[page.edit_mode];
            return (
              <tr key={page.id} className="border-b border-border last:border-b-0 hover:bg-background">
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">{page.title}</p>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">{page.route}</p>
                </td>
                <td className="px-5 py-4">
                  <PageStatusBadge status={page.status} />
                </td>
                <td className="px-5 py-4 text-sm whitespace-nowrap text-muted-foreground">
                  {formatDate(page.updated_at)}
                </td>
                <td className="px-5 py-4 text-sm whitespace-nowrap text-muted-foreground">
                  {page.updated_by_name ?? "—"}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    {editHref ? (
                      <Link
                        href={editHref}
                        aria-label={`Edit ${page.title}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-transform duration-200 ease-spring hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-90"
                      >
                        <PenLine className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span
                        title="Managed in code — no admin fields yet"
                        aria-label={`${page.title} is managed in code — no admin fields yet`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground/30"
                      >
                        <PenLine className="h-4 w-4" />
                      </span>
                    )}
                    <Link
                      href={page.route}
                      target="_blank"
                      aria-label={`Preview ${page.title}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-transform duration-200 ease-spring hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-90"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
