// Matches ContentCard's shape so the loading state doesn't jump on arrival.
export function ContentCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-elevated">
      <div className="aspect-16/10 w-full animate-pulse bg-border/60" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-5 w-20 animate-pulse rounded-full bg-border/60" />
        <div className="h-5 w-full animate-pulse rounded-lg bg-border/60" />
        <div className="h-4 w-3/4 animate-pulse rounded-lg bg-border/60" />
        <div className="mt-2 h-3 w-1/2 animate-pulse rounded-lg bg-border/60" />
      </div>
    </div>
  );
}
