"use client";

export function ContentMetaPanel({
  slug,
  onSlugChange,
  excerpt,
  onExcerptChange,
  readingTimeMinutes,
  readingTimeManual,
  onReadingTimeChange,
  onToggleReadingTimeManual,
  featured,
  onFeaturedChange,
  pinned,
  onPinnedChange,
  allowComments,
  onAllowCommentsChange,
}: {
  slug: string;
  onSlugChange: (slug: string) => void;
  excerpt: string;
  onExcerptChange: (excerpt: string) => void;
  readingTimeMinutes: number;
  readingTimeManual: boolean;
  onReadingTimeChange: (minutes: number) => void;
  onToggleReadingTimeManual: (manual: boolean) => void;
  featured: boolean;
  onFeaturedChange: (value: boolean) => void;
  pinned: boolean;
  onPinnedChange: (value: boolean) => void;
  allowComments: boolean;
  onAllowCommentsChange: (value: boolean) => void;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-elevated">
      <h2 className="font-display text-sm font-semibold tracking-[-0.01em] text-foreground">
        Content settings
      </h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="post-slug" className="text-sm font-medium text-foreground">
          Slug
        </label>
        <input
          id="post-slug"
          type="text"
          value={slug}
          onChange={(event) => onSlugChange(event.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        />
        <p className="truncate text-xs text-muted-foreground">/blog/{slug || "…"}</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="post-excerpt" className="text-sm font-medium text-foreground">
          Excerpt
        </label>
        <textarea
          id="post-excerpt"
          value={excerpt}
          onChange={(event) => onExcerptChange(event.target.value)}
          rows={3}
          maxLength={500}
          placeholder="A short summary shown on cards and search results…"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        />
        <p className="text-right text-xs text-muted-foreground">{excerpt.length}/500</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="post-reading-time" className="text-sm font-medium text-foreground">
            Reading time
          </label>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={readingTimeManual}
              onChange={(event) => onToggleReadingTimeManual(event.target.checked)}
              className="h-3.5 w-3.5 rounded border-border text-brand-600"
            />
            Override
          </label>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="post-reading-time"
            type="number"
            min={1}
            max={500}
            value={readingTimeMinutes}
            disabled={!readingTimeManual}
            onChange={(event) => onReadingTimeChange(Number(event.target.value) || 1)}
            className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 disabled:opacity-60"
          />
          <span className="text-sm text-muted-foreground">
            minute{readingTimeMinutes === 1 ? "" : "s"} {readingTimeManual ? "(manual)" : "(auto)"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-border pt-4">
        <label className="flex items-center justify-between text-sm font-medium text-foreground">
          Featured
          <input
            type="checkbox"
            checked={featured}
            onChange={(event) => onFeaturedChange(event.target.checked)}
            className="h-4 w-4 rounded border-border text-brand-600"
          />
        </label>
        <label className="flex items-center justify-between text-sm font-medium text-foreground">
          Pin to top
          <input
            type="checkbox"
            checked={pinned}
            onChange={(event) => onPinnedChange(event.target.checked)}
            className="h-4 w-4 rounded border-border text-brand-600"
          />
        </label>
        <label className="flex items-center justify-between text-sm font-medium text-foreground">
          Allow comments
          <input
            type="checkbox"
            checked={allowComments}
            onChange={(event) => onAllowCommentsChange(event.target.checked)}
            className="h-4 w-4 rounded border-border text-brand-600"
          />
        </label>
      </div>
    </section>
  );
}
