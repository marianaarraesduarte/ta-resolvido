-- Tá Resolvido — lançamento por áudio
-- Rodar no SQL Editor do Supabase, depois das migrations anteriores.
-- Permite 'audio' como origem de um lançamento, junto com 'manual', 'foto' e 'chat'.

alter table public.entries drop constraint entries_source_check;
alter table public.entries add constraint entries_source_check
  check (source in ('manual', 'foto', 'chat', 'audio'));
