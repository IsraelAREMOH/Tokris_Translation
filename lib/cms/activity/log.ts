import type { SupabaseClient } from "@supabase/supabase-js";

// Closed list, matching supabase/migrations/0010_cms_foundation.sql's comment
// on activity_log.event_type. Kept small: transitions like scheduling/
// archiving fold into "post.updated" with a descriptive title rather than
// growing the type list per status.
export type ActivityEventType =
  | "post.created"
  | "post.updated"
  | "post.published"
  | "post.deleted"
  | "category.created"
  | "category.updated"
  | "category.deleted"
  | "tag.created"
  | "tag.updated"
  | "tag.deleted"
  | "author.created"
  | "author.updated"
  | "author.deleted"
  | "media.uploaded"
  | "media.deleted"
  | "newsletter.subscribed"
  | "newsletter.deleted"
  | "page.updated";

export type ActivityEntityType =
  | "post"
  | "category"
  | "tag"
  | "author"
  | "media"
  | "newsletter_subscriber"
  | "page";

/**
 * Best-effort activity log write — called from within existing admin
 * actions after their real write already succeeded. Never throws: a logging
 * failure shouldn't fail the action that triggered it, so errors are just
 * logged to the console for troubleshooting (matches getSiteContent()'s
 * error-tolerant style elsewhere in this codebase).
 */
export async function logActivity(
  supabase: SupabaseClient,
  {
    eventType,
    entityType,
    entityId,
    title,
    actorId,
  }: {
    eventType: ActivityEventType;
    entityType: ActivityEntityType;
    entityId?: string | null;
    title: string;
    actorId?: string | null;
  },
): Promise<void> {
  const { error } = await supabase.from("activity_log").insert({
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId ?? null,
    title,
    actor_id: actorId ?? null,
  });

  if (error) {
    console.error("Activity log write failed:", error.message);
  }
}
