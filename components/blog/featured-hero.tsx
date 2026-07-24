import { CalendarDays, Clock } from "lucide-react";
import Image from "next/image";

import { Link } from "@/i18n/navigation";
import type { BlogPostSummary } from "@/lib/blog/types";
import { formatDate } from "@/lib/format";

export function FeaturedHero({
  post,
  eyebrow,
  readMoreLabel,
}: {
  post: BlogPostSummary;
  eyebrow: string;
  readMoreLabel: string;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group relative flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-3xl border border-border bg-surface shadow-floating focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
    >
      {post.cover_image ? (
        <Image
          src={post.cover_image.url}
          alt={post.cover_image_alt || ""}
          fill
          sizes="(min-width: 1024px) 1024px, 100vw"
          priority
          className="object-cover transition-transform duration-500 ease-out-soft group-hover:scale-105"
        />
      ) : null}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent mix-blend-multiply"
      />
      <div className="relative z-10 flex flex-col gap-3 p-6 sm:p-10">
        <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
          {eyebrow}
        </span>
        <h2 className="max-w-2xl font-display text-2xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
          {post.title}
        </h2>
        {post.excerpt ? (
          <p className="max-w-xl text-sm text-white/80 sm:text-base">{post.excerpt}</p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-white/75">
          {post.author ? <span className="font-medium text-white/90">{post.author.name}</span> : null}
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(post.published_at)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.reading_time_minutes} min
          </span>
          <span className="font-semibold text-white underline underline-offset-4">
            {readMoreLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
