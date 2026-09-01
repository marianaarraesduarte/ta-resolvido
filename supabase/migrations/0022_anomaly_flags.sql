-- Tá Resolvido — alerta de gasto/fatura estranha
-- Rodar no SQL Editor do Supabase, depois da migration anterior (0021).
-- Guarda um registro toda vez que o app avisa a pessoa que algo ficou fora
-- do padrão (ex: fatura bem maior que a média) — só escrita pelo próprio
-- usuário (sem select próprio, porque quem revisa isso é a administradora,
-- via service role, não a pessoa dona do registro).

create table public.anomaly_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null,
  description text not null,
  amount numeric not null,
  reference_amount numeric not null,
  user_flagged boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.anomaly_flags enable row level security;

create policy "anomaly_flags: insert own" on public.anomaly_flags
  for insert with check (auth.uid() = user_id);
