import { namesMatch } from "./text-match";

export type CategoryPattern = { description_pattern: string; category_id: string };

/**
 * Acha a categoria já ensinada pra uma descrição parecida — assim, uma loja
 * ou assinatura que já foi corrigida uma vez não precisa ser corrigida de
 * novo toda vez que aparecer.
 */
export function matchCategoryPattern(
  description: string,
  patterns: CategoryPattern[],
): string | null {
  const match = patterns.find((p) => namesMatch(p.description_pattern, description));
  return match?.category_id ?? null;
}
