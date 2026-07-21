-- 0001_initial_schema.sql
-- ALREADY APPLIED (2026-07-12) via the Supabase SQL Editor.
-- Kept in the repo for reproducibility — do not run twice.

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
