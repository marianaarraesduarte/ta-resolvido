-- Tá Resolvido — comentário do mês em formato de conversa, com número real
-- Rodar no SQL Editor do Supabase, depois das migrations anteriores.
-- Troca o parágrafo único gerado pela IA por 5 blocos curtos (resumo,
-- categorias, metas, comparação, sugestão) — cada um guarda o texto que a IA
-- escreveu JUNTO com os números já calculados no código (nunca pela IA), pra
-- nunca mostrar um valor que a IA possa ter errado ou arredondado.
-- Como o formato muda por completo, os comentários já gerados até aqui são
-- descartados — a próxima visita ao app gera de novo, no formato novo.

delete from public.monthly_insights;

alter table public.monthly_insights drop column content;
alter table public.monthly_insights add column sections jsonb not null;
