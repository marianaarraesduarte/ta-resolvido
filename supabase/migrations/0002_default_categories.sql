-- Tá Resolvido — categorias padrão
-- Rodar no SQL Editor do Supabase, depois do supabase/schema.sql.
-- Cria as categorias padrão pra quem se cadastrar a partir de agora, e também
-- preenche pra quem já tinha cadastro (ex: sua conta de teste).

alter table public.categories
  add constraint categories_user_name_unique unique (user_id, name);

create or replace function public.seed_default_categories(p_user_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.categories (user_id, name, icon)
  values
    (p_user_id, 'Mercado', 'shopping-cart'),
    (p_user_id, 'Contas', 'zap'),
    (p_user_id, 'Transporte', 'fuel'),
    (p_user_id, 'Saúde', 'heart'),
    (p_user_id, 'Lazer', 'music'),
    (p_user_id, 'Outros', 'more-horizontal')
  on conflict (user_id, name) do nothing;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  perform public.seed_default_categories(new.id);
  return new;
end;
$$;

-- Backfill pra contas já existentes que ainda não têm nenhuma categoria.
select public.seed_default_categories(u.id)
from auth.users u
where not exists (
  select 1 from public.categories c where c.user_id = u.id
);
