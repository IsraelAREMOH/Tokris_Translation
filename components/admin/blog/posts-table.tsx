"use client";

import { Eye, Pin, Star } from "lucide-react";

import { PostRowActions } from "@/components/admin/blog/post-row-actions";
import { PostStatusBadge } from "@/components/admin/blog/post-status-badge";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import type { BlogPostSummary } from "@/lib/blog/types";

export function PostsTable({
  posts,
  selected,
  onToggle,
}: {
  posts: BlogPostSummary[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-elevated">
      <table className="w-full min-w-[880px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="w-10 px-4 py-3.5" />
            {["Title", "Status", "Category", "Author", "Updated", "Views", ""].map((heading) => (
              <th
                key={heading}
                scope="col"
                className="px-4 py-3.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr
              key={post.id}
              className="relative border-b border-border last:border-b-0 hover:bg-background"
            >
              <td className="px-4 py-4">
                <input
                  type="checkbox"
                  checked={selected.has(post.id)}
                  onChange={() => onToggle(post.id)}
                  aria-label={`Select ${post.title}`}
                  className="h-4 w-4 rounded border-border text-brand-600"
                />
              </td>
              <td className="max-w-xs px-4 py-4">
                <Link
                  href={`/admin/blog/posts/${post.id}`}
                  className="text-sm font-semibold text-foreground after:absolute after:inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500"
                >
                  <span className="flex items-center gap-1.5">
                    {post.pinned ? <Pin className="h-3.5 w-3.5 shrink-0 text-brand-600" /> : null}
                    {post.featured ? (
                      <Star className="h-3.5 w-3.5 shrink-0 fill-accent-500 text-accent-500" />
                    ) : null}
                    <span className="truncate">{post.title}</span>
                  </span>
                </Link>
              </td>
              <td className="px-4 py-4">
                <PostStatusBadge status={post.status} />
              </td>
              <td className="px-4 py-4 text-sm whitespace-nowrap text-muted-foreground">
                {post.category?.name ?? "—"}
              </td>
              <td className="px-4 py-4 text-sm whitespace-nowrap text-muted-foreground">
                {post.author?.name ?? "—"}
              </td>
              <td className="px-4 py-4 text-sm whitespace-nowrap text-muted-foreground">
                {formatDate(post.updated_at)}
              </td>
              <td className="px-4 py-4 text-sm whitespace-nowrap tabular-nums text-muted-foreground">
                {post.view_count}
              </td>
              <td className="relative px-4 py-4">
                <div className="relative z-10 flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/preview/${post.id}`}
                    target="_blank"
                    aria-label={`Preview ${post.title}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-transform duration-200 ease-spring hover:bg-background hover:text-foreground active:scale-90"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <PostRowActions post={post} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
