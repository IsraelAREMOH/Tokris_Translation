import type { SupabaseClient } from "@supabase/supabase-js";

export type PageEditMode = "code" | "site_content" | "rich_text";

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  route: string;
  status: "published" | "draft";
  edit_mode: PageEditMode;
  updated_at: string | null;
  updated_by_name: string | null;
};

type RawRow = {
  id: string;
  slug: string;
  title: string;
  route: string;
  status: string;
  edit_mode: string;
  updated_at: string | null;
  updated_by: { full_name: string | null } | null;
};

/**
 * The Pages registry (supabase/migrations/0010_cms_foundation.sql) — a
 * catalog of the site's public routes, not a page-content store. Most pages
 * have `edit_mode: 'code'` (copy lives in messages/*.json + JSX, no admin
 * fields exist yet) — only Contact currently has real admin-editable fields,
 * via Site Content. Error-tolerant like getSiteContent(): an empty list
 * means the migration hasn't run yet, not that there are no pages.
 */
export async function listPages(supabase: SupabaseClient): Promise<CmsPage[]> {
  const { data, error } = await supabase
    .from("pages")
    .select("id, slug, title, route, status, edit_mode, updated_at, updated_by:profiles(full_name)")
    .order("route", { ascending: true });

  if (error) {
    console.error("Pages registry load failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const raw = row as unknown as RawRow;
    return {
      id: raw.id,
      slug: raw.slug,
      title: raw.title,
      route: raw.route,
      status: raw.status as CmsPage["status"],
      edit_mode: raw.edit_mode as PageEditMode,
      updated_at: raw.updated_at,
      updated_by_name: raw.updated_by?.full_name ?? null,
    };
  });
}
