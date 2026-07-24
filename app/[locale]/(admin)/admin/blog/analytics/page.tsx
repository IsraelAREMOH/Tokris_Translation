import { BarChart3 } from "lucide-react";
import type { Metadata } from "next";

import { AreaChart } from "@/components/admin/charts/area-chart";
import { BarChart } from "@/components/admin/charts/bar-chart";
import { ChartEmptyState } from "@/components/admin/charts/chart-empty-state";
import { requireAdmin } from "@/lib/auth/guards";
import {
  getAuthorPerformance,
  getCategoryPerformance,
  getNewsletterGrowth,
  getPublishingFrequency,
  getTopPosts,
  getViewsOverTime,
} from "@/lib/cms/analytics/queries";

export const metadata: Metadata = { title: "Analytics" };

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
      <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
        {title}
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function AdminBlogAnalyticsPage() {
  const { supabase } = await requireAdmin();

  const [viewsOverTime, topPosts, categoryPerformance, newsletterGrowth, publishingFrequency, authorPerformance] =
    await Promise.all([
      getViewsOverTime(supabase, 30),
      getTopPosts(supabase, 5),
      getCategoryPerformance(supabase),
      getNewsletterGrowth(supabase, 12),
      getPublishingFrequency(supabase, 12),
      getAuthorPerformance(supabase),
    ]);

  return (
    <div className="flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          Analytics
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Built from your own data — post views, publishing history and subscriber signups. Every
          chart below fills in on its own as the data accumulates; none of it is estimated.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Views over time" description="Post views over the last 30 days.">
          <AreaChart
            data={viewsOverTime}
            valueLabel="Views"
            emptyMessage="No views recorded yet — this fills in as visitors read your posts."
          />
        </ChartCard>

        <ChartCard title="Newsletter growth" description="Cumulative subscribers over the last 12 months.">
          <AreaChart
            data={newsletterGrowth}
            valueLabel="Subscribers"
            emptyMessage="No subscribers yet — this fills in once your first visitor signs up."
          />
        </ChartCard>

        <ChartCard title="Top-performing posts" description="Ranked by total views.">
          <BarChart
            data={topPosts.map((post) => ({ label: post.name, value: post.value }))}
            valueLabel="Views"
            emptyMessage="No posts have views yet."
          />
        </ChartCard>

        <ChartCard title="Most popular categories" description="Total views across each category's posts.">
          <BarChart
            data={categoryPerformance.map((category) => ({ label: category.name, value: category.value }))}
            valueLabel="Views"
            emptyMessage="Assign posts to categories to see this chart fill in."
          />
        </ChartCard>

        <ChartCard title="Publishing frequency" description="Posts published per month, last 12 months.">
          <BarChart
            data={publishingFrequency}
            valueLabel="Posts published"
            emptyMessage="Publish your first post to see this chart fill in."
          />
        </ChartCard>

        <ChartCard title="Author performance" description="Total views across each author's posts.">
          <BarChart
            data={authorPerformance.map((author) => ({ label: author.name, value: author.value }))}
            valueLabel="Views"
            emptyMessage="Assign posts to authors to see this chart fill in."
          />
        </ChartCard>
      </div>

      <ChartCard
        title="Traffic by month"
        description="Site-wide traffic (not just the blog) — future-ready, once an analytics provider is connected."
      >
        <ChartEmptyState message="Connect Google Analytics, Plausible, or PostHog (see .env.example / components/analytics/analytics-scripts.tsx) to see site-wide traffic here — this app doesn't fabricate numbers it can't measure." />
      </ChartCard>

      <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-surface p-5 text-sm text-muted-foreground shadow-elevated">
        <BarChart3 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <p>
          Post view counts come from visits to published articles (tracked client-side, so ISR
          background revalidation never inflates them). Category, author and publishing charts are
          computed from your current posts each time this page loads.
        </p>
      </div>
    </div>
  );
}
