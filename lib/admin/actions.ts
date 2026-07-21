"use server";

import { revalidatePath } from "next/cache";

import { getAdminContext } from "@/lib/auth/admin-context";
import { isProjectStatus } from "@/lib/projects/constants";
import {
  MAX_FILES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  hasAllowedExtension,
  sanitizeFileName,
} from "@/lib/quotes/constants";
import { MAX_MESSAGE_LENGTH, UUID_PATTERN } from "@/lib/validation";

export type AdminActionState = {
  error?: string;
  success?: boolean;
};

export type CompletedUploadState = {
  error?: string;
  /** Set on success — the upload form keys the drop zone on it to reset. */
  uploadedAt?: number;
};

/** Console list/detail and the client portal all render this data. */
function revalidateProjectViews() {
  revalidatePath("/[locale]/(admin)/admin/projects", "page");
  revalidatePath("/[locale]/(admin)/admin/projects/[id]", "page");
  revalidatePath("/[locale]/(portal)/portal/requests", "page");
  revalidatePath("/[locale]/(portal)/portal/requests/[id]", "page");
}

export async function updateProjectStatus(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };

  const projectId = String(formData.get("projectId") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!UUID_PATTERN.test(projectId) || !isProjectStatus(status)) {
    return { error: "Invalid status update request." };
  }

  // .select().single() so an update that matched no row surfaces as an error.
  const { data, error } = await context.supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId)
    .select("id")
    .single();

  if (error || !data) {
    console.error("Admin status update failed:", error?.message);
    return { error: "Could not update the status — please try again." };
  }

  revalidateProjectViews();
  return { success: true };
}

export async function postProjectMessage(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };

  const projectId = String(formData.get("projectId") ?? "");
  const messageText = String(formData.get("message") ?? "").trim();

  if (!UUID_PATTERN.test(projectId)) {
    return { error: "Invalid message request." };
  }
  if (!messageText) {
    return { error: "Write a message before posting." };
  }
  if (messageText.length > MAX_MESSAGE_LENGTH) {
    return {
      error: `Messages are limited to ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }

  const { error } = await context.supabase.from("messages").insert({
    project_id: projectId,
    sender_id: context.user.id,
    message_text: messageText,
  });

  if (error) {
    console.error("Admin message post failed:", error.message);
    return { error: "Could not post the message — please try again." };
  }

  revalidateProjectViews();
  return { success: true };
}

export async function uploadCompletedFiles(
  _prev: CompletedUploadState,
  formData: FormData,
): Promise<CompletedUploadState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };
  const { supabase, user } = context;

  const projectId = String(formData.get("projectId") ?? "");
  const files = formData
    .getAll("files")
    .filter(
      (entry): entry is File =>
        entry instanceof File && entry.size > 0 && entry.name !== "",
    );

  if (!UUID_PATTERN.test(projectId)) {
    return { error: "Invalid upload request." };
  }
  if (files.length === 0) {
    return { error: "Attach at least one finished document." };
  }
  if (files.length > MAX_FILES) {
    return { error: `Upload at most ${MAX_FILES} files at a time.` };
  }
  for (const file of files) {
    if (!hasAllowedExtension(file.name)) {
      return { error: `Unsupported file type: ${file.name}` };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        error: `${file.name} exceeds the ${MAX_FILE_SIZE_MB} MB limit.`,
      };
    }
  }

  // The storage path must start with the owning client's uid — that first
  // folder segment is what grants the client download access (migration 0003).
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("client_id")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    console.error("Completed upload: project lookup failed:", projectError?.message);
    return { error: "Project not found." };
  }

  const uploadedPaths: string[] = [];
  const rollback = async () => {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from("translations").remove(uploadedPaths);
    }
  };

  const fileRows: {
    project_id: string;
    file_name: string;
    storage_path: string;
    uploaded_by: string;
    file_type: string;
  }[] = [];

  for (const [index, file] of files.entries()) {
    const storagePath = `${project.client_id}/${projectId}/completed/${Date.now()}-${index}-${sanitizeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from("translations")
      .upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
      });

    if (uploadError) {
      console.error("Completed upload: upload failed:", uploadError.message);
      await rollback();
      return { error: "A file failed to upload — please try again." };
    }

    uploadedPaths.push(storagePath);
    fileRows.push({
      project_id: projectId,
      file_name: file.name,
      storage_path: storagePath,
      uploaded_by: user.id,
      file_type: "completed",
    });
  }

  const { error: filesError } = await supabase
    .from("project_files")
    .insert(fileRows);

  if (filesError) {
    console.error("Completed upload: file records failed:", filesError.message);
    await rollback();
    return { error: "Could not save the file records — please try again." };
  }

  revalidateProjectViews();
  return { uploadedAt: Date.now() };
}
