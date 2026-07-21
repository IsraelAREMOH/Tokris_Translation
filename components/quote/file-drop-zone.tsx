"use client";

import { FileText, Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import {
  ACCEPT_ATTRIBUTE,
  MAX_FILES,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  formatFileSize,
  hasAllowedExtension,
} from "@/lib/quotes/constants";

/**
 * Drag-and-drop upload zone. The curated file list is mirrored into a real
 * <input name="files"> via DataTransfer, so the surrounding form submits the
 * files natively through its Server Action — no manual FormData wiring.
 * Pass `label` to override the default "Source documents" heading (e.g. the
 * admin console's completed-translation upload).
 */
export function FileDropZone({ label }: { label?: string }) {
  const t = useTranslations("quote.upload");
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  function sync(next: File[]) {
    setFiles(next);
    if (inputRef.current) {
      const dataTransfer = new DataTransfer();
      next.forEach((file) => dataTransfer.items.add(file));
      inputRef.current.files = dataTransfer.files;
    }
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const next = [...files];
    const rejected: string[] = [];

    for (const file of Array.from(list)) {
      const duplicate = next.some(
        (existing) => existing.name === file.name && existing.size === file.size,
      );
      if (duplicate) continue;

      if (
        next.length >= MAX_FILES ||
        !hasAllowedExtension(file.name) ||
        file.size > MAX_FILE_SIZE_BYTES
      ) {
        rejected.push(file.name);
        continue;
      }
      next.push(file);
    }

    setSkipped(rejected);
    sync(next);
  }

  function removeFile(index: number) {
    sync(files.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <span id="quote-files-label" className="text-sm font-medium text-foreground">
        {label ?? t("label")}
      </span>

      <div
        role="button"
        tabIndex={0}
        aria-labelledby="quote-files-label"
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
          addFiles(event.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 ${
          dragActive
            ? "border-brand-500 bg-brand-50 dark:bg-brand-950"
            : "border-border bg-background"
        }`}
      >
        <Upload className="h-6 w-6 text-brand-600 dark:text-brand-400" />
        <p className="text-sm font-medium text-foreground">{t("dropHint")}</p>
        <p className="text-xs text-muted-foreground">
          {t("constraints", { maxFiles: MAX_FILES, maxSize: MAX_FILE_SIZE_MB })}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        name="files"
        multiple
        accept={ACCEPT_ATTRIBUTE}
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => addFiles(event.target.files)}
      />

      {skipped.length > 0 ? (
        <p className="text-xs text-danger">
          {t("skipped", { names: skipped.join(", ") })}
        </p>
      ) : null}

      {files.length > 0 ? (
        <ul className="flex flex-col gap-1.5">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3.5 py-2.5 shadow-elevated"
            >
              <FileText className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">
                {file.name}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                aria-label={t("remove", { name: file.name })}
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-transform duration-200 ease-spring hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-90"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
