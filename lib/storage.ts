import type { SupabaseClient } from "@supabase/supabase-js";

export const TRANSLATIONS_BUCKET = "translations";

/** One admin/client working session; regenerated on every server render. */
export const SIGNED_URL_TTL_SECONDS = 60 * 60;

/**
 * Batch-signs private-bucket paths into short-lived download URLs.
 * RLS still applies: callers can only sign objects their session may read
 * (clients: own {uid}/… folder, admins: everything).
 */
export async function createSignedUrlMap(
  supabase: SupabaseClient,
  paths: string[],
) {
  const urlByPath = new Map<string, string>();
  if (paths.length === 0) return urlByPath;

  const { data, error } = await supabase.storage
    .from(TRANSLATIONS_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS, { download: true });

  if (error) {
    console.error("Signed URL generation failed:", error.message);
    return urlByPath;
  }

  for (const entry of data ?? []) {
    if (entry.signedUrl && entry.path) {
      urlByPath.set(entry.path, entry.signedUrl);
    }
  }
  return urlByPath;
}
