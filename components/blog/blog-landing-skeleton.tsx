import { ContentCardSkeleton } from "@/components/content/content-card-skeleton";

/**
 * Rendered as a manually-placed <Suspense fallback> inside blog/page.tsx's
 * own JSX — deliberately NOT a loading.tsx file. A loading.tsx here would
 * wrap this whole route (and its dynamic siblings [slug]/category/tag) in a
 * Suspense boundary that Next.js 16 starts streaming a 200 for before
 * notFound() can be decided, silently turning 404s into 200s. See the
 * memory note on this — never reintroduce loading.tsx for these routes.
 */
export function BlogLandingSkeleton() {
  return (
    <>
      <div className="mt-12 aspect-16/9 w-full animate-pulse rounded-3xl bg-border/60" />
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <ContentCardSkeleton key={index} />
        ))}
      </div>
    </>
  );
}
