"use client";

import type { LucideIcon } from "lucide-react";

export function ToolbarButton({
  icon: Icon,
  label,
  active = false,
  disabled = false,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  disabled?: boolean;
  /** Optional — omit when this button is itself wrapped by a DialogTrigger
   * (e.g. inside MediaPickerDialog's `trigger` prop), which supplies the
   * open handler on a wrapping element instead. */
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 ease-spring hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-90 disabled:pointer-events-none disabled:opacity-40 ${
        active
          ? "bg-brand-600/10 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

export function ToolbarDivider() {
  return <span className="mx-1 h-6 w-px shrink-0 bg-border" aria-hidden />;
}
