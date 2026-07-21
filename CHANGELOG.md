# Changelog

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
