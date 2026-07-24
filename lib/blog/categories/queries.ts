import { cache } from "react";

import type { BlogCategory } from "@/lib/blog/types";
import { createPublicClient } from "@/lib/supabase/public-server";

/** Error-tolerant like getSiteContent() — an empty list if migrations haven't run yet. */
export const getCategories = cache(async (): Promise<BlogCategory[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_categories")
    .select("id, name, slug, description, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Blog categories load failed:", error.message);
    return [];
  }
  return data ?? [];
});

export const getCategoryBySlug = cache(
  async (slug: string): Promise<BlogCategory | null> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("blog_categories")
      .select("id, name, slug, description, sort_order")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Blog category load failed:", error.message);
      return null;
    }
    return data;
  },
);
