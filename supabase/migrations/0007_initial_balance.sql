-- Tá Resolvido — saldo inicial
-- Rodar no SQL Editor do painel do Supabase.
-- Guarda quanto a pessoa já tinha na conta ao começar a usar o app, pra o
-- saldo mostrado no app poder bater com o saldo real do banco.

alter table public.profiles
  add column if not exists initial_balance numeric(12, 2) not null default 0;

alter table public.profiles
  add column if not exists initial_balance_date date;
