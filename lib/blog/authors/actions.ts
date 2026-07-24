"use server";

import { revalidatePath } from "next/cache";

import { getAdminContext } from "@/lib/auth/admin-context";
import { logActivity } from "@/lib/cms/activity/log";
import { UUID_PATTERN } from "@/lib/validation";

export type AuthorActionState = {
  error?: string;
  success?: boolean;
};

const MAX_NAME_LENGTH = 100;
const MAX_POSITION_LENGTH = 100;
const MAX_BIO_LENGTH = 1000;
const MAX_EMAIL_LENGTH = 200;
const MAX_URL_LENGTH = 300;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function revalidateAuthorViews() {
  revalidatePath("/[locale]/(admin)/admin/blog/authors", "page");
  revalidatePath("/[locale]/(public)/blog", "page");
  revalidatePath("/[locale]/(public)/blog/[slug]", "page");
}

function parseSocialLinks(formData: FormData) {
  const links: Record<string, string> = {};
  for (const key of ["twitter", "linkedin", "website"] as const) {
    const value = String(formData.get(`social_${key}`) ?? "").trim();
    if (value) links[key] = value.slice(0, MAX_URL_LENGTH);
  }
  return links;
}

function parseCommonFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const photoId = String(formData.get("photoId") ?? "").trim();
  const featured = formData.get("featured") === "on";

  if (!name) return { error: "Name is required." } as const;
  if (name.length > MAX_NAME_LENGTH) {
    return { error: `Name is limited to ${MAX_NAME_LENGTH} characters.` } as const;
  }
  if (position.length > MAX_POSITION_LENGTH) {
    return { error: `Position is limited to ${MAX_POSITION_LENGTH} characters.` } as const;
  }
  if (bio.length > MAX_BIO_LENGTH) {
    return { error: `Bio is limited to ${MAX_BIO_LENGTH} characters.` } as const;
  }
  if (email && (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email))) {
    return { error: "Enter a valid email address." } as const;
  }
  if (photoId && !UUID_PATTERN.test(photoId)) {
    return { error: "Invalid photo selection." } as const;
  }

  return {
    name,
    position: position || null,
    email: email || null,
    bio: bio || null,
    photo_id: photoId || null,
    featured,
    social_links: parseSocialLinks(formData),
  } as const;
}

export async function createAuthor(
  _prev: AuthorActionState,
  formData: FormData,
): Promise<AuthorActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };

  const fields = parseCommonFields(formData);
  if ("error" in fields) return fields;

  const { data, error } = await context.supabase
    .from("blog_authors")
    .insert(fields)
    .select("id")
    .single();
  if (error) {
    console.error("Author create failed:", error.message);
    return { error: "Could not create the author — please try again." };
  }

  await logActivity(context.supabase, {
    eventType: "author.created",
    entityType: "author",
    entityId: data?.id,
    title: `Added author “${fields.name}”`,
    actorId: context.user.id,
  });

  revalidateAuthorViews();
  return { success: true };
}

export async function updateAuthor(
  _prev: AuthorActionState,
  formData: FormData,
): Promise<AuthorActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) return { error: "Invalid author." };

  const fields = parseCommonFields(formData);
  if ("error" in fields) return fields;

  const { error } = await context.supabase
    .from("blog_authors")
    .update(fields)
    .eq("id", id);

  if (error) {
    console.error("Author update failed:", error.message);
    return { error: "Could not save — please try again." };
  }

  await logActivity(context.supabase, {
    eventType: "author.updated",
    entityType: "author",
    entityId: id,
    title: `Updated author “${fields.name}”`,
    actorId: context.user.id,
  });

  revalidateAuthorViews();
  return { success: true };
}

/** author_id on blog_posts is ON DELETE SET NULL, so this always succeeds. */
export async function deleteAuthor(
  _prev: AuthorActionState,
  formData: FormData,
): Promise<AuthorActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) return { error: "Invalid author." };

  const { data, error } = await context.supabase
    .from("blog_authors")
    .delete()
    .eq("id", id)
    .select("name")
    .maybeSingle();
  if (error) {
    console.error("Author delete failed:", error.message);
    return { error: "Could not delete — please try again." };
  }

  if (data) {
    await logActivity(context.supabase, {
      eventType: "author.deleted",
      entityType: "author",
      entityId: id,
      title: `Removed author “${data.name}”`,
      actorId: context.user.id,
    });
  }

  revalidateAuthorViews();
  return { success: true };
}
