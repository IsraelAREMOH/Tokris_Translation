"use client";

import { Eye, ImageOff, Pin, Star } from "lucide-react";
import Image from "next/image";

import { PostRowActions } from "@/components/admin/blog/post-row-actions";
import { PostStatusBadge } from "@/components/admin/blog/post-status-badge";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";
import type { BlogPostSummary } from "@/lib/blog/types";

export function PostsCards({
  posts,
  selected,
  onToggle,
}: {
  posts: BlogPostSummary[];
  selected: Set<string>;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-elevated"
        >
          <div className="relative aspect-video w-full bg-background">
            {post.cover_image ? (
              <Image
                src={post.cover_image.url}
                alt=""
                fill
                sizes="360px"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageOff className="h-6 w-6" />
              </span>
            )}
            <input
              type="checkbox"
              checked={selected.has(post.id)}
              onChange={() => onToggle(post.id)}
              aria-label={`Select ${post.title}`}
              className="absolute top-2.5 left-2.5 h-4 w-4 rounded border-white/60 bg-white/80 text-brand-600"
            />
            <div className="absolute top-2.5 right-2.5 flex gap-1">
              {post.pinned ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
                  <Pin className="h-3.5 w-3.5" />
                </span>
              ) : null}
              {post.featured ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
                  <Star className="h-3.5 w-3.5 fill-current" />
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <PostStatusBadge status={post.status} />
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {post.view_count} views
              </span>
            </div>
            <Link
              href={`/admin/blog/posts/${post.id}`}
              className="line-clamp-2 font-display text-base font-semibold tracking-[-0.01em] text-foreground transition-colors hover:text-brand-700 dark:hover:text-brand-300"
            >
              {post.title}
            </Link>
            <p className="text-xs text-muted-foreground">
              {post.category?.name ?? "Uncategorized"} · {post.author?.name ?? "No author"}
            </p>
            <p className="text-xs text-muted-foreground">Updated {formatDate(post.updated_at)}</p>

            <div className="mt-auto flex items-center justify-end gap-1 border-t border-border pt-3">
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
          </div>
        </div>
      ))}
    </div>
  );
}
