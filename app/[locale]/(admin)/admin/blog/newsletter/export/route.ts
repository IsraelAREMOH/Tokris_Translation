import { getAllSubscribersForExport } from "@/lib/blog/newsletter/queries";
import { requireAdmin } from "@/lib/auth/guards";

// A real HTTP route (not a server action) so the browser can treat the
// response as a file download — mirrors the RSS/Atom/OG routes' use of
// Route Handlers for non-HTML output. requireAdmin() here is defense in
// depth: Route Handlers don't inherit admin/layout.tsx's own check (layouts
// only wrap page.tsx), though the proxy's matcher already covers this path.
//
// `source`/`email` are user-supplied (the public subscribe form) and stored
// verbatim, so a value starting with =, +, -, @, or a tab/CR is neutralized
// with a leading apostrophe before quoting — otherwise Excel/Sheets would
// evaluate it as a formula the moment an admin opens this export.
const FORMULA_PREFIX_PATTERN = /^[=+\-@\t\r]/;

function csvField(value: string) {
  const safeValue = FORMULA_PREFIX_PATTERN.test(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

export async function GET() {
  const { supabase } = await requireAdmin();

  const subscribers = await getAllSubscribersForExport(supabase);

  const header = ["Email", "Status", "Source", "Subscribed at", "Unsubscribed at"];
  const rows = subscribers.map((subscriber) => [
    subscriber.email,
    subscriber.status,
    subscriber.source,
    subscriber.subscribed_at,
    subscriber.unsubscribed_at ?? "",
  ]);

  const csv = [header, ...rows].map((row) => row.map(csvField).join(",")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
