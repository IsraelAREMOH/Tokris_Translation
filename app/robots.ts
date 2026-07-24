import type { MetadataRoute } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

/**
 * Blocks the admin console (including /admin/preview/* — the true-preview
 * route lives under /admin/, see components/blog/post-view.tsx's callers),
 * the client portal, and auth pages. Draft/scheduled-not-yet-due posts are
 * never reachable via a public URL at all (RLS only exposes published +
 * due-scheduled rows), so there's no URL for a crawler to accidentally hit.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/portal", "/portal/", "/login", "/register", "/api/"],
      },
    ],
    // app/sitemap.ts splits into 4 files via generateSitemaps() — Next.js
    // doesn't auto-generate a combined /sitemap.xml index for that case, so
    // each is listed here directly instead.
    sitemap: [
      `${SITE_URL}/sitemap/pages.xml`,
      `${SITE_URL}/sitemap/posts.xml`,
      `${SITE_URL}/sitemap/categories.xml`,
      `${SITE_URL}/sitemap/tags.xml`,
    ],
  };
}
