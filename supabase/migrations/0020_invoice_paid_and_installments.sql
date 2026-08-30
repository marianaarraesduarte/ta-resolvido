-- Tá Resolvido — fatura paga e parcelas
-- Rodar no SQL Editor do Supabase, depois da migration anterior (0019).
-- Lançar uma compra e pagar a fatura são coisas diferentes — paid_at deixa
-- marcar quando o boleto/fatura foi realmente pago, sem misturar com a data
-- da compra em si. installments agrupa compras parceladas identificadas
-- pelo texto da fatura (ex: "3/10"), reaproveitado por todo lançamento que
-- bater a mesma descrição+cartão+total de parcelas.

alter table public.card_invoices
  add column paid_at timestamptz;

create table public.installments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  card_id uuid references public.cards (id) on delete set null,
  description text not null,
  total_installments int not null,
  monthly_amount numeric not null,
  category_id uuid references public.categories (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.installments enable row level security;

create policy "installments: all own" on public.installments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.entries
  add column installment_id uuid references public.installments (id) on delete set null,
  add column installment_number int;
