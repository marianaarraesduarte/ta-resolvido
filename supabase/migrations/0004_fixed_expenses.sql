-- Tá Resolvido — gastos fixos mensais
-- Rodar no SQL Editor do Supabase, depois das migrations anteriores.

create table if not exists public.fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  expected_amount numeric(12, 2) not null check (expected_amount > 0),
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

alter table public.fixed_expenses enable row level security;

create policy "fixed_expenses: all own" on public.fixed_expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
