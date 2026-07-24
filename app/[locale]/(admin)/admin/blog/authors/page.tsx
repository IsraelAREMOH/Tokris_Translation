import type { Metadata } from "next";

import { AuthorsManager } from "@/components/admin/blog/authors-manager";
import { SearchInput } from "@/components/admin/search-input";
import { requireAdmin } from "@/lib/auth/guards";
import type { BlogAuthor } from "@/lib/blog/types";
import { getMediaPublicUrl } from "@/lib/media/constants";
import type { MediaAsset } from "@/lib/media/types";

export const metadata: Metadata = { title: "Blog Authors" };

function sanitizeSearchTerm(value: string) {
  return value.replace(/[,()]/g, "").trim();
}

const MEDIA_FIELDS =
  "id, file_name, storage_path, file_type, mime_type, size_bytes, width, height, alt_text, folder, uploaded_by, created_at";

type RawAuthorRow = Omit<BlogAuthor, "photo"> & {
  photo: Omit<MediaAsset, "url"> | null;
};

export default async function AdminBlogAuthorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ q }, { supabase }] = await Promise.all([searchParams, requireAdmin()]);

  let query = supabase
    .from("blog_authors")
    .select(
      `id, profile_id, name, photo_id, bio, position, email, social_links, featured, photo:media_library(${MEDIA_FIELDS})`,
    )
    .order("name", { ascending: true });

  const term = q ? sanitizeSearchTerm(q) : "";
  if (term) {
    query = query.or(`name.ilike.%${term}%,position.ilike.%${term}%,email.ilike.%${term}%`);
  }

  const { data, error } = await query;
  const authors: BlogAuthor[] = (data ?? []).map((row) => {
    const { photo, ...rest } = row as unknown as RawAuthorRow;
    return {
      ...rest,
      photo: photo ? { ...photo, url: getMediaPublicUrl(photo.storage_path) } : null,
    };
  });

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          Authors
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bylines shown on published articles — photo, bio, position and
          social links.
        </p>
      </div>

      <SearchInput placeholder="Search authors…" />

      {error ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-5 py-6">
          <p className="text-sm font-semibold text-danger">
            The blog_authors table isn&apos;t available yet.
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
        <AuthorsManager authors={authors} hasQuery={Boolean(term)} />
      )}
    </div>
  );
}
