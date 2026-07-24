import { cache } from "react";

import type { BlogAuthor } from "@/lib/blog/types";
import { getMediaPublicUrl } from "@/lib/media/constants";
import type { MediaAsset } from "@/lib/media/types";
import { createPublicClient } from "@/lib/supabase/public-server";

const MEDIA_FIELDS =
  "id, file_name, storage_path, file_type, mime_type, size_bytes, width, height, alt_text, folder, uploaded_by, created_at";

const AUTHOR_SELECT = `
  id, profile_id, name, photo_id, bio, position, email, social_links, featured,
  photo:media_library(${MEDIA_FIELDS})
`;

type RawAuthorRow = Omit<BlogAuthor, "photo"> & {
  photo: (Omit<MediaAsset, "url"> | null);
};

function mapAuthor(row: RawAuthorRow): BlogAuthor {
  const { photo, ...rest } = row;
  return {
    ...rest,
    photo: photo ? { ...photo, url: getMediaPublicUrl(photo.storage_path) } : null,
  };
}

export const getAuthors = cache(async (): Promise<BlogAuthor[]> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("blog_authors")
    .select(AUTHOR_SELECT)
    .order("name", { ascending: true });

  if (error) {
    console.error("Blog authors load failed:", error.message);
    return [];
  }
  return (data ?? []).map((row) => mapAuthor(row as unknown as RawAuthorRow));
});

export const getAuthorById = cache(
  async (id: string): Promise<BlogAuthor | null> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("blog_authors")
      .select(AUTHOR_SELECT)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Blog author load failed:", error.message);
      return null;
    }
    return data ? mapAuthor(data as unknown as RawAuthorRow) : null;
  },
);
