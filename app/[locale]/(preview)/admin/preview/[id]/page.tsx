import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { PostView } from "@/components/blog/post-view";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getAdjacentPosts, getPostForEdit, getRelatedPosts } from "@/lib/blog/posts/queries";
import { UUID_PATTERN } from "@/lib/validation";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

// Deliberately its own route group (not nested under the (admin) group), so
// it renders the article full-bleed — no ConsoleShell sidebar — matching
// what the public page will actually look like. /admin/preview/* still gets
// proxy-level admin gating (matches path.startsWith("/admin/")); requireAdmin()
// below is the defense-in-depth check, same pattern as every other admin page.
export const metadata: Metadata = {
  title: "Preview",
  robots: { index: false, follow: false },
};

export default async function AdminPostPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, { supabase }, locale] = await Promise.all([
    params,
    requireAdmin(),
    getLocale(),
  ]);
  if (!UUID_PATTERN.test(id)) notFound();

  const post = await getPostForEdit(supabase, id);
  if (!post) notFound();

  // Same data-fetching calls the public article page makes, so preview
  // matches production exactly — not just "the component compiles the same".
  const [relatedPosts, { previous, next }] = await Promise.all([
    getRelatedPosts(post.id, post.category_id),
    getAdjacentPosts(post.id, post.published_at),
  ]);

  return (
    <div className="min-h-dvh bg-background">
      <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-accent-700/20 bg-accent-100 px-4 py-2.5 text-sm font-medium text-accent-800 dark:bg-accent-500/15 dark:text-accent-200">
        <span>Preview mode — this is not publicly visible.</span>
        <Link
          href={`/admin/blog/posts/${id}`}
          className="shrink-0 rounded-full border border-accent-700/30 px-3 py-1 text-xs font-semibold transition-colors hover:bg-accent-200/50 dark:border-accent-300/30 dark:hover:bg-accent-500/20"
        >
          Back to editor
        </Link>
      </div>
      <PostView
        post={post}
        articleUrl={`${SITE_URL}/${locale}/blog/${post.slug}`}
        relatedPosts={relatedPosts}
        previous={previous ? { href: `/blog/${previous.slug}`, title: previous.title } : null}
        next={next ? { href: `/blog/${next.slug}`, title: next.title } : null}
      />
    </div>
  );
}
