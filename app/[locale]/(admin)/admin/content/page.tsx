import type { Metadata } from "next";

import { SiteContentForm } from "@/components/admin/site-content-form";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Site Content" };

export default async function AdminContentPage() {
  const { supabase } = await requireAdmin();

  // Query directly (not via the cached public getter) so a missing table is
  // distinguishable from an empty one and we can show setup guidance.
  const { data, error } = await supabase
    .from("site_content")
    .select("key, value");

  const content = Object.fromEntries(
    (data ?? []).map((row: { key: string; value: string }) => [
      row.key,
      row.value,
    ]),
  );

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          Site Content
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Site wide details shown on the public website edit here, no code
          changes needed. Leaving the WhatsApp number empty falls back to the
          configured environment default.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-5 py-6">
          <p className="text-sm font-semibold text-danger">
            The site content table isn&apos;t available yet.
          </p>
          <p className="mt-2 text-sm text-danger/90">
            Run{" "}
            <code className="rounded bg-danger/10 px-1.5 py-0.5 font-mono text-xs">
              supabase/migrations/0004_site_content.sql
            </code>{" "}
            in the Supabase SQL Editor, then reload this page.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-5 shadow-elevated sm:p-6">
          <SiteContentForm content={content} />
        </div>
      )}
    </div>
  );
}
