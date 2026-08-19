-- Tá Resolvido — auditoria de RLS, v2
-- Rodar no SQL Editor do Supabase, depois da 0009 e 0010.
-- A v1 (migration 0009) só conferia se a tabela tinha alguma política — uma
-- política escrita errado (ex: "using (true)", liberando geral) passaria do
-- mesmo jeito. Essa versão devolve o texto de cada política, pra o teste
-- conferir que ela realmente trava em auth.uid(), não só que existe.

drop function if exists public.rls_status();

create function public.rls_status()
returns table (
  table_name text,
  rls_enabled boolean,
  policy_name text,
  policy_expr text
)
language sql
security definer
set search_path = public
as $$
  select
    c.relname::text as table_name,
    c.relrowsecurity as rls_enabled,
    p.polname::text as policy_name,
    concat_ws(
      ' | ',
      pg_get_expr(p.polqual, p.polrelid),
      pg_get_expr(p.polwithcheck, p.polrelid)
    ) as policy_expr
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  left join pg_policy p on p.polrelid = c.oid
  where n.nspname = 'public'
    and c.relkind = 'r'
  order by c.relname, p.polname;
$$;

revoke all on function public.rls_status() from public, anon, authenticated;
grant execute on function public.rls_status() to service_role;
