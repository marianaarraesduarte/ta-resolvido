/**
 * Sugestão automática de categoria a partir de palavras-chave na descrição.
 * Cobre as categorias padrão semeadas em supabase/migrations/0002_default_categories.sql.
 * Só sugere — a pessoa sempre pode trocar clicando em outra categoria.
 */
const KEYWORDS_BY_CATEGORY: Record<string, string[]> = {
  Mercado: ["mercado", "supermercado", "hortifruti", "acougue", "padaria", "feira", "hipermercado"],
  Contas: [
    "luz",
    "energia",
    "agua",
    "internet",
    "condominio",
    "aluguel",
    "telefone",
    "celular",
    "gas",
    "boleto",
  ],
  Transporte: [
    "uber",
    "99",
    "combustivel",
    "gasolina",
    "posto",
    "estacionamento",
    "onibus",
    "metro",
    "pedagio",
  ],
  Saúde: ["farmacia", "remedio", "medico", "consulta", "dentista", "exame", "plano de saude"],
  Lazer: [
    "netflix",
    "spotify",
    "prime video",
    "disney",
    "cinema",
    "streaming",
    "bar",
    "restaurante",
    "show",
    "viagem",
  ],
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function suggestCategoryName(description: string): string | null {
  const normalizedDesc = normalize(description);
  if (!normalizedDesc.trim()) return null;

  for (const [category, keywords] of Object.entries(KEYWORDS_BY_CATEGORY)) {
    if (keywords.some((keyword) => normalizedDesc.includes(keyword))) {
      return category;
    }
  }
  return null;
}
