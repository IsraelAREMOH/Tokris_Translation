import { createClient } from "@/lib/supabase/server";

/**
 * Action-level admin check, mirroring requireAdmin() but returning an error
 * instead of redirecting. RLS already blocks non-admin writes at the database;
 * this turns a silent no-op into a clear message. Lives outside the
 * "use server" action modules so it never becomes a callable action itself.
 */
export async function getAdminContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Your session has expired — please log in again." } as const;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Only the operator account can perform this action." } as const;
  }

  return { supabase, user } as const;
}
