-- Tá Resolvido — aprendizado de categoria
-- Rodar no SQL Editor do Supabase, depois das migrations anteriores.
-- Guarda, por usuária, qual categoria foi usada pra cada descrição já
-- reconhecida por foto/PDF — pra não precisar corrigir a mesma loja ou
-- assinatura toda vez que ela aparecer de novo.

create table if not exists public.category_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  description_pattern text not null,
  category_id uuid not null references public.categories (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, description_pattern)
);

alter table public.category_patterns enable row level security;

create policy "category_patterns: all own" on public.category_patterns
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
