"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { uploadMedia } from "@/lib/media/actions";
import { ACCEPT_ATTRIBUTE, MAX_MEDIA_FILE_SIZE_MB } from "@/lib/media/constants";

export function MediaDropzone({ folder = "uploads" }: { folder?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);

    const formData = new FormData();
    Array.from(fileList).forEach((file) => formData.append("files", file));
    formData.set("folder", folder);

    const result = await uploadMedia({}, formData);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";

    if (result.error) toast.error(result.error);
    else toast.success("Upload complete.");
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload media"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 ${
        dragActive
          ? "border-brand-500 bg-brand-50 dark:bg-brand-950"
          : "border-border bg-surface"
      }`}
    >
      <Upload className="h-6 w-6 text-brand-600 dark:text-brand-400" />
      <p className="text-sm font-medium text-foreground">
        {uploading ? "Uploading…" : "Drop files here, or click to browse"}
      </p>
      <p className="text-xs text-muted-foreground">
        Images, PDFs, video and documents, up to {MAX_MEDIA_FILE_SIZE_MB} MB each.
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPT_ATTRIBUTE}
        disabled={uploading}
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}
