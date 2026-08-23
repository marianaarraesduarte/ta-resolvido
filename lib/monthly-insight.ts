import type { createClient } from "@/lib/supabase/server";
import { extractFromText, Type } from "@/lib/gemini";
import { toDateKey, monthLabel, daysInMonth } from "@/lib/date";
import { comparePeriods, type SpendEntry } from "@/lib/period-comparison";
import { currency } from "@/lib/tokens";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

type EntryRow = {
  type: "despesa" | "receita";
  amount: number;
  categories: { name: string } | null;
  investment_goal_id: string | null;
};

export type CategoriaStat = { nome: string; valor: number; pct: number };
export type MetaStat = { nome: string; done: boolean };

export type MonthlyInsightSections = {
  resumo: { text: string; entrou: number; saiu: number; sobrou: number };
  categorias: { text: string; top: CategoriaStat[] };
  metas: { text: string; items: MetaStat[] } | null;
  comparacao: { text: string; pct: number; direction: "up" | "down" | "flat" } | null;
  sugestao: { text: string };
};

const sectionsSchema = {
  type: Type.OBJECT,
  properties: {
    resumo: { type: Type.STRING },
    categorias: { type: Type.STRING },
    metas: { type: Type.STRING },
    comparacao: { type: Type.STRING },
    sugestao: { type: Type.STRING },
  },
  required: ["resumo", "categorias", "metas", "comparacao", "sugestao"],
};

type AiSections = {
  resumo: string;
  categorias: string;
  metas: string;
  comparacao: string;
  sugestao: string;
};

type Period = { firstDay: Date; lastDay: Date };

/**
 * Calcula os números reais (sem IA) de um período e pede pro Gemini
 * escrever só o comentário de cada bloco — nunca os valores. Usado tanto
 * pro comentário automático do mês fechado quanto pra análise parcial sob
 * demanda, no meio do mês.
 */
async function computeInsightSections(
  supabase: SupabaseClient,
  userId: string,
  current: Period,
  previous: Period,
  opts: { periodLabel: string; partial: boolean },
): Promise<MonthlyInsightSections | null> {
  const currentStartKey = toDateKey(current.firstDay);
  const currentEndKey = toDateKey(current.lastDay);

  const [{ data: entriesData }, { data: prevEntriesData }, { data: goalsData }, { data: confirmedData }] =
    await Promise.all([
      supabase
        .from("entries")
        .select("type, amount, categories(name), investment_goal_id")
        .eq("user_id", userId)
        .gte("entry_date", currentStartKey)
        .lte("entry_date", currentEndKey),
      supabase
        .from("entries")
        .select("type, amount, categories(name), investment_goal_id")
        .eq("user_id", userId)
        .eq("type", "despesa")
        .gte("entry_date", toDateKey(previous.firstDay))
        .lte("entry_date", toDateKey(previous.lastDay)),
      supabase.from("investment_goals").select("id, name, percent").eq("user_id", userId),
      supabase
        .from("entries")
        .select("investment_goal_id")
        .eq("user_id", userId)
        .not("investment_goal_id", "is", null)
        .gte("entry_date", currentStartKey)
        .lte("entry_date", currentEndKey),
    ]);

  const rows = (entriesData as unknown as EntryRow[]) ?? [];
  if (rows.length === 0) return null;

  const despesas = rows.filter((r) => r.type === "despesa");
  const receitas = rows.filter((r) => r.type === "receita");
  const entrou = receitas.reduce((sum, r) => sum + r.amount, 0);
  const saiu = despesas.reduce((sum, r) => sum + r.amount, 0);
  const sobrou = entrou - saiu;

  // Investimento confirmado é despesa de verdade (conta no saldo), mas não é
  // "gasto" no sentido de categoria — sem isso, ele aparecia misturado como
  // "Sem categoria" ao lado de Mercado, Lazer etc.
  const despesasSemInvestimento = despesas.filter((d) => !d.investment_goal_id);
  const totalSemInvestimento = despesasSemInvestimento.reduce((sum, d) => sum + d.amount, 0);

  const byCategory = new Map<string, number>();
  for (const d of despesasSemInvestimento) {
    const name = d.categories?.name ?? "Sem categoria";
    byCategory.set(name, (byCategory.get(name) ?? 0) + d.amount);
  }
  const top: CategoriaStat[] = Array.from(byCategory.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([nome, valor]) => ({
      nome,
      valor,
      pct: totalSemInvestimento > 0 ? Math.round((valor / totalSemInvestimento) * 100) : 0,
    }));

  const goals = goalsData ?? [];
  let metas: MonthlyInsightSections["metas"] = null;
  let unconfirmedGap = 0;
  if (goals.length > 0) {
    const receitaBasis = entrou; // renda real lançada nesse período
    const confirmedGoalIds = new Set(
      ((confirmedData as { investment_goal_id: string | null }[] | null) ?? [])
        .map((e) => e.investment_goal_id)
        .filter((id): id is string => id != null),
    );
    const items: MetaStat[] = goals.map((g) => ({
      nome: g.name,
      done: confirmedGoalIds.has(g.id),
    }));
    unconfirmedGap = goals
      .filter((g) => !confirmedGoalIds.has(g.id))
      .reduce((sum, g) => sum + (receitaBasis * g.percent) / 100, 0);
    metas = { text: "", items };
  }

  const thisPeriod: SpendEntry[] = despesasSemInvestimento.map((d) => ({
    amount: d.amount,
    categoryName: d.categories?.name ?? null,
  }));
  const lastPeriod: SpendEntry[] = ((prevEntriesData as unknown as EntryRow[]) ?? [])
    .filter((d) => !d.investment_goal_id)
    .map((d) => ({
      amount: d.amount,
      categoryName: d.categories?.name ?? null,
    }));
  const comparison = comparePeriods(thisPeriod, lastPeriod);
  const comparacao: MonthlyInsightSections["comparacao"] = comparison
    ? { text: "", pct: Math.abs(comparison.deltaPercent), direction: comparison.direction }
    : null;

  const momentoFrase = opts.partial
    ? `o momento atual do mês em andamento (${opts.periodLabel}, ainda não fechou)`
    : `o mês passado (${opts.periodLabel})`;

  const prompt = `Você é uma amiga próxima comentando casualmente ${momentoFrase} de alguém, dentro de um app de controle financeiro pessoal chamado "Tá Resolvido". Fale em português do Brasil, tom caloroso e natural, como uma amiga mandando uma mensagem — nunca formal, nunca de banco ou contador, nunca de julgamento ou bronca, e sem gírias forçadas.
${
  opts.partial
    ? "IMPORTANTE: o mês ainda não acabou — fale no presente/futuro (\"até agora\", \"ainda dá tempo\"), nunca como se o mês já tivesse fechado ou como se fosse tarde demais pra mudar algo."
    : ""
}
Escreva 5 comentários curtos (1 frase cada, no máximo 2 quando fizer sentido), um por bloco:

- resumo: um comentário geral sobre como ${opts.partial ? "tá indo o mês até agora" : "foi o mês"} (bom, corrido, tranquilo...). NÃO cite valores em R$ — esses já aparecem visualmente em outro lugar da tela.
- categorias: um comentário sobre quais categorias mais pesaram ou chamaram atenção. Pode citar os NOMES das categorias, mas não repita os valores em R$.
- metas: um comentário sobre quais metas de investimento a pessoa ${opts.partial ? "já guardou até agora e quais ainda não" : "conseguiu guardar e quais ficou de fora"}. Pode citar os NOMES das metas, mas não repita valores.
- comparacao: um comentário reagindo a ter gastado mais, menos ou igual ao mesmo período do mês anterior. NÃO cite a porcentagem exata — ela já aparece visualmente.
- sugestao: a única frase que PODE citar um valor em R$ específico, e só se esse valor estiver nos dados abaixo — dê um conselho prático e específico, escolhendo o ângulo mais relevante dentre os dados (categoria que mais mudou, meta quase batida, etc.)

Se não houver metas de investimento cadastradas, escreva em "metas" algo curto convidando a pessoa a experimentar a tela de metas — sem soar como propaganda.
Se não houver período anterior pra comparar, escreva em "comparacao" algo neutro tipo "ainda não dá pra comparar com o período anterior".

Nunca invente um número que não esteja nos dados abaixo.`;

  const dataText = `Dados do período (já calculados, não recalcule; valores já em formato R$ brasileiro, use exatamente como estão):
- Entrou: ${currency(entrou)}, Saiu: ${currency(saiu)}, Sobrou: ${currency(sobrou)}
- Categorias que mais pesaram: ${top.map((c) => `${c.nome} (${c.pct}%)`).join(", ") || "nenhuma"}
- Metas de investimento: ${
    metas
      ? metas.items.map((m) => `${m.nome}: ${m.done ? "guardou" : "não guardou"}`).join(", ")
      : "a pessoa ainda não cadastrou nenhuma meta"
  }
- Falta guardar pra bater todas as metas: ${unconfirmedGap > 0 ? currency(unconfirmedGap) : "já bateu todas, ou não tem metas"}
- Comparado ao mesmo período anterior: ${
    comparison
      ? `${comparison.direction === "up" ? "gastou mais" : comparison.direction === "down" ? "gastou menos" : "gastou quase igual"} (${Math.abs(comparison.deltaPercent)}%)${comparison.topCategory ? `, puxado por ${comparison.topCategory}` : ""}`
      : "sem período anterior pra comparar"
  }`;

  const ai = await extractFromText<AiSections>(dataText, prompt, sectionsSchema);

  return {
    resumo: { text: ai.resumo, entrou, saiu, sobrou },
    categorias: { text: ai.categorias, top },
    metas: metas ? { text: ai.metas, items: metas.items } : null,
    comparacao: comparacao ? { text: ai.comparacao, pct: comparacao.pct, direction: comparacao.direction } : null,
    sugestao: { text: ai.sugestao },
  };
}

/**
 * Se ainda não existe uma análise gerada pro mês anterior e ele teve algum
 * lançamento, gera e guarda. Roda ao abrir o app, sem depender de cron nem
 * de e-mail. Se a geração falhar, não salva nada e tenta de novo na
 * próxima visita.
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

  const { data: existing } = await supabase
    .from("monthly_insights")
    .select("id")
    .eq("user_id", userId)
    .eq("month_start", monthStartKey)
    .maybeSingle();

  if (existing) return;

  const prevMonthEnd = new Date(lastMonthStart.getFullYear(), lastMonthStart.getMonth(), 0);
  const prevMonthStart = new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), 1);

  try {
    const sections = await computeInsightSections(
      supabase,
      userId,
      { firstDay: lastMonthStart, lastDay: lastMonthEnd },
      { firstDay: prevMonthStart, lastDay: prevMonthEnd },
      { periodLabel: monthLabel(lastMonthStart), partial: false },
    );
    if (!sections) return;

    await supabase.from("monthly_insights").insert({
      user_id: userId,
      month_start: monthStartKey,
      sections,
    });
  } catch {
    // Ignora — tenta de novo na próxima visita.
  }
}

/**
 * Análise sob demanda do mês em andamento, do dia 1 até hoje — gerada na
 * hora, nunca guardada (os números mudam a cada lançamento novo). Quem
 * chama decide se e quando vale a pena pagar o custo de uma chamada real
 * de IA — não roda sozinha.
 */
export async function generatePartialInsight(
  supabase: SupabaseClient,
  userId: string,
): Promise<MonthlyInsightSections | null> {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const lastMonthFirstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastPeriodEndDay = Math.min(today.getDate(), daysInMonth(lastMonthFirstDay));
  const prevLastDay = new Date(lastMonthFirstDay.getFullYear(), lastMonthFirstDay.getMonth(), lastPeriodEndDay);

  return computeInsightSections(
    supabase,
    userId,
    { firstDay, lastDay: today },
    { firstDay: lastMonthFirstDay, lastDay: prevLastDay },
    { periodLabel: monthLabel(firstDay), partial: true },
  );
}
