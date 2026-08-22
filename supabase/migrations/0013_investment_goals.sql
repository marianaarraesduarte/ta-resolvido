-- Tá Resolvido — metas de investimento totalmente editáveis
-- Rodar no SQL Editor do Supabase, depois das migrations anteriores.
-- Substitui as 3 metas fixas (liberdade financeira / longo prazo / curto
-- prazo) por uma lista livre: a pessoa pode renomear, criar e apagar metas.

create table if not exists public.investment_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  percent numeric(5, 2) not null default 0 check (percent >= 0),
  created_at timestamptz not null default now()
);

alter table public.investment_goals enable row level security;

create policy "investment_goals: all own" on public.investment_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.entries
  add column if not exists investment_goal_id uuid references public.investment_goals (id) on delete set null;

-- Migra as metas fixas já preenchidas de cada usuária pra linhas nomeadas.
insert into public.investment_goals (user_id, name, percent)
select user_id,
  case kind
    when 'liberdade_financeira' then 'Liberdade financeira'
    when 'longo_prazo' then 'Longo prazo'
    when 'curto_prazo' then 'Curto prazo'
  end,
  percent
from public.goals;

-- Liga os lançamentos de confirmação já existentes (descrição
-- "Investimento — <nome>") à meta correspondente, pra continuar
-- aparecendo como "já investido" depois da troca.
update public.entries e
set investment_goal_id = g.id
from public.investment_goals g
where e.user_id = g.user_id
  and e.description = 'Investimento — ' || g.name
  and e.investment_goal_id is null;

drop table if exists public.goals;
