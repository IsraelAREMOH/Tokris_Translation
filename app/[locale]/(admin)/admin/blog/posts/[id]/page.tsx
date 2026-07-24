import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostForm } from "@/components/admin/blog/editor/post-form";
import { requireAdmin } from "@/lib/auth/guards";
import { getAuthors } from "@/lib/blog/authors/queries";
import { getCategories } from "@/lib/blog/categories/queries";
import { getPostForEdit } from "@/lib/blog/posts/queries";
import { getTags } from "@/lib/blog/tags/queries";
import { UUID_PATTERN } from "@/lib/validation";

export const metadata: Metadata = { title: "Edit Post" };

export default async function AdminBlogPostEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, { supabase }] = await Promise.all([params, requireAdmin()]);
  if (!UUID_PATTERN.test(id)) notFound();

  const [post, categories, tags, authors] = await Promise.all([
    getPostForEdit(supabase, id),
    getCategories(),
    getTags(),
    getAuthors(),
  ]);

  if (!post) notFound();

  return (
    <div className="max-w-[100rem]">
      <PostForm post={post} categories={categories} tags={tags} authors={authors} />
    </div>
  );
}
