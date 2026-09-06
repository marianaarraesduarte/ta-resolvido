import type { createClient } from "@/lib/supabase/server";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type SaldoEntryRow = { type: "despesa" | "receita"; amount: number; income_type: string | null };
export type SaldoEntryWithDate = SaldoEntryRow & { effectiveDate: string };

/**
 * Data que de fato conta pro saldo: a de vencimento, ou a de quando a
 * fatura foi marcada como paga, se isso aconteceu antes (antecipação) — só
 * existe fatura marcada como paga ANTES do vencimento, nunca depois, então
 * paid_at aqui sempre puxa a data pra trás no tempo, nunca pra frente.
 */
export function effectiveDateOf(
  entry: { entry_date: string; card_invoice_id: string | null },
  paidDateByInvoiceId: Map<string, string>,
): string {
  const paidDate = entry.card_invoice_id ? paidDateByInvoiceId.get(entry.card_invoice_id) : undefined;
  return paidDate ?? entry.entry_date;
}

/**
 * Mapa invoice_id -> data (YYYY-MM-DD) em que foi marcada como paga. Exposto
 * pra quem precisa buscar colunas extras além das básicas (ex: categoria,
 * meta de investimento) e montar a data efetiva na mão com effectiveDateOf.
 */
export async function fetchPaidInvoiceDates(
  supabase: SupabaseClient,
  userId: string,
): Promise<Map<string, string>> {
  const { data } = await supabase
    .from("card_invoices")
    .select("id, paid_at")
    .eq("user_id", userId)
    .not("paid_at", "is", null);

  return new Map(
    (data ?? []).map((row) => [row.id as string, (row.paid_at as string).slice(0, 10)]),
  );
}

/**
 * Busca lançamentos com a data efetiva já resolvida (ver effectiveDateOf),
 * sem cortar por um teto de data — quem chama decide como agrupar por
 * período. Usada por quem precisa comparar mais de um período de uma vez
 * (ex: comentário do mês, comparando com o anterior; histórico de saldo por
 * mês nas Análises), onde um corte simples de "até tal data" erraria pra
 * qual período uma fatura antecipada pertence.
 */
export async function fetchEntriesWithEffectiveDate(
  supabase: SupabaseClient,
  userId: string,
  fromDate: string,
  toDate: string,
): Promise<SaldoEntryWithDate[]> {
  const paidDateByInvoiceId = await fetchPaidInvoiceDates(supabase, userId);
  const paidInvoiceIds = [...paidDateByInvoiceId.keys()];

  let query = supabase
    .from("entries")
    .select("type, amount, income_type, entry_date, card_invoice_id")
    .eq("user_id", userId)
    .gte("entry_date", fromDate);

  query =
    paidInvoiceIds.length > 0
      ? query.or(`entry_date.lte.${toDate},card_invoice_id.in.(${paidInvoiceIds.join(",")})`)
      : query.lte("entry_date", toDate);

  const { data } = await query;

  return ((data as (SaldoEntryRow & { entry_date: string; card_invoice_id: string | null })[] | null) ?? [])
    .map((row) => ({
      type: row.type,
      amount: row.amount,
      income_type: row.income_type,
      effectiveDate: effectiveDateOf(row, paidDateByInvoiceId),
    }))
    .filter((row) => row.effectiveDate <= toDate);
}

/**
 * Busca os lançamentos que entram no cálculo do saldo até uma data —
 * antecipar o pagamento de uma fatura desconta na hora (data efetiva vira a
 * do pagamento), mesmo com o vencimento ainda no futuro. Centralizado aqui
 * pra o saldo do topo, a simulação em "Guardando dinheiro" e as Análises
 * nunca ficarem desincronizados entre si.
 */
export async function fetchSaldoEntries(
  supabase: SupabaseClient,
  userId: string,
  fromDate: string,
  toDate: string,
): Promise<SaldoEntryRow[]> {
  const rows = await fetchEntriesWithEffectiveDate(supabase, userId, fromDate, toDate);
  return rows.map(({ type, amount, income_type }) => ({ type, amount, income_type }));
}
