# Edith Translation — Agency Platform (Solo Operator MVP)

Multi-page translation agency platform: public marketing site, protected client
portal, and a solo-operator admin console. Built on Next.js (App Router),
Tailwind CSS v4, `next-intl` locale routing, `next-themes` dark/light mode, and
Supabase (PostgreSQL, Auth, Storage). See [CLAUDE.md](CLAUDE.md) for the full
product blueprint.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase / Resend keys
npm run dev
```

Open <http://localhost:3000> — the proxy redirects to your locale
(e.g. `/en`).

## Project structure

```
app/
  globals.css                  # Design tokens: brand palette, fonts, shadows, motion
  [locale]/                    # next-intl locale segment (en only — English-only for V1)
    layout.tsx                 # Root layout: fonts, ThemeProvider, intl provider
    not-found.tsx
    [...rest]/                 # Catch-all -> renders not-found
    (public)/                  # Marketing site (header, footer, WhatsApp float)
      page.tsx                 # Home
      services/  languages/  quote/  about/  testimonials/  contact/
    (auth)/                    # Centered auth shell
      login/  register/
    (portal)/portal/           # Client portal (session guard TODO)
      page.tsx                 # Dashboard overview
      requests/                # My Requests timeline
      requests/[id]/           # Uploads, messages, downloads per request
    (admin)/admin/             # Solo-operator console (admin guard TODO)
      page.tsx                 # Master dashboard analytics
      projects/  clients/  quotes/  files/  content/
components/
  theme/                       # ThemeProvider wrapper + ThemeToggle button
  layout/                      # SiteHeader, MobileNav, SiteFooter, WhatsAppFloat, ConsoleShell
  page-placeholder.tsx         # Public-page scaffold section
  console-placeholder.tsx      # Portal/admin scaffold section
i18n/                          # next-intl routing, navigation, request config
messages/                      # en.json translation catalog (English-only for V1)
lib/supabase/                  # Browser + server Supabase client factories
proxy.ts                       # next-intl locale middleware (Next 16 proxy convention)
```

## Theming

- Dark/light mode via `next-themes` (`attribute="class"`, system default).
  Toggle lives in `components/theme/theme-toggle.tsx`.
- Design tokens live in `app/globals.css`:
  - **Brand palette:** custom "Lagoon" teal scale (`brand-50…950`) + "Sand"
    accent — no stock Tailwind hues.
  - **Typography:** Fraunces (display serif, tight tracking) paired with Inter
    (body sans, 1.7 line-height), loaded via `next/font`.
  - **Depth:** semantic surfaces `background -> surface -> floating` with
    layered brand-tinted shadows (`shadow-elevated`, `shadow-floating`,
    `shadow-brand`).
  - **Motion:** `ease-spring` / `ease-out-soft` easings; animate transform and
    opacity only.
  - **Texture:** `bg-noise` utility (SVG grain) for layering over radial
    gradients.

## Authentication & access control

- **Forms:** `components/auth/login-form.tsx` / `register-form.tsx` submit to
  Server Actions in `lib/auth/actions.ts` (Supabase password auth, localized
  errors, role-aware redirects).
- **Gatekeeping:** `proxy.ts` refreshes the Supabase session on every request
  and enforces RBAC — `/portal/**` needs a session, `/admin/**` needs
  `role = 'admin'` in `profiles`. The portal/admin layouts re-check via
  `lib/auth/guards.ts` as defense in depth.
- **Email confirmation:** `/api/auth/confirm` verifies token-hash links. In
  Supabase → Authentication → Emails → "Confirm signup", set the link to:
  `{{ .SiteURL }}/api/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/portal`
  (or disable "Confirm email" under Sign In / Providers for local development).
- **Migrations:** `supabase/migrations/` — `0001` is the base schema (already
  applied); `0002` adds the signup profile trigger + profiles RLS policies and
  must be run before registrations will work. Promote your own account to
  admin with the SQL snippet at the bottom of `0002`. `0003` creates the
  private `translations` Storage bucket plus the RLS policies for
  projects/project_files/messages and storage objects — required before quote
  submissions will work.

## Quote requests & file storage

- `/quote` is auth-gated: signed-out visitors get login/register CTAs (with a
  `?redirect=/quote` deep link), signed-in clients get the form.
- Uploads go to the private `translations` bucket under
  `{client_id}/{project_id}/source/…` — the first path segment drives the
  storage RLS policies. Limits live in `lib/quotes/constants.ts`
  (5 files x 10 MB, extension allow-list) and are enforced client- and
  server-side; the bucket enforces the size cap as a final backstop.
- `lib/quotes/actions.ts` runs entirely under the user's session (RLS end to
  end) and rolls back the project row + uploaded objects if any step fails.
- Deployment note: Server Actions carry the upload through the Next.js
  server (`bodySizeLimit: 60mb`). Vercel's request limit (~4.5 MB body on
  serverless) will constrain this in production — switch to direct-to-Supabase
  signed upload URLs when deploying.

## Status lifecycle (manual, admin-driven)

`Request Submitted -> Under Review -> Translating -> Quality Check -> Completed -> Delivered`

## Next phases

1. Quote request form with file upload to a private Storage bucket
   (+ RLS policies for projects / project_files / messages).
2. Portal: request timeline, messaging, downloads.
3. Admin: project status management, client directory, quote tracker.
