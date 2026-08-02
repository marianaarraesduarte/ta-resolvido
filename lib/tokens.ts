/**
 * Mesmos tokens de cor usados nos mockups em mockups/*.jsx.
 * Mantido à parte do tailwind.config para uso em lugares que precisam do valor
 * hex puro (ex: cor dinâmica calculada em runtime, SVGs).
 */
export const TOKENS = {
  bg: "#EDE9DE",
  card: "#FBFAF6",
  ink: "#1F3A3D",
  inkSoft: "#5B6E6C",
  amber: "#D9A441",
  coral: "#C1553D",
  sage: "#6F8F6A",
  line: "#D9D3C4",
} as const;

export function currency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Completa um valor digitado sem centavos com ",00" (ou preenche o segundo
 * dígito decimal quando só um foi digitado). Usado nos campos de valor em R$.
 */
export function completeCents(raw: string): string {
  if (!raw.trim()) return raw;
  const [intPart, decPart = ""] = raw.replace(".", ",").split(",");
  const cleanInt = intPart.replace(/[^0-9]/g, "") || "0";
  const cleanDec = (decPart.replace(/[^0-9]/g, "") + "00").slice(0, 2);
  return `${cleanInt},${cleanDec}`;
}

export function parseCurrencyInput(raw: string): number {
  return Number(completeCents(raw).replace(",", "."));
}

export type IntensityLevel = "sage" | "amber" | "coral";

/**
 * Intensidade de um gasto relativa à média dos gastos do próprio usuário no
 * mês (não um valor fixo em R$ — R$100 é "leve" pra uns e "alto" pra outros).
 */
export function levelFor(value: number, averageDespesa: number): IntensityLevel {
  if (averageDespesa <= 0) return "amber";
  const ratio = value / averageDespesa;
  if (ratio <= 0.7) return "sage";
  if (ratio <= 1.3) return "amber";
  return "coral";
}

export const LEVEL_COLOR: Record<IntensityLevel, string> = {
  sage: TOKENS.sage,
  amber: TOKENS.amber,
  coral: TOKENS.coral,
};
