export type ParsedInstallment = { baseDescription: string; number: number; total: number };

// Faturas de cartão costumam marcar compra parcelada bem colado ao nome do
// estabelecimento, no fim da descrição — "AMAZON BR 03/10", "NOTEBOOK DELL
// PARCELA 3/10", "SOFÁ (3 de 12)". Só reconhece no fim da string de propósito
// (não no meio) pra não confundir com um código de produto que por acaso
// tenha uma barra.
const PATTERNS = [
  /^(.*\S)\s+\(?parc(?:ela)?\.?\s*(\d{1,2})\s*(?:de|\/)\s*(\d{1,2})\)?\s*$/i,
  /^(.*\S)\s+\((\d{1,2})\s*(?:de|\/)\s*(\d{1,2})\)\s*$/i,
  /^(.*\S)\s+(\d{1,2})\s*\/\s*(\d{1,2})\s*$/,
];

/**
 * Extrai número/total de parcela do fim de uma descrição, se houver.
 * Só considera plausível quando número <= total e total está num intervalo
 * razoável de parcelamento (2 a 48) — isso evita confundir com uma data
 * (dia/mês) que por coincidência apareça colada ao nome.
 */
export function parseInstallmentInfo(description: string): ParsedInstallment | null {
  const trimmed = description.trim();
  for (const pattern of PATTERNS) {
    const match = trimmed.match(pattern);
    if (!match) continue;
    const number = parseInt(match[2], 10);
    const total = parseInt(match[3], 10);
    if (total < 2 || total > 48 || number < 1 || number > total) continue;
    const baseDescription = match[1].trim().replace(/[-–—,.\s]+$/, "").trim();
    if (!baseDescription) continue;
    return { baseDescription, number, total };
  }
  return null;
}
