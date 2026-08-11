import type { createClient } from "@/lib/supabase/server";
import { generateText } from "@/lib/gemini";
import { toDateKey, monthLabel } from "@/lib/date";
import { currency } from "@/lib/tokens";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

type EntryRow = {
  type: "despesa" | "receita";
  amount: number;
  payment_method: "conta" | "cartao";
  categories: { name: string } | null;
};

/**
 * Se ainda não existe uma análise gerada pro mês anterior e ele teve algum
 * lançamento, pede pro Gemini escrever um comentário curto e amigável e
 * salva. Roda ao abrir o app — não depende de cron nem de e-mail. Se a
 * geração falhar, simplesmente não salva nada e tenta de novo na próxima
 * visita (nunca trava o carregamento do app por causa disso).
 */
export async function ensureMonthlyInsight(
  supabase: SupabaseClient,
  userId: string,
  enabled: boolean,
): Promise<void> {
  if (!enabled) return;

  const today = new Date();
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);
  const monthStartKey = toDateKey(lastMonthStart);
  const monthEndKey = toDateKey(lastMonthEnd);

  const { data: existing } = await supabase
    .from("monthly_insights")
    .select("id")
    .eq("user_id", userId)
    .eq("month_start", monthStartKey)
    .maybeSingle();

  if (existing) return;

  const { data } = await supabase
    .from("entries")
    .select("type, amount, payment_method, categories(name)")
    .eq("user_id", userId)
    .gte("entry_date", monthStartKey)
    .lte("entry_date", monthEndKey);

  const rows = (data as unknown as EntryRow[]) ?? [];
  if (rows.length === 0) return;

  const despesas = rows.filter((r) => r.type === "despesa");
  const receitas = rows.filter((r) => r.type === "receita");
  const totalDespesa = despesas.reduce((sum, r) => sum + r.amount, 0);
  const totalReceita = receitas.reduce((sum, r) => sum + r.amount, 0);
  const cardCount = despesas.filter((r) => r.payment_method === "cartao").length;

  const byCategory = new Map<string, number>();
  for (const d of despesas) {
    const name = d.categories?.name ?? "Sem categoria";
    byCategory.set(name, (byCategory.get(name) ?? 0) + d.amount);
  }
  const topCategories = Array.from(byCategory.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const prompt = `Você é um amigo prestativo comentando os gastos do mês passado (${monthLabel(lastMonthStart)}) de alguém, dentro de um app de controle financeiro pessoal chamado "Tá Resolvido". O tom é leve, caloroso e nunca de julgamento ou bronca — como um amigo comentando gentilmente, não um banco ou contador. Fale em português do Brasil, em no máximo 3 frases curtas, sem markdown, sem emojis.

Dados do mês:
- Total gasto: ${currency(totalDespesa)}
- Total recebido: ${currency(totalReceita)}
- ${despesas.length} gastos marcados no total, sendo ${cardCount} no cartão de crédito
- Categorias que mais pesaram: ${topCategories.map(([name, value]) => `${name} (${currency(value)})`).join(", ") || "nenhuma categoria destacada"}

Escreva um comentário curto sobre como foi o mês — pode elogiar algo bom (ex: gastou pouco, guardou dinheiro) ou apontar com leveza algo pra ficar de olho no próximo mês (ex: muitas compras parceladas, categoria que pesou mais que o normal). Nunca soe como alerta grave ou cobrança.`;

  try {
    const content = await generateText(prompt);
    await supabase.from("monthly_insights").insert({
      user_id: userId,
      month_start: monthStartKey,
      content,
    });
  } catch {
    // Ignora — tenta de novo na próxima visita.
  }
}
