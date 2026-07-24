"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";

import { SelectField } from "@/components/ui/select-field";
import type { BlogAuthor, BlogCategory, BlogTag } from "@/lib/blog/types";

function TagsInput({
  availableTags,
  selectedTagIds,
  onChange,
}: {
  availableTags: BlogTag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const selected = useMemo(
    () => selectedTagIds.map((id) => availableTags.find((tag) => tag.id === id)).filter((tag) => !!tag),
    [selectedTagIds, availableTags],
  );

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const lower = query.trim().toLowerCase();
    return availableTags
      .filter((tag) => !selectedTagIds.includes(tag.id) && tag.name.toLowerCase().includes(lower))
      .slice(0, 6);
  }, [query, availableTags, selectedTagIds]);

  function addTag(id: string) {
    onChange([...selectedTagIds, id]);
    setQuery("");
  }
  function removeTag(id: string) {
    onChange(selectedTagIds.filter((tagId) => tagId !== id));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">Tags</label>
      <div className="flex flex-wrap gap-1.5 rounded-lg border border-border bg-background p-2">
        {selected.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 rounded-full bg-brand-600/10 py-1 pr-1 pl-2.5 text-xs font-medium text-brand-700 dark:text-brand-300"
          >
            {tag.name}
            <button
              type="button"
              onClick={() => removeTag(tag.id)}
              aria-label={`Remove ${tag.name}`}
              className="inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-brand-600/20"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={selected.length === 0 ? "Search tags…" : ""}
          className="min-w-[6rem] flex-1 bg-transparent px-1 py-1 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />
      </div>
      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => addTag(tag.id)}
              className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              + {tag.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function TaxonomyPanel({
  categories,
  authors,
  tags,
  categoryId,
  authorId,
  tagIds,
  onCategoryChange,
  onAuthorChange,
  onTagsChange,
}: {
  categories: BlogCategory[];
  authors: BlogAuthor[];
  tags: BlogTag[];
  categoryId: string | null;
  authorId: string | null;
  tagIds: string[];
  onCategoryChange: (id: string | null) => void;
  onAuthorChange: (id: string | null) => void;
  onTagsChange: (ids: string[]) => void;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-elevated">
      <h2 className="font-display text-sm font-semibold tracking-[-0.01em] text-foreground">
        Classification
      </h2>

      <SelectField
        label="Category"
        id="post-category"
        value={categoryId ?? ""}
        onChange={(event) => onCategoryChange(event.target.value || null)}
      >
        <option value="">Uncategorized</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </SelectField>

      <SelectField
        label="Author"
        id="post-author"
        value={authorId ?? ""}
        onChange={(event) => onAuthorChange(event.target.value || null)}
      >
        <option value="">No author</option>
        {authors.map((author) => (
          <option key={author.id} value={author.id}>
            {author.name}
          </option>
        ))}
      </SelectField>

      <TagsInput availableTags={tags} selectedTagIds={tagIds} onChange={onTagsChange} />
    </section>
  );
}
