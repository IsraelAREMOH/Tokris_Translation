"use server";

import { revalidatePath } from "next/cache";

import { slugify } from "@/lib/blog/slugify";
import { getAdminContext } from "@/lib/auth/admin-context";
import { logActivity } from "@/lib/cms/activity/log";
import { UUID_PATTERN } from "@/lib/validation";

export type CategoryActionState = {
  error?: string;
  success?: boolean;
};

const MAX_NAME_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 300;

function revalidateCategoryViews() {
  revalidatePath("/[locale]/(admin)/admin/blog/categories", "page");
  revalidatePath("/[locale]/(public)/blog", "page");
  revalidatePath("/[locale]/(public)/blog/category/[slug]", "page");
}

function uniqueSlugError(error: { code?: string; message: string }) {
  console.error("Category save failed:", error.message);
  return error.code === "23505"
    ? "That slug is already in use by another category."
    : "Could not save the category — please try again.";
}

export async function createCategory(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };

  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) return { error: "Name is required." };
  if (name.length > MAX_NAME_LENGTH) {
    return { error: `Name is limited to ${MAX_NAME_LENGTH} characters.` };
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: `Description is limited to ${MAX_DESCRIPTION_LENGTH} characters.` };
  }

  const slug = slugify(slugInput || name);
  if (!slug) {
    return { error: "Could not generate a slug from that name — add letters or numbers." };
  }

  const { count } = await context.supabase
    .from("blog_categories")
    .select("id", { count: "exact", head: true });

  const { data, error } = await context.supabase
    .from("blog_categories")
    .insert({
      name,
      slug,
      description: description || null,
      sort_order: count ?? 0,
    })
    .select("id")
    .single();

  if (error) return { error: uniqueSlugError(error) };

  await logActivity(context.supabase, {
    eventType: "category.created",
    entityType: "category",
    entityId: data?.id,
    title: `Created category “${name}”`,
    actorId: context.user.id,
  });

  revalidateCategoryViews();
  return { success: true };
}

export async function updateCategory(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!UUID_PATTERN.test(id)) return { error: "Invalid category." };
  if (!name) return { error: "Name is required." };
  if (name.length > MAX_NAME_LENGTH) {
    return { error: `Name is limited to ${MAX_NAME_LENGTH} characters.` };
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: `Description is limited to ${MAX_DESCRIPTION_LENGTH} characters.` };
  }

  const slug = slugify(slugInput || name);
  if (!slug) {
    return { error: "Could not generate a slug from that name — add letters or numbers." };
  }

  const { error } = await context.supabase
    .from("blog_categories")
    .update({ name, slug, description: description || null })
    .eq("id", id);

  if (error) return { error: uniqueSlugError(error) };

  await logActivity(context.supabase, {
    eventType: "category.updated",
    entityType: "category",
    entityId: id,
    title: `Updated category “${name}”`,
    actorId: context.user.id,
  });

  revalidateCategoryViews();
  return { success: true };
}

/** category_id on blog_posts is ON DELETE SET NULL, so this always succeeds. */
export async function deleteCategory(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) return { error: "Invalid category." };

  const { data, error } = await context.supabase
    .from("blog_categories")
    .delete()
    .eq("id", id)
    .select("name")
    .maybeSingle();
  if (error) {
    console.error("Category delete failed:", error.message);
    return { error: "Could not delete — please try again." };
  }

  if (data) {
    await logActivity(context.supabase, {
      eventType: "category.deleted",
      entityType: "category",
      entityId: id,
      title: `Deleted category “${data.name}”`,
      actorId: context.user.id,
    });
  }

  revalidateCategoryViews();
  return { success: true };
}

export async function moveCategory(
  _prev: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };
  const { supabase } = context;

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!UUID_PATTERN.test(id) || (direction !== "up" && direction !== "down")) {
    return { error: "Invalid reorder request." };
  }

  const { data, error } = await supabase
    .from("blog_categories")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("Category reorder failed:", error?.message);
    return { error: "Could not reorder — please try again." };
  }

  const index = data.findIndex((row) => row.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= data.length) {
    return { success: true }; // already at the boundary — no-op
  }

  const current = data[index];
  const swap = data[swapIndex];

  const [{ error: err1 }, { error: err2 }] = await Promise.all([
    supabase.from("blog_categories").update({ sort_order: swap.sort_order }).eq("id", current.id),
    supabase.from("blog_categories").update({ sort_order: current.sort_order }).eq("id", swap.id),
  ]);

  if (err1 || err2) {
    console.error("Category reorder failed:", err1?.message, err2?.message);
    return { error: "Could not reorder — please try again." };
  }

  revalidateCategoryViews();
  return { success: true };
}
