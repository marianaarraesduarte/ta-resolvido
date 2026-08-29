-- Tá Resolvido — renomeia o lembrete de "print" pra "lançamento"
-- Rodar no SQL Editor do Supabase, depois das migrations anteriores.
-- O lembrete nunca foi só sobre mandar print do extrato (hoje tem chat, áudio
-- e manual também) — o nome da coluna acompanha o rename do recurso na copy.

alter table public.profiles rename column last_print_sent_at to last_reminder_sent_at;
