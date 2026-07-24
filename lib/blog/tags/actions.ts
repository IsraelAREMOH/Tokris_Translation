"use server";

import { revalidatePath } from "next/cache";

import { getAdminContext } from "@/lib/auth/admin-context";
import { slugify } from "@/lib/blog/slugify";
import { logActivity } from "@/lib/cms/activity/log";
import { UUID_PATTERN } from "@/lib/validation";

export type TagActionState = {
  error?: string;
  success?: boolean;
};

const MAX_NAME_LENGTH = 60;

function revalidateTagViews() {
  revalidatePath("/[locale]/(admin)/admin/blog/tags", "page");
  revalidatePath("/[locale]/(public)/blog", "page");
  revalidatePath("/[locale]/(public)/blog/tag/[slug]", "page");
}

function uniqueSlugError(error: { code?: string; message: string }) {
  console.error("Tag save failed:", error.message);
  return error.code === "23505"
    ? "That slug is already in use by another tag."
    : "Could not save the tag — please try again.";
}

export async function createTag(
  _prev: TagActionState,
  formData: FormData,
): Promise<TagActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();

  if (!name) return { error: "Name is required." };
  if (name.length > MAX_NAME_LENGTH) {
    return { error: `Name is limited to ${MAX_NAME_LENGTH} characters.` };
  }

  const slug = slugify(slugInput || name);
  if (!slug) {
    return { error: "Could not generate a slug from that name — add letters or numbers." };
  }

  const { data, error } = await context.supabase
    .from("blog_tags")
    .insert({ name, slug })
    .select("id")
    .single();
  if (error) return { error: uniqueSlugError(error) };

  await logActivity(context.supabase, {
    eventType: "tag.created",
    entityType: "tag",
    entityId: data?.id,
    title: `Created tag “${name}”`,
    actorId: context.user.id,
  });

  revalidateTagViews();
  return { success: true };
}

export async function updateTag(
  _prev: TagActionState,
  formData: FormData,
): Promise<TagActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();

  if (!UUID_PATTERN.test(id)) return { error: "Invalid tag." };
  if (!name) return { error: "Name is required." };
  if (name.length > MAX_NAME_LENGTH) {
    return { error: `Name is limited to ${MAX_NAME_LENGTH} characters.` };
  }

  const slug = slugify(slugInput || name);
  if (!slug) {
    return { error: "Could not generate a slug from that name — add letters or numbers." };
  }

  const { error } = await context.supabase
    .from("blog_tags")
    .update({ name, slug })
    .eq("id", id);

  if (error) return { error: uniqueSlugError(error) };

  await logActivity(context.supabase, {
    eventType: "tag.updated",
    entityType: "tag",
    entityId: id,
    title: `Updated tag “${name}”`,
    actorId: context.user.id,
  });

  revalidateTagViews();
  return { success: true };
}

/** tag_id on blog_post_tags is ON DELETE CASCADE — deleting a tag just untags its posts. */
export async function deleteTag(
  _prev: TagActionState,
  formData: FormData,
): Promise<TagActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) return { error: "Invalid tag." };

  const { data, error } = await context.supabase
    .from("blog_tags")
    .delete()
    .eq("id", id)
    .select("name")
    .maybeSingle();
  if (error) {
    console.error("Tag delete failed:", error.message);
    return { error: "Could not delete — please try again." };
  }

  if (data) {
    await logActivity(context.supabase, {
      eventType: "tag.deleted",
      entityType: "tag",
      entityId: id,
      title: `Deleted tag “${data.name}”`,
      actorId: context.user.id,
    });
  }

  revalidateTagViews();
  return { success: true };
}
