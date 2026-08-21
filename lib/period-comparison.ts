// Tá Resolvido — compara os gastos do mês em andamento com o mesmo período
// do mês passado, sem IA (matemática direta, instantâneo, sem custo).

export type SpendEntry = { amount: number; categoryName: string | null };

export type PeriodComparison = {
  deltaPercent: number;
  direction: "up" | "down" | "flat";
  topCategory: string | null;
};

// Abaixo disso, a diferença é ruído — não vale a pena chamar atenção pra ela.
const FLAT_THRESHOLD_PERCENT = 5;

function sum(entries: SpendEntry[]): number {
  return entries.reduce((total, e) => total + e.amount, 0);
}

function groupByCategory(entries: SpendEntry[]): Map<string, number> {
  const byCategory = new Map<string, number>();
  for (const e of entries) {
    const name = e.categoryName ?? "Sem categoria";
    byCategory.set(name, (byCategory.get(name) ?? 0) + e.amount);
  }
  return byCategory;
}

/**
 * Retorna null quando não dá pra comparar (mês passado sem nenhum gasto
 * marcado nesse período — dividir por zero não faz sentido aqui).
 */
export function comparePeriods(
  thisPeriod: SpendEntry[],
  lastPeriod: SpendEntry[],
): PeriodComparison | null {
  const lastTotal = sum(lastPeriod);
  if (lastTotal === 0) return null;

  const thisTotal = sum(thisPeriod);
  const deltaPercent = Math.round(((thisTotal - lastTotal) / lastTotal) * 100);
  const direction =
    Math.abs(deltaPercent) < FLAT_THRESHOLD_PERCENT ? "flat" : deltaPercent > 0 ? "up" : "down";

  let topCategory: string | null = null;
  if (direction !== "flat") {
    const thisByCategory = groupByCategory(thisPeriod);
    const lastByCategory = groupByCategory(lastPeriod);
    const allCategories = new Set([...thisByCategory.keys(), ...lastByCategory.keys()]);

    let best: { name: string; delta: number } | null = null;
    for (const name of allCategories) {
      const delta = (thisByCategory.get(name) ?? 0) - (lastByCategory.get(name) ?? 0);
      // Só considera categorias empurrando na mesma direção da tendência geral
      // — senão a "explicação" pode contradizer o número principal.
      if (direction === "up" && delta <= 0) continue;
      if (direction === "down" && delta >= 0) continue;
      if (!best || Math.abs(delta) > Math.abs(best.delta)) best = { name, delta };
    }
    topCategory = best?.name ?? null;
  }

  return { deltaPercent, direction, topCategory };
}

export function periodComparisonSentence(comparison: PeriodComparison): string {
  if (comparison.direction === "flat") {
    return "Você tá gastando praticamente igual ao mesmo período do mês passado.";
  }

  const verb = comparison.direction === "up" ? "a mais" : "a menos";
  const base = `Você já gastou ${Math.abs(comparison.deltaPercent)}% ${verb} que no mesmo período do mês passado`;
  return comparison.topCategory ? `${base}, puxado por ${comparison.topCategory}.` : `${base}.`;
}
