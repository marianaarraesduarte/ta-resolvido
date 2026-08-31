-- Tá Resolvido — nível de controle financeiro e modo guiado
-- Rodar no SQL Editor do Supabase, depois da migration anterior (0020).
-- experience_level guarda a resposta do onboarding (só ajusta o quanto o
-- guia explica em cada passo). guide_active liga/desliga o guia — os passos
-- em si não têm progresso salvo à parte, são derivados dos dados reais
-- (tem categoria? tem gasto fixo? tem cartão? já lançou algo?), então nunca
-- desincroniza.

alter table public.profiles
  add column experience_level text,
  add column guide_active boolean not null default false;
