"use client";

import { Pencil, Plus, Tags as TagsIcon, X } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/admin/empty-state";
import { TagFormDialog } from "@/components/admin/blog/tag-form-dialog";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { deleteTag } from "@/lib/blog/tags/actions";
import type { BlogTag } from "@/lib/blog/types";

function TagChip({ tag }: { tag: BlogTag }) {
  const confirm = useConfirm();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const ok = await confirm({
        title: `Delete "${tag.name}"?`,
        description: "Posts tagged with it just lose the tag. This can't be undone.",
        confirmLabel: "Delete",
        danger: true,
      });
      if (!ok) return;

      const formData = new FormData();
      formData.set("id", tag.id);
      const result = await deleteTag({}, formData);
      if (result.error) toast.error(result.error);
      else toast.success("Tag deleted.");
    });
  }

  return (
    <span className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface py-1.5 pr-1.5 pl-3.5 text-sm font-medium text-foreground shadow-elevated">
      {tag.name}
      <TagFormDialog
        tag={tag}
        trigger={
          <button
            type="button"
            aria-label={`Edit ${tag.name}`}
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-transform duration-200 ease-spring hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-90"
          >
            <Pencil className="h-3 w-3" />
          </button>
        }
      />
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        aria-label={`Delete ${tag.name}`}
        className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-transform duration-200 ease-spring hover:bg-danger/10 hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-90 disabled:pointer-events-none disabled:opacity-50"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export function TagsManager({
  tags,
  hasQuery,
}: {
  tags: BlogTag[];
  hasQuery: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <TagFormDialog
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              New tag
            </button>
          }
        />
      </div>

      {tags.length === 0 ? (
        <EmptyState
          icon={TagsIcon}
          title={hasQuery ? "No tags match your search." : "No tags yet"}
          description={
            hasQuery
              ? "Try a different search term."
              : "Tags are free-form labels — add as many as you need while writing a post."
          }
        />
      ) : (
        <div className="flex flex-wrap gap-2 rounded-xl border border-border bg-surface p-5 shadow-elevated">
          {tags.map((tag) => (
            <TagChip key={tag.id} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
