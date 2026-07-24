import { ContentCardSkeleton } from "@/components/content/content-card-skeleton";

/** Manually-placed <Suspense fallback> for the archive pages — see
 * blog-landing-skeleton.tsx's doc comment for why this isn't a loading.tsx file. */
export function ArchiveResultsSkeleton() {
  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <ContentCardSkeleton key={index} />
      ))}
    </div>
  );
}
