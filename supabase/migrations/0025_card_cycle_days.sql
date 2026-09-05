-- Tá Resolvido — dia de vencimento e de fechamento por cartão
-- Rodar no SQL Editor do Supabase, depois das migrations anteriores.
-- Com isso, lançar uma compra no crédito passa a só pedir o cartão: o app
-- calcula sozinho em qual fatura ela cai (vencimento sempre; fechamento é
-- opcional — sem ele, o app assume um fechamento ~7 dias antes do
-- vencimento). Cartões já cadastrados ficam com os dois campos em branco
-- até a usuária preencher.

alter table public.cards
  add column due_day smallint,
  add column closing_day smallint;

alter table public.cards
  add constraint cards_due_day_range check (due_day is null or (due_day between 1 and 31));

alter table public.cards
  add constraint cards_closing_day_range check (closing_day is null or (closing_day between 1 and 31));
