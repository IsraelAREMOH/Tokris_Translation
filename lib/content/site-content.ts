import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/**
 * Site-wide settings edited in Admin -> Site Content. Error-tolerant: if the
 * table is missing (migration 0004 not run yet) this returns {} and callers
 * fall back to env/static defaults. cache() dedupes within a request.
 */
export const getSiteContent = cache(
  async (): Promise<Record<string, string>> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("key, value");

    if (error || !data) {
      if (error) console.error("Site content load failed:", error.message);
      return {};
    }

    return Object.fromEntries(
      data.map((row: { key: string; value: string }) => [row.key, row.value]),
    );
  },
);
