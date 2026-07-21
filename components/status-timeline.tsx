import { PROJECT_STATUSES } from "@/lib/projects/constants";

/**
 * Vertical lifecycle stepper shared by the admin detail view and the client
 * portal: completed stages filled, current stage ringed, future stages muted.
 */
export function StatusTimeline({ status }: { status: string }) {
  const currentIndex = PROJECT_STATUSES.findIndex((step) => step === status);

  return (
    <ol className="flex flex-col">
      {PROJECT_STATUSES.map((step, index) => {
        const done = index < currentIndex;
        const current = index === currentIndex;
        return (
          <li key={step} className="flex items-center gap-3 py-1.5">
            <span
              aria-hidden
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                done
                  ? "bg-brand-600 dark:bg-brand-400"
                  : current
                    ? "bg-brand-600 ring-4 ring-brand-600/20 dark:bg-brand-400 dark:ring-brand-400/20"
                    : "border border-border bg-background"
              }`}
            />
            <span
              className={`text-sm ${
                current
                  ? "font-semibold text-foreground"
                  : done
                    ? "text-foreground"
                    : "text-muted-foreground"
              }`}
            >
              {step}
              {current ? (
                <span className="sr-only"> (current stage)</span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
