import type { MediaFileType } from "@/lib/media/types";

// Keep in sync with the bucket's file_size_limit in migration 0007.
export const MEDIA_BUCKET = "site-media";
export const MAX_MEDIA_FILE_SIZE_MB = 25;
export const MAX_MEDIA_FILE_SIZE_BYTES = MAX_MEDIA_FILE_SIZE_MB * 1024 * 1024;
export const MEDIA_PAGE_SIZE = 24;

export const MEDIA_FILE_TYPES: MediaFileType[] = ["image", "pdf", "video", "document"];

const EXTENSION_TYPE_MAP: Record<string, MediaFileType> = {
  ".png": "image",
  ".jpg": "image",
  ".jpeg": "image",
  ".webp": "image",
  ".gif": "image",
  ".svg": "image",
  ".pdf": "pdf",
  ".mp4": "video",
  ".webm": "video",
  ".mov": "video",
  ".doc": "document",
  ".docx": "document",
  ".txt": "document",
};

export const ACCEPTED_MEDIA_EXTENSIONS = Object.keys(EXTENSION_TYPE_MAP);
export const ACCEPT_ATTRIBUTE = ACCEPTED_MEDIA_EXTENSIONS.join(",");

export function fileTypeFromName(fileName: string): MediaFileType | null {
  const lower = fileName.toLowerCase();
  const extension = ACCEPTED_MEDIA_EXTENSIONS.find((ext) => lower.endsWith(ext));
  return extension ? EXTENSION_TYPE_MAP[extension] : null;
}

/** Keeps original names readable while stripping path tricks and oddities. */
export function sanitizeFileName(name: string) {
  const cleaned = name.replace(/[^\w.\- ]+/g, "_").replace(/\s+/g, "_");
  return cleaned.slice(-100) || "file";
}

export function formatFileSize(bytes: number | null) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * The bucket is public, so this is a deterministic URL, not a signed one —
 * no Supabase client/network round trip needed to compute it.
 */
export function getMediaPublicUrl(storagePath: string) {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${MEDIA_BUCKET}/${storagePath}`;
}
