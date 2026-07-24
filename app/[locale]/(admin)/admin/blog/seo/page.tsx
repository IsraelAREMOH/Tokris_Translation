import type { Metadata } from "next";

import { SeoAuditList, SeoDuplicateList } from "@/components/admin/blog/seo-audit-list";
import { StatTile } from "@/components/admin/stat-tile";
import { requireAdmin } from "@/lib/auth/guards";
import { getDashboardStats } from "@/lib/cms/dashboard/queries";
import { getSeoAudit } from "@/lib/cms/seo/audit";

export const metadata: Metadata = { title: "SEO" };

export default async function AdminBlogSeoPage() {
  const { supabase } = await requireAdmin();
  const [audit, stats] = await Promise.all([getSeoAudit(supabase), getDashboardStats(supabase)]);

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          SEO
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Derived from your {audit.postsAudited} non-archived post{audit.postsAudited === 1 ? "" : "s"}
          {" "}— nothing here is estimated. Static pages (Home, Services, About) set their own SEO
          fields in code, so they aren&apos;t audited below.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SeoAuditList
          title="Missing SEO title"
          posts={audit.missingSeoTitle}
          okMessage="Every post has an SEO title (or falls back to its headline)."
        />
        <SeoAuditList
          title="Missing meta description"
          posts={audit.missingMetaDescription}
          okMessage="Every post has a meta description."
        />
        <SeoAuditList
          title="Missing custom OG image"
          posts={audit.missingOgImage}
          okMessage="Every post has a cover or OG image — the rest fall back to an auto-generated one, which is fine, just less distinctive."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SeoDuplicateList
          title="Duplicate titles"
          groups={audit.duplicateTitles.map((group) => ({ label: group.title, posts: group.posts }))}
          okMessage="No two posts share the same title."
        />
        <SeoDuplicateList
          title="Duplicate meta descriptions"
          groups={audit.duplicateDescriptions.map((group) => ({
            label: group.description,
            posts: group.posts,
          }))}
          okMessage="No two posts share the same meta description."
        />
      </div>

      <div className="rounded-xl border border-dashed border-border bg-surface p-5 shadow-elevated">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground">Broken internal links</h3>
          <span className="text-xs font-semibold whitespace-nowrap text-muted-foreground">
            Not yet implemented
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Placeholder architecture only — a link crawler isn&apos;t built yet. When it is, results
          report into this same panel.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
          <h3 className="text-sm font-semibold text-foreground">Sitemap status</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {stats.publishedPosts} published post{stats.publishedPosts === 1 ? "" : "s"},{" "}
            {stats.categories} categor{stats.categories === 1 ? "y" : "ies"}, {stats.tags} tag
            {stats.tags === 1 ? "" : "s"} — split across 4 files, since Next.js doesn&apos;t generate a
            combined index for split sitemaps.
          </p>
          <ul className="mt-3 flex flex-col gap-1">
            {audit.sitemapUrls.map((url) => (
              <li key={url}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="block truncate rounded-lg px-2 py-1 font-mono text-xs text-brand-700 hover:bg-background dark:text-brand-300"
                >
                  {url}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
          <h3 className="text-sm font-semibold text-foreground">Robots status</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Read live from <code className="font-mono">app/robots.ts</code> — always accurate, never
            drifts from what&apos;s actually served.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {audit.robotsRules.map((rule, index) => (
              <li key={index} className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground">User-agent: {rule.userAgent}</p>
                {rule.allow ? (
                  <p>
                    Allow:{" "}
                    {Array.isArray(rule.allow) ? rule.allow.join(", ") : rule.allow}
                  </p>
                ) : null}
                {rule.disallow ? (
                  <p>
                    Disallow:{" "}
                    {Array.isArray(rule.disallow) ? rule.disallow.join(", ") : rule.disallow}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Published posts" value={stats.publishedPosts} />
        <StatTile label="Categories" value={stats.categories} />
        <StatTile label="Tags" value={stats.tags} />
      </div>
    </div>
  );
}
