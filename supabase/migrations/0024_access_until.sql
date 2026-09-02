-- Tá Resolvido — cancelar sem perder o mês já pago.
-- Rodar no SQL Editor do painel do Supabase.
--
-- O problema: cancelar rebaixava o plano pra 'free' na mesma hora. Quem
-- cancelava dia 3 perdia no dia 3 o mês inteiro que já tinha pago — o tipo de
-- coisa que vira reclamação e pedido de reembolso, com razão.
--
-- Agora o cancelamento guarda aqui até quando o acesso vale (a data da
-- próxima cobrança que não vai mais acontecer), o plano continua 'completo'
-- até lá, e o cron diário faz o rebaixamento quando a data chega.
--
-- Fica de fora do grant de colunas da migration 0023 de propósito: quem
-- escreve aqui é só a service role, igual ao `plan`.

alter table public.profiles
  add column if not exists access_until timestamptz;

comment on column public.profiles.access_until is
  'Até quando o Completo vale depois de cancelado. Nulo = sem cancelamento pendente.';

-- Ajuda o cron diário a achar rápido quem já venceu, sem varrer a tabela toda.
create index if not exists profiles_access_until_idx
  on public.profiles (access_until)
  where access_until is not null;
