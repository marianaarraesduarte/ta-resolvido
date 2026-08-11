-- Tá Resolvido — análise mensal opcional (dentro do app, gerada pelo Gemini)
-- Rodar no SQL Editor do Supabase, depois das migrations anteriores.

create table if not exists public.monthly_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month_start date not null,
  content text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique (user_id, month_start)
);

alter table public.monthly_insights enable row level security;

create policy "monthly_insights: all own" on public.monthly_insights
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.profiles
  add column if not exists monthly_insights_enabled boolean not null default true;
