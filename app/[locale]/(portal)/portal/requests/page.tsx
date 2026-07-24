import type { Metadata } from "next";

import { LoadErrorBanner } from "@/components/portal/load-error-banner";
import { StatusBadge } from "@/components/status-badge";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth/guards";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "My Requests" };

type ProjectRow = {
  id: string;
  source_language: string;
  target_language: string;
  status: string;
  deadline: string | null;
  created_at: string;
};

export default async function PortalRequestsPage() {
  const { supabase } = await requireUser();

  // RLS limits this to the logged-in client's own projects.
  const { data, error } = await supabase
    .from("projects")
    .select("id, source_language, target_language, status, deadline, created_at")
    .order("created_at", { ascending: false });

  if (error) console.error("Portal requests: load failed:", error.message);

  const projects = (data ?? []) as ProjectRow[];

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          My Requests Timeline
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every quote request and its progress — from submission to secure
          delivery.
        </p>
      </div>

      {error ? (
        <LoadErrorBanner message="Couldn't load your requests right now — please refresh the page." />
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-border bg-surface px-6 py-10 shadow-elevated">
          <p className="text-sm text-muted-foreground">
            No requests yet — upload your documents and receive a free quote
            from our specialists.
          </p>
          <Link
            href="/quote"
            className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
          >
            Request a quote
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/portal/requests/${project.id}`}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-5 py-4 shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {project.source_language} → {project.target_language}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted {formatDate(project.created_at)} · Deadline{" "}
                    {formatDate(project.deadline)}
                  </p>
                </div>
                <StatusBadge status={project.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
