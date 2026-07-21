
# Claude.md - Translation Agency Platform MVP (Solo Operator Edition)

## Business Model

A single individual manages all translation requests manually. No
payment gateway and no automatic translator assignment workflow are
included in Version 1.

## Core Objectives

-   Keep operations simple and manageable for a solo operator.
-   Deliver a professional client experience.
-   Build with future scalability in mind.
-   Minimize operational overhead and maintenance effort.

## Always Do First 
- **Invoke the ` frontend-design` skill** before writing any frontend code, every sessio, no exceptions.

## Anti Generic Guardrails
- **Colors:** Never use default tailwind palette (Indigo-500, blue-600, etc) pick a custom brand color and derive from it.
- **Shadows:** Never use flat ` Shadow-md` use layered, color-tinted shadows with low opacity.
- ** Typography: ** Never use the same font for headings and body. Pair a display/srif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** layer multiple radial gradients add grain/texture via SVG noise filter for depth 
- **Animation:** Only animate transform and opacity. Never ` transition-all`. Use spring-style easing. 
- **Interactive States:** Every clickable element needs hover, focus-visible, and active states no exceptions. 
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`), and a color treatment layer with `Mix-blend-multiply`
- **Spacing:** Use intentional consistent spacing tokens - not random tailwind steps.
- **Depth:** Surface should have a layering system (based -> elevated -> floating), not all sit at the same z-plane

## Website Structure

### Public Website (Separate, Distinct Sub-pages)

-   `/` (Home)
-   `/services` (Services Grid)
-   `/languages` (Languages Supported)
-   `/quote` (Request Quote Form)
-   `/about` (About Us)
-   `/testimonials` (Client Reviews)
-   `/contact` (Contact Us Form)
-   `/login` & `/register` (Authentication Portal)

### Client Portal (Protected Route Workspace)

-   Dashboard Overview
-   My Requests Timeline
-   Upload Source Files
-   Direct Messages Context
-   Download Completed Files

### Admin Portal (Solo Operator Management Console)

-   Master Dashboard Analytics
-   Project Manager (Status Updates)
-   Client Directory
-   Quote Tracker
-   File Vault
-   Website Content Editing Setup

## Key Features

### UI Theme & Presentation Rules

-   **Dark/Light Mode:** Implement a fully functional, professional light/dark theme switch utilizing `next-themes` and Tailwind CSS configurations. The default state must look premium, modern, and corporate.
-   **Asset Placeholders:** Utilize high-quality placeholder image configurations (such as beautiful, context-relevant dynamic Unsplash source URLs) throughout all pages so the site layout renders completely out of the box pending final client replacements.
-   **Navigation:** Multi-page website with a highly responsive, fixed navigation bar supporting dark/light mode transitions and seamless mobile drawer toggle states.
-   **Communication:** Floating WhatsApp communication icon pinned to the bottom right of all public web views.

### Quote Request & Workflow System

Clients can: - Upload source documents - Select origin language - Select destination language - Specify requested deadline - Provide custom instructions

**Project Status Lifecycle Matrix:**
All projects must strictly transition manually through these exact states:
`Request Submitted` -> `Under Review` -> `Translating` -> `Quality Check` -> `Completed` -> `Delivered`

## Recommended Tech Stack

-   **Framework:** Next.js (Modern App Router Architecture)
-   **Styling:** Tailwind CSS (Shadcn UI or clean utility classes)
-   **Database & Auth:** PostgreSQL (Supabase backend wrapper)
-   **Storage:** Supabase Storage Buckets (No external Cloudinary needed)
-   **Hosting:** Vercel Monolith (No independent Express.js or separate backend servers)
-   **SEO/Localization Routing:** File-system locale routing (e.g., `app/[locale]/` subdirectory architecture via `next-intl`).

## Database Schema (Supabase PostgreSQL)

Run the following SQL migration script in your Supabase SQL Editor to establish the database schema:

```sql
-- 1. PROFILES (Extends Supabase Auth users to manage roles)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone_number text,
  role text default 'client' check (role in ('client', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PROJECTS (Handles quotes and active translation requests)
create table projects (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references profiles(id) on delete cascade,
  source_language text not null,
  target_language text not null,
  deadline timestamp with time zone,
  instructions text,
  status text default 'Request Submitted' check (status in ('Request Submitted', 'Under Review', 'Translating', 'Quality Check', 'Completed', 'Delivered')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. PROJECT_FILES (Tracks document links tied to projects)
create table project_files (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  file_name text not null,
  storage_path text not null, -- Path inside the private Supabase Storage bucket
  uploaded_by uuid references profiles(id),
  file_type text check (file_type in ('source', 'completed')),
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. MESSAGES (Simple communication history log)
create table messages (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  sender_id uuid references profiles(id),
  message_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on tables for maximum protection
alter table profiles enable row level security;
alter table projects enable row level security;
alter table project_files enable row level security;
alter table messages enable row level security;

-- 5. AUTOMATED TRIGGER (Creates a profile instantly when a client registers)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', 'New Client'), 
    'client'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Environment Variables (`.env.local`)

Ensure your environment configuration contains the following keys. Do not expose private backend keys to the client side.

```bash
# Supabase Configuration (Settings -> API)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anonymous_public_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_service_role_key

# Transactional Email Notification Service (e.g., Resend API)
RESEND_API_KEY=your_resend_api_key

# Absolute URL Configuration (Crucial for multi-page canonical SEO meta links)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Engineering Principles

-   Learn from failures and adapt implementation strategies when an approach does not work.
-   Keep workflows, dependencies, and documentation current as the platform evolves.
-   Prefer maintainable solutions over quick fixes.
-   Avoid hardcoded values where configuration is more appropriate.
-   Design features with future scalability in mind.
-   Log important errors and system events for troubleshooting.
-   Favor reusable components and modular design.
-   Maintain backward compatibility where practical.
-   Validate assumptions before making architectural changes.

## AI Agent Instructions

-   Analyze root causes and attempt alternative solutions when implementation fails.
-   Continue iterating until a reasonable solution is found.
-   Preserve existing functionality while introducing new features.
-   Verify changes through testing where possible.
-   Update documentation whenever functionality changes.
-   Keep generated code consistent with the existing architecture and coding standards.
-   Do not remove existing functionality unless explicitly requested.
-   Prefer incremental improvements over disruptive rewrites.
-   Review existing code before generating new implementations.
-   Extend existing modules before creating new ones.
-   Generate migration scripts for database changes.
-   Keep secrets and credentials outside source code.
-   Maintain changelogs for major architectural changes.

## Continuous Improvement

-   Periodically review workflows for bottlenecks.
-   Update dependencies regularly.
-   Use analytics and feedback to guide improvements.
-   Refactor areas that become difficult to maintain.
-   Monitor application performance and error trends.

## Operational Principles

-   Protect existing functionality while implementing new features.
-   Optimize for simplicity over unnecessary complexity.
-   Every feature should have a clear business purpose.
-   Prefer configuration over code changes where possible.
-   Ensure all critical processes are documented.

## Maintenance Policy

-   Keep workflows current.
-   Keep documentation synchronized with implementation.
-   Remove dead code when safe to do so.
-   Review infrastructure decisions as traffic grows.
-   Regularly review backups and recovery procedures.
