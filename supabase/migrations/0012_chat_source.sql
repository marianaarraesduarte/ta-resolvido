-- Tá Resolvido — lançamento por chat
-- Rodar no SQL Editor do Supabase, depois das migrations anteriores.
-- Permite 'chat' como origem de um lançamento, junto com 'manual' e 'foto'.

alter table public.entries drop constraint entries_source_check;
alter table public.entries add constraint entries_source_check
  check (source in ('manual', 'foto', 'chat'));
