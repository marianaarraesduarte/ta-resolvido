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
