import type { SupabaseClient } from "@supabase/supabase-js";

import { MEDIA_PAGE_SIZE, getMediaPublicUrl } from "@/lib/media/constants";
import type { MediaAsset, MediaFileType } from "@/lib/media/types";

const MEDIA_SELECT =
  "id, file_name, storage_path, file_type, mime_type, size_bytes, width, height, alt_text, folder, uploaded_by, created_at";

type MediaRow = Omit<MediaAsset, "url">;

function mapMedia(row: MediaRow): MediaAsset {
  return { ...row, url: getMediaPublicUrl(row.storage_path) };
}

/**
 * Admin-scoped list for the Media Library page and any media picker —
 * takes the already-authenticated client from getAdminContext()/requireAdmin()
 * rather than creating its own, mirroring createSignedUrlMap() in lib/storage.ts.
 */
export async function listMedia(
  supabase: SupabaseClient,
  {
    page = 1,
    pageSize = MEDIA_PAGE_SIZE,
    search,
    fileType,
  }: {
    page?: number;
    pageSize?: number;
    search?: string;
    fileType?: MediaFileType;
  } = {},
): Promise<{ items: MediaAsset[]; total: number }> {
  let query = supabase
    .from("media_library")
    .select(MEDIA_SELECT, { count: "exact" })
    .order("created_at", { ascending: false });

  if (fileType) query = query.eq("file_type", fileType);
  if (search) query = query.ilike("file_name", `%${search}%`);

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);

  if (error) {
    console.error("Media library load failed:", error.message);
    return { items: [], total: 0 };
  }
  return {
    items: (data ?? []).map((row) => mapMedia(row as unknown as MediaRow)),
    total: count ?? 0,
  };
}

export async function getMediaByIds(
  supabase: SupabaseClient,
  ids: string[],
): Promise<MediaAsset[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from("media_library")
    .select(MEDIA_SELECT)
    .in("id", ids);

  if (error) {
    console.error("Media lookup failed:", error.message);
    return [];
  }
  return (data ?? []).map((row) => mapMedia(row as unknown as MediaRow));
}
