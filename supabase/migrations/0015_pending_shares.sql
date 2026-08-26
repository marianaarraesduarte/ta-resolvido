-- Tá Resolvido — compartilhar foto/print direto de outro app (Web Share Target)
-- Rodar no SQL Editor do Supabase, depois das migrations anteriores.
-- Guarda por pouco tempo a imagem recebida via "Compartilhar" do sistema
-- (ex: um print do WhatsApp) até a tela de novo lançamento buscar e apagar.

create table if not exists public.pending_shares (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  data_url text not null,
  is_pdf boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.pending_shares enable row level security;

create policy "pending_shares: all own" on public.pending_shares
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
