import type { Metadata } from "next";

import { PagesTable } from "@/components/admin/blog/pages-table";
import { requireAdmin } from "@/lib/auth/guards";
import { listPages } from "@/lib/cms/pages/queries";

export const metadata: Metadata = { title: "Pages" };

export default async function AdminPagesPage() {
  const { supabase } = await requireAdmin();
  const pages = await listPages(supabase);

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          Pages
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every public page on the site, and how it&apos;s currently edited. Most pages&apos; copy still
          lives in code — Contact&apos;s details are editable now via Site Content, and this registry
          is the foundation a future rich-text page editor plugs into.
        </p>
      </div>

      {pages.length === 0 ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-5 py-6">
          <p className="text-sm font-semibold text-danger">The pages table isn&apos;t available yet.</p>
          <p className="mt-2 text-sm text-danger/90">
            Run{" "}
            <code className="rounded bg-danger/10 px-1.5 py-0.5 font-mono text-xs">
              supabase/migrations/0010_cms_foundation.sql
            </code>{" "}
            in the Supabase SQL Editor, then reload this page.
          </p>
        </div>
      ) : (
        <>
          <PagesTable pages={pages} />
          <p className="text-xs text-muted-foreground">
            Future content types (Case Studies, Resources, FAQs, Events) register themselves in
            this same table — no dashboard redesign needed when they arrive.
          </p>
        </>
      )}
    </div>
  );
}
