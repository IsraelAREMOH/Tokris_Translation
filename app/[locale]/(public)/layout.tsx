import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { JsonLd } from "@/components/content/json-ld";
import { buildOrganizationSchema } from "@/lib/blog/seo/structured-data";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <JsonLd data={buildOrganizationSchema()} />
      <SiteHeader />
      <main className="flex-1 pt-16">{children}</main>
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  );
}
