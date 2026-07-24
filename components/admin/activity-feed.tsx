import {
  Activity,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Mail,
  Tag as TagIcon,
  User,
  type LucideIcon,
} from "lucide-react";

import { EmptyState } from "@/components/admin/empty-state";
import { formatRelativeTime } from "@/lib/format";
import type { ActivityEntry } from "@/lib/cms/activity/queries";

const ENTITY_ICON: Record<string, LucideIcon> = {
  post: FileText,
  category: FolderOpen,
  tag: TagIcon,
  author: User,
  media: ImageIcon,
  newsletter_subscriber: Mail,
  page: FileText,
};

export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="No activity yet"
        description="Publish a post, add a category, or upload media what you do shows up here as a timeline."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {entries.map((entry) => {
        const Icon = ENTITY_ICON[entry.entity_type] ?? Activity;
        return (
          <li
            key={entry.id}
            className="flex items-start gap-3 rounded-lg border border-border bg-background px-3.5 py-2.5"
          >
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              <Icon className="h-3.5 w-3.5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-foreground">{entry.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {entry.actor_name ?? "System"} · {formatRelativeTime(entry.created_at)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
