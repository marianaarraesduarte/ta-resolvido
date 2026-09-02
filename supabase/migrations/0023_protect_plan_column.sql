-- Tá Resolvido — impede que a própria usuária se dê o plano pago.
-- Rodar no SQL Editor do painel do Supabase.
--
-- O problema: a policy "profiles: update own" deixa cada pessoa editar a
-- própria ficha — e no Postgres isso vale pra ficha INTEIRA, incluindo a
-- coluna `plan`. Na prática dava pra virar "completo" pelo navegador, sem
-- passar pelo pagamento. RLS controla quais LINHAS cada pessoa alcança, não
-- quais COLUNAS; quem faz esse recorte é o GRANT.
--
-- Depois desta migration, só quem usa a service role key consegue escrever
-- em `plan`: o webhook da Hotmart (compra e cancelamento vindos de lá) e a
-- ação de cancelar dentro do app.

revoke update on public.profiles from authenticated;

-- De volta, só o que é preferência da própria pessoa. O que ficou de fora e
-- por quê:
--   plan, paid_at          -> só a service role (é o que a pessoa pagou)
--   last_reminder_sent_at  -> só o cron de lembretes
--   id, created_at         -> nunca mudam
grant update (
  display_name,
  accent_color,
  separate_by_account,
  income_basis,
  hide_goals_screen,
  reminder_frequency,
  onboarding_completed,
  monthly_insights_enabled,
  initial_balance,
  initial_balance_date,
  experience_level,
  guide_active
) on public.profiles to authenticated;

-- Pra conferir que funcionou: esta consulta deve listar as colunas acima e
-- NÃO deve trazer "plan".
--
--   select column_name
--   from information_schema.column_privileges
--   where grantee = 'authenticated'
--     and table_name = 'profiles'
--     and privilege_type = 'UPDATE'
--   order by column_name;
