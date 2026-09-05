-- Tá Resolvido — junta faturas duplicadas (mesmo cartão + mesmo vencimento)
-- Rodar no SQL Editor do Supabase, depois das migrations anteriores.
-- resolveInvoiceId sempre procurou uma fatura já existente com o mesmo
-- cartão+data antes de criar uma nova, mas duas faturas dessas podiam ser
-- criadas ao mesmo tempo (ex: duas fotos da mesma fatura salvas em corrida)
-- e as duas passavam pela checagem antes de qualquer uma existir de verdade.
-- Isso junta as duplicadas que já existem antes de travar isso no banco.

-- Pra cada grupo de faturas duplicadas, escolhe uma sobrevivente (prioriza
-- a que já foi marcada como paga; empate vai pra mais antiga), move os
-- lançamentos das outras pra ela, e só depois apaga as duplicadas — nessa
-- ordem, porque card_invoice_id tem "on delete cascade" em entries.
with ranked as (
  select
    id,
    row_number() over (
      partition by user_id, card_id, invoice_date
      order by (paid_at is not null) desc, created_at asc
    ) as rn,
    first_value(id) over (
      partition by user_id, card_id, invoice_date
      order by (paid_at is not null) desc, created_at asc
    ) as keeper_id
  from public.card_invoices
  where card_id is not null
)
update public.entries e
set card_invoice_id = r.keeper_id
from ranked r
where e.card_invoice_id = r.id
  and r.rn > 1;

with ranked as (
  select
    id,
    row_number() over (
      partition by user_id, card_id, invoice_date
      order by (paid_at is not null) desc, created_at asc
    ) as rn
  from public.card_invoices
  where card_id is not null
)
delete from public.card_invoices
where id in (select id from ranked where rn > 1);

-- Trava isso no banco pra nunca mais duplicar, mesmo numa corrida — o
-- código (resolveInvoiceId) reaproveita a fatura existente se essa
-- constraint barrar a criação de uma nova.
alter table public.card_invoices
  add constraint card_invoices_user_card_date_unique unique (user_id, card_id, invoice_date);
