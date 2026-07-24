import type { Metadata } from "next";

import { TagsManager } from "@/components/admin/blog/tags-manager";
import { SearchInput } from "@/components/admin/search-input";
import { requireAdmin } from "@/lib/auth/guards";
import type { BlogTag } from "@/lib/blog/types";

export const metadata: Metadata = { title: "Blog Tags" };

function sanitizeSearchTerm(value: string) {
  return value.replace(/[,()]/g, "").trim();
}

export default async function AdminBlogTagsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ q }, { supabase }] = await Promise.all([searchParams, requireAdmin()]);

  let query = supabase
    .from("blog_tags")
    .select("id, name, slug")
    .order("name", { ascending: true });

  const term = q ? sanitizeSearchTerm(q) : "";
  if (term) query = query.or(`name.ilike.%${term}%,slug.ilike.%${term}%`);

  const { data, error } = await query;
  const tags = (data ?? []) as BlogTag[];

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          Tags
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Free-form labels for articles — more granular than categories, no
          limit on how many you create.
        </p>
      </div>

      <SearchInput placeholder="Search tags…" />

      {error ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-5 py-6">
          <p className="text-sm font-semibold text-danger">
            The blog_tags table isn&apos;t available yet.
          </p>
          <p className="mt-2 text-sm text-danger/90">
            Run{" "}
            <code className="rounded bg-danger/10 px-1.5 py-0.5 font-mono text-xs">
              supabase/migrations/0005_blog_schema.sql
            </code>{" "}
            (then 0006, 0007) in the Supabase SQL Editor, then reload this page.
          </p>
        </div>
      ) : (
        <TagsManager tags={tags} hasQuery={Boolean(term)} />
      )}
    </div>
  );
}
