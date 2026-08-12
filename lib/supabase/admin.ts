import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente com a service role key — ignora RLS. Só pra uso em rotas de
 * servidor sem sessão de usuário (ex: o cron de lembretes), nunca no client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada no servidor.");
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
