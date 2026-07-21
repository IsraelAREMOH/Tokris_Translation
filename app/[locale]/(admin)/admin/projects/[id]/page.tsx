import { ArrowLeft, Phone } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CompletedUploadForm } from "@/components/admin/completed-upload-form";
import { StatusSelect } from "@/components/admin/status-select";
import { FileDownloadList } from "@/components/file-download-list";
import { MessageForm } from "@/components/messages/message-form";
import { StatusBadge } from "@/components/status-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { Link } from "@/i18n/navigation";
import { postProjectMessage } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDate, formatDateTime } from "@/lib/format";
import { isOverdue } from "@/lib/projects/constants";
import { createSignedUrlMap } from "@/lib/storage";

export const metadata: Metadata = { title: "Project Detail" };

type ProjectDetail = {
  id: string;
  client_id: string;
  source_language: string;
  target_language: string;
  deadline: string | null;
  instructions: string | null;
  status: string;
  created_at: string;
  profiles: { full_name: string | null; phone_number: string | null } | null;
};

type FileRow = {
  id: string;
  file_name: string;
  storage_path: string;
  file_type: "source" | "completed";
  uploaded_at: string;
};

type MessageRow = {
  id: string;
  sender_id: string | null;
  message_text: string;
  created_at: string;
};

export default async function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, { supabase }] = await Promise.all([params, requireAdmin()]);

  const { data: projectData } = await supabase
    .from("projects")
    .select(
      "id, client_id, source_language, target_language, deadline, instructions, status, created_at, profiles(full_name, phone_number)",
    )
    .eq("id", id)
    .single();

  if (!projectData) notFound();
  const project = projectData as unknown as ProjectDetail;

  const [{ data: filesData }, { data: messagesData }] = await Promise.all([
    supabase
      .from("project_files")
      .select("id, file_name, storage_path, file_type, uploaded_at")
      .eq("project_id", id)
      .order("uploaded_at", { ascending: true }),
    supabase
      .from("messages")
      .select("id, sender_id, message_text, created_at")
      .eq("project_id", id)
      .order("created_at", { ascending: true }),
  ]);

  const files = (filesData ?? []) as FileRow[];
  const messages = (messagesData ?? []) as MessageRow[];
  const sourceFiles = files.filter((file) => file.file_type === "source");
  const completedFiles = files.filter((file) => file.file_type === "completed");

  // Short-lived signed URLs so downloads work straight from the private
  // bucket without exposing anything public. Page is dynamic per request.
  const urlByPath = await createSignedUrlMap(
    supabase,
    files.map((file) => file.storage_path),
  );

  const clientName = project.profiles?.full_name ?? "Client";
  const overdue = isOverdue(project.deadline, project.status);

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-transform duration-200 ease-spring hover:-translate-x-0.5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-x-0"
        >
          <ArrowLeft className="h-4 w-4" />
          All projects
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
            {project.source_language} → {project.target_language}
          </h1>
          <StatusBadge status={project.status} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {clientName} · Submitted {formatDate(project.created_at)} · Deadline{" "}
          <span className={overdue ? "font-semibold text-danger" : undefined}>
            {formatDate(project.deadline)}
            {overdue ? " (overdue)" : ""}
          </span>
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
            <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
              Client instructions
            </h2>
            {project.instructions ? (
              <p className="mt-3 text-sm break-words whitespace-pre-wrap text-foreground">
                {project.instructions}
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                No special instructions provided.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
            <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
              Source documents
            </h2>
            <FileDownloadList
              files={sourceFiles}
              urlByPath={urlByPath}
              emptyText="No source documents on this project."
            />
          </section>

          <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
            <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
              Completed translations
            </h2>
            <FileDownloadList
              files={completedFiles}
              urlByPath={urlByPath}
              emptyText="Nothing delivered yet — upload finished documents from the panel on the right."
            />
          </section>

          <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
            <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
              Messages
            </h2>
            {messages.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                No messages yet — post the first update below.
              </p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {messages.map((message) => {
                  const fromClient = message.sender_id === project.client_id;
                  return (
                    <li
                      key={message.id}
                      className={`flex max-w-[85%] flex-col gap-1 rounded-xl border px-4 py-3 ${
                        fromClient
                          ? "self-start border-border bg-background"
                          : "self-end border-brand-600/20 bg-brand-600/10 dark:border-brand-400/20 dark:bg-brand-400/10"
                      }`}
                    >
                      <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
                        {fromClient ? clientName : "You"}
                      </span>
                      <p className="text-sm break-words whitespace-pre-wrap text-foreground">
                        {message.message_text}
                      </p>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDateTime(message.created_at)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="mt-5 border-t border-border pt-5">
              <MessageForm
                projectId={project.id}
                action={postProjectMessage}
                label="Post an update"
                placeholder="Progress notes, questions about the documents, delivery details…"
                submitLabel="Post message"
              />
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
            <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
              Workflow status
            </h2>
            <div className="mt-4">
              <StatusTimeline status={project.status} />
            </div>
            <div className="mt-4 border-t border-border pt-4">
              <StatusSelect
                projectId={project.id}
                currentStatus={project.status}
              />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
            <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
              Upload completed translation
            </h2>
            <p className="mt-1.5 mb-4 text-xs text-muted-foreground">
              Finished documents are stored in the client&apos;s private folder
              and appear in their portal for download.
            </p>
            <CompletedUploadForm projectId={project.id} />
          </section>

          <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
            <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
              Client
            </h2>
            <p className="mt-3 text-sm font-medium text-foreground">
              {clientName}
            </p>
            {project.profiles?.phone_number ? (
              <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                {project.profiles.phone_number}
              </p>
            ) : (
              <p className="mt-1.5 text-sm text-muted-foreground">
                No phone number on file.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
