import type { SupabaseClient } from "@supabase/supabase-js";

export type TimeSeriesPoint = { label: string; value: number };
export type NamedMetric = { name: string; value: number; secondary?: number };

const MONTH_LABEL = new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit" });

function monthKey(iso: string) {
  return iso.slice(0, 7); // "2026-03"
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);
  return MONTH_LABEL.format(new Date(year, month - 1, 1));
}

/** Last N calendar months' keys ("2026-01" ...), oldest first, always
 * including months with zero activity so charts don't skip gaps. */
function trailingMonthKeys(months: number): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

/**
 * Daily view counts via the get_daily_post_views RPC (0010) — aggregated in
 * Postgres rather than pulling raw post_views rows, since that table only
 * grows. Runs as the calling admin user; RLS still governs post_views.
 */
export async function getViewsOverTime(
  supabase: SupabaseClient,
  days = 30,
): Promise<TimeSeriesPoint[]> {
  const { data, error } = await supabase.rpc("get_daily_post_views", { p_days: days });
  if (error) {
    console.error("Views-over-time load failed:", error.message);
    return [];
  }

  const byDay = new Map((data ?? []).map((row: { day: string; views: number }) => [row.day, row.views]));
  const points: TimeSeriesPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    points.push({
      label: date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      value: Number(byDay.get(key) ?? 0),
    });
  }
  return points;
}

export async function getTopPosts(
  supabase: SupabaseClient,
  limit = 5,
): Promise<NamedMetric[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("title, view_count")
    .order("view_count", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Top posts load failed:", error.message);
    return [];
  }
  return (data ?? []).map((row) => ({ name: row.title as string, value: row.view_count as number }));
}

/** Aggregated in JS after a single flat fetch — no GROUP BY via the
 * PostgREST fluent API, and at a solo operator's post volume this is cheap. */
export async function getCategoryPerformance(supabase: SupabaseClient): Promise<NamedMetric[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("view_count, category:blog_categories(name)")
    .not("category_id", "is", null);

  if (error) {
    console.error("Category performance load failed:", error.message);
    return [];
  }

  const totals = new Map<string, { views: number; posts: number }>();
  for (const row of data ?? []) {
    const category = row.category as unknown as { name: string } | null;
    if (!category) continue;
    const entry = totals.get(category.name) ?? { views: 0, posts: 0 };
    entry.views += (row.view_count as number) ?? 0;
    entry.posts += 1;
    totals.set(category.name, entry);
  }

  return [...totals.entries()]
    .map(([name, { views, posts }]) => ({ name, value: views, secondary: posts }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

export async function getAuthorPerformance(supabase: SupabaseClient): Promise<NamedMetric[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("view_count, author:blog_authors(name)")
    .not("author_id", "is", null);

  if (error) {
    console.error("Author performance load failed:", error.message);
    return [];
  }

  const totals = new Map<string, { views: number; posts: number }>();
  for (const row of data ?? []) {
    const author = row.author as unknown as { name: string } | null;
    if (!author) continue;
    const entry = totals.get(author.name) ?? { views: 0, posts: 0 };
    entry.views += (row.view_count as number) ?? 0;
    entry.posts += 1;
    totals.set(author.name, entry);
  }

  return [...totals.entries()]
    .map(([name, { views, posts }]) => ({ name, value: views, secondary: posts }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

export async function getPublishingFrequency(
  supabase: SupabaseClient,
  months = 12,
): Promise<TimeSeriesPoint[]> {
  const since = trailingMonthKeys(months)[0];
  const { data, error } = await supabase
    .from("blog_posts")
    .select("published_at")
    .not("published_at", "is", null)
    .gte("published_at", `${since}-01`);

  if (error) {
    console.error("Publishing frequency load failed:", error.message);
    return [];
  }

  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    const key = monthKey(row.published_at as string);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return trailingMonthKeys(months).map((key) => ({
    label: monthLabel(key),
    value: counts.get(key) ?? 0,
  }));
}

/** Cumulative subscriber total per month — the "growth" curve. Capped at
 * 10k rows fetched, comfortably beyond a solo operator's subscriber count. */
export async function getNewsletterGrowth(
  supabase: SupabaseClient,
  months = 12,
): Promise<TimeSeriesPoint[]> {
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("subscribed_at")
    .order("subscribed_at", { ascending: true })
    .limit(10_000);

  if (error) {
    console.error("Newsletter growth load failed:", error.message);
    return [];
  }

  const monthKeys = trailingMonthKeys(months);
  const firstVisibleMonth = monthKeys[0];

  let cumulativeBeforeWindow = 0;
  const newByMonth = new Map<string, number>();
  for (const row of data ?? []) {
    const key = monthKey(row.subscribed_at as string);
    if (key < firstVisibleMonth) {
      cumulativeBeforeWindow += 1;
    } else {
      newByMonth.set(key, (newByMonth.get(key) ?? 0) + 1);
    }
  }

  let running = cumulativeBeforeWindow;
  return monthKeys.map((key) => {
    running += newByMonth.get(key) ?? 0;
    return { label: monthLabel(key), value: running };
  });
}
