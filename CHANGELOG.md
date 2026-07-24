# Changelog

## 2026-07-25 — Bug fixes

- `ConfirmDialogProvider` in `components/layout/console-shell.tsx` only
  wrapped `<ToastProvider/>`, not `{children}` — any admin component calling
  `useConfirm()` (Newsletter/Posts/Tags/Media managers, delete buttons)
  threw immediately on render. Now wraps the whole shell.
- `/admin/blog/posts/new` called a `"use server"` action
  (`createDraftPost()`) with `revalidatePath()` directly from a Server
  Component's render, which Next.js disallows. Removed the revalidation
  from `createDraftPost()` — an empty draft has nothing public-facing to
  refresh, and the first real `savePost()` call already revalidates
  everything once there's real content.

## 2026-07-24 — Blog/CMS platform + site-wide CMS foundation

- Full Blog/CMS built into the existing Admin Portal: DB schema
  (`supabase/migrations/0005`–`0010`) for categories, tags, authors, posts, a
  site-wide Media Library, newsletter subscribers, per-view analytics, and
  slug-redirect history.
- Admin authoring: Tiptap rich-text editor (`components/admin/blog/editor/`)
  with custom callout/CTA-button/columns/video/image nodes, autosave, and a
  single `savePost()` action driving Draft/Publish/Schedule/Archive.
- Admin CRUD for categories/tags/authors/media, with a shared admin UX kit:
  toast notifications (`sonner`), a native-`<dialog>` confirm dialog, empty
  states, skeletons, URL-param search/pagination, and bulk actions.
- Public blog: `/blog` landing (featured/latest/popular/browse/search/
  newsletter), `/blog/[slug]`, category/tag archives — reading through a
  cookie-free public Supabase client (`lib/supabase/public-server.ts`).
- SEO: per-page metadata, dynamic OG image fallback (`app/api/og`), JSON-LD,
  a 4-way split sitemap (`app/sitemap.ts`), `app/robots.ts`, RSS/Atom feeds,
  and ranked full-text + fuzzy search (migration `0009`).
- Expanded into a site-wide CMS foundation (`lib/cms/`): a real Content
  Dashboard (stat tiles + recent activity), an Analytics page (hand-rolled
  SVG charts, no chart library added), a Newsletter admin module with CSV
  export, a read-only Pages registry, and an SEO audit dashboard — all
  backed by a new append-only `activity_log` table.

## 2026-07-24 — Production readiness hardening

- Fixed CSV/formula-injection risk in the newsletter export, an RPC
  (`log_newsletter_signup`) that accepted any UUID with no existence check,
  and a backslash-based open-redirect bypass (new shared
  `isSafeInternalPath()` in `lib/validation.ts`).
- Added `app/[locale]/error.tsx` and `app/global-error.tsx` — the app had
  zero error boundaries before this.
- Cached `requireAdmin()`/`requireUser()` (`lib/auth/guards.ts`) to dedupe
  repeated auth round-trips per navigation.
- Fixed a dead WhatsApp CTA when unconfigured, an uncaught Resend fetch
  failure, an autofill-vulnerable contact-form honeypot, a client portal
  with no mobile navigation, and silently-swallowed Supabase read errors
  across the portal.

## 2026-07-24 — Remove French locale; repo cleanup

- Removed French (`fr`) from `i18n/routing.ts`'s `locales` list — the site is
  now English-only for V1. `messages/fr.json` deleted; `messages/en.json` is
  the sole translation catalog. The `[locale]/` route-segment architecture,
  `next-intl` config, and `routing.locales`-driven `generateStaticParams`/
  sitemap/proxy logic are all untouched and generic, so adding a locale back
  later is a `messages/<locale>.json` + one array entry, no routing changes.
  `lib/languages.ts`'s "French" entry is unrelated (a translation-service
  language offered to clients, not a UI locale) and was left as-is.
- Untracked `CLAUDE.md` and `Assets/` from git (kept locally, added to
  `.gitignore`) — internal project instructions and raw source content don't
  need to be in the public repo history going forward.

## 2026-07-19 — Portal content pass & production polish

- Client portal dashboard rebuilt as a real TGS experience
  (`app/[locale]/(portal)/portal/page.tsx`): personalized welcome, live stat
  tiles (active requests, in translation, documents delivered), recent
  requests, latest messages, a four-step "How it works" onboarding state for
  new clients, and a support card wired to the operator-editable WhatsApp
  number / contact email (Admin → Site Content).
- Removed the `ConsolePlaceholder` scaffold component and its "Module
  scaffold" copy — no placeholder content remains in either console.
- Rebrand leftovers fixed: auth layout wordmark, quote page eyebrow, and the
  portal message sender label now say TOKRIS / Tokris Global Services / TGS
  Team instead of "Edith".
- Copy polish across the portal (requests list subline, empty states, request
  progress description) to match TGS services and quality-assurance workflow;
  requests list now reuses the shared `lib/format` date helper.
- Next.js dev-tools floating indicator (bottom-left) disabled via
  `devIndicators: false` — the WhatsApp button is the only floating widget.
- WhatsApp float now renders the official WhatsApp glyph (inline SVG) instead
  of the placeholder lucide icon.

## 2026-07-19 — TGS rebrand: About/Services/Contact, contact form, footer

- About, Services, and Contact pages rebuilt from
  `Assets/TGS  WEBSITE HERO SECTION.docx` copy: TGS story/vision/mission and
  5-pillar section, translation-type + service cards + interpretation
  formats, and working contact channels.
- Real contact form (`components/contact/contact-form.tsx`,
  `lib/contact/actions.ts`) via Resend, with server-side sanitization, a
  honeypot, and a minimum-submit-time check.
- `/services` hero accordion, industries hover gallery, and an
  auto-advancing services showcase.
- Footer/contact details centralized in `lib/contact/details.ts`
  (site-content overrides over doc fallbacks).

## 2026-07-12 — Quote request system & storage integration

- Migration `supabase/migrations/0003_quote_storage_policies.sql`: private
  `translations` Storage bucket (10 MB/file cap), full RLS for
  projects/project_files/messages (clients own-rows-only, admins everything),
  storage object policies keyed on the `{client_id}/...` path convention, and
  FK indexes.
- Quote request form on `/quote` (auth-gated): language pair selects, future
  deadline picker, instructions, and a drag-and-drop upload zone
  (`components/quote/file-drop-zone.tsx`) that mirrors curated files into a
  native input via DataTransfer.
- Server Action `lib/quotes/actions.ts` validates everything server-side,
  uploads files to the private bucket as the logged-in user (RLS-enforced),
  inserts the project + file rows, and rolls back project/storage on partial
  failure. Server Action body limit raised to 60 MB in `next.config.ts`.
- Portal "My Requests" page now lists real projects with lifecycle status
  badges (`components/status-badge.tsx`).

## 2026-07-12 — Functional authentication & role-based gatekeeping

- Login/registration forms (`components/auth/`) driven by Server Actions in
  `lib/auth/actions.ts` (React 19 `useActionState`, localized validation
  errors, pending states, open-redirect-safe deep links).
- `proxy.ts` now composes next-intl routing with Supabase session refresh and
  RBAC: `/portal` requires a session, `/admin` requires `role = 'admin'`,
  logged-in visitors are bounced off `/login`/`/register`, deep links are
  preserved via a `?redirect=` param.
- Defense-in-depth server guards (`lib/auth/guards.ts`) in the portal/admin
  layouts; sign-out button added to the console shell.
- Email confirmation endpoint at `/api/auth/confirm` (token-hash `verifyOtp`
  flow per Supabase SSR docs).
- Migration `supabase/migrations/0002_auth_profiles_policies.sql`: signup
  trigger that seeds `profiles`, `is_admin()` security-definer helper,
  profiles RLS policies, and column-level grants that block role
  self-promotion.

## 2026-07-12 — Initial architecture scaffold

- Established `app/[locale]/` App Router tree via `next-intl` (locales: `en`, `fr`;
  proxy-based locale routing per Next 16 convention).
- Route groups: `(public)` marketing site (home, services, languages, quote,
  about, testimonials, contact), `(auth)` login/register, `(portal)` client
  portal, `(admin)` operator console.
- Implemented dark/light theming with `next-themes` (class strategy) and a
  Tailwind v4 token system in `app/globals.css`: custom Lagoon/Sand palette,
  Fraunces + Inter font pairing, semantic surface depth tiers, brand-tinted
  layered shadows, spring easings, SVG noise utility.
- Shared layout components: fixed responsive header with mobile drawer, footer,
  floating WhatsApp button, reusable console shell for portal/admin.
- Supabase browser/server client factories in `lib/supabase/` (auth wiring
  deferred to the next phase).
