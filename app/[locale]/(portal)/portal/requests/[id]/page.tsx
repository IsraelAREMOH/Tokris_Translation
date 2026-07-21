import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AutoRefresh } from "@/components/auto-refresh";
import { FileDownloadList } from "@/components/file-download-list";
import { MessageForm } from "@/components/messages/message-form";
import { StatusBadge } from "@/components/status-badge";
import { StatusTimeline } from "@/components/status-timeline";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth/guards";
import { formatDate, formatDateTime } from "@/lib/format";
import { sendProjectMessage } from "@/lib/portal/actions";
import { createSignedUrlMap } from "@/lib/storage";

export const metadata: Metadata = { title: "Request Details" };

type ProjectDetail = {
  id: string;
  client_id: string;
  source_language: string;
  target_language: string;
  deadline: string | null;
  instructions: string | null;
  status: string;
  created_at: string;
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

export default async function PortalRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, { supabase, user }] = await Promise.all([
    params,
    requireUser(),
  ]);

  // RLS scopes this to the client's own projects — someone else's id 404s.
  const { data: projectData } = await supabase
    .from("projects")
    .select(
      "id, client_id, source_language, target_language, deadline, instructions, status, created_at",
    )
    .eq("id", id)
    .single();

  if (!projectData) notFound();
  const project = projectData as ProjectDetail;

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

  // One-hour signed URLs from the private bucket; the client's storage policy
  // only lets them sign objects inside their own folder.
  const urlByPath = await createSignedUrlMap(
    supabase,
    files.map((file) => file.storage_path),
  );

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {/* New admin updates (status, files, messages) appear automatically. */}
      <AutoRefresh intervalMs={8000} />

      <div>
        <Link
          href="/portal/requests"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-transform duration-200 ease-spring hover:-translate-x-0.5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-x-0"
        >
          <ArrowLeft className="h-4 w-4" />
          My requests
        </Link>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
            {project.source_language} → {project.target_language}
          </h1>
          <StatusBadge status={project.status} />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Submitted {formatDate(project.created_at)} · Requested deadline{" "}
          {formatDate(project.deadline)}
        </p>
      </div>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
        <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
          Progress
        </h2>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Your project is reviewed, translated, edited and verified by
          experienced linguists before secure delivery — this timeline updates
          live as it moves through each stage.
        </p>
        <div className="mt-4">
          <StatusTimeline status={project.status} />
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
        <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
          Your completed translation
        </h2>
        <FileDownloadList
          files={completedFiles}
          urlByPath={urlByPath}
          emptyText="Your finished documents will appear here for download as soon as they're delivered."
        />
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
        <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
          Your source documents
        </h2>
        <FileDownloadList
          files={sourceFiles}
          urlByPath={urlByPath}
          emptyText="No source documents on this request."
        />
      </section>

      {project.instructions ? (
        <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
          <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
            Your instructions
          </h2>
          <p className="mt-3 text-sm break-words whitespace-pre-wrap text-foreground">
            {project.instructions}
          </p>
        </section>
      ) : null}

      <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
        <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
          Messages
        </h2>
        {messages.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No messages yet — questions about your request? Send one below.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {messages.map((message) => {
              const fromMe = message.sender_id === user.id;
              return (
                <li
                  key={message.id}
                  className={`flex max-w-[85%] flex-col gap-1 rounded-xl border px-4 py-3 ${
                    fromMe
                      ? "self-end border-brand-600/20 bg-brand-600/10 dark:border-brand-400/20 dark:bg-brand-400/10"
                      : "self-start border-border bg-background"
                  }`}
                >
                  <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground">
                    {fromMe ? "You" : "TGS Team"}
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
            action={sendProjectMessage}
            label="Send a message"
            placeholder="Questions, clarifications, certification or delivery notes…"
            submitLabel="Send message"
          />
        </div>
      </section>
    </div>
  );
}
