"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { SearchInput } from "@/components/admin/search-input";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { BLOG_POST_STATUSES } from "@/lib/blog/posts/constants";
import type { AdminPostSortField } from "@/lib/blog/posts/queries";
import type { BlogAuthor, BlogCategory, BlogTag } from "@/lib/blog/types";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

const SORT_OPTIONS: { label: string; sort: AdminPostSortField; dir: "asc" | "desc" }[] = [
  { label: "Last updated (newest)", sort: "updated_at", dir: "desc" },
  { label: "Last updated (oldest)", sort: "updated_at", dir: "asc" },
  { label: "Publish date (newest)", sort: "published_at", dir: "desc" },
  { label: "Publish date (oldest)", sort: "published_at", dir: "asc" },
  { label: "Title (A-Z)", sort: "title", dir: "asc" },
  { label: "Title (Z-A)", sort: "title", dir: "desc" },
  { label: "Most viewed", sort: "view_count", dir: "desc" },
  { label: "Least viewed", sort: "view_count", dir: "asc" },
];

function useQueryUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (updates: Record<string, string | undefined>) => {
    const query: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== "page" && !(key in updates)) query[key] = value;
    });
    for (const [key, value] of Object.entries(updates)) {
      if (value) query[key] = value;
    }
    router.push(Object.keys(query).length > 0 ? { pathname, query } : pathname, { scroll: false });
  };
}

function FilterSelect({
  paramName,
  value,
  options,
  placeholder,
}: {
  paramName: string;
  value: string;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  const updateQuery = useQueryUpdater();

  return (
    <select
      value={value}
      onChange={(event) => updateQuery({ [paramName]: event.target.value })}
      aria-label={placeholder}
      className="rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-medium text-foreground shadow-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function PostSortSelect({ sort, dir }: { sort: string; dir: string }) {
  const updateQuery = useQueryUpdater();
  const current = SORT_OPTIONS.findIndex((option) => option.sort === sort && option.dir === dir);

  return (
    <select
      value={current >= 0 ? String(current) : "0"}
      onChange={(event) => {
        const option = SORT_OPTIONS[Number(event.target.value)];
        updateQuery({ sort: option.sort, dir: option.dir });
      }}
      aria-label="Sort posts"
      className="rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-medium text-foreground shadow-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
    >
      {SORT_OPTIONS.map((option, index) => (
        <option key={option.label} value={index}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function PostFilters({
  status,
  categoryId,
  authorId,
  tagId,
  sort,
  dir,
  view,
  categories,
  authors,
  tags,
}: {
  status?: string;
  categoryId?: string;
  authorId?: string;
  tagId?: string;
  sort: string;
  dir: string;
  view: "table" | "cards";
  categories: BlogCategory[];
  authors: Pick<BlogAuthor, "id" | "name">[];
  tags: BlogTag[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput placeholder="Search posts…" />
        <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1 shadow-elevated">
          <Link
            href={{ pathname: "/admin/blog/posts", query: { view: "table" } }}
            aria-current={view === "table" ? "true" : undefined}
            aria-label="Table view"
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              view === "table" ? "bg-brand-600 text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Table2 className="h-4 w-4" />
          </Link>
          <Link
            href={{ pathname: "/admin/blog/posts", query: { view: "cards" } }}
            aria-current={view === "cards" ? "true" : undefined}
            aria-label="Card view"
            className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              view === "cards" ? "bg-brand-600 text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {[undefined, ...BLOG_POST_STATUSES].map((value) => {
          const active = value === status;
          return (
            <Link
              key={value ?? "all"}
              href={
                value
                  ? { pathname: "/admin/blog/posts", query: { status: value } }
                  : "/admin/blog/posts"
              }
              aria-current={active ? "true" : undefined}
              className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] ${
                active
                  ? "border-brand-600 bg-brand-600 text-white shadow-brand dark:border-brand-400 dark:bg-brand-400 dark:text-brand-950"
                  : "border-border bg-surface text-muted-foreground shadow-elevated hover:text-foreground"
              }`}
            >
              {value ? STATUS_LABELS[value] : "All"}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-wrap gap-2">
        <FilterSelect
          paramName="category"
          value={categoryId ?? ""}
          placeholder="All categories"
          options={categories.map((category) => ({ value: category.id, label: category.name }))}
        />
        <FilterSelect
          paramName="author"
          value={authorId ?? ""}
          placeholder="All authors"
          options={authors.map((author) => ({ value: author.id, label: author.name }))}
        />
        <FilterSelect
          paramName="tag"
          value={tagId ?? ""}
          placeholder="All tags"
          options={tags.map((tag) => ({ value: tag.id, label: tag.name }))}
        />
        <PostSortSelect sort={sort} dir={dir} />
      </div>
    </div>
  );
}
