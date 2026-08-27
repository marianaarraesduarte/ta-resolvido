import { matchFixedExpense, type FixedExpense } from "./fixed-expense-match";
import { normalize } from "./text-match";

export type ExpenseEntry = {
  description: string;
  amount: number;
  category_id: string | null;
  entry_date: string;
};

export type FrequentExpense = {
  description: string;
  amount: number;
  categoryId: string | null;
  count: number;
};

const MIN_OCCURRENCES = 3;
const MAX_RESULTS = 3;

/**
 * Gastos pequenos que se repetem (cafezinho, Uber) mas não são conta fixa —
 * agrupa por descrição igual (sem acento/maiúsculas), pega a ocorrência mais
 * recente de cada grupo como representante, e ordena pelas mais frequentes.
 */
export function computeFrequentExpenses(
  entries: ExpenseEntry[],
  fixedExpenses: FixedExpense[],
): FrequentExpense[] {
  const groups = new Map<string, ExpenseEntry[]>();

  for (const entry of entries) {
    if (matchFixedExpense(entry.description, entry.amount, fixedExpenses)) continue;
    const key = normalize(entry.description);
    if (!key) continue;
    const group = groups.get(key) ?? [];
    group.push(entry);
    groups.set(key, group);
  }

  return [...groups.values()]
    .filter((group) => group.length >= MIN_OCCURRENCES)
    .map((group) => {
      const mostRecent = group.reduce((a, b) => (a.entry_date >= b.entry_date ? a : b));
      return {
        description: mostRecent.description,
        amount: mostRecent.amount,
        categoryId: mostRecent.category_id,
        count: group.length,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_RESULTS);
}
