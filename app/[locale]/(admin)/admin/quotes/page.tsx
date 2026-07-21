import type { Metadata } from "next";

import { StatusBadge } from "@/components/status-badge";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Quote Tracker" };

/** The pre-translation stages — a project past these no longer needs a quote. */
const QUOTE_STAGES = ["Request Submitted", "Under Review"] as const;

type QuoteRow = {
  id: string;
  source_language: string;
  target_language: string;
  status: string;
  deadline: string | null;
  created_at: string;
  instructions: string | null;
  profiles: { full_name: string | null } | null;
};

export default async function AdminQuotesPage() {
  const { supabase } = await requireAdmin();

  // Oldest first — the queue is answered in arrival order.
  const { data } = await supabase
    .from("projects")
    .select(
      "id, source_language, target_language, status, deadline, created_at, instructions, profiles(full_name)",
    )
    .in("status", [...QUOTE_STAGES])
    .order("created_at", { ascending: true });

  const quotes = (data ?? []) as unknown as QuoteRow[];

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          Quote Tracker
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Requests awaiting review and a personal reply, oldest first. Open one
          to read the documents and message the client with your quote.
        </p>
      </div>

      {quotes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-10 shadow-elevated">
          <p className="text-sm text-muted-foreground">
            The quote queue is clear — every request has been reviewed.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-elevated">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {["Client", "Languages", "Received", "Deadline", "Status"].map(
                  (heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-5 py-3.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr
                  key={quote.id}
                  className="relative border-b border-border last:border-b-0 hover:bg-background"
                >
                  <td className="px-5 py-4">
                    {/* Stretched link — the whole row opens the project. */}
                    <Link
                      href={`/admin/projects/${quote.id}`}
                      className="text-sm font-semibold text-foreground after:absolute after:inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500"
                    >
                      {quote.profiles?.full_name ?? "Client"}
                    </Link>
                    {quote.instructions ? (
                      <p className="mt-0.5 line-clamp-1 max-w-56 text-xs text-muted-foreground">
                        {quote.instructions}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 text-sm whitespace-nowrap text-muted-foreground">
                    {quote.source_language} → {quote.target_language}
                  </td>
                  <td className="px-5 py-4 text-sm whitespace-nowrap text-muted-foreground">
                    {formatDate(quote.created_at)}
                  </td>
                  <td className="px-5 py-4 text-sm whitespace-nowrap text-muted-foreground">
                    {formatDate(quote.deadline)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={quote.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
