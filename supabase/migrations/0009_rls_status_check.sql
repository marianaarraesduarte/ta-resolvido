-- Tá Resolvido — função de auditoria de RLS
-- Rodar no SQL Editor do painel do Supabase.
-- Não expõe nenhum dado de usuário — só metadados de schema (nome da
-- tabela, se RLS está ligado, quantas políticas tem). Só o service_role
-- (usado pelos testes automatizados, nunca pelo app rodando no navegador)
-- pode chamar essa função.

create or replace function public.rls_status()
returns table (table_name text, rls_enabled boolean, policy_count bigint)
language sql
security definer
set search_path = public
as $$
  select
    c.relname::text as table_name,
    c.relrowsecurity as rls_enabled,
    count(p.polname) as policy_count
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  left join pg_policy p on p.polrelid = c.oid
  where n.nspname = 'public'
    and c.relkind = 'r'
  group by c.relname, c.relrowsecurity
  order by c.relname;
$$;

revoke all on function public.rls_status() from public, anon, authenticated;
grant execute on function public.rls_status() to service_role;
