import type { Metadata } from "next";

import { CategoriesManager } from "@/components/admin/blog/categories-manager";
import { SearchInput } from "@/components/admin/search-input";
import { requireAdmin } from "@/lib/auth/guards";
import type { BlogCategory } from "@/lib/blog/types";

export const metadata: Metadata = { title: "Blog Categories" };

// PostgREST's .or() mini-language treats commas/parens as syntax — strip them
// from free-text search input so an operator typing "foo, bar" doesn't 500.
function sanitizeSearchTerm(value: string) {
  return value.replace(/[,()]/g, "").trim();
}

export default async function AdminBlogCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ q }, { supabase }] = await Promise.all([searchParams, requireAdmin()]);

  let query = supabase
    .from("blog_categories")
    .select("id, name, slug, description, sort_order")
    .order("sort_order", { ascending: true });

  const term = q ? sanitizeSearchTerm(q) : "";
  if (term) query = query.or(`name.ilike.%${term}%,slug.ilike.%${term}%`);

  const { data, error } = await query;
  const categories = (data ?? []) as BlogCategory[];

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          Categories
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Group articles by topic, Translation, Case Studies, Industry
          Insights and so on. The order below controls the filter order shown
          on the public blog.
        </p>
      </div>

      <SearchInput placeholder="Search categories…" />

      {error ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-5 py-6">
          <p className="text-sm font-semibold text-danger">
            The blog_categories table isn&apos;t available yet.
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
        <CategoriesManager categories={categories} hasQuery={Boolean(term)} />
      )}
    </div>
  );
}
