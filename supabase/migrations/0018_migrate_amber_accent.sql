-- Tá Resolvido — migra quem tinha "Âmbar" escolhido como cor de destaque
-- Rodar no SQL Editor do Supabase, depois das migrations anteriores.
-- "Âmbar" saiu das opções de destaque (mesmo tom da cor fixa de "gasto
-- médio" na régua, o que confundia o marcador de "hoje" com ela) — quem já
-- tinha escolhido essa cor cai no padrão atual (Ameixa).

update public.profiles set accent_color = '#7A5C7E' where accent_color = '#D9A441';
