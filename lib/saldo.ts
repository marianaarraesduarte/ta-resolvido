import type { createClient } from "@/lib/supabase/server";
import { toDateKey } from "@/lib/date";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type SaldoEntry = {
  type: "despesa" | "receita";
  amount: number;
  income_type?: string | null;
};

/**
 * Saldo = saldo inicial informado pela usuária + receitas - despesas desde a
 * data do saldo inicial. Quando `salaryOnly` está ligado (config "considerar
 * só salário"), receitas que não são salário não entram na conta.
 */
export function calculateSaldo(
  entries: SaldoEntry[],
  options: { initialBalance: number; salaryOnly: boolean },
): number {
  const receitaAcumulada = entries
    .filter((e) => e.type === "receita" && (!options.salaryOnly || e.income_type === "salario"))
    .reduce((sum, e) => sum + e.amount, 0);
  const despesaAcumulada = entries
    .filter((e) => e.type === "despesa")
    .reduce((sum, e) => sum + e.amount, 0);
  return options.initialBalance + receitaAcumulada - despesaAcumulada;
}

/**
 * Busca o perfil e os lançamentos e calcula o saldo até uma data — usado
 * tanto pelo saldo do topo quanto por qualquer tela que precise do saldo
 * num ponto específico, sem duplicar a query em cada lugar.
 */
export async function computeSaldoAtDate(
  supabase: SupabaseClient,
  userId: string,
  endDate: Date,
): Promise<number> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("income_basis, initial_balance, initial_balance_date")
    .eq("id", userId)
    .single();

  const { data: entries } = await supabase
    .from("entries")
    .select("type, amount, income_type")
    .eq("user_id", userId)
    .gte("entry_date", profile?.initial_balance_date ?? "1900-01-01")
    .lte("entry_date", toDateKey(endDate));

  return calculateSaldo(entries ?? [], {
    initialBalance: profile?.initial_balance ?? 0,
    salaryOnly: profile?.income_basis === "salary_only",
  });
}
