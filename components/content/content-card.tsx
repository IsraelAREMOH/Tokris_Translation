import { CalendarDays, Clock, Eye, ImageOff } from "lucide-react";
import Image from "next/image";

import { highlightMatch } from "@/components/content/highlight-match";
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/format";

/**
 * Deliberately generic — no blog_posts import here. Any future content type
 * (Case Studies, News, Resources…) just needs its own adapter mapping its
 * own row shape into this, and reuses this exact card unchanged.
 */
export type ContentCardData = {
  href: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  categoryLabel?: string | null;
  categoryHref?: string | null;
  title: string;
  excerpt?: string | null;
  authorName?: string | null;
  readingTimeMinutes?: number | null;
  publishedAt?: string | null;
  viewCount?: number | null;
};

export function ContentCard({
  data,
  highlightTerm,
}: {
  data: ContentCardData;
  /** When set (e.g. the active search query), matching substrings in the
   * title/excerpt are wrapped in <mark>. */
  highlightTerm?: string;
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-1">
      <div className="relative aspect-16/10 w-full overflow-hidden bg-background">
        {data.coverImageUrl ? (
          <Image
            src={data.coverImageUrl}
            alt={data.coverImageAlt || ""}
            fill
            sizes="(min-width: 1024px) 360px, 100vw"
            className="object-cover transition-transform duration-300 ease-out-soft group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-6 w-6" />
          </span>
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent mix-blend-multiply opacity-0 transition-opacity duration-300 ease-out-soft group-hover:opacity-100"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {data.categoryLabel ? (
          data.categoryHref ? (
            <Link
              href={data.categoryHref}
              className="relative z-10 w-fit rounded-full bg-brand-600/10 px-3 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-600/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 dark:text-brand-300"
            >
              {data.categoryLabel}
            </Link>
          ) : (
            <span className="w-fit rounded-full bg-brand-600/10 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300">
              {data.categoryLabel}
            </span>
          )
        ) : null}

        <h3 className="font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
          <Link
            href={data.href}
            className="after:absolute after:inset-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500"
          >
            <span className="line-clamp-2 transition-colors group-hover:text-brand-700 dark:group-hover:text-brand-300">
              {highlightTerm ? highlightMatch(data.title, highlightTerm) : data.title}
            </span>
          </Link>
        </h3>

        {data.excerpt ? (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {highlightTerm ? highlightMatch(data.excerpt, highlightTerm) : data.excerpt}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
          {data.authorName ? <span>{data.authorName}</span> : null}
          {data.publishedAt ? (
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(data.publishedAt)}
            </span>
          ) : null}
          {data.readingTimeMinutes ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {data.readingTimeMinutes} min
            </span>
          ) : null}
          {typeof data.viewCount === "number" ? (
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {data.viewCount}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
