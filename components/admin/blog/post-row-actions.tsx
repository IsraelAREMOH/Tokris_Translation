"use client";

import { MoreHorizontal } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import {
  archivePost,
  deletePost,
  duplicatePost,
  quickTogglePublish,
  restorePost,
  toggleFeatured,
  togglePinned,
  type PostActionState,
} from "@/lib/blog/posts/actions";
import type { BlogPostSummary } from "@/lib/blog/types";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/components/ui/confirm-dialog";

/** The less-common per-row actions, tucked behind a menu — Edit/Preview stay
 * as always-visible controls on the row itself. */
export function PostRowActions({ post }: { post: BlogPostSummary }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [pending, startTransition] = useTransition();

  function run(promise: Promise<PostActionState>, successMessage: string) {
    startTransition(async () => {
      const result = await promise;
      if (result.error) toast.error(result.error);
      else toast.success(successMessage);
    });
  }

  return (
    <DropdownMenu
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          aria-label={`More actions for ${post.title}`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-transform duration-200 ease-spring hover:bg-background hover:text-foreground active:scale-90 disabled:opacity-50"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      )}
    >
      {(close) => (
        <div className="flex flex-col gap-0.5">
          <DropdownMenuItem
            onSelect={() => {
              run(quickTogglePublish(post.id), post.status === "published" ? "Unpublished." : "Published.");
              close();
            }}
          >
            {post.status === "published" ? "Unpublish" : "Publish now"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              run(
                toggleFeatured(post.id, !post.featured),
                post.featured ? "Removed from featured." : "Marked as featured.",
              );
              close();
            }}
          >
            {post.featured ? "Unfeature" : "Feature"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              run(togglePinned(post.id, !post.pinned), post.pinned ? "Unpinned." : "Pinned to top.");
              close();
            }}
          >
            {post.pinned ? "Unpin" : "Pin to top"}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={async () => {
              close();
              const result = await duplicatePost(post.id);
              if (result.error) toast.error(result.error);
              else if (result.postId) {
                toast.success("Post duplicated.");
                router.push(`/admin/blog/posts/${result.postId}`);
              }
            }}
          >
            Duplicate
          </DropdownMenuItem>
          {post.status === "archived" ? (
            <DropdownMenuItem
              onSelect={() => {
                run(restorePost(post.id), "Restored to draft.");
                close();
              }}
            >
              Restore
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onSelect={() => {
                run(archivePost(post.id), "Archived.");
                close();
              }}
            >
              Archive
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            danger
            onSelect={async () => {
              close();
              const ok = await confirm({
                title: `Delete "${post.title}"?`,
                description: "This can't be undone.",
                confirmLabel: "Delete",
                danger: true,
              });
              if (!ok) return;

              const formData = new FormData();
              formData.set("id", post.id);
              const result = await deletePost({}, formData);
              if (result.error) toast.error(result.error);
              else toast.success("Post deleted.");
            }}
          >
            Delete
          </DropdownMenuItem>
        </div>
      )}
    </DropdownMenu>
  );
}
