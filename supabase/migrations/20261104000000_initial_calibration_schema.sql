create extension if not exists "pgcrypto";

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  city text,
  gst_number text,
  created_at timestamptz not null default now()
);

create table if not exists public.calibration_schedules (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  schedule_name text not null,
  schedule_reference text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.calibration_cycles (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references public.calibration_schedules(id) on delete cascade,
  cycle_number integer,
  job_reference text,
  calibration_date date,
  completion_date date,
  total_instruments integer not null default 0 check (total_instruments >= 0),
  due_date_mode text check (due_date_mode in ('COMMON', 'INDIVIDUAL', 'MIXED')),
  common_next_due_date date,
  status text,
  remarks text,
  created_at timestamptz not null default now()
);

create table if not exists public.calibration_cycle_items (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid references public.calibration_cycles(id) on delete cascade,
  instrument_name text not null,
  make text,
  model text,
  serial_number text,
  instrument_range text,
  next_due_date date,
  remarks text
);

create table if not exists public.instrument_master (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete cascade,
  instrument_name text not null,
  make text,
  model text,
  serial_number text,
  instrument_range text,
  created_at timestamptz not null default now()
);

create index if not exists idx_customers_company_name on public.customers(company_name);
create index if not exists idx_customers_gst on public.customers(gst_number);
create index if not exists idx_customers_phone on public.customers(phone);
create index if not exists idx_calibration_schedules_customer on public.calibration_schedules(customer_id);
create index if not exists idx_calibration_cycles_schedule on public.calibration_cycles(schedule_id);
create index if not exists idx_calibration_cycles_due_date on public.calibration_cycles(common_next_due_date);
create index if not exists idx_calibration_cycle_items_cycle on public.calibration_cycle_items(cycle_id);

alter table public.customers enable row level security;
alter table public.calibration_schedules enable row level security;
alter table public.calibration_cycles enable row level security;
alter table public.calibration_cycle_items enable row level security;
alter table public.instrument_master enable row level security;

create policy "Authenticated users can read customers" on public.customers
for select using (auth.uid() is not null);
create policy "Authenticated users can insert customers" on public.customers
for insert with check (auth.uid() is not null);
create policy "Authenticated users can update customers" on public.customers
for update using (auth.uid() is not null);
create policy "Authenticated users can delete customers" on public.customers
for delete using (auth.uid() is not null);

create policy "Authenticated users can read calibration schedules" on public.calibration_schedules
for select using (auth.uid() is not null);
create policy "Authenticated users can insert calibration schedules" on public.calibration_schedules
for insert with check (auth.uid() is not null);
create policy "Authenticated users can update calibration schedules" on public.calibration_schedules
for update using (auth.uid() is not null);
create policy "Authenticated users can delete calibration schedules" on public.calibration_schedules
for delete using (auth.uid() is not null);

create policy "Authenticated users can read calibration cycles" on public.calibration_cycles
for select using (auth.uid() is not null);
create policy "Authenticated users can insert calibration cycles" on public.calibration_cycles
for insert with check (auth.uid() is not null);
create policy "Authenticated users can update calibration cycles" on public.calibration_cycles
for update using (auth.uid() is not null);
create policy "Authenticated users can delete calibration cycles" on public.calibration_cycles
for delete using (auth.uid() is not null);

create policy "Authenticated users can read calibration cycle items" on public.calibration_cycle_items
for select using (auth.uid() is not null);
create policy "Authenticated users can insert calibration cycle items" on public.calibration_cycle_items
for insert with check (auth.uid() is not null);
create policy "Authenticated users can update calibration cycle items" on public.calibration_cycle_items
for update using (auth.uid() is not null);
create policy "Authenticated users can delete calibration cycle items" on public.calibration_cycle_items
for delete using (auth.uid() is not null);

create policy "Authenticated users can read instruments master" on public.instrument_master
for select using (auth.uid() is not null);
create policy "Authenticated users can insert instruments master" on public.instrument_master
for insert with check (auth.uid() is not null);
create policy "Authenticated users can update instruments master" on public.instrument_master
for update using (auth.uid() is not null);
create policy "Authenticated users can delete instruments master" on public.instrument_master
for delete using (auth.uid() is not null);
