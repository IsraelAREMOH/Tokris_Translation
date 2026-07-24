import type { SupabaseClient } from "@supabase/supabase-js";

import type { ActivityEntityType, ActivityEventType } from "@/lib/cms/activity/log";

export type ActivityEntry = {
  id: string;
  event_type: ActivityEventType;
  entity_type: ActivityEntityType;
  entity_id: string | null;
  title: string;
  created_at: string;
  actor_name: string | null;
};

type RawRow = {
  id: string;
  event_type: string;
  entity_type: string;
  entity_id: string | null;
  title: string;
  created_at: string;
  actor: { full_name: string | null } | null;
};

/** Admin-only recent activity feed — takes the already-authenticated client
 * from getAdminContext()/requireAdmin(), mirroring getAdminPosts(). */
export async function getRecentActivity(
  supabase: SupabaseClient,
  limit = 20,
): Promise<ActivityEntry[]> {
  const { data, error } = await supabase
    .from("activity_log")
    .select("id, event_type, entity_type, entity_id, title, created_at, actor:profiles(full_name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Activity feed load failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const raw = row as unknown as RawRow;
    return {
      id: raw.id,
      event_type: raw.event_type as ActivityEventType,
      entity_type: raw.entity_type as ActivityEntityType,
      entity_id: raw.entity_id,
      title: raw.title,
      created_at: raw.created_at,
      actor_name: raw.actor?.full_name ?? null,
    };
  });
}
