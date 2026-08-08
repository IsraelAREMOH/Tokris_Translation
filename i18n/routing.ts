import { defineRouting } from "next-intl/routing";

// English-only for V1 — kept as a next-intl `locales` list (rather than
// hardcoding "en" throughout the app) so a future locale is just one entry
// here plus a new messages/<locale>.json, no routing/component changes.
//
// localePrefix: "never" — with a single locale there's nothing to
// disambiguate in the URL, so public paths stay unprefixed (`/about`, not
// `/en/about`). next-intl still rewrites internally to the `app/[locale]`
// segment; only the visible URL changes. Old `/en/...` URLs are redirected
// to their unprefixed equivalent in proxy.ts.
export const routing = defineRouting({
  locales: ["en"],
  defaultLocale: "en",
  localePrefix: "never",
});
