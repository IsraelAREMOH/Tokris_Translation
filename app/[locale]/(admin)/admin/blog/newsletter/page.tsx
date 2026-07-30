import type { Metadata } from "next";

import { NewsletterFilters } from "@/components/admin/blog/newsletter-filters";
import { NewsletterManager } from "@/components/admin/blog/newsletter-manager";
import { StatTile } from "@/components/admin/stat-tile";
import { Pagination } from "@/components/ui/pagination";
import { requireAdmin } from "@/lib/auth/guards";
import { NEWSLETTER_PAGE_SIZE, isNewsletterStatus } from "@/lib/blog/newsletter/constants";
import { getNewsletterStats, listSubscribers } from "@/lib/blog/newsletter/queries";

export const metadata: Metadata = { title: "Newsletter" };

export default async function AdminNewsletterPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const [params, { supabase }] = await Promise.all([searchParams, requireAdmin()]);

  const status = params.status && isNewsletterStatus(params.status) ? params.status : undefined;
  const page = Math.max(1, Number(params.page) || 1);

  const [{ subscribers, total }, stats] = await Promise.all([
    listSubscribers(supabase, { search: params.q, status, page }),
    getNewsletterStats(supabase),
  ]);

  const hasFilters = Boolean(params.q || status);

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          Newsletter
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Subscribers captured from the blog&apos;s signup widget. Sending campaigns isn&apos;t part of
          this build reach out to your list manually using the export below.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile label="Total subscribers" value={stats.total} />
        <StatTile label="Active" value={stats.active} />
      </div>

      <NewsletterFilters status={status} />

      <NewsletterManager subscribers={subscribers} hasFilters={hasFilters} />

      <Pagination
        page={page}
        pageSize={NEWSLETTER_PAGE_SIZE}
        total={total}
        basePath="/admin/blog/newsletter"
        searchParams={{ q: params.q, status }}
      />
    </div>
  );
}
