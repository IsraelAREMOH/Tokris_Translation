import { defineRouting } from "next-intl/routing";

// English-only for V1 — kept as a next-intl `locales` list (rather than
// hardcoding "en" throughout the app) so a future locale is just one entry
// here plus a new messages/<locale>.json, no routing/component changes.
export const routing = defineRouting({
  locales: ["en"],
  defaultLocale: "en",
});
