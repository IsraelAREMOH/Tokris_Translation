import { Link } from "@/i18n/navigation";
import type { BlogCategory } from "@/lib/blog/types";

export function BrowseByCategory({
  categories,
  title,
}: {
  categories: BlogCategory[];
  title: string;
}) {
  if (categories.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-xl font-semibold tracking-[-0.01em] text-foreground">
        {title}
      </h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/blog/category/${category.slug}`}
            className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-600/10 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] dark:hover:text-brand-300"
          >
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
