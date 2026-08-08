import { SOCIAL_LINKS } from "@/lib/social/links";
import type { BlogPost } from "@/lib/blog/types";
import { SITE_URL } from "@/lib/site-url";

const ORG_NAME = "Tokris Global Services Limited";
const ORG_SHORT_NAME = "TGS";

/** Reused as Article.publisher — a full site-wide Organization schema is
 * also rendered once in the public layout. */
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG_NAME,
    alternateName: ORG_SHORT_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/api/og`,
    // Feeds Google's Knowledge Panel / entity graph with the official profiles.
    sameAs: SOCIAL_LINKS.map((link) => link.href),
  };
}

/** Includes a SearchAction pointing at the blog's search box, so Google can
 * offer a sitelinks search box for the domain. */
export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ORG_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/**
 * The author is embedded as a nested Person object — schema.org/Google's
 * Rich Results expect Article.author to be a Person (or Organization), not a
 * standalone top-level entity, and there's no dedicated author profile page
 * in this app (deferred per the Phase 1 plan) that would need its own
 * separately-referenced Person schema.
 */
export function buildArticleSchema(post: BlogPost, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.meta_description || post.excerpt || undefined,
    image: post.cover_image?.url ? [post.cover_image.url] : undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    author: post.author
      ? {
          "@type": "Person",
          name: post.author.name,
          ...(post.author.position ? { jobTitle: post.author.position } : {}),
          ...(post.author.photo?.url ? { image: post.author.photo.url } : {}),
        }
      : undefined,
    publisher: buildOrganizationSchema(),
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}
