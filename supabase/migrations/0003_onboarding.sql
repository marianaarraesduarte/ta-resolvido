-- Tá Resolvido — controle de onboarding
-- Rodar no SQL Editor do Supabase, depois das migrations anteriores.
-- Contas que já existem viram "true" automaticamente (não veem o onboarding
-- de novo); contas novas a partir de agora nascem com "false".

alter table public.profiles
  add column if not exists onboarding_completed boolean not null default true;

alter table public.profiles
  alter column onboarding_completed set default false;
