-- Tá Resolvido — busca de usuária por e-mail
-- Usado pelo webhook do Hotmart, que só sabe o e-mail de quem comprou (não o
-- id interno). auth.users não é acessível direto pela service role via
-- PostgREST, então essa função (security definer) faz a ponte.
-- Rodar no SQL Editor do painel do Supabase.

create or replace function public.get_user_id_by_email(p_email text)
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from auth.users where lower(email) = lower(p_email) limit 1;
$$;

revoke all on function public.get_user_id_by_email(text) from public, anon, authenticated;
grant execute on function public.get_user_id_by_email(text) to service_role;
