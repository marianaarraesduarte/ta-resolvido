const MIN_HISTORY = 2;
const THRESHOLD_RATIO = 1.8;

export type AnomalyResult = { isAnomalous: boolean; average: number };

/**
 * Compara um valor novo (ex: total de uma fatura) com a média de valores
 * anteriores do mesmo tipo (ex: faturas anteriores do mesmo cartão). Só
 * considera anômalo com histórico suficiente pra média fazer sentido — com
 * pouco histórico, qualquer primeira fatura pareceria "estranha".
 */
export function checkAmountAnomaly(current: number, pastAmounts: number[]): AnomalyResult {
  if (pastAmounts.length < MIN_HISTORY) return { isAnomalous: false, average: 0 };
  const average = pastAmounts.reduce((sum, a) => sum + a, 0) / pastAmounts.length;
  if (average <= 0) return { isAnomalous: false, average };
  return { isAnomalous: current > average * THRESHOLD_RATIO, average };
}
