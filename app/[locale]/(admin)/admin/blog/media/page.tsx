import type { Metadata } from "next";

import { MediaManager } from "@/components/admin/media/media-manager";
import { Pagination } from "@/components/ui/pagination";
import { SearchInput } from "@/components/admin/search-input";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import {
  MEDIA_FILE_TYPES,
  MEDIA_PAGE_SIZE,
  getMediaPublicUrl,
} from "@/lib/media/constants";
import type { MediaAsset, MediaFileType } from "@/lib/media/types";

export const metadata: Metadata = { title: "Media Library" };

const MEDIA_SELECT =
  "id, file_name, storage_path, file_type, mime_type, size_bytes, width, height, alt_text, folder, uploaded_by, created_at";

export default async function AdminMediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  const [{ q, type, page: pageParam }, { supabase }] = await Promise.all([
    searchParams,
    requireAdmin(),
  ]);

  const activeType = MEDIA_FILE_TYPES.find((candidate) => candidate === type);
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * MEDIA_PAGE_SIZE;

  let query = supabase
    .from("media_library")
    .select(MEDIA_SELECT, { count: "exact" })
    .order("created_at", { ascending: false });

  if (activeType) query = query.eq("file_type", activeType);
  if (q) query = query.ilike("file_name", `%${q}%`);

  const { data, error, count } = await query.range(from, from + MEDIA_PAGE_SIZE - 1);

  const items: MediaAsset[] = (data ?? []).map((row) => ({
    ...(row as unknown as Omit<MediaAsset, "url">),
    url: getMediaPublicUrl((row as unknown as MediaAsset).storage_path),
  }));

  const filters: { label: string; value: MediaFileType | undefined }[] = [
    { label: "All", value: undefined },
    ...MEDIA_FILE_TYPES.map((fileType) => ({
      label: fileType.charAt(0).toUpperCase() + fileType.slice(1) + "s",
      value: fileType,
    })),
  ];

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          Media Library
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The site-wide asset repository — used by the blog today, and
          reusable by every future page editor (Homepage, Services, Team) as
          they come online.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput placeholder="Search media…" />
        <nav aria-label="Filter by type" className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const active = filter.value === activeType;
            return (
              <Link
                key={filter.label}
                href={
                  filter.value
                    ? { pathname: "/admin/blog/media", query: { type: filter.value } }
                    : "/admin/blog/media"
                }
                aria-current={active ? "true" : undefined}
                className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] ${
                  active
                    ? "border-brand-600 bg-brand-600 text-white shadow-brand dark:border-brand-400 dark:bg-brand-400 dark:text-brand-950"
                    : "border-border bg-surface text-muted-foreground shadow-elevated hover:text-foreground"
                }`}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {error ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-5 py-6">
          <p className="text-sm font-semibold text-danger">
            The media_library table isn&apos;t available yet.
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
        <>
          <MediaManager items={items} hasQuery={Boolean(q)} />
          <Pagination
            page={page}
            pageSize={MEDIA_PAGE_SIZE}
            total={count ?? 0}
            basePath="/admin/blog/media"
            searchParams={{ q, type }}
          />
        </>
      )}
    </div>
  );
}
