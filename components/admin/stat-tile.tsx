import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";

import { Link } from "@/i18n/navigation";

export function StatTile({
  label,
  value,
  icon: Icon,
  href,
  hint,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  href?: ComponentProps<typeof Link>["href"];
  hint?: string;
}) {
  const content = (
    <div className="h-full rounded-xl border border-border bg-surface p-5 shadow-elevated transition-transform duration-200 ease-spring group-hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <Icon className="h-4 w-4 text-brand-600 dark:text-brand-400" aria-hidden />
        ) : null}
      </div>
      <p className="mt-1.5 text-3xl font-semibold tracking-[-0.02em] text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      {content}
    </Link>
  );
}
