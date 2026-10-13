-- =========================================================================
-- OPTIONAL: Prefixed Schema (crm_*) for Shared Supabase Databases
-- Use this if you want to use the same Supabase database without naming conflicts!
-- =========================================================================

create extension if not exists "uuid-ossp";

-- 1. Clients Table
create table if not exists public.crm_clients (
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
create table if not exists public.crm_projects (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.crm_clients(id) on delete cascade,
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

-- 3. Deliverables Table
create table if not exists public.crm_deliverables (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.crm_projects(id) on delete cascade,
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

-- 4. Communication Logs Table
create table if not exists public.crm_communication_logs (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.crm_clients(id) on delete cascade,
  client_name text not null,
  channel text not null default 'whatsapp',
  recipient_phone_or_email text not null,
  trigger_type text not null default 'manual',
  message text not null,
  sent_at timestamptz default timezone('utc'::text, now()) not null,
  status text default 'delivered'
);

-- 5. Inquiries Table
create table if not exists public.crm_inquiries (
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

-- 6. Invoices Table
create table if not exists public.crm_invoices (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.crm_projects(id) on delete cascade,
  client_id uuid references public.crm_clients(id) on delete cascade,
  client_name text not null,
  invoice_number text not null,
  description text not null,
  amount numeric not null,
  status text not null default 'Pending',
  issue_date date default current_date,
  due_date date not null
);

-- RLS
alter table public.crm_clients enable row level security;
alter table public.crm_projects enable row level security;
alter table public.crm_deliverables enable row level security;
alter table public.crm_communication_logs enable row level security;
alter table public.crm_invoices enable row level security;
alter table public.crm_inquiries enable row level security;

create policy "Allow all operations" on public.crm_clients for all using (true) with check (true);
create policy "Allow all operations" on public.crm_projects for all using (true) with check (true);
create policy "Allow all operations" on public.crm_deliverables for all using (true) with check (true);
create policy "Allow all operations" on public.crm_communication_logs for all using (true) with check (true);
create policy "Allow all operations" on public.crm_invoices for all using (true) with check (true);
create policy "Allow all operations" on public.crm_inquiries for all using (true) with check (true);
