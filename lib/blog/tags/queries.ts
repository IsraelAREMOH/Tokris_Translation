import { cache } from "react";

import type { BlogTag } from "@/lib/blog/types";
import { createPublicClient } from "@/lib/supabase/public-server";

export const getTags = cache(async (): Promise<BlogTag[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_tags")
    .select("id, name, slug")
    .order("name", { ascending: true });

  if (error) {
    console.error("Blog tags load failed:", error.message);
    return [];
  }
  return data ?? [];
});

export const getTagBySlug = cache(async (slug: string): Promise<BlogTag | null> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_tags")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Blog tag load failed:", error.message);
    return null;
  }
  return data;
});
