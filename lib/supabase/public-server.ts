import { createClient } from "@supabase/supabase-js";

/**
 * A cookie-free Supabase client for public, unauthenticated reads (RLS
 * policies like "anyone can view published posts" don't need a session).
 * Unlike lib/supabase/server.ts, this never touches next/headers' cookies(),
 * so pages that use it stay eligible for static generation/ISR instead of
 * being forced into fully dynamic rendering.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
