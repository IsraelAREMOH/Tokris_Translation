"use client";

import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/admin/empty-state";
import { DialogTrigger } from "@/components/ui/dialog-trigger";
import { searchMedia, uploadMedia } from "@/lib/media/actions";
import { ACCEPT_ATTRIBUTE } from "@/lib/media/constants";
import type { MediaAsset, MediaFileType } from "@/lib/media/types";

/**
 * Reusable across every "pick an image" field (author photo today; post
 * cover/OG image in Phase 3) — one shared library, one shared picker.
 */
export function MediaPickerDialog({
  trigger,
  onSelect,
  restrictToType,
  folder = "uploads",
}: {
  trigger: ReactNode;
  onSelect: (asset: MediaAsset) => void;
  restrictToType?: MediaFileType;
  folder?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);

  function load(term: string) {
    startTransition(async () => {
      const result = await searchMedia({
        search: term || undefined,
        fileType: restrictToType,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setItems(result.items);
    });
  }

  function open() {
    dialogRef.current?.showModal();
    load(search);
  }

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    Array.from(fileList).forEach((file) => formData.append("files", file));
    formData.set("folder", folder);

    const result = await uploadMedia({}, formData);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";

    if (result.error) toast.error(result.error);
    else {
      toast.success("Uploaded.");
      load(search);
    }
  }

  return (
    <>
      <DialogTrigger onOpen={open}>{trigger}</DialogTrigger>
      <dialog
        ref={dialogRef}
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="m-auto h-[calc(100%-4rem)] w-[calc(100%-2rem)] max-w-3xl rounded-xl border border-border bg-floating p-0 text-foreground shadow-floating backdrop:bg-foreground/40 backdrop:backdrop-blur-sm"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
              Select media
            </h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-transform duration-200 ease-spring hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 border-b border-border px-6 py-3.5">
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                load(event.target.value);
              }}
              placeholder="Search media…"
              aria-label="Search media"
              className="w-full max-w-xs rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
            />
            <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-dashed border-border bg-surface px-4 py-2 text-sm font-medium whitespace-nowrap text-foreground transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload"}
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_ATTRIBUTE}
                multiple
                className="sr-only"
                disabled={uploading}
                onChange={(event) => handleUpload(event.target.files)}
              />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isPending ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={ImageIcon}
                title="No media found"
                description="Upload a file to get started."
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {items.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => {
                      onSelect(asset);
                      dialogRef.current?.close();
                    }}
                    className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface text-left shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0"
                  >
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
                    <span className="truncate px-2.5 py-2 text-xs text-muted-foreground">
                      {asset.file_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
