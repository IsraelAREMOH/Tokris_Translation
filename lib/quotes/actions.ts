"use server";

import { getTranslations } from "next-intl/server";

import { LANGUAGES } from "@/lib/languages";
import {
  MAX_FILES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  hasAllowedExtension,
  sanitizeFileName,
} from "@/lib/quotes/constants";
import { createClient } from "@/lib/supabase/server";
import { MAX_INSTRUCTIONS_LENGTH } from "@/lib/validation";

export type QuoteFormState = {
  error?: string;
  success?: boolean;
};

export async function submitQuoteRequest(
  _prev: QuoteFormState,
  formData: FormData,
): Promise<QuoteFormState> {
  const t = await getTranslations("quote.errors");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: t("notAuthenticated") };
  }

  const sourceLanguage = String(formData.get("sourceLanguage") ?? "");
  const targetLanguage = String(formData.get("targetLanguage") ?? "");
  const deadline = String(formData.get("deadline") ?? "");
  const instructions = String(formData.get("instructions") ?? "").trim();
  const files = formData
    .getAll("files")
    .filter(
      (entry): entry is File =>
        entry instanceof File && entry.size > 0 && entry.name !== "",
    );

  if (
    !LANGUAGES.includes(sourceLanguage) ||
    !LANGUAGES.includes(targetLanguage) ||
    !deadline
  ) {
    return { error: t("missingFields") };
  }
  if (sourceLanguage === targetLanguage) {
    return { error: t("sameLanguage") };
  }
  if (instructions.length > MAX_INSTRUCTIONS_LENGTH) {
    return {
      error: t("instructionsTooLong", { max: MAX_INSTRUCTIONS_LENGTH }),
    };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    return { error: t("invalidDeadline") };
  }
  const deadlineDate = new Date(`${deadline}T23:59:59.999Z`);
  if (
    Number.isNaN(deadlineDate.getTime()) ||
    deadlineDate.getTime() < Date.now()
  ) {
    return { error: t("invalidDeadline") };
  }

  if (files.length === 0) {
    return { error: t("noFiles") };
  }
  if (files.length > MAX_FILES) {
    return { error: t("tooManyFiles", { max: MAX_FILES }) };
  }
  for (const file of files) {
    if (!hasAllowedExtension(file.name)) {
      return { error: t("unsupportedType", { name: file.name }) };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { error: t("fileTooLarge", { name: file.name, max: MAX_FILE_SIZE_MB }) };
    }
  }

  // All inserts/uploads run as the logged-in user, so the RLS policies from
  // migration 0003 are enforced end to end.
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      client_id: user.id,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      deadline: deadlineDate.toISOString(),
      instructions: instructions || null,
    })
    .select("id")
    .single();

  if (projectError || !project) {
    console.error("Quote request: project insert failed:", projectError?.message);
    return { error: t("generic") };
  }

  const uploadedPaths: string[] = [];

  // Roll back everything if any step below fails — no orphaned projects
  // or dangling storage objects.
  const rollback = async () => {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from("translations").remove(uploadedPaths);
    }
    await supabase.from("projects").delete().eq("id", project.id);
  };

  const fileRows: {
    project_id: string;
    file_name: string;
    storage_path: string;
    uploaded_by: string;
    file_type: string;
  }[] = [];

  for (const [index, file] of files.entries()) {
    const storagePath = `${user.id}/${project.id}/source/${Date.now()}-${index}-${sanitizeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from("translations")
      .upload(storagePath, file, {
        contentType: file.type || "application/octet-stream",
      });

    if (uploadError) {
      console.error("Quote request: upload failed:", uploadError.message);
      await rollback();
      return { error: t("uploadFailed") };
    }

    uploadedPaths.push(storagePath);
    fileRows.push({
      project_id: project.id,
      file_name: file.name,
      storage_path: storagePath,
      uploaded_by: user.id,
      file_type: "source",
    });
  }

  const { error: filesError } = await supabase
    .from("project_files")
    .insert(fileRows);

  if (filesError) {
    console.error("Quote request: file records failed:", filesError.message);
    await rollback();
    return { error: t("generic") };
  }

  return { success: true };
}
