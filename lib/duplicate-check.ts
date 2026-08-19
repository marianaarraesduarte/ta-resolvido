import { namesMatch } from "./text-match";

export type ExistingEntry = { entry_date: string; amount: number; description: string };
export type DuplicateCandidate = { date: string; amount: number; description: string };

/**
 * Um item reconhecido é possível duplicata quando já existe um lançamento na
 * mesma data, com o mesmo valor (tolerância de 1 centavo) e nome parecido —
 * o cenário mais comum sendo mandar o mesmo print duas vezes.
 */
export function isPossibleDuplicate(
  candidate: DuplicateCandidate,
  existing: ExistingEntry[],
): boolean {
  return existing.some(
    (e) =>
      e.entry_date === candidate.date &&
      Math.abs(e.amount - candidate.amount) < 0.01 &&
      namesMatch(e.description, candidate.description),
  );
}
