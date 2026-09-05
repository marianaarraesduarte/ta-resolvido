-- Tá Resolvido — schema inicial
-- Rodar no SQL Editor do painel do Supabase (Database > SQL Editor).
-- Todas as tabelas são isoladas por usuário via RLS (auth.uid()).

-- 1. profiles ------------------------------------------------------------
-- Uma linha por usuário, criada automaticamente no signup (trigger abaixo).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  accent_color text not null default '#D9A441',
  separate_by_account boolean not null default false,
  income_basis text not null default 'all' check (income_basis in ('all', 'salary_only')),
  hide_goals_screen boolean not null default false,
  reminder_frequency smallint not null default 0 check (reminder_frequency in (0, 1, 2, 4)),
  last_reminder_sent_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: select own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles
  for update using (auth.uid() = id);

-- Cria o profile automaticamente quando um usuário se cadastra.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. categories ------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  icon text,
  monthly_limit numeric(12, 2) check (monthly_limit is null or monthly_limit > 0),
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories: all own" on public.categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. entries (lançamentos) --------------------------------------------------
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('despesa', 'receita')),
  amount numeric(12, 2) not null check (amount <> 0),
  description text not null,
  entry_date date not null,
  category_id uuid references public.categories (id) on delete set null,
  income_type text check (income_type in ('salario', 'outra')),
  account_name text,
  source text not null default 'manual' check (source in ('manual', 'foto')),
  created_at timestamptz not null default now(),
  constraint entries_type_fields_check check (
    (type = 'despesa' and income_type is null) or
    (type = 'receita' and category_id is null)
  )
);

create index if not exists entries_user_date_idx on public.entries (user_id, entry_date desc);

alter table public.entries enable row level security;

create policy "entries: all own" on public.entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. salary_patterns ---------------------------------------------------------
-- Guarda descrições já marcadas como "salário" na tela de foto/extrato, pra
-- reconhecer automaticamente a mesma origem nos meses seguintes.
create table if not exists public.salary_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  description_pattern text not null,
  created_at timestamptz not null default now(),
  unique (user_id, description_pattern)
);

alter table public.salary_patterns enable row level security;

create policy "salary_patterns: all own" on public.salary_patterns
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 5. goals (metas de investimento) -------------------------------------------
-- Uma linha por meta fixa (liberdade financeira / longo prazo / curto prazo).
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('liberdade_financeira', 'longo_prazo', 'curto_prazo')),
  percent numeric(5, 2) not null default 0 check (percent >= 0),
  unique (user_id, kind)
);

alter table public.goals enable row level security;

create policy "goals: all own" on public.goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 6. reserves (reservas planejadas) ------------------------------------------
create table if not exists public.reserves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  saved_amount numeric(12, 2) not null default 0 check (saved_amount >= 0),
  created_at timestamptz not null default now()
);

alter table public.reserves enable row level security;

create policy "reserves: all own" on public.reserves
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
