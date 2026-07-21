import { Download, FileText } from "lucide-react";
import type { Metadata } from "next";

import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDate } from "@/lib/format";
import { createSignedUrlMap } from "@/lib/storage";

export const metadata: Metadata = { title: "File Vault" };

// Bounds the signed-URL batch; raise alongside real storage growth.
const VAULT_PAGE_SIZE = 100;

const TYPE_FILTERS = [
  { label: "All files", value: undefined },
  { label: "Source", value: "source" },
  { label: "Completed", value: "completed" },
] as const;

type VaultFileRow = {
  id: string;
  file_name: string;
  file_type: "source" | "completed";
  storage_path: string;
  uploaded_at: string;
  projects: {
    id: string;
    source_language: string;
    target_language: string;
    profiles: { full_name: string | null } | null;
  } | null;
};

export default async function AdminFilesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const [{ type: typeParam }, { supabase }] = await Promise.all([
    searchParams,
    requireAdmin(),
  ]);

  const activeType =
    typeParam === "source" || typeParam === "completed" ? typeParam : undefined;

  let query = supabase
    .from("project_files")
    .select(
      "id, file_name, file_type, storage_path, uploaded_at, projects(id, source_language, target_language, profiles(full_name))",
    )
    .order("uploaded_at", { ascending: false })
    .limit(VAULT_PAGE_SIZE);
  if (activeType) {
    query = query.eq("file_type", activeType);
  }

  const { data } = await query;
  const files = (data ?? []) as unknown as VaultFileRow[];

  const urlByPath = await createSignedUrlMap(
    supabase,
    files.map((file) => file.storage_path),
  );

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          File Vault
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every document across all projects, newest first — stored in the
          private bucket and downloadable via one-hour signed links.
        </p>
      </div>

      <nav aria-label="Filter by file type" className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map((filter) => {
          const active = filter.value === activeType;
          return (
            <Link
              key={filter.label}
              href={
                filter.value
                  ? { pathname: "/admin/files", query: { type: filter.value } }
                  : "/admin/files"
              }
              aria-current={active ? "true" : undefined}
              className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] ${
                active
                  ? "border-brand-600 bg-brand-600 text-white shadow-brand dark:border-brand-400 dark:bg-brand-400 dark:text-brand-950"
                  : "border-border bg-surface text-muted-foreground shadow-elevated hover:text-foreground"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {files.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-10 shadow-elevated">
          <p className="text-sm text-muted-foreground">
            {activeType
              ? `No ${activeType} files in the vault yet.`
              : "No files in the vault yet — documents appear as clients submit requests."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {files.map((file) => {
            const url = urlByPath.get(file.storage_path);
            const completed = file.file_type === "completed";
            return (
              <li
                key={file.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-elevated"
              >
                <FileText className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {file.file_name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {file.projects ? (
                      <>
                        {file.projects.profiles?.full_name ?? "Client"} ·{" "}
                        <Link
                          href={`/admin/projects/${file.projects.id}`}
                          className="rounded-sm underline decoration-border underline-offset-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                        >
                          {file.projects.source_language} →{" "}
                          {file.projects.target_language}
                        </Link>
                      </>
                    ) : (
                      "Unlinked project"
                    )}{" "}
                    · {formatDate(file.uploaded_at)}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap ${
                    completed
                      ? "bg-brand-600/10 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300"
                      : "border border-border bg-background text-muted-foreground"
                  }`}
                >
                  {completed ? "Completed" : "Source"}
                </span>
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
      )}

      {files.length === VAULT_PAGE_SIZE ? (
        <p className="text-xs text-muted-foreground">
          Showing the {VAULT_PAGE_SIZE} most recent files — open a project for
          its full document history.
        </p>
      ) : null}
    </div>
  );
}
