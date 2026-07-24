import { getLocale } from "next-intl/server";
import { cache } from "react";

import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side guards used by the portal/admin layouts as defense in depth —
 * the proxy already enforces these rules at the edge of every request.
 *
 * Wrapped in React's cache() because every admin/portal page calls this
 * again on top of its layout already having called it — without caching,
 * that's a repeated auth.getUser() + profiles.role round trip per page
 * (2-3x, layout + page + any nested call) on every single navigation.
 * cache() dedupes repeat calls within one render pass down to one.
 */
export const requireUser = cache(async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect({ href: "/login", locale: await getLocale() });
  }

  // Non-null: redirect above throws, next-intl just doesn't type it as never
  return { supabase, user: user! };
});

export const requireAdmin = cache(async function requireAdmin() {
  const { supabase, user } = await requireUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect({ href: "/portal", locale: await getLocale() });
  }

  return { supabase, user };
});
