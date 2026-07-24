"use client";

export function BulkActionBar({
  selectedCount,
  onClear,
  actions,
}: {
  selectedCount: number;
  onClear: () => void;
  actions: {
    label: string;
    onClick: () => void;
    danger?: boolean;
    pending?: boolean;
  }[];
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 self-center rounded-full border border-border bg-floating px-5 py-3 shadow-floating">
      <span className="text-sm font-semibold whitespace-nowrap text-foreground">
        {selectedCount} selected
      </span>
      <button
        type="button"
        onClick={onClear}
        className="text-sm font-medium whitespace-nowrap text-muted-foreground transition-transform duration-200 ease-spring hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-95"
      >
        Clear
      </button>
      <span className="h-4 w-px bg-border" aria-hidden />
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          disabled={action.pending}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 ${
            action.danger
              ? "bg-danger/10 text-danger hover:bg-danger/15"
              : "bg-brand-600 text-white shadow-brand hover:bg-brand-700"
          }`}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
