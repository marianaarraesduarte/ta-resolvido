export const FREE_RECOGNITION_LIMIT = 3;

export function isCompleto(plan: string | null | undefined): boolean {
  return plan === "completo";
}

/**
 * Verdadeiro quando a usuária já bateu o limite de reconhecimentos por IA
 * (foto, PDF ou chat) do mês do plano grátis — as três formas contam pro
 * mesmo limite. Quem é do Completo nunca bate o limite.
 */
export function isRecognitionLimitReached(
  plan: string | null | undefined,
  countThisMonth: number,
): boolean {
  if (isCompleto(plan)) return false;
  return countThisMonth >= FREE_RECOGNITION_LIMIT;
}
