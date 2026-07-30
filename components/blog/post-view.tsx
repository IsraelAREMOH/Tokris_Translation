import { CalendarDays, Clock, RefreshCw } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

import { NewsletterSignup } from "@/components/blog/newsletter-signup";
import { ContentCard } from "@/components/content/content-card";
import type { PrevNextItem } from "@/components/content/prev-next-nav";
import { PrevNextNav } from "@/components/content/prev-next-nav";
import { ShareButtons } from "@/components/content/share-buttons";
import { TableOfContents } from "@/components/content/table-of-contents";
import { Link } from "@/i18n/navigation";
import { extractToc } from "@/lib/blog/editor/toc";
import { toContentCard } from "@/lib/blog/content-card-adapter";
import type { BlogPost, BlogPostSummary } from "@/lib/blog/types";
import { formatDate } from "@/lib/format";

function wasUpdatedAfterPublish(post: BlogPost) {
  if (!post.published_at) return false;
  return new Date(post.updated_at).toDateString() !== new Date(post.published_at).toDateString();
}

/**
 * The actual "render one post" template — shared verbatim by the admin
 * preview route (/admin/preview/[id]) and the public article page
 * (/blog/[slug]), so preview always matches production exactly. Every extra
 * section below (related posts, prev/next, newsletter) is an optional prop
 * so both callers can pass identical data without either being required to.
 */
export async function PostView({
  post,
  articleUrl,
  relatedPosts = [],
  previous = null,
  next = null,
}: {
  post: BlogPost;
  articleUrl: string;
  relatedPosts?: BlogPostSummary[];
  previous?: PrevNextItem | null;
  next?: PrevNextItem | null;
}) {
  const t = await getTranslations("blog.article");
  const { toc, html } = extractToc(post.content_html);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {post.cover_image ? (
        <div className="relative mb-8 aspect-16/9 w-full overflow-hidden rounded-2xl shadow-floating">
          <Image
            src={post.cover_image.url}
            alt={post.cover_image_alt || post.title}
            fill
            sizes="768px"
            priority
            className="object-cover"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent mix-blend-multiply"
          />
        </div>
      ) : null}

      {post.category || post.tags.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {post.category ? (
            <Link
              href={`/blog/category/${post.category.slug}`}
              className="rounded-full bg-brand-600/10 px-3 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-600/20 dark:text-brand-300"
            >
              {post.category.name}
            </Link>
          ) : null}
          {post.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/blog/tag/${tag.slug}`}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      ) : null}

      <h1 className="mt-4 font-display text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
        {post.title}
      </h1>

      {post.excerpt ? (
        <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-border py-4 text-sm text-muted-foreground">
        {post.author ? (
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border bg-background">
              {post.author.photo ? (
                <Image src={post.author.photo.url} alt="" fill sizes="36px" className="object-cover" />
              ) : null}
            </span>
            <div>
              <p className="font-medium text-foreground">{post.author.name}</p>
              {post.author.position ? <p className="text-xs">{post.author.position}</p> : null}
            </div>
          </div>
        ) : null}
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" />
          {formatDate(post.published_at)}
        </span>
        {wasUpdatedAfterPublish(post) ? (
          <span className="flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4" />
            {t("updated", { date: formatDate(post.updated_at) })}
          </span>
        ) : null}
        <span className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {t("readingTime", { minutes: post.reading_time_minutes })}
        </span>
      </div>

      {toc.length > 0 ? (
        <div className="mt-6">
          <TableOfContents entries={toc} label={t("tableOfContents")} />
        </div>
      ) : null}

      <div className="blog-prose mt-8" dangerouslySetInnerHTML={{ __html: html }} />

      <div className="mt-10 border-t border-border pt-6">
        <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {t("share")}
        </p>
        <ShareButtons
          url={articleUrl}
          title={post.title}
          label={t("share")}
          copyLabel={t("copyLink")}
          copiedLabel={t("linkCopied")}
        />
      </div>

      {post.author?.bio ? (
        <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-elevated sm:flex-row sm:items-start">
          <span className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border bg-background">
            {post.author.photo ? (
              <Image src={post.author.photo.url} alt="" fill sizes="64px" className="object-cover" />
            ) : null}
          </span>
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {t("aboutAuthor")}
            </p>
            <p className="mt-1 font-display text-base font-semibold text-foreground">
              {post.author.name}
            </p>
            {post.author.position ? (
              <p className="text-sm text-muted-foreground">{post.author.position}</p>
            ) : null}
            <p className="mt-2 text-sm text-muted-foreground">{post.author.bio}</p>
          </div>
        </div>
      ) : null}

      {previous || next ? (
        <div className="mt-10">
          <PrevNextNav
            previous={previous}
            next={next}
            previousLabel={t("previousPost")}
            nextLabel={t("nextPost")}
          />
        </div>
      ) : null}

      {relatedPosts.length > 0 ? (
        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-foreground">
            {t("relatedTitle")}
          </h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((related) => (
              <ContentCard key={related.id} data={toContentCard(related)} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-10">
        <NewsletterSignupSection />
      </div>
    </article>
  );
}

async function NewsletterSignupSection() {
  const t = await getTranslations("blog.newsletter");
  return (
    <NewsletterSignup
      source="article"
      title={t("title")}
      description={t("description")}
      emailLabel={t("emailLabel")}
      placeholder={t("placeholder")}
      submitLabel={t("submit")}
      successMessage={t("success")}
      followLabel={t("followLabel")}
    />
  );
}
