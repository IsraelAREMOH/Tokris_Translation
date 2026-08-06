const DEV_FALLBACK_URL = "http://localhost:3000";

/**
 * Single source of truth for the site's absolute base URL — every place
 * that builds an absolute link (metadata, JSON-LD, sitemap, RSS/Atom,
 * share buttons, canonical URLs) imports this instead of re-deriving it.
 * Preference order: explicit NEXT_PUBLIC_SITE_URL (the real production
 * domain) -> Vercel's auto-injected VERCEL_URL (covers any deployment —
 * preview or production — where the env var was left unset, so a
 * misconfiguration still never surfaces localhost) -> localhost, which only
 * applies to a bare local `next dev`/`next start`.
 */
function resolveSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  return DEV_FALLBACK_URL;
}

export const SITE_URL = resolveSiteUrl();
