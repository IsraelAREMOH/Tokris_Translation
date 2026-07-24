import type { SupabaseClient } from "@supabase/supabase-js";

import { NEWSLETTER_PAGE_SIZE, type NewsletterStatus } from "@/lib/blog/newsletter/constants";

export type NewsletterSubscriber = {
  id: string;
  email: string;
  status: NewsletterStatus;
  source: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
};

/**
 * Admin-scoped list for the Newsletter page — takes the already-authenticated
 * client from getAdminContext()/requireAdmin(), mirroring listMedia()/
 * getAdminPosts(). `source` isn't a fixed enum (see 0005's plain `text`
 * column), so any new signup surface just works without a schema change.
 */
export async function listSubscribers(
  supabase: SupabaseClient,
  {
    search,
    status,
    page = 1,
    pageSize = NEWSLETTER_PAGE_SIZE,
  }: {
    search?: string;
    status?: NewsletterStatus;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<{ subscribers: NewsletterSubscriber[]; total: number }> {
  let query = supabase
    .from("newsletter_subscribers")
    .select("id, email, status, source, subscribed_at, unsubscribed_at", { count: "exact" })
    .order("subscribed_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (search) query = query.ilike("email", `%${search}%`);

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);

  if (error) {
    console.error("Newsletter subscribers load failed:", error.message);
    return { subscribers: [], total: 0 };
  }

  return { subscribers: (data ?? []) as NewsletterSubscriber[], total: count ?? 0 };
}

export type NewsletterStats = {
  total: number;
  active: number;
};

export async function getNewsletterStats(supabase: SupabaseClient): Promise<NewsletterStats> {
  const [{ count: total }, { count: active }] = await Promise.all([
    supabase.from("newsletter_subscribers").select("id", { count: "exact", head: true }),
    supabase
      .from("newsletter_subscribers")
      .select("id", { count: "exact", head: true })
      .eq("status", "subscribed"),
  ]);

  return { total: total ?? 0, active: active ?? 0 };
}

/** Full unpaginated export for CSV download — admin-only, capped generously
 * since a solo-operator blog's subscriber list won't approach this size. */
export async function getAllSubscribersForExport(
  supabase: SupabaseClient,
): Promise<NewsletterSubscriber[]> {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, status, source, subscribed_at, unsubscribed_at")
    .order("subscribed_at", { ascending: false })
    .limit(10_000);

  if (error) {
    console.error("Newsletter export load failed:", error.message);
    return [];
  }
  return (data ?? []) as NewsletterSubscriber[];
}
