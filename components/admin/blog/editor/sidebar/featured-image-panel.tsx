"use client";

import { ImageOff, X } from "lucide-react";
import Image from "next/image";

import { MediaPickerDialog } from "@/components/admin/media/media-picker-dialog";
import type { MediaAsset } from "@/lib/media/types";

export function FeaturedImagePanel({
  coverImage,
  coverImageAlt,
  onChangeCoverImage,
  onChangeAlt,
}: {
  coverImage: MediaAsset | null;
  coverImageAlt: string;
  onChangeCoverImage: (asset: MediaAsset | null) => void;
  onChangeAlt: (alt: string) => void;
}) {
  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-elevated">
      <h2 className="font-display text-sm font-semibold tracking-[-0.01em] text-foreground">
        Featured image
      </h2>

      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
        {coverImage ? (
          <Image src={coverImage.url} alt={coverImageAlt || ""} fill sizes="320px" className="object-cover" />
        ) : (
          <ImageOff className="h-6 w-6 text-muted-foreground" />
        )}
        {coverImage ? (
          <button
            type="button"
            onClick={() => onChangeCoverImage(null)}
            aria-label="Remove featured image"
            className="absolute top-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white backdrop-blur-sm transition-transform duration-200 ease-spring hover:scale-105 active:scale-90"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      <MediaPickerDialog
        restrictToType="image"
        folder="posts"
        onSelect={onChangeCoverImage}
        trigger={
          <button
            type="button"
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
          >
            {coverImage ? "Change image" : "Choose image"}
          </button>
        }
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="cover-image-alt" className="text-xs font-medium text-muted-foreground">
          Alt text
        </label>
        <input
          id="cover-image-alt"
          type="text"
          value={coverImageAlt}
          onChange={(event) => onChangeAlt(event.target.value)}
          placeholder="Describe this image…"
          maxLength={300}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        />
      </div>
    </section>
  );
}
