// The site-wide media repository — shared by the blog today, and intended
// for reuse by future page editors (Homepage, Services, Team, etc.).

export type MediaFileType = "image" | "pdf" | "video" | "document";

export type MediaAsset = {
  id: string;
  file_name: string;
  storage_path: string;
  file_type: MediaFileType;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  alt_text: string | null;
  folder: string;
  uploaded_by: string | null;
  created_at: string;
  /** Computed, not stored — the bucket is public so this is a plain URL, no signing. */
  url: string;
};
