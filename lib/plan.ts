export const FREE_PHOTO_LIMIT = 3;

export function isCompleto(plan: string | null | undefined): boolean {
  return plan === "completo";
}

/**
 * Verdadeiro quando a usuária já bateu o limite de reconhecimentos de
 * foto/PDF do mês do plano grátis. Quem é do Completo nunca bate o limite.
 */
export function isPhotoLimitReached(
  plan: string | null | undefined,
  countThisMonth: number,
): boolean {
  if (isCompleto(plan)) return false;
  return countThisMonth >= FREE_PHOTO_LIMIT;
}
