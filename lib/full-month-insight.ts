import type { createClient } from "@/lib/supabase/server";
import { extractFromText, Type } from "@/lib/gemini";
import { toDateKey, dayOfMonth, monthLabel, monthKey, daysInMonth } from "@/lib/date";
import { effectiveDateOf, fetchPaidInvoiceDates } from "@/lib/saldo-entries";
import { checkAmountAnomaly } from "@/lib/anomaly-check";
import { comparePeriods, type SpendEntry } from "@/lib/period-comparison";
import { currency } from "@/lib/tokens";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type TopLancamento = {
  description: string;
  amount: number;
  categoryName: string | null;
  cardName: string | null;
};
export type CategoriaValor = { nome: string; valor: number };
export type SaldoDia = { day: number; acumulado: number };
export type MetaStat = { nome: string; done: boolean };

export type FullMonthInsight = {
  periodLabel: string;
  entrou: number;
  saiu: number;
  sobrou: number;
  abertura: string;
  maioresGastos: { text: string; items: TopLancamento[] };
  categorias: { text: string; items: CategoriaValor[] };
  saldoDiaADia: { text: string; items: SaldoDia[] };
  comparacao: { text: string; pct: number; direction: "up" | "down" | "flat" } | null;
  metas: { text: string; items: MetaStat[] } | null;
  alerta: { text: string; categoria: string } | null;
  direcionamento: string;
};

type RawRow = {
  type: "despesa" | "receita";
  amount: number;
  description: string;
  categories: { name: string } | null;
  entry_date: string;
  card_invoice_id: string | null;
  investment_goal_id: string | null;
  income_type: string | null;
};

const sectionsSchema = {
  type: Type.OBJECT,
  properties: {
    abertura: { type: Type.STRING },
    maioresGastos: { type: Type.STRING },
    categorias: { type: Type.STRING },
    saldoDiaADia: { type: Type.STRING },
    comparacao: { type: Type.STRING },
    metas: { type: Type.STRING },
    alerta: { type: Type.STRING },
    direcionamento: { type: Type.STRING },
  },
  required: [
    "abertura",
    "maioresGastos",
    "categorias",
    "saldoDiaADia",
    "comparacao",
    "metas",
    "alerta",
    "direcionamento",
  ],
};

type AiSections = {
  abertura: string;
  maioresGastos: string;
  categorias: string;
  saldoDiaADia: string;
  comparacao: string;
  metas: string;
  alerta: string;
  direcionamento: string;
};

/**
 * Acha a janela de alguns dias seguidos com a queda mais forte no saldo
 * acumulado do período, e nomeia o que mais pesou nela — pra IA comentar o
 * gráfico com um fato real ("a queda maior foi entre os dias X e Y, por
 * causa de Z"), não uma frase genérica só olhando o formato da curva.
 */
function findBiggestDrop(
  dailySaldo: SaldoDia[],
  despesas: { description: string; amount: number; day: number }[],
  windowSize = 3,
): { startDay: number; endDay: number; delta: number; itens: string[] } | null {
  if (dailySaldo.length < windowSize) return null;

  let best: { startDay: number; endDay: number; delta: number } | null = null;
  for (let i = 0; i <= dailySaldo.length - windowSize; i++) {
    const start = dailySaldo[i];
    const end = dailySaldo[i + windowSize - 1];
    const delta = end.acumulado - start.acumulado;
    if (!best || delta < best.delta) {
      best = { startDay: start.day, endDay: end.day, delta };
    }
  }
  if (!best || best.delta >= 0) return null;

  const itens = despesas
    .filter((d) => d.day >= best!.startDay && d.day <= best!.endDay)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)
    .map((d) => d.description);

  return { ...best, itens };
}

/**
 * Análise completa do mês: uma explicação de verdade, como se a pessoa
 * tivesse que prestar contas pra alguém — não um resumo de uma frase por
 * bloco. Nomeia os 5 maiores gastos (incluindo os de dentro de uma fatura),
 * traz gráfico de categoria e de saldo dia a dia com legenda comentando o
 * que aconteceu de real, e fecha com uma direção prática pro mês. Recurso
 * do Completo, sempre sob demanda — nunca gera sozinha.
 */
export async function generateFullMonthInsight(
  supabase: SupabaseClient,
  userId: string,
  salaryOnly: boolean,
): Promise<FullMonthInsight | null> {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayKey = toDateKey(firstDay);
  const todayKey = toDateKey(today);

  const lastMonthFirstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const prevPeriodEndDay = Math.min(today.getDate(), daysInMonth(lastMonthFirstDay));
  const prevLastDay = new Date(lastMonthFirstDay.getFullYear(), lastMonthFirstDay.getMonth(), prevPeriodEndDay);
  const prevStartKey = toDateKey(lastMonthFirstDay);
  const prevEndKey = toDateKey(prevLastDay);

  const paidDateByInvoiceId = await fetchPaidInvoiceDates(supabase, userId);
  const paidInvoiceIds = [...paidDateByInvoiceId.keys()];

  let query = supabase
    .from("entries")
    .select(
      "type, amount, description, categories(name), entry_date, card_invoice_id, investment_goal_id, income_type",
    )
    .eq("user_id", userId)
    .gte("entry_date", prevStartKey);
  query =
    paidInvoiceIds.length > 0
      ? query.or(`entry_date.lte.${todayKey},card_invoice_id.in.(${paidInvoiceIds.join(",")})`)
      : query.lte("entry_date", todayKey);

  const [{ data: rawRows }, { data: goalsData }, { data: confirmedData }] = await Promise.all([
    query,
    supabase.from("investment_goals").select("id, name, percent").eq("user_id", userId),
    supabase
      .from("entries")
      .select("investment_goal_id")
      .eq("user_id", userId)
      .not("investment_goal_id", "is", null)
      .gte("entry_date", firstDayKey)
      .lte("entry_date", todayKey),
  ]);

  const allRows = ((rawRows as unknown as RawRow[]) ?? []).map((r) => ({
    ...r,
    effectiveDate: effectiveDateOf(r, paidDateByInvoiceId),
  }));
  const rows = allRows.filter((r) => r.effectiveDate >= firstDayKey && r.effectiveDate <= todayKey);
  const prevRows = allRows.filter(
    (r) => r.type === "despesa" && r.effectiveDate >= prevStartKey && r.effectiveDate <= prevEndKey,
  );
  if (rows.length === 0) return null;

  const despesas = rows.filter((r) => r.type === "despesa");
  const receitas = rows.filter((r) => r.type === "receita" && (!salaryOnly || r.income_type === "salario"));
  const entrou = receitas.reduce((sum, r) => sum + r.amount, 0);
  const saiu = despesas.reduce((sum, r) => sum + r.amount, 0);
  const sobrou = entrou - saiu;

  const despesasSemInvestimento = despesas.filter((d) => !d.investment_goal_id);

  const invoiceIds = [
    ...new Set(despesas.map((d) => d.card_invoice_id).filter((id): id is string => !!id)),
  ];
  const cardNameByInvoiceId = new Map<string, string>();
  if (invoiceIds.length > 0) {
    const { data: invoiceRows } = await supabase
      .from("card_invoices")
      .select("id, cards(name)")
      .in("id", invoiceIds);
    for (const row of (invoiceRows as unknown as { id: string; cards: { name: string } | null }[] | null) ?? []) {
      if (row.cards?.name) cardNameByInvoiceId.set(row.id, row.cards.name);
    }
  }

  const topLancamentos: TopLancamento[] = [...despesasSemInvestimento]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)
    .map((d) => ({
      description: d.description,
      amount: d.amount,
      categoryName: d.categories?.name ?? null,
      cardName: d.card_invoice_id ? (cardNameByInvoiceId.get(d.card_invoice_id) ?? null) : null,
    }));

  const byCategory = new Map<string, number>();
  for (const d of despesasSemInvestimento) {
    const name = d.categories?.name ?? "Sem categoria";
    byCategory.set(name, (byCategory.get(name) ?? 0) + d.amount);
  }
  const categoriasChart: CategoriaValor[] = Array.from(byCategory.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([nome, valor]) => ({ nome, valor }));

  const byDay = new Map<number, number>();
  for (const r of rows) {
    const day = dayOfMonth(r.effectiveDate);
    byDay.set(day, (byDay.get(day) ?? 0) + (r.type === "receita" ? r.amount : -r.amount));
  }
  const lastDay = today.getDate();
  let running = 0;
  const dailySaldo: SaldoDia[] = [];
  for (let day = 1; day <= lastDay; day++) {
    running += byDay.get(day) ?? 0;
    dailySaldo.push({ day, acumulado: Math.round(running * 100) / 100 });
  }
  const drop = findBiggestDrop(
    dailySaldo,
    despesasSemInvestimento.map((d) => ({
      description: d.description,
      amount: d.amount,
      day: dayOfMonth(d.effectiveDate),
    })),
  );

  const thisPeriod: SpendEntry[] = despesasSemInvestimento.map((d) => ({
    amount: d.amount,
    categoryName: d.categories?.name ?? null,
  }));
  const lastPeriod: SpendEntry[] = prevRows
    .filter((d) => !d.investment_goal_id)
    .map((d) => ({ amount: d.amount, categoryName: d.categories?.name ?? null }));
  const comparison = comparePeriods(thisPeriod, lastPeriod);

  const goals = goalsData ?? [];
  let metasStat: MetaStat[] = [];
  let unconfirmedGap = 0;
  if (goals.length > 0) {
    const confirmedGoalIds = new Set(
      ((confirmedData as { investment_goal_id: string | null }[] | null) ?? [])
        .map((e) => e.investment_goal_id)
        .filter((id): id is string => id != null),
    );
    metasStat = goals.map((g) => ({ nome: g.name, done: confirmedGoalIds.has(g.id) }));
    unconfirmedGap = goals
      .filter((g) => !confirmedGoalIds.has(g.id))
      .reduce((sum, g) => sum + (entrou * g.percent) / 100, 0);
  }

  const alertaInfo = await detectAlerta(supabase, userId, firstDay, categoriasChart);

  const periodLabel = `${monthLabel(firstDay)}, até dia ${today.getDate()}`;

  const prompt = `Você está ajudando alguém a escrever uma explicação completa e honesta de como foi o mês financeiro dela até agora, dentro do app "Tá Resolvido" — como se ela precisasse prestar contas pra alguém (um chefe, um parceiro), não uma mensagem casual de bate-papo. Português do Brasil, tom direto e completo, mas ainda caloroso — nunca formal-frio, nunca de banco ou contador, nunca de julgamento ou bronca.

Escreva parágrafos de verdade (2 a 4 frases cada, pode ser mais que um comentário de chat), citando nomes reais (categorias, lançamentos, meses) que estiverem nos dados abaixo. NUNCA cite um valor em R$ que não esteja explicitamente nos dados — os números já aparecem visualmente na tela, então só cite valor quando ele ajudar a explicação a fazer sentido.

Blocos, cada um seu próprio texto:
- abertura: um panorama completo do período — como foi de verdade, não só "bom" ou "ruim". Pode mencionar o que puxou o resultado.
- maioresGastos: comente os 5 maiores gastos listados abaixo, citando pelo menos 2 ou 3 pelo nome — o que eles revelam sobre o mês (ex: gasto pontual vs recorrente, parcela vs compra à vista).
- categorias: comente a distribuição por categoria, citando as que mais pesaram e, se fizer sentido, alguma que chama atenção por ser baixa ou alta pro que costuma ser.
- saldoDiaADia: comente o formato do gráfico de saldo acumulado do período. ${
    drop
      ? `Cite a queda mais forte, entre os dias ${drop.startDay} e ${drop.endDay}, puxada por: ${drop.itens.join(", ")}.`
      : "Não houve uma queda forte concentrada em poucos dias — pode comentar que o ritmo foi mais espalhado."
  }
- comparacao: compare com o mesmo período do mês anterior, citando a categoria que mais pesou na diferença, se houver.
- metas: comente o progresso das metas de investimento.
- alerta: ${
    alertaInfo
      ? `a categoria "${alertaInfo.categoria}" fugiu do padrão dela mesma nos últimos meses — explique isso e sugira uma ação prática.`
      : "nenhuma categoria destoou muito da própria média nos últimos meses — confirme isso brevemente, sem soar vazio."
  }
- direcionamento: feche com uma direção prática e específica pro resto do mês, escolhendo o ângulo mais relevante entre os dados (categoria que mais pesou, meta perto de bater, o alerta acima, etc.) — não um conselho genérico.

Se não houver metas cadastradas, escreva em "metas" um convite curto pra experimentar a tela de metas, sem soar como propaganda.
Se não houver período anterior pra comparar, escreva em "comparacao" algo neutro.

Nunca invente um número que não esteja nos dados abaixo.`;

  const dataText = `Dados do período — ${periodLabel} (já calculados, não recalcule; valores em R$ brasileiro, use exatamente como estão):
- Entrou: ${currency(entrou)}, Saiu: ${currency(saiu)}, Sobrou: ${currency(sobrou)}
- Os 5 maiores gastos: ${
    topLancamentos
      .map((t) => `${t.description} (${t.categoryName ?? "sem categoria"}${t.cardName ? `, fatura ${t.cardName}` : ""}) — ${currency(t.amount)}`)
      .join("; ") || "nenhum"
  }
- Gasto por categoria: ${categoriasChart.map((c) => `${c.nome}: ${currency(c.valor)}`).join(", ") || "nenhum"}
- Metas de investimento: ${
    metasStat.length > 0
      ? metasStat.map((m) => `${m.nome}: ${m.done ? "guardou" : "não guardou"}`).join(", ")
      : "a pessoa ainda não cadastrou nenhuma meta"
  }
- Falta guardar pra bater todas as metas: ${unconfirmedGap > 0 ? currency(unconfirmedGap) : "já bateu todas, ou não tem metas"}
- Comparado ao mesmo período do mês anterior: ${
    comparison
      ? `${comparison.direction === "up" ? "gastou mais" : comparison.direction === "down" ? "gastou menos" : "gastou quase igual"} (${Math.abs(comparison.deltaPercent)}%)${comparison.topCategory ? `, puxado por ${comparison.topCategory}` : ""}`
      : "sem período anterior pra comparar"
  }
- Categoria fora do padrão: ${
    alertaInfo
      ? `${alertaInfo.categoria}, ${currency(alertaInfo.valor)} esse mês vs média de ${currency(alertaInfo.media)}`
      : "nenhuma"
  }`;

  const ai = await extractFromText<AiSections>(dataText, prompt, sectionsSchema);

  return {
    periodLabel,
    entrou,
    saiu,
    sobrou,
    abertura: ai.abertura,
    maioresGastos: { text: ai.maioresGastos, items: topLancamentos },
    categorias: { text: ai.categorias, items: categoriasChart },
    saldoDiaADia: { text: ai.saldoDiaADia, items: dailySaldo },
    comparacao: comparison
      ? { text: ai.comparacao, pct: Math.abs(comparison.deltaPercent), direction: comparison.direction }
      : null,
    metas: metasStat.length > 0 ? { text: ai.metas, items: metasStat } : null,
    alerta: alertaInfo ? { text: ai.alerta, categoria: alertaInfo.categoria } : null,
    direcionamento: ai.direcionamento,
  };
}

type AlertaInfo = { categoria: string; valor: number; media: number };

/**
 * Compara o gasto de cada categoria nesse mês com a média dela mesma nos 3
 * meses fechados anteriores (mesma lógica de anomalia já usada pra fatura
 * acima da média) — só quando algo realmente destoa. A fala em si é escrita
 * junto com o resto no prompt principal, aqui só os números.
 */
async function detectAlerta(
  supabase: SupabaseClient,
  userId: string,
  firstDay: Date,
  categoriasChart: CategoriaValor[],
): Promise<AlertaInfo | null> {
  const historyStart = new Date(firstDay.getFullYear(), firstDay.getMonth() - 3, 1);
  const { data: historyRows } = await supabase
    .from("entries")
    .select("amount, categories(name), entry_date")
    .eq("user_id", userId)
    .eq("type", "despesa")
    .is("investment_goal_id", null)
    .gte("entry_date", toDateKey(historyStart))
    .lt("entry_date", toDateKey(firstDay));

  const totalsByMonthCategory = new Map<string, number>();
  for (const row of (historyRows as unknown as { amount: number; categories: { name: string } | null; entry_date: string }[] | null) ?? []) {
    const key = `${row.entry_date.slice(0, 7)}|${row.categories?.name ?? "Sem categoria"}`;
    totalsByMonthCategory.set(key, (totalsByMonthCategory.get(key) ?? 0) + row.amount);
  }
  const pastMonthKeys = [1, 2, 3].map((n) =>
    monthKey(new Date(firstDay.getFullYear(), firstDay.getMonth() - n, 1)),
  );

  let best: AlertaInfo & { ratio: number } = { categoria: "", valor: 0, media: 0, ratio: 0 };
  for (const { nome, valor } of categoriasChart) {
    const pastAmounts = pastMonthKeys
      .map((mk) => totalsByMonthCategory.get(`${mk}|${nome}`) ?? 0)
      .filter((v) => v > 0);
    const result = checkAmountAnomaly(valor, pastAmounts);
    if (!result.isAnomalous) continue;
    const ratio = valor / result.average;
    if (ratio > best.ratio) {
      best = { categoria: nome, valor, media: result.average, ratio };
    }
  }
  return best.ratio > 0 ? { categoria: best.categoria, valor: best.valor, media: best.media } : null;
}
