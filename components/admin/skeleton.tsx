// Loading placeholders for admin list views — Tailwind's built-in `animate-pulse`
// only touches opacity, so it stays within the transform/opacity motion budget.

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-border/60 ${className}`} />;
}

export function TableRowSkeleton({ columns }: { columns: number }) {
  return (
    <tr className="border-b border-border last:border-b-0">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-5 py-4">
          <Skeleton className="h-4 w-full max-w-[10rem]" />
        </td>
      ))}
    </tr>
  );
}

export function TableSkeleton({ rows = 5, columns }: { rows?: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <TableRowSkeleton key={index} columns={columns} />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-elevated">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
