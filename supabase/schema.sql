-- =========================================================
-- Supabase Schema for Interior Design CRM & Client Portal
-- Designed for Next.js & Supabase deployment
-- =========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Clients Table
create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text not null,
  company text,
  address text,
  city text default 'New York, NY',
  avatar_url text,
  property_type text not null default 'Luxury Villa',
  style_preference text not null default 'Warm Minimalist',
  budget numeric not null default 75000,
  square_footage integer not null default 2800,
  stage text not null default 'Lead Inbound',
  lead_source text default 'Referral',
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. Projects Table
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete cascade,
  client_name text not null,
  name text not null,
  property_type text not null,
  stage text not null default 'Concept & Moodboard',
  progress_pct integer default 15,
  target_date date,
  total_budget numeric not null default 120000,
  spent_budget numeric default 0,
  revit_version text default 'Revit 2026.1 (LOD 350)',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. Deliverables Table (Lighting Plans, Plumbing, Elevations, 3D Renders)
create table if not exists public.deliverables (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  type text not null,
  sheet_number text not null,
  status text not null default 'Pending Review',
  ai_automated boolean default false,
  time_saved_min integer default 0,
  preview_url text,
  file_url text,
  client_feedback text,
  version text default 'v1.0',
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. Communication Logs Table (WhatsApp, Email & Notifications)
create table if not exists public.communication_logs (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete cascade,
  client_name text not null,
  channel text not null default 'whatsapp',
  recipient_phone_or_email text not null,
  trigger_type text not null default 'manual',
  message text not null,
  sent_at timestamptz default timezone('utc'::text, now()) not null,
  status text default 'delivered'
);

-- 5. Inquiries (leads before they become clients)
create table if not exists public.inquiries (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  phone text,
  property_type text not null default 'Penthouse',
  budget numeric not null default 0,
  lead_source text default 'Website',
  message text,
  status text not null default 'New',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 6. Invoices & Billing Table
create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  client_name text not null,
  invoice_number text not null,
  description text not null,
  amount numeric not null,
  status text not null default 'Pending',
  issue_date date default current_date,
  due_date date not null
);

-- Row Level Security (RLS)
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.deliverables enable row level security;
alter table public.communication_logs enable row level security;
alter table public.invoices enable row level security;
alter table public.inquiries enable row level security;

-- Public read/write policies for Demo & Service Client
create policy "Allow all operations for anon/auth" on public.clients for all using (true) with check (true);
create policy "Allow all operations for anon/auth" on public.projects for all using (true) with check (true);
create policy "Allow all operations for anon/auth" on public.deliverables for all using (true) with check (true);
create policy "Allow all operations for anon/auth" on public.communication_logs for all using (true) with check (true);
create policy "Allow all operations for anon/auth" on public.invoices for all using (true) with check (true);
create policy "Allow all operations for anon/auth" on public.inquiries for all using (true) with check (true);
