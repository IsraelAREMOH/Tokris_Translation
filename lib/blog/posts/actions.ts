"use server";

import { revalidatePath } from "next/cache";

import { getAdminContext } from "@/lib/auth/admin-context";
import { isBlogPostStatus } from "@/lib/blog/posts/constants";
import { slugify } from "@/lib/blog/slugify";
import type { BlogPostStatus } from "@/lib/blog/types";
import type { ActivityEventType } from "@/lib/cms/activity/log";
import { logActivity } from "@/lib/cms/activity/log";
import { createPublicClient } from "@/lib/supabase/public-server";
import { UUID_PATTERN } from "@/lib/validation";

export type PostActionState = {
  error?: string;
  success?: boolean;
  postId?: string;
  savedAt?: number;
};

/**
 * Public, unauthenticated — called once client-side when a visitor opens an
 * article (components/blog/post-view-tracker.tsx). Deliberately NOT done
 * during the page's server render: that route uses ISR (`revalidate`), and
 * a background revalidation re-runs the render without an actual visitor,
 * which would inflate the counter every revalidate window instead of per view.
 */
export async function recordPostView(postId: string): Promise<void> {
  if (!UUID_PATTERN.test(postId)) return;
  const supabase = createPublicClient();
  await supabase.rpc("record_post_view", { p_post_id: postId });
}

const MAX_TITLE_LENGTH = 200;
const MAX_SLUG_LENGTH = 200;
const MAX_EXCERPT_LENGTH = 500;
const MAX_SEO_TITLE_LENGTH = 70;
const MAX_META_DESCRIPTION_LENGTH = 200;
const MAX_URL_LENGTH = 500;
const MAX_CONTENT_JSON_LENGTH = 500_000;
const MAX_CONTENT_TEXT_LENGTH = 200_000;

function revalidatePostViews(id?: string) {
  revalidatePath("/[locale]/(admin)/admin/blog/posts", "page");
  revalidatePath("/[locale]/(admin)/admin/blog", "page");
  if (id) revalidatePath("/[locale]/(admin)/admin/blog/posts/[id]", "page");

  // Public pages — a save/publish/schedule/archive/etc. should show up
  // immediately rather than waiting out the ISR window.
  revalidatePath("/[locale]/(public)", "page");
  revalidatePath("/[locale]/(public)/blog", "page");
  revalidatePath("/[locale]/(public)/blog/[slug]", "page");
  revalidatePath("/[locale]/(public)/blog/category/[slug]", "page");
  revalidatePath("/[locale]/(public)/blog/tag/[slug]", "page");
}

function shortId() {
  return Math.random().toString(36).slice(2, 8);
}

/** Called by app/.../posts/new/page.tsx, which immediately redirects to the
 * real id — every editor session gets a stable row from the start, so
 * autosave never has to special-case "not yet created". */
export async function createDraftPost(): Promise<PostActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };
  const { supabase, user } = context;

  const slug = `untitled-draft-${Date.now().toString(36)}-${shortId()}`;

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      title: "Untitled draft",
      slug,
      content_json: {},
      content_html: "",
      content_text: "",
      status: "draft",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("Draft post create failed:", error?.message);
    return { error: "Could not create a new post — please try again." };
  }

  await logActivity(supabase, {
    eventType: "post.created",
    entityType: "post",
    entityId: data.id,
    title: "Created draft “Untitled draft”",
    actorId: user.id,
  });

  // No revalidatePath() here: this action runs directly from the /posts/new
  // page's server-render (not a client-triggered mutation), where Next.js
  // disallows cache revalidation. Harmless to skip — an untitled empty draft
  // has nothing public-facing to refresh, and the first real savePost() call
  // (always client-triggered) revalidates everything once there's real
  // content to show.
  return { success: true, postId: data.id };
}

type SavePostFields = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  contentJson: unknown;
  contentHtml: string;
  contentText: string;
  readingTimeMinutes: number;
  categoryId: string | null;
  authorId: string | null;
  tagIds: string[];
  coverImageId: string | null;
  coverImageAlt: string | null;
  ogImageId: string | null;
  seoTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  allowComments: boolean;
  featured: boolean;
  pinned: boolean;
  status?: BlogPostStatus;
  scheduledAt?: string;
};

function parseSavePostFormData(formData: FormData): SavePostFields | { error: string } {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const contentJsonRaw = String(formData.get("contentJson") ?? "{}");
  const contentHtml = String(formData.get("contentHtml") ?? "");
  const contentText = String(formData.get("contentText") ?? "");
  const readingTimeMinutes = Number(formData.get("readingTimeMinutes") ?? 1);
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const authorId = String(formData.get("authorId") ?? "").trim();
  const tagIds = formData.getAll("tagIds").map((value) => String(value));
  const coverImageId = String(formData.get("coverImageId") ?? "").trim();
  const coverImageAlt = String(formData.get("coverImageAlt") ?? "").trim();
  const ogImageId = String(formData.get("ogImageId") ?? "").trim();
  const seoTitle = String(formData.get("seoTitle") ?? "").trim();
  const metaDescription = String(formData.get("metaDescription") ?? "").trim();
  const canonicalUrl = String(formData.get("canonicalUrl") ?? "").trim();
  const allowComments = formData.get("allowComments") === "on";
  const featured = formData.get("featured") === "on";
  const pinned = formData.get("pinned") === "on";
  const statusRaw = String(formData.get("status") ?? "");
  const scheduledAt = String(formData.get("scheduledAt") ?? "").trim();

  if (!UUID_PATTERN.test(id)) return { error: "Invalid post." };
  if (!title) return { error: "Title is required." };
  if (title.length > MAX_TITLE_LENGTH) {
    return { error: `Title is limited to ${MAX_TITLE_LENGTH} characters.` };
  }
  if (excerpt.length > MAX_EXCERPT_LENGTH) {
    return { error: `Excerpt is limited to ${MAX_EXCERPT_LENGTH} characters.` };
  }
  if (seoTitle.length > MAX_SEO_TITLE_LENGTH) {
    return { error: `SEO title is limited to ${MAX_SEO_TITLE_LENGTH} characters.` };
  }
  if (metaDescription.length > MAX_META_DESCRIPTION_LENGTH) {
    return { error: `Meta description is limited to ${MAX_META_DESCRIPTION_LENGTH} characters.` };
  }
  if (canonicalUrl.length > MAX_URL_LENGTH) {
    return { error: "Canonical URL is too long." };
  }
  if (contentJsonRaw.length > MAX_CONTENT_JSON_LENGTH) {
    return { error: "This post's content is too large to save." };
  }
  if (contentText.length > MAX_CONTENT_TEXT_LENGTH) {
    return { error: "This post's content is too large to save." };
  }
  if (categoryId && !UUID_PATTERN.test(categoryId)) return { error: "Invalid category." };
  if (authorId && !UUID_PATTERN.test(authorId)) return { error: "Invalid author." };
  if (coverImageId && !UUID_PATTERN.test(coverImageId)) return { error: "Invalid cover image." };
  if (ogImageId && !UUID_PATTERN.test(ogImageId)) return { error: "Invalid OG image." };
  if (tagIds.some((tagId) => !UUID_PATTERN.test(tagId))) return { error: "Invalid tag selection." };

  const slug = slugify(slugInput || title);
  if (!slug || slug.length > MAX_SLUG_LENGTH) {
    return { error: "Could not derive a valid slug — add letters or numbers." };
  }

  let contentJson: unknown;
  try {
    contentJson = JSON.parse(contentJsonRaw);
  } catch {
    return { error: "Could not parse the editor content — please try again." };
  }

  const readingTime = Number.isFinite(readingTimeMinutes)
    ? Math.min(500, Math.max(1, Math.round(readingTimeMinutes)))
    : 1;

  let status: BlogPostStatus | undefined;
  if (statusRaw) {
    if (!isBlogPostStatus(statusRaw)) return { error: "Invalid status." };
    status = statusRaw;
  }
  if (status === "scheduled" && !scheduledAt) {
    return { error: "Choose a date and time to schedule this post." };
  }

  return {
    id,
    title,
    slug,
    excerpt: excerpt || null,
    contentJson,
    contentHtml,
    contentText,
    readingTimeMinutes: readingTime,
    categoryId: categoryId || null,
    authorId: authorId || null,
    tagIds,
    coverImageId: coverImageId || null,
    coverImageAlt: coverImageAlt || null,
    ogImageId: ogImageId || null,
    seoTitle: seoTitle || null,
    metaDescription: metaDescription || null,
    canonicalUrl: canonicalUrl || null,
    allowComments,
    featured,
    pinned,
    status,
    scheduledAt: scheduledAt || undefined,
  };
}

/**
 * The editor's single save path — used by autosave, "Save Draft", "Publish
 * Now", "Schedule" and "Archive" alike. Always writes the full field set so
 * a status transition can never publish content staler than what's on
 * screen. `status` is omitted for plain autosave (keeps whatever status the
 * post already has).
 */
export async function savePost(
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };
  const { supabase } = context;

  const fields = parseSavePostFormData(formData);
  if ("error" in fields) return { error: fields.error };

  const { data: existing, error: existingError } = await supabase
    .from("blog_posts")
    .select("slug, status, published_at, pinned")
    .eq("id", fields.id)
    .maybeSingle();

  if (existingError || !existing) {
    console.error("Post save: lookup failed:", existingError?.message);
    return { error: "Post not found." };
  }

  const update: Record<string, unknown> = {
    title: fields.title,
    slug: fields.slug,
    excerpt: fields.excerpt,
    content_json: fields.contentJson,
    content_html: fields.contentHtml,
    content_text: fields.contentText,
    reading_time_minutes: fields.readingTimeMinutes,
    category_id: fields.categoryId,
    author_id: fields.authorId,
    cover_image_id: fields.coverImageId,
    cover_image_alt: fields.coverImageAlt,
    og_image_id: fields.ogImageId,
    seo_title: fields.seoTitle,
    meta_description: fields.metaDescription,
    canonical_url: fields.canonicalUrl,
    allow_comments: fields.allowComments,
    featured: fields.featured,
    pinned: fields.pinned,
  };

  if (fields.pinned && !existing.pinned) update.pinned_at = new Date().toISOString();
  if (!fields.pinned) update.pinned_at = null;

  if (fields.status === "published") {
    update.status = "published";
    update.scheduled_at = null;
    if (!existing.published_at) update.published_at = new Date().toISOString();
  } else if (fields.status === "scheduled") {
    update.status = "scheduled";
    update.scheduled_at = fields.scheduledAt;
    update.published_at = fields.scheduledAt;
  } else if (fields.status === "archived") {
    update.status = "archived";
  } else if (fields.status === "draft") {
    update.status = "draft";
  }

  const { error: updateError } = await supabase
    .from("blog_posts")
    .update(update)
    .eq("id", fields.id);

  if (updateError) {
    console.error("Post save failed:", updateError.message);
    return {
      error:
        updateError.code === "23505"
          ? "That slug is already used by another post."
          : "Could not save — please try again.",
    };
  }

  // Only a genuine status transition is logged — plain autosave omits
  // `status` entirely (see the doc comment above), so this never fires on
  // every 30s autosave tick, only on explicit Save Draft/Publish/Schedule/
  // Archive button clicks that actually change the post's status.
  if (fields.status && fields.status !== existing.status) {
    const verb =
      fields.status === "published"
        ? "Published"
        : fields.status === "scheduled"
          ? "Scheduled"
          : fields.status === "archived"
            ? "Archived"
            : "Updated";
    const eventType: ActivityEventType =
      fields.status === "published" ? "post.published" : "post.updated";
    await logActivity(supabase, {
      eventType,
      entityType: "post",
      entityId: fields.id,
      title: `${verb} “${fields.title}”`,
      actorId: context.user.id,
    });
  }

  // Slug redirects only matter once a slug has been (or could be) publicly
  // live — skip them for draft-stage slug fiddling.
  const wasPubliclyLive = existing.status === "published" || existing.status === "scheduled";
  if (wasPubliclyLive && existing.slug && existing.slug !== fields.slug) {
    const { error: redirectError } = await supabase
      .from("blog_post_slug_redirects")
      .upsert({ old_slug: existing.slug, post_id: fields.id }, { onConflict: "old_slug" });
    if (redirectError) {
      console.error("Slug redirect record failed:", redirectError.message);
    }
  }

  const { error: tagsDeleteError } = await supabase
    .from("blog_post_tags")
    .delete()
    .eq("post_id", fields.id);
  if (tagsDeleteError) {
    console.error("Post tag sync (delete) failed:", tagsDeleteError.message);
  } else if (fields.tagIds.length > 0) {
    const { error: tagsInsertError } = await supabase
      .from("blog_post_tags")
      .insert(fields.tagIds.map((tagId) => ({ post_id: fields.id, tag_id: tagId })));
    if (tagsInsertError) {
      console.error("Post tag sync (insert) failed:", tagsInsertError.message);
    }
  }

  revalidatePostViews(fields.id);
  return { success: true, postId: fields.id, savedAt: Date.now() };
}

/** post_id, category_id, author_id, cover/og image references are all ON
 * DELETE SET NULL/CASCADE — deleting a post never fails on referential grounds. */
export async function deletePost(
  _prev: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };

  const id = String(formData.get("id") ?? "");
  if (!UUID_PATTERN.test(id)) return { error: "Invalid post." };

  const { data, error } = await context.supabase
    .from("blog_posts")
    .delete()
    .eq("id", id)
    .select("title")
    .maybeSingle();
  if (error) {
    console.error("Post delete failed:", error.message);
    return { error: "Could not delete — please try again." };
  }

  if (data) {
    await logActivity(context.supabase, {
      eventType: "post.deleted",
      entityType: "post",
      entityId: id,
      title: `Deleted “${data.title}”`,
      actorId: context.user.id,
    });
  }

  revalidatePostViews();
  return { success: true };
}

/** Callable directly from client components (list-page row menu). */
export async function duplicatePost(id: string): Promise<PostActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };
  const { supabase, user } = context;

  if (!UUID_PATTERN.test(id)) return { error: "Invalid post." };

  const { data: original, error: fetchError } = await supabase
    .from("blog_posts")
    .select(
      "title, slug, excerpt, content_json, content_html, content_text, reading_time_minutes, cover_image_id, cover_image_alt, category_id, author_id, seo_title, meta_description, canonical_url, og_image_id, allow_comments",
    )
    .eq("id", id)
    .single();

  if (fetchError || !original) return { error: "Post not found." };

  const { data: tagRows } = await supabase
    .from("blog_post_tags")
    .select("tag_id")
    .eq("post_id", id);

  const { data: created, error: insertError } = await supabase
    .from("blog_posts")
    .insert({
      ...original,
      title: `${original.title} (copy)`,
      slug: `${original.slug}-copy-${shortId()}`,
      status: "draft",
      published_at: null,
      scheduled_at: null,
      view_count: 0,
      featured: false,
      pinned: false,
      pinned_at: null,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (insertError || !created) {
    console.error("Post duplicate failed:", insertError?.message);
    return { error: "Could not duplicate — please try again." };
  }

  const tagIds = (tagRows ?? []).map((row) => row.tag_id as string);
  if (tagIds.length > 0) {
    await supabase
      .from("blog_post_tags")
      .insert(tagIds.map((tagId) => ({ post_id: created.id, tag_id: tagId })));
  }

  await logActivity(supabase, {
    eventType: "post.created",
    entityType: "post",
    entityId: created.id,
    title: `Duplicated “${original.title}”`,
    actorId: user.id,
  });

  revalidatePostViews();
  return { success: true, postId: created.id };
}

async function transitionStatus(
  id: string,
  update: Record<string, unknown>,
  logEvent?: (title: string) => { eventType: ActivityEventType; title: string },
): Promise<PostActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };
  if (!UUID_PATTERN.test(id)) return { error: "Invalid post." };

  const { data, error } = await context.supabase
    .from("blog_posts")
    .update(update)
    .eq("id", id)
    .select("title")
    .single();
  if (error) {
    console.error("Post status change failed:", error.message);
    return { error: "Could not update the post — please try again." };
  }

  if (logEvent && data) {
    const event = logEvent(data.title);
    await logActivity(context.supabase, {
      eventType: event.eventType,
      entityType: "post",
      entityId: id,
      title: event.title,
      actorId: context.user.id,
    });
  }

  revalidatePostViews(id);
  return { success: true };
}

export async function archivePost(id: string): Promise<PostActionState> {
  return transitionStatus(id, { status: "archived" }, (title) => ({
    eventType: "post.updated",
    title: `Archived “${title}”`,
  }));
}

export async function restorePost(id: string): Promise<PostActionState> {
  return transitionStatus(id, { status: "draft" }, (title) => ({
    eventType: "post.updated",
    title: `Restored “${title}” to draft`,
  }));
}

/** One-click publish/unpublish from the list — no scheduling, keeps the
 * original published_at on republish (only set the first time). */
export async function quickTogglePublish(id: string): Promise<PostActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };
  if (!UUID_PATTERN.test(id)) return { error: "Invalid post." };
  const { supabase } = context;

  const { data: existing, error: fetchError } = await supabase
    .from("blog_posts")
    .select("status, published_at")
    .eq("id", id)
    .maybeSingle();
  if (fetchError || !existing) return { error: "Post not found." };

  const publishing = existing.status !== "published";
  const update = publishing
    ? {
        status: "published" as const,
        scheduled_at: null,
        published_at: existing.published_at ?? new Date().toISOString(),
      }
    : { status: "draft" as const };

  return transitionStatus(id, update, (title) => ({
    eventType: publishing ? "post.published" : "post.updated",
    title: publishing ? `Published “${title}”` : `Unpublished “${title}”`,
  }));
}

export async function toggleFeatured(id: string, featured: boolean): Promise<PostActionState> {
  return transitionStatus(id, { featured });
}

export async function togglePinned(id: string, pinned: boolean): Promise<PostActionState> {
  return transitionStatus(id, { pinned, pinned_at: pinned ? new Date().toISOString() : null });
}

export async function bulkUpdatePostStatus(
  ids: string[],
  status: BlogPostStatus,
): Promise<PostActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };
  if (ids.length === 0) return { error: "No posts selected." };

  const { error } = await context.supabase
    .from("blog_posts")
    .update({ status })
    .in("id", ids);

  if (error) {
    console.error("Bulk post status update failed:", error.message);
    return { error: "Could not update the selected posts — please try again." };
  }

  await logActivity(context.supabase, {
    eventType: status === "published" ? "post.published" : "post.updated",
    entityType: "post",
    title: `${status === "published" ? "Published" : status === "archived" ? "Archived" : "Updated"} ${ids.length} post${ids.length === 1 ? "" : "s"}`,
    actorId: context.user.id,
  });

  revalidatePostViews();
  return { success: true };
}

export async function bulkDeletePosts(ids: string[]): Promise<PostActionState> {
  const context = await getAdminContext();
  if ("error" in context) return { error: context.error };
  if (ids.length === 0) return { error: "No posts selected." };

  const { error } = await context.supabase.from("blog_posts").delete().in("id", ids);
  if (error) {
    console.error("Bulk post delete failed:", error.message);
    return { error: "Could not delete the selected posts — please try again." };
  }

  await logActivity(context.supabase, {
    eventType: "post.deleted",
    entityType: "post",
    title: `Deleted ${ids.length} post${ids.length === 1 ? "" : "s"}`,
    actorId: context.user.id,
  });

  revalidatePostViews();
  return { success: true };
}
