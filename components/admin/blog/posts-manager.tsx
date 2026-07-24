"use client";

import { Newspaper } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import { PostsCards } from "@/components/admin/blog/posts-cards";
import { PostsTable } from "@/components/admin/blog/posts-table";
import { EmptyState } from "@/components/admin/empty-state";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { bulkDeletePosts, bulkUpdatePostStatus } from "@/lib/blog/posts/actions";
import type { PostListView } from "@/lib/blog/posts/constants";
import type { BlogPostSummary, BlogPostStatus } from "@/lib/blog/types";

export function PostsManager({
  posts,
  view,
  hasFilters,
}: {
  posts: BlogPostSummary[];
  view: PostListView;
  hasFilters: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const confirm = useConfirm();
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function bulkStatus(status: BlogPostStatus, label: string) {
    startTransition(async () => {
      const result = await bulkUpdatePostStatus(Array.from(selected), status);
      if (result.error) toast.error(result.error);
      else {
        toast.success(label);
        setSelected(new Set());
      }
    });
  }

  function bulkDelete() {
    startTransition(async () => {
      const ok = await confirm({
        title: `Delete ${selected.size} post${selected.size === 1 ? "" : "s"}?`,
        description: "This can't be undone.",
        confirmLabel: "Delete",
        danger: true,
      });
      if (!ok) return;

      const result = await bulkDeletePosts(Array.from(selected));
      if (result.error) toast.error(result.error);
      else {
        toast.success("Posts deleted.");
        setSelected(new Set());
      }
    });
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        icon={Newspaper}
        title={hasFilters ? "No posts match your filters." : "No posts yet"}
        description={hasFilters ? "Try a different search or filter." : "Create your first article to get started."}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {view === "cards" ? (
        <PostsCards posts={posts} selected={selected} onToggle={toggle} />
      ) : (
        <PostsTable posts={posts} selected={selected} onToggle={toggle} />
      )}

      <BulkActionBar
        selectedCount={selected.size}
        onClear={() => setSelected(new Set())}
        actions={[
          { label: "Publish", onClick: () => bulkStatus("published", "Posts published."), pending },
          { label: "Archive", onClick: () => bulkStatus("archived", "Posts archived."), pending },
          { label: "Delete", onClick: bulkDelete, danger: true, pending },
        ]}
      />
    </div>
  );
}
