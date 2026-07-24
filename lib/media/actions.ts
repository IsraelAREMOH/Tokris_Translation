"use server";

import type { SupabaseClient, User } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

import { getAdminContext } from "@/lib/auth/admin-context";
import { logActivity } from "@/lib/cms/activity/log";
import {
  MAX_MEDIA_FILE_SIZE_BYTES,
  MAX_MEDIA_FILE_SIZE_MB,
  MEDIA_BUCKET,
  fileTypeFromName,
  getMediaPublicUrl,
  sanitizeFileName,
} from "@/lib/media/constants";
import { listMedia } from "@/lib/media/queries";
import type { MediaAsset, MediaFileType } from "@/lib/media/types";
import { UUID_PATTERN } from "@/lib/validation";

/**
 * Callable directly from client components (e.g. MediaPickerDialog) — not a
 * useActionState-shaped action, just a plain admin-gated server function.
 */
export async function searchMedia({
  search,
  fileType,
  page = 1,
}: {
  search?: string;
  fileType?: MediaFileType;
  page?: number;
} = {}): Promise<{ items: MediaAsset[]; total: number; error?: string }> {
  const context = await getAdminContext();
  if ("error" in context) return { items: [], total: 0, error: context.error };
  return listMedia(context.supabase, { search, fileType, page });
}

export type MediaActionState = {
  error?: string;
  success?: boolean;
};

function revalidateMediaViews() {
  revalidatePath("/[locale]/(admin)/admin/blog/media", "page");
}

/** Shared by uploadMedia (form-based, Media Library page) and
 * uploadMediaFile (direct call, editor paste/drop-to-insert). */
async function uploadOneFile(
  supabase: SupabaseClient,
  user: User,
  file: File,
  folder: string,
): Promise<{ id: string; url: string } | { error: string }> {
  const fileType = fileTypeFromName(file.name);
  if (!fileType) return { error: `Unsupported file type: ${file.name}` };
  if (file.size > MAX_MEDIA_FILE_SIZE_BYTES) {
    return { error: `${file.name} exceeds the ${MAX_MEDIA_FILE_SIZE_MB} MB limit.` };
  }

  const storagePath = `${folder}/${Date.now()}-${sanitizeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, file, { contentType: file.type || "application/octet-stream" });

  if (uploadError) {
    console.error("Media upload failed:", uploadError.message);
    return { error: `Could not upload ${file.name} — please try again.` };
  }

  const { data, error: insertError } = await supabase
    .from("media_library")
    .insert({
      file_name: file.name,
      storage_path: storagePath,
      file_type: fileType,
      mime_type: file.type || null,
      size_bytes: file.size,
      folder,
      uploaded_by: user.id,
    })
    .select("id")
    .single();

  if (insertError || !data) {
    console.error("Media record failed:", insertError?.message);
    await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
    return { error: "Could not save the media record — please try again." };
  }

  await logActivity(supabase, {
    eventType: "media.uploaded",
    entityType: "media",
    entityId: data.id,
    title: `Uploaded “${file.name}”`,
    actorId: user.id,
  });

  return { id: data.id, url: getMediaPublicUrl(storagePath) };
}

export async function uploadMedia(
  _prev: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };
  const { supabase, user } = context;

  const files = formData
    .getAll("files")
    .filter(
      (entry): entry is File =>
        entry instanceof File && entry.size > 0 && entry.name !== "",
    );
  const folder = String(formData.get("folder") ?? "uploads").trim() || "uploads";

  if (files.length === 0) {
    return { error: "Choose at least one file to upload." };
  }

  for (const file of files) {
    const result = await uploadOneFile(supabase, user, file, folder);
    if ("error" in result) return { error: result.error };
  }

  revalidateMediaViews();
  return { success: true };
}

/**
 * Direct (non-form) call for the editor's paste/drop-to-insert flow — returns
 * the uploaded asset's id/url immediately so it can be inserted as an image
 * node without a round trip through the Media Library list.
 */
export async function uploadMediaFile(
  file: File,
  folder = "posts",
): Promise<{ id: string; url: string } | { error: string }> {
  const context = await getAdminContext();
  if ("error" in context) return { error: String(context.error) };

  const result = await uploadOneFile(context.supabase, context.user, file, folder);
  if (!("error" in result)) revalidateMediaViews();
  return result;
}

/** Referencing columns (cover_image_id, og_image_id, photo_id) are ON DELETE
 * SET NULL, so removing an item that's in use clears the reference rather
 * than failing — safe to delete unconditionally. */
export async function deleteMedia(
  _prev: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };
  const { supabase } = context;

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) return { error: "Invalid media item." };

  const { data: asset, error: fetchError } = await supabase
    .from("media_library")
    .select("storage_path, file_name")
    .eq("id", id)
    .single();

  if (fetchError || !asset) return { error: "Media item not found." };

  const { error: deleteError } = await supabase
    .from("media_library")
    .delete()
    .eq("id", id);

  if (deleteError) {
    console.error("Media delete failed:", deleteError.message);
    return { error: "Could not delete — please try again." };
  }

  await supabase.storage.from(MEDIA_BUCKET).remove([asset.storage_path]);
  await logActivity(supabase, {
    eventType: "media.deleted",
    entityType: "media",
    entityId: id,
    title: `Deleted “${asset.file_name}”`,
    actorId: context.user.id,
  });
  revalidateMediaViews();
  return { success: true };
}

/** Callable directly from client components (MediaManager's bulk-delete bar). */
export async function bulkDeleteMedia(ids: string[]): Promise<MediaActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };
  const { supabase } = context;

  if (ids.length === 0) return { error: "No items selected." };

  const { data: assets, error: fetchError } = await supabase
    .from("media_library")
    .select("storage_path")
    .in("id", ids);

  if (fetchError) {
    console.error("Bulk media delete lookup failed:", fetchError.message);
    return { error: "Could not delete — please try again." };
  }

  const { error: deleteError } = await supabase
    .from("media_library")
    .delete()
    .in("id", ids);

  if (deleteError) {
    console.error("Bulk media delete failed:", deleteError.message);
    return { error: "Could not delete — please try again." };
  }

  const paths = (assets ?? []).map((asset) => asset.storage_path);
  if (paths.length > 0) {
    await supabase.storage.from(MEDIA_BUCKET).remove(paths);
  }

  await logActivity(supabase, {
    eventType: "media.deleted",
    entityType: "media",
    title: `Deleted ${ids.length} media asset${ids.length === 1 ? "" : "s"}`,
    actorId: context.user.id,
  });

  revalidateMediaViews();
  return { success: true };
}

export async function updateMediaAltText(
  _prev: MediaActionState,
  formData: FormData,
): Promise<MediaActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };
  const { supabase } = context;

  const id = String(formData.get("id") ?? "");
  const altText = String(formData.get("altText") ?? "").trim().slice(0, 300);
  if (!UUID_PATTERN.test(id)) return { error: "Invalid media item." };

  const { error } = await supabase
    .from("media_library")
    .update({ alt_text: altText || null })
    .eq("id", id);

  if (error) {
    console.error("Media alt-text update failed:", error.message);
    return { error: "Could not save — please try again." };
  }

  revalidateMediaViews();
  return { success: true };
}
