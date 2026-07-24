import { Link } from "@/i18n/navigation";
import type { SearchSuggestions as SearchSuggestionsData } from "@/lib/blog/posts/queries";

/** Shown under a zero-result search — "browse instead" chips for a few
 * categories/tags, rather than leaving the visitor at a dead end. */
export function SearchSuggestions({
  suggestions,
  label,
}: {
  suggestions: SearchSuggestionsData;
  label: string;
}) {
  if (suggestions.categories.length === 0 && suggestions.tags.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.categories.map((category) => (
          <Link
            key={category.id}
            href={`/blog/category/${category.slug}`}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-600/10 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 dark:hover:text-brand-300"
          >
            {category.name}
          </Link>
        ))}
        {suggestions.tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/blog/tag/${tag.slug}`}
            className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 dark:hover:text-brand-300"
          >
            #{tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
