import { ChartEmptyState } from "@/components/admin/charts/chart-empty-state";

const WIDTH = 600;
const HEIGHT = 160;

/**
 * A hand-rolled SVG sparkline/area chart — no chart library in this project
 * (see package.json), and pulling one in for a handful of dashboard widgets
 * would be a heavier dependency than a ~30-line SVG path needs to be.
 *
 * Accessible via `role="img"` + a text `aria-label` summarizing the series
 * (range, total, peak) rather than exposing the raw path data to screen
 * readers — there's nothing to navigate by keyboard here since the chart
 * itself isn't interactive (no per-point tooltips), matching every other
 * static visualization already in the console (e.g. the Master Dashboard's
 * status bars).
 */
export function AreaChart({
  data,
  valueLabel = "value",
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
  const stepX = data.length > 1 ? WIDTH / (data.length - 1) : WIDTH;
  const coords = data.map((point, index) => {
    const x = index * stepX;
    const y = HEIGHT - (point.value / max) * (HEIGHT - 8) - 4;
    return `${x},${y}`;
  });
  const linePath = `M${coords.join(" L")}`;
  const areaPath = `${linePath} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;

  const total = data.reduce((sum, point) => sum + point.value, 0);
  const summary = `${valueLabel} from ${data[0].label} to ${data[data.length - 1].label}: total ${total}, peak ${max}.`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={summary}
        className="h-40 w-full"
      >
        <path d={areaPath} className="fill-brand-600/10 dark:fill-brand-400/10" />
        <path
          d={linePath}
          fill="none"
          className="stroke-brand-600 dark:stroke-brand-400"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
        <span>{data[0].label}</span>
        <span>{data[data.length - 1].label}</span>
      </div>
    </div>
  );
}
