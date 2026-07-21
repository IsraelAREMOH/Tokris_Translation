import type { ReactNode } from "react";

import { ConsoleShell } from "@/components/layout/console-shell";
import { requireUser } from "@/lib/auth/guards";

// Defense in depth — the proxy already blocks unauthenticated requests.
export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUser();

  const links = [
    { href: "/portal", label: "Dashboard" },
    { href: "/portal/requests", label: "My Requests" },
  ];

  return (
    <ConsoleShell title="Client Portal" links={links}>
      {children}
    </ConsoleShell>
  );
}
