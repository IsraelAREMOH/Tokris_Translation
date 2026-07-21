"use server";

import { revalidatePath } from "next/cache";

import { getAdminContext } from "@/lib/auth/admin-context";
import {
  MAX_CONTENT_VALUE_LENGTH,
  SITE_CONTENT_FIELDS,
  WHATSAPP_NUMBER_PATTERN,
} from "@/lib/content/constants";

export type SiteContentState = {
  error?: string;
  success?: boolean;
};

export async function updateSiteContent(
  _prev: SiteContentState,
  formData: FormData,
): Promise<SiteContentState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };

  const rows: { key: string; value: string; updated_at: string }[] = [];
  const now = new Date().toISOString();

  for (const field of SITE_CONTENT_FIELDS) {
    const value = String(formData.get(field.key) ?? "").trim();

    if (value.length > MAX_CONTENT_VALUE_LENGTH) {
      return {
        error: `${field.label} is limited to ${MAX_CONTENT_VALUE_LENGTH} characters.`,
      };
    }
    if (
      field.key === "whatsapp_number" &&
      value !== "" &&
      !WHATSAPP_NUMBER_PATTERN.test(value)
    ) {
      return {
        error:
          "The WhatsApp number must be 6–15 digits with country code, no spaces or symbols.",
      };
    }

    rows.push({ key: field.key, value, updated_at: now });
  }

  const { error } = await context.supabase.from("site_content").upsert(rows);

  if (error) {
    console.error("Site content update failed:", error.message);
    return {
      error:
        "Could not save — if this persists, check that migration 0004 has been run.",
    };
  }

  // Public pages (WhatsApp float, contact details) render these values.
  revalidatePath("/[locale]", "layout");
  return { success: true };
}
