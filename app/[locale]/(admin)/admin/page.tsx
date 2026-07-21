import type { Metadata } from "next";

import { StatusBadge } from "@/components/status-badge";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDate, formatDateTime } from "@/lib/format";
import { PROJECT_STATUSES, isOverdue } from "@/lib/projects/constants";

export const metadata: Metadata = { title: "Admin Dashboard" };

type ProjectRow = {
  id: string;
  status: string;
  deadline: string | null;
  created_at: string;
  source_language: string;
  target_language: string;
  profiles: { full_name: string | null } | null;
};

type MessageRow = {
  id: string;
  message_text: string;
  created_at: string;
  sender_id: string | null;
  projects: {
    id: string;
    client_id: string;
    source_language: string;
    target_language: string;
    profiles: { full_name: string | null } | null;
  } | null;
};

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {/* Stat value: sans semibold, proportional figures at display size */}
      <p className="mt-1.5 text-3xl font-semibold tracking-[-0.02em] text-foreground">
        {value}
      </p>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin();

  const [{ data: projectsData }, { count: clientCount }, { data: messagesData }] =
    await Promise.all([
      supabase
        .from("projects")
        .select(
          "id, status, deadline, created_at, source_language, target_language, profiles(full_name)",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "client"),
      supabase
        .from("messages")
        .select(
          "id, message_text, created_at, sender_id, projects(id, client_id, source_language, target_language, profiles(full_name))",
        )
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const projects = (projectsData ?? []) as unknown as ProjectRow[];
  const messages = (messagesData ?? []) as unknown as MessageRow[];
  const recentProjects = projects.slice(0, 5);

  const statusCounts = new Map<string, number>(
    PROJECT_STATUSES.map((status) => [
      status,
      projects.filter((project) => project.status === status).length,
    ]),
  );
  const maxStatusCount = Math.max(1, ...statusCounts.values());

  const tiles = [
    {
      label: "Open projects",
      value: projects.filter((project) => project.status !== "Delivered").length,
    },
    {
      label: "Awaiting quote",
      value: projects.filter(
        (project) =>
          project.status === "Request Submitted" ||
          project.status === "Under Review",
      ).length,
    },
    {
      label: "Overdue",
      value: projects.filter((project) =>
        isOverdue(project.deadline, project.status),
      ).length,
    },
    { label: "Registered clients", value: clientCount ?? 0 },
  ];

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          Master Dashboard
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The TGS operation at a glance — project pipeline, latest requests and
          the most recent client messages.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <StatTile key={tile.label} label={tile.label} value={tile.value} />
        ))}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
          <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
            Pipeline by status
          </h2>
          <ul className="mt-4 flex flex-col gap-1">
            {PROJECT_STATUSES.map((status) => {
              const count = statusCounts.get(status) ?? 0;
              return (
                <li key={status}>
                  <Link
                    href={{
                      pathname: "/admin/projects",
                      query: { status },
                    }}
                    className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0"
                  >
                    <span className="w-36 shrink-0 truncate text-sm text-muted-foreground group-hover:text-foreground">
                      {status}
                    </span>
                    {/* Single-series bar on a same-ramp track; count labeled at the tip */}
                    <span
                      aria-hidden
                      className="relative h-3 min-w-0 flex-1 overflow-hidden rounded-r-[4px] bg-brand-100 dark:bg-brand-950"
                    >
                      <span
                        className="absolute inset-y-0 left-0 rounded-r-[4px] bg-brand-600 dark:bg-brand-400"
                        style={{ width: `${(count / maxStatusCount) * 100}%` }}
                      />
                    </span>
                    <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                      {count}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
          <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
            Recent requests
          </h2>
          {recentProjects.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No requests yet — new submissions land here.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-1.5">
              {recentProjects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3.5 py-2.5 transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {project.profiles?.full_name ?? "Client"}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {project.source_language} → {project.target_language} ·{" "}
                        {formatDate(project.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={project.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-border bg-surface p-5 shadow-elevated">
        <h2 className="font-display text-base font-semibold tracking-[-0.01em] text-foreground">
          Latest messages
        </h2>
        {messages.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No messages yet — project conversations show up here.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-1.5">
            {messages.map((message) => {
              const fromClient =
                message.sender_id === message.projects?.client_id;
              const senderName = fromClient
                ? (message.projects?.profiles?.full_name ?? "Client")
                : "You";
              return (
                <li key={message.id}>
                  <Link
                    href={
                      message.projects
                        ? `/admin/projects/${message.projects.id}`
                        : "/admin/projects"
                    }
                    className="flex flex-col gap-1 rounded-lg border border-border bg-background px-3.5 py-2.5 transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0"
                  >
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                      <span className="text-xs font-semibold text-foreground">
                        {senderName}
                        {message.projects ? (
                          <span className="ml-2 font-normal text-muted-foreground">
                            {message.projects.source_language} →{" "}
                            {message.projects.target_language}
                          </span>
                        ) : null}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDateTime(message.created_at)}
                      </span>
                    </span>
                    <span className="line-clamp-2 text-sm text-muted-foreground">
                      {message.message_text}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
