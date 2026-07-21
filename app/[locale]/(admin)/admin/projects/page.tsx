import type { Metadata } from "next";

import { StatusBadge } from "@/components/status-badge";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDate } from "@/lib/format";
import { PROJECT_STATUSES, isOverdue } from "@/lib/projects/constants";

export const metadata: Metadata = { title: "Project Manager" };

type ProjectRow = {
  id: string;
  source_language: string;
  target_language: string;
  status: string;
  deadline: string | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
};

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ status: statusParam }, { supabase }] = await Promise.all([
    searchParams,
    requireAdmin(),
  ]);

  // Admin RLS policy exposes every project; profiles join gives client names.
  const { data } = await supabase
    .from("projects")
    .select(
      "id, source_language, target_language, status, deadline, created_at, profiles(full_name)",
    )
    .order("created_at", { ascending: false });

  const allProjects = (data ?? []) as unknown as ProjectRow[];

  const activeFilter = PROJECT_STATUSES.find((status) => status === statusParam);
  const projects = activeFilter
    ? allProjects.filter((project) => project.status === activeFilter)
    : allProjects;

  const filters = [
    { label: "All", value: undefined, count: allProjects.length },
    ...PROJECT_STATUSES.map((status) => ({
      label: status,
      value: status,
      count: allProjects.filter((project) => project.status === status).length,
    })),
  ];

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          Project Manager
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every incoming request and where it sits in the workflow. Open a
          project to review documents, message the client and move it forward.
        </p>
      </div>

      <nav aria-label="Filter by status" className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const active = filter.value === activeFilter;
          return (
            <Link
              key={filter.label}
              href={
                filter.value
                  ? { pathname: "/admin/projects", query: { status: filter.value } }
                  : "/admin/projects"
              }
              aria-current={active ? "true" : undefined}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] ${
                active
                  ? "border-brand-600 bg-brand-600 text-white shadow-brand dark:border-brand-400 dark:bg-brand-400 dark:text-brand-950"
                  : "border-border bg-surface text-muted-foreground shadow-elevated hover:text-foreground"
              }`}
            >
              {filter.label}
              <span
                className={`rounded-full px-1.5 text-[11px] tabular-nums ${
                  active
                    ? "bg-white/20 dark:bg-brand-950/15"
                    : "bg-background"
                }`}
              >
                {filter.count}
              </span>
            </Link>
          );
        })}
      </nav>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-10 shadow-elevated">
          <p className="text-sm text-muted-foreground">
            {activeFilter
              ? `No projects currently in “${activeFilter}”.`
              : "No quote requests yet — new submissions will appear here."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-elevated">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {["Client", "Languages", "Submitted", "Deadline", "Status"].map(
                  (heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="px-5 py-3.5 text-[11px] font-semibold tracking-[0.14em] uppercase text-muted-foreground"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => {
                const overdue = isOverdue(project.deadline, project.status);
                return (
                  <tr
                    key={project.id}
                    className="relative border-b border-border last:border-b-0 hover:bg-background"
                  >
                    <td className="px-5 py-4">
                      {/* Stretched link — the whole row opens the project. */}
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="text-sm font-semibold text-foreground after:absolute after:inset-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500"
                      >
                        {project.profiles?.full_name ?? "Client"}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-sm whitespace-nowrap text-muted-foreground">
                      {project.source_language} → {project.target_language}
                    </td>
                    <td className="px-5 py-4 text-sm whitespace-nowrap text-muted-foreground">
                      {formatDate(project.created_at)}
                    </td>
                    <td
                      className={`px-5 py-4 text-sm whitespace-nowrap ${
                        overdue
                          ? "font-semibold text-danger"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatDate(project.deadline)}
                      {overdue ? " · overdue" : ""}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={project.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
