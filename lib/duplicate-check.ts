export type ExistingEntry = { entry_date: string; amount: number; description: string };
export type DuplicateCandidate = { date: string; amount: number; description: string };

/**
 * Um item reconhecido é possível duplicata quando já existe um lançamento na
 * mesma data e com o mesmo valor (tolerância de 1 centavo) — mesmo que o
 * nome seja diferente. É comum a pessoa lançar algo na mão com um nome (ex:
 * "Mercado") e depois mandar o print do extrato, onde o mesmo gasto aparece
 * com o nome do estabelecimento (ex: "SUPERMERCADO EXTRA LTDA") — exigir
 * nome parecido deixava esses casos passarem batido.
 */
export function isPossibleDuplicate(
  candidate: DuplicateCandidate,
  existing: ExistingEntry[],
): boolean {
  return existing.some(
    (e) => e.entry_date === candidate.date && Math.abs(e.amount - candidate.amount) < 0.01,
  );
}
