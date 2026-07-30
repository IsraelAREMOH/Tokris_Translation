import type { Metadata } from "next";

import { requireAdmin } from "@/lib/auth/guards";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Client Directory" };

type ClientRow = {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  created_at: string;
};

type ProjectStub = {
  client_id: string | null;
  status: string;
};

export default async function AdminClientsPage() {
  const { supabase } = await requireAdmin();

  const [{ data: clientsData }, { data: projectsData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, phone_number, created_at")
      .eq("role", "client")
      .order("created_at", { ascending: false }),
    supabase.from("projects").select("client_id, status"),
  ]);

  const clients = (clientsData ?? []) as ClientRow[];
  const projects = (projectsData ?? []) as ProjectStub[];

  const statsByClient = new Map<string, { total: number; open: number }>();
  for (const project of projects) {
    if (!project.client_id) continue;
    const stats = statsByClient.get(project.client_id) ?? { total: 0, open: 0 };
    stats.total += 1;
    if (project.status !== "Delivered") stats.open += 1;
    statsByClient.set(project.client_id, stats);
  }

  return (
    <div className="flex max-w-5xl flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
          Client Directory
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Every registered client with contact details and project history.
        </p>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-10 shadow-elevated">
          <p className="text-sm text-muted-foreground">
            No clients yet accounts appear here as soon as someone registers.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-elevated">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                {["Client", "Phone", "Joined", "Projects", "Open"].map(
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
              {clients.map((client) => {
                const stats = statsByClient.get(client.id) ?? {
                  total: 0,
                  open: 0,
                };
                return (
                  <tr
                    key={client.id}
                    className="border-b border-border last:border-b-0 hover:bg-background"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-foreground">
                      {client.full_name ?? "Client"}
                    </td>
                    <td className="px-5 py-4 text-sm whitespace-nowrap text-muted-foreground">
                      {client.phone_number ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-sm whitespace-nowrap text-muted-foreground">
                      {formatDate(client.created_at)}
                    </td>
                    <td className="px-5 py-4 text-sm tabular-nums text-muted-foreground">
                      {stats.total}
                    </td>
                    <td className="px-5 py-4 text-sm tabular-nums text-muted-foreground">
                      {stats.open > 0 ? (
                        <span className="font-semibold text-brand-700 dark:text-brand-300">
                          {stats.open}
                        </span>
                      ) : (
                        0
                      )}
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
