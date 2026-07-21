// Upload constraints shared by the drop zone (client) and the server action.
// Keep in sync with the bucket's file_size_limit in migration 0003.
export const MAX_FILES = 5;
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ACCEPTED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".rtf",
  ".odt",
  ".png",
  ".jpg",
  ".jpeg",
];

export const ACCEPT_ATTRIBUTE = ACCEPTED_EXTENSIONS.join(",");

export function hasAllowedExtension(fileName: string) {
  const lower = fileName.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

/** Keeps original names readable while stripping path tricks and oddities. */
export function sanitizeFileName(name: string) {
  const cleaned = name.replace(/[^\w.\- ]+/g, "_").replace(/\s+/g, "_");
  return cleaned.slice(-100) || "document";
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
