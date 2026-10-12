-- =========================================================================
-- CLEANUP SCRIPT: Run this ONLY in your OTHER Supabase project
-- to remove the 5 CRM tables accidentally created by schema.sql
-- =========================================================================

-- Dropping in reverse dependency order with CASCADE
drop table if exists public.invoices cascade;
drop table if exists public.communication_logs cascade;
drop table if exists public.deliverables cascade;
drop table if exists public.projects cascade;
drop table if exists public.clients cascade;

-- Note: We do NOT drop the "uuid-ossp" extension because other tables
-- in your project might be using it.
