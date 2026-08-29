-- Tá Resolvido — cartões nomeados com cor
-- Rodar no SQL Editor do Supabase, depois das migrations anteriores.
-- Antes, uma fatura só existia por data de vencimento — quem tem mais de um
-- cartão via faturas de cartões diferentes se misturarem quando caem no
-- mesmo dia. Cada fatura agora pertence a um cartão (nome + cor escolhidos
-- pela usuária).

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null,
  created_at timestamptz not null default now()
);

alter table public.cards enable row level security;

create policy "cards: all own" on public.cards
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.card_invoices
  add column card_id uuid references public.cards (id) on delete set null;
