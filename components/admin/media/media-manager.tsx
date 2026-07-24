"use client";

import { Image as ImageIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { BulkActionBar } from "@/components/admin/bulk-action-bar";
import { EmptyState } from "@/components/admin/empty-state";
import { MediaCard } from "@/components/admin/media/media-card";
import { MediaDropzone } from "@/components/admin/media/media-dropzone";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { bulkDeleteMedia } from "@/lib/media/actions";
import type { MediaAsset } from "@/lib/media/types";

export function MediaManager({
  items,
  hasQuery,
}: {
  items: MediaAsset[];
  hasQuery: boolean;
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

  function handleBulkDelete() {
    startTransition(async () => {
      const ok = await confirm({
        title: `Delete ${selected.size} item${selected.size === 1 ? "" : "s"}?`,
        description:
          "Any posts or authors using these files just lose the reference. This can't be undone.",
        confirmLabel: "Delete",
        danger: true,
      });
      if (!ok) return;

      const result = await bulkDeleteMedia(Array.from(selected));
      if (result.error) toast.error(result.error);
      else {
        toast.success("Media deleted.");
        setSelected(new Set());
      }
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <MediaDropzone />

      {items.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title={hasQuery ? "No media matches your search." : "No media yet"}
          description={
            hasQuery ? "Try a different search term." : "Upload your first file above."
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((asset) => (
            <MediaCard
              key={asset.id}
              asset={asset}
              selected={selected.has(asset.id)}
              onToggleSelect={toggle}
            />
          ))}
        </div>
      )}

      <BulkActionBar
        selectedCount={selected.size}
        onClear={() => setSelected(new Set())}
        actions={[{ label: "Delete", onClick: handleBulkDelete, danger: true, pending }]}
      />
    </div>
  );
}
