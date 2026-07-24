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
    {
      label: "Content Management",
      links: [
        { href: "/admin/blog", label: "Dashboard" },
        { href: "/admin/blog/analytics", label: "Analytics" },
        { href: "/admin/blog/pages", label: "Pages" },
        { href: "/admin/blog/posts", label: "Blog Posts" },
        { href: "/admin/blog/categories", label: "Categories" },
        { href: "/admin/blog/tags", label: "Tags" },
        { href: "/admin/blog/authors", label: "Authors" },
        { href: "/admin/blog/media", label: "Media Library" },
        { href: "/admin/blog/newsletter", label: "Newsletter" },
        { href: "/admin/blog/seo", label: "SEO" },
      ],
    },
  ];

  return (
    <ConsoleShell title="Admin Console" links={links}>
      {children}
    </ConsoleShell>
  );
}
