import { BookOpen, FileStack, Image as ImageIcon, Mail, Tag as TagIcon, Users } from "lucide-react";
import type { Metadata } from "next";

import { ActivityFeed } from "@/components/admin/activity-feed";
import { StatTile } from "@/components/admin/stat-tile";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { getRecentActivity } from "@/lib/cms/activity/queries";
import { getDashboardStats, getMostReadPost } from "@/lib/cms/dashboard/queries";

export const metadata: Metadata = { title: "Content Dashboard" };

export default async function AdminBlogDashboardPage() {
  const { supabase } = await requireAdmin();

  const [stats, mostRead, activity] = await Promise.all([
    getDashboardStats(supabase),
    getMostReadPost(supabase),
    getRecentActivity(supabase, 12),
  ]);

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          Content Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The whole website&apos;s content, at a glance the blog is one module here, alongside
          pages, media and the newsletter.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total pages" value={stats.totalPages} icon={FileStack} href="/admin/blog/pages" />
        <StatTile label="Blog posts" value={stats.totalPosts} icon={BookOpen} href="/admin/blog/posts" />
        <StatTile
          label="Published posts"
          value={stats.publishedPosts}
          href={{ pathname: "/admin/blog/posts", query: { status: "published" } }}
        />
        <StatTile
          label="Drafts"
          value={stats.draftPosts}
          href={{ pathname: "/admin/blog/posts", query: { status: "draft" } }}
        />
        <StatTile
          label="Scheduled"
          value={stats.scheduledPosts}
          href={{ pathname: "/admin/blog/posts", query: { status: "scheduled" } }}
        />
        <StatTile label="Categories" value={stats.categories} icon={TagIcon} href="/admin/blog/categories" />
        <StatTile label="Tags" value={stats.tags} href="/admin/blog/tags" />
        <StatTile label="Authors" value={stats.authors} icon={Users} href="/admin/blog/authors" />
        <StatTile
          label="Newsletter subscribers"
          value={stats.newsletterSubscribers}
          icon={Mail}
          href="/admin/blog/newsletter"
        />
        <StatTile label="Media assets" value={stats.mediaAssets} icon={ImageIcon} href="/admin/blog/media" />
        <StatTile
          label="Monthly views"
          value={stats.monthlyViews}
          hint="This calendar month"
          href="/admin/blog/analytics"
        />
        {mostRead ? (
          <Link
            href={`/admin/blog/posts/${mostRead.id}`}
            className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            <div className="h-full rounded-xl border border-border bg-surface p-5 shadow-elevated transition-transform duration-200 ease-spring group-hover:-translate-y-0.5">
              <p className="text-xs font-medium text-muted-foreground">Most read article</p>
              <p className="mt-1.5 truncate text-base font-semibold tracking-[-0.01em] text-foreground">
                {mostRead.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{mostRead.view_count} views</p>
            </div>
          </Link>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-surface p-5 shadow-elevated">
            <p className="text-xs font-medium text-muted-foreground">Most read article</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Publish your first post and views will show up here.
            </p>
          </div>
        )}
      </div>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
            Recent activity
          </h2>
          <Link
            href="/admin/blog/analytics"
            className="text-xs font-semibold text-brand-700 hover:underline dark:text-brand-300"
          >
            View analytics
          </Link>
        </div>
        <div className="mt-4">
          <ActivityFeed entries={activity} />
        </div>
      </section>
    </div>
  );
}
