"use client";

import { Eye } from "lucide-react";
import { useState } from "react";

import { Link } from "@/i18n/navigation";
import type { BlogPostStatus } from "@/lib/blog/types";

const STATUS_LABELS: Record<BlogPostStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

const STATUS_STYLES: Record<BlogPostStatus, string> = {
  draft: "border border-border bg-surface text-muted-foreground",
  scheduled: "bg-accent-200 text-accent-800 dark:bg-accent-500/25 dark:text-accent-200",
  published: "bg-brand-600 text-white dark:bg-brand-500 dark:text-brand-950",
  archived: "bg-danger/10 text-danger",
};

function formatSavedAt(timestamp: number | null) {
  if (!timestamp) return "Not saved yet";
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 10) return "Saved just now";
  if (seconds < 60) return `Saved ${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `Saved ${minutes}m ago`;
  return `Saved at ${new Date(timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

export function PublishPanel({
  postId,
  status,
  scheduledAt,
  saving,
  lastSavedAt,
  onSaveDraft,
  onPublishNow,
  onSchedule,
  onArchive,
  onRestore,
  onDuplicate,
  onDelete,
}: {
  postId: string;
  status: BlogPostStatus;
  scheduledAt: string | null;
  saving: boolean;
  lastSavedAt: number | null;
  onSaveDraft: () => void;
  onPublishNow: () => void;
  onSchedule: (scheduledAt: string) => void;
  onArchive: () => void;
  onRestore: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const [scheduleValue, setScheduleValue] = useState(scheduledAt ? scheduledAt.slice(0, 16) : "");
  const [showScheduler, setShowScheduler] = useState(false);

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-elevated">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold tracking-[-0.01em] text-foreground">
          Publish
        </h2>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${STATUS_STYLES[status]}`}
        >
          {STATUS_LABELS[status]}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        {saving ? "Saving…" : formatSavedAt(lastSavedAt)}
      </p>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={saving}
          className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
        >
          Save draft
        </button>

        <button
          type="button"
          onClick={onPublishNow}
          disabled={saving}
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
        >
          {status === "published" ? "Update & keep published" : "Publish now"}
        </button>

        {showScheduler ? (
          <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3">
            <input
              type="datetime-local"
              value={scheduleValue}
              onChange={(event) => setScheduleValue(event.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            />
            <button
              type="button"
              disabled={!scheduleValue || saving}
              onClick={() => onSchedule(new Date(scheduleValue).toISOString())}
              className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-transform duration-200 ease-spring hover:bg-brand-700 disabled:pointer-events-none disabled:opacity-60"
            >
              Confirm schedule
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowScheduler(true)}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
          >
            Schedule…
          </button>
        )}

        {status === "archived" ? (
          <button
            type="button"
            onClick={onRestore}
            disabled={saving}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
          >
            Restore to draft
          </button>
        ) : (
          <button
            type="button"
            onClick={onArchive}
            disabled={saving}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
          >
            Archive
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <Link
          href={`/admin/preview/${postId}`}
          target="_blank"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
        >
          <Eye className="h-4 w-4" />
          Preview
        </Link>
        <button
          type="button"
          onClick={onDuplicate}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Duplicate
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-sm font-medium text-danger transition-colors hover:text-danger/80"
        >
          Delete post
        </button>
      </div>
    </section>
  );
}
