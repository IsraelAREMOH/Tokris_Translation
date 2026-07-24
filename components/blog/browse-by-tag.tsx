import { Link } from "@/i18n/navigation";
import type { BlogTag } from "@/lib/blog/types";

export function BrowseByTag({ tags, title }: { tags: BlogTag[]; title: string }) {
  if (tags.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-foreground">
        {title}
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/blog/tag/${tag.slug}`}
            className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] dark:hover:text-brand-300"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
