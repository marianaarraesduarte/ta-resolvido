import { createAdminClient } from "./supabase/admin";

export type RlsStatus = { table_name: string; rls_enabled: boolean; policy_count: number };

/**
 * Consulta o Postgres (via a função `public.rls_status`, criada na migration
 * 0009) pra saber se toda tabela pública tem RLS ligado e alguma política —
 * a única coisa que impede uma usuária de ler dados de outra.
 */
export async function fetchRlsStatus(): Promise<RlsStatus[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("rls_status");
  if (error) {
    throw new Error(`Não deu pra checar o status de RLS: ${error.message}`);
  }
  return (data ?? []) as RlsStatus[];
}
