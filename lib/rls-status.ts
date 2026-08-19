import { createAdminClient } from "./supabase/admin";

export type RlsStatusRow = {
  table_name: string;
  rls_enabled: boolean;
  policy_name: string | null;
  policy_expr: string | null;
};

/**
 * Consulta o Postgres (via a função `public.rls_status`, migrations 0009 e
 * 0011) pra saber se toda tabela pública tem RLS ligado e, pra cada
 * política, qual o texto dela — a única coisa que impede uma usuária de ler
 * dados de outra. Uma linha por (tabela, política); tabela sem política
 * nenhuma aparece uma vez com policy_name null.
 */
export async function fetchRlsStatus(): Promise<RlsStatusRow[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("rls_status");
  if (error) {
    throw new Error(`Não deu pra checar o status de RLS: ${error.message}`);
  }
  return (data ?? []) as RlsStatusRow[];
}
