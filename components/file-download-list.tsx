import { Download, FileText } from "lucide-react";

import { formatDate } from "@/lib/format";

export type DownloadableFile = {
  id: string;
  file_name: string;
  storage_path: string;
  uploaded_at: string;
};

/**
 * File rows with signed download links. `urlByPath` comes from
 * createSignedUrlMap() — a missing entry renders a graceful fallback.
 */
export function FileDownloadList({
  files,
  urlByPath,
  emptyText,
}: {
  files: DownloadableFile[];
  urlByPath: Map<string, string>;
  emptyText: string;
}) {
  if (files.length === 0) {
    return <p className="mt-3 text-sm text-muted-foreground">{emptyText}</p>;
  }

  return (
    <ul className="mt-3 flex flex-col gap-1.5">
      {files.map((file) => {
        const url = urlByPath.get(file.storage_path);
        return (
          <li
            key={file.id}
            className="flex items-center gap-3 rounded-lg border border-border bg-background px-3.5 py-2.5"
          >
            <FileText className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {file.file_name}
              </p>
              <p className="text-xs text-muted-foreground">
                Uploaded {formatDate(file.uploaded_at)}
              </p>
            </div>
            {url ? (
              <a
                href={url}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
            ) : (
              <span className="shrink-0 text-xs text-muted-foreground">
                Link unavailable
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
