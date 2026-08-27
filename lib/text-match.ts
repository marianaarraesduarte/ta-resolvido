export function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Compara duas descrições de forma tolerante (sem acento, maiúsculo/minúsculo,
 * substring em qualquer direção) — usado pra ligar um gasto fixo cadastrado
 * (ex: "Aluguel") a um lançamento real (ex: "Aluguel apto - agosto").
 */
export function namesMatch(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}
