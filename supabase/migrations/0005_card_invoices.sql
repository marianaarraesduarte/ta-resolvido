-- Tá Resolvido — gastos de cartão de crédito consolidados por fatura
-- Rodar no SQL Editor do Supabase, depois das migrations anteriores.

create table if not exists public.card_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  invoice_date date not null,
  created_at timestamptz not null default now()
);

alter table public.card_invoices enable row level security;

create policy "card_invoices: all own" on public.card_invoices
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.entries
  add column if not exists payment_method text not null default 'conta'
    check (payment_method in ('conta', 'cartao'));

alter table public.entries
  add column if not exists card_invoice_id uuid references public.card_invoices (id) on delete cascade;

create index if not exists entries_card_invoice_idx on public.entries (card_invoice_id);
