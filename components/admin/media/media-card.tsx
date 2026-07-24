"use client";

import { Check, Pencil, X } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { DeleteButton } from "@/components/admin/delete-button";
import { deleteMedia, updateMediaAltText } from "@/lib/media/actions";
import { formatFileSize } from "@/lib/media/constants";
import type { MediaAsset } from "@/lib/media/types";

export function MediaCard({
  asset,
  selected,
  onToggleSelect,
}: {
  asset: MediaAsset;
  selected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const [editingAlt, setEditingAlt] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleAltTextSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateMediaAltText({}, formData);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Alt text saved.");
        setEditingAlt(false);
      }
    });
  }

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border bg-surface shadow-elevated ${
        selected ? "border-brand-500 ring-2 ring-brand-500/30" : "border-border"
      }`}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => onToggleSelect(asset.id)}
          aria-pressed={selected}
          aria-label={selected ? `Deselect ${asset.file_name}` : `Select ${asset.file_name}`}
          className={`absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full border backdrop-blur-sm transition-transform duration-200 ease-spring hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-90 ${
            selected
              ? "border-brand-500 bg-brand-600 text-white"
              : "border-white/50 bg-black/35 text-white"
          }`}
        >
          {selected ? <Check className="h-3.5 w-3.5" /> : null}
        </button>
        <span className="relative block aspect-square w-full overflow-hidden bg-background">
          {asset.file_type === "image" ? (
            <Image
              src={asset.url}
              alt={asset.alt_text ?? asset.file_name}
              fill
              sizes="200px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase text-muted-foreground">
              {asset.file_type}
            </span>
          )}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="truncate text-xs font-semibold text-foreground" title={asset.file_name}>
          {asset.file_name}
        </p>
        <p className="text-[11px] text-muted-foreground">{formatFileSize(asset.size_bytes)}</p>

        {editingAlt ? (
          <form action={handleAltTextSubmit} className="mt-1 flex flex-col gap-1.5">
            <input type="hidden" name="id" value={asset.id} />
            <textarea
              name="altText"
              defaultValue={asset.alt_text ?? ""}
              rows={2}
              maxLength={300}
              placeholder="Describe this image…"
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setEditingAlt(false)}
                aria-label="Cancel"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-transform duration-200 ease-spring hover:text-foreground active:scale-90"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <button
                type="submit"
                disabled={pending}
                aria-label="Save alt text"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white transition-transform duration-200 ease-spring hover:bg-brand-700 active:scale-90 disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setEditingAlt(true)}
            className="flex items-center gap-1 text-left text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <Pencil className="h-3 w-3 shrink-0" />
            <span className="truncate">{asset.alt_text || "Add alt text"}</span>
          </button>
        )}
      </div>

      <div className="flex justify-end border-t border-border px-2 py-1.5">
        <DeleteButton
          action={deleteMedia}
          fields={{ id: asset.id }}
          confirmTitle={`Delete "${asset.file_name}"?`}
          confirmDescription="Any post or author currently using this file just loses the reference. This can't be undone."
          label={`Delete ${asset.file_name}`}
          successMessage="Media deleted."
        />
      </div>
    </div>
  );
}
