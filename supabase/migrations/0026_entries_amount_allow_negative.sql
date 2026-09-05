-- Tá Resolvido — permite valor negativo em lançamentos (estorno/devolução)
-- Rodar no SQL Editor do Supabase, depois das migrations anteriores.
-- A tabela só aceitava amount > 0, o que travava (com erro genérico, sem
-- mensagem clara) qualquer tentativa de gravar um estorno/devolução como
-- valor negativo — tanto editando um lançamento na mão quanto lendo isso de
-- uma foto de fatura. Continua não aceitando amount = 0.

alter table public.entries drop constraint entries_amount_check;
alter table public.entries add constraint entries_amount_check check (amount <> 0);
