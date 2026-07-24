import { getLocale } from "next-intl/server";

import { redirect } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { createDraftPost } from "@/lib/blog/posts/actions";

/**
 * Creates an empty draft server-side, then redirects to its editor — every
 * editor session gets a stable id from the start, so autosave never has to
 * special-case "not yet created".
 */
export default async function NewBlogPostPage() {
  await requireAdmin();
  const locale = await getLocale();

  const result = await createDraftPost();
  if (result.error || !result.postId) {
    redirect({ href: "/admin/blog/posts", locale });
    return;
  }

  redirect({ href: `/admin/blog/posts/${result.postId}`, locale });
}
