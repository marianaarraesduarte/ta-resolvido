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
  plum: "#7A5C7E",
  line: "#D9D3C4",
} as const;

export function currency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/**
 * Formata um valor em R$ enquanto a pessoa digita, tipo caixa eletrônico:
 * cada dígito entra pela direita (nos centavos) e empurra o resto — sem
 * precisar digitar vírgula nem ponto. Aceita qualquer texto (já formatado
 * ou não), sempre reconstruindo a partir só dos dígitos.
 */
export function formatCentsInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  const cents = digits === "" ? 0 : parseInt(digits, 10);
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Inverso de formatCentsInput — de volta pra número, robusto a ponto de milhar. */
export function parseCentsInput(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, "");
  return digits === "" ? 0 : parseInt(digits, 10) / 100;
}

/** Valor inicial pra um campo que usa formatCentsInput (edição de um valor já existente). */
export function amountToInputValue(amount: number): string {
  return amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
