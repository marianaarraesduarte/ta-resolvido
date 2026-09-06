import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type SaldoEntryRow = { type: "despesa" | "receita"; amount: number; income_type: string | null };

/**
 * Busca os lançamentos que entram no cálculo do saldo: os que já chegaram
 * na data, mais qualquer um de fatura já marcada como paga — antecipar o
 * pagamento desconta na hora, mesmo com o vencimento ainda no futuro.
 * Centralizado aqui pra o saldo do topo e a simulação em "Guardando
 * dinheiro" nunca ficarem desincronizados um do outro.
 */
export async function fetchSaldoEntries(
  supabase: SupabaseClient,
  userId: string,
  fromDate: string,
  toDate: string,
): Promise<SaldoEntryRow[]> {
  const { data: paidInvoicesData } = await supabase
    .from("card_invoices")
    .select("id")
    .eq("user_id", userId)
    .not("paid_at", "is", null);
  const paidInvoiceIds = (paidInvoicesData ?? []).map((i) => i.id);

  let query = supabase
    .from("entries")
    .select("type, amount, income_type")
    .eq("user_id", userId)
    .gte("entry_date", fromDate);

  query =
    paidInvoiceIds.length > 0
      ? query.or(`entry_date.lte.${toDate},card_invoice_id.in.(${paidInvoiceIds.join(",")})`)
      : query.lte("entry_date", toDate);

  const { data } = await query;
  return (data as SaldoEntryRow[] | null) ?? [];
}
