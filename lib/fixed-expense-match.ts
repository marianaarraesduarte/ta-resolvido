import { namesMatch } from "./text-match";

export type FixedExpense = { name: string; expected_amount: number };

/**
 * Liga um lançamento reconhecido a um gasto fixo cadastrado — primeiro por
 * valor exato (tolerância de 1 centavo), depois por nome parecido.
 */
export function matchFixedExpense(
  description: string,
  amount: number,
  fixedExpenses: FixedExpense[],
): string | null {
  const byAmount = fixedExpenses.find((fe) => Math.abs(fe.expected_amount - amount) < 0.01);
  if (byAmount) return byAmount.name;
  const byName = fixedExpenses.find((fe) => namesMatch(fe.name, description));
  return byName?.name ?? null;
}
