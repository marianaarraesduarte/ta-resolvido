-- Tá Resolvido — planos (grátis / completo)
-- Rodar no SQL Editor do painel do Supabase.

alter table public.profiles
  add column if not exists plan text not null default 'free' check (plan in ('free', 'completo'));

-- Quem já tinha conta antes dessa migration é tester do beta — mantém acesso
-- total, de graça, enquanto durar o beta.
update public.profiles set plan = 'completo' where plan = 'free';

-- Log de cada análise de foto/PDF feita (não guarda a imagem, só a marca de
-- tempo), usado pra contar o limite de 3 por mês do plano grátis.
create table if not exists public.photo_recognitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists photo_recognitions_user_idx on public.photo_recognitions (user_id, created_at);

alter table public.photo_recognitions enable row level security;

create policy "photo_recognitions: all own" on public.photo_recognitions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
