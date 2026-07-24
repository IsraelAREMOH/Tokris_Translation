import { ChartEmptyState } from "@/components/admin/charts/chart-empty-state";

/**
 * Reuses the horizontal same-ramp bar-list visual language already used by
 * the Master Dashboard's "Pipeline by status" (app/.../admin/page.tsx) —
 * no chart library in this project, and this keeps every dashboard chart
 * visually consistent with what's already shipped.
 *
 * Accessible via a paired `sr-only` data table: the bars themselves are
 * `aria-hidden` (they're a redundant visual encoding of the same numbers),
 * so screen reader users get the real table instead of a wall of divs.
 */
export function BarChart({
  data,
  valueLabel = "Value",
  emptyMessage,
}: {
  data: { label: string; value: number }[];
  valueLabel?: string;
  emptyMessage?: string;
}) {
  const hasData = data.some((point) => point.value > 0);
  if (!hasData) {
    return <ChartEmptyState message={emptyMessage ?? "Not enough data yet."} />;
  }

  const max = Math.max(1, ...data.map((point) => point.value));

  return (
    <div>
      <ul aria-hidden className="flex flex-col gap-1.5">
        {data.map((point) => (
          <li key={point.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-xs text-muted-foreground">
              {point.label}
            </span>
            <span className="relative h-3 min-w-0 flex-1 overflow-hidden rounded-r-[4px] bg-brand-100 dark:bg-brand-950">
              <span
                className="absolute inset-y-0 left-0 rounded-r-[4px] bg-brand-600 dark:bg-brand-400"
                style={{ width: `${(point.value / max) * 100}%` }}
              />
            </span>
            <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
              {point.value}
            </span>
          </li>
        ))}
      </ul>
      <table className="sr-only">
        <caption>{valueLabel} by category</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point) => (
            <tr key={point.label}>
              <td>{point.label}</td>
              <td>{point.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
