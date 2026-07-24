"use client";

import { ChevronDown, ImageOff } from "lucide-react";
import Image from "next/image";

import { MediaPickerDialog } from "@/components/admin/media/media-picker-dialog";
import type { MediaAsset } from "@/lib/media/types";

const SEO_TITLE_MAX = 70;
const META_DESCRIPTION_MAX = 200;
const SERP_TITLE_MAX = 60;
const SERP_DESCRIPTION_MAX = 155;

export function SeoPanel({
  title,
  slug,
  seoTitle,
  onSeoTitleChange,
  metaDescription,
  onMetaDescriptionChange,
  canonicalUrl,
  onCanonicalUrlChange,
  ogImage,
  onOgImageChange,
}: {
  title: string;
  slug: string;
  seoTitle: string;
  onSeoTitleChange: (value: string) => void;
  metaDescription: string;
  onMetaDescriptionChange: (value: string) => void;
  canonicalUrl: string;
  onCanonicalUrlChange: (value: string) => void;
  ogImage: MediaAsset | null;
  onOgImageChange: (asset: MediaAsset | null) => void;
}) {
  const effectiveTitle = seoTitle || title || "Untitled post";
  const effectiveDescription = metaDescription || "No meta description set yet.";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "yoursite.com").replace(/^https?:\/\//, "");

  return (
    <details className="group rounded-xl border border-border bg-surface p-5 shadow-elevated">
      <summary className="flex cursor-pointer list-none items-center justify-between font-display text-sm font-semibold tracking-[-0.01em] text-foreground">
        SEO
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 ease-spring group-open:rotate-180" />
      </summary>

      <div className="mt-4 flex flex-col gap-4">
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="truncate text-[13px] text-muted-foreground">
            {siteUrl}/blog/{slug || "…"}
          </p>
          <p className="mt-0.5 truncate text-base text-blue-700 dark:text-blue-400">
            {effectiveTitle.slice(0, SERP_TITLE_MAX)}
          </p>
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
            {effectiveDescription.slice(0, SERP_DESCRIPTION_MAX)}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="seo-title" className="text-sm font-medium text-foreground">
            SEO title
          </label>
          <input
            id="seo-title"
            type="text"
            value={seoTitle}
            onChange={(event) => onSeoTitleChange(event.target.value)}
            placeholder={title}
            maxLength={SEO_TITLE_MAX}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          />
          <p className="text-right text-xs text-muted-foreground">
            {seoTitle.length}/{SEO_TITLE_MAX}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="meta-description" className="text-sm font-medium text-foreground">
            Meta description
          </label>
          <textarea
            id="meta-description"
            value={metaDescription}
            onChange={(event) => onMetaDescriptionChange(event.target.value)}
            rows={3}
            maxLength={META_DESCRIPTION_MAX}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          />
          <p className="text-right text-xs text-muted-foreground">
            {metaDescription.length}/{META_DESCRIPTION_MAX}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="canonical-url" className="text-sm font-medium text-foreground">
            Canonical URL (optional)
          </label>
          <input
            id="canonical-url"
            type="url"
            value={canonicalUrl}
            onChange={(event) => onCanonicalUrlChange(event.target.value)}
            placeholder={`https://${siteUrl}/blog/${slug}`}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">Open Graph image</span>
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
            {ogImage ? (
              <Image src={ogImage.url} alt="" fill sizes="320px" className="object-cover" />
            ) : (
              <ImageOff className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex gap-2">
            <MediaPickerDialog
              restrictToType="image"
              folder="posts"
              onSelect={onOgImageChange}
              trigger={
                <button
                  type="button"
                  className="rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground transition-transform duration-200 ease-spring hover:-translate-y-0.5 active:translate-y-0"
                >
                  {ogImage ? "Change" : "Choose image"}
                </button>
              }
            />
            {ogImage ? (
              <button
                type="button"
                onClick={() => onOgImageChange(null)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                Remove
              </button>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            Falls back to the featured image if left empty.
          </p>
        </div>
      </div>
    </details>
  );
}
