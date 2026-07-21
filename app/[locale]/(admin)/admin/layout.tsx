import type { ReactNode } from "react";

import { ConsoleShell } from "@/components/layout/console-shell";
import { requireAdmin } from "@/lib/auth/guards";

// Defense in depth — the proxy already enforces the admin role.
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/projects", label: "Projects" },
    { href: "/admin/clients", label: "Clients" },
    { href: "/admin/quotes", label: "Quotes" },
    { href: "/admin/files", label: "File Vault" },
    { href: "/admin/content", label: "Site Content" },
  ];

  return (
    <ConsoleShell title="Admin Console" links={links}>
      {children}
    </ConsoleShell>
  );
}
