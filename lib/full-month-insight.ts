import type { createClient } from "@/lib/supabase/server";
import { extractFromText, Type } from "@/lib/gemini";
import { toDateKey, dayOfMonth, monthKey } from "@/lib/date";
import { effectiveDateOf, fetchPaidInvoiceDates } from "@/lib/saldo-entries";
import { checkAmountAnomaly } from "@/lib/anomaly-check";
import { currency } from "@/lib/tokens";
import { generatePartialInsight, type MonthlyInsightSections } from "@/lib/monthly-insight";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type TopLancamento = {
  description: string;
  amount: number;
  categoryName: string | null;
  cardName: string | null;
};
export type CategoriaValor = { nome: string; valor: number };
export type SaldoDia = { day: number; acumulado: number };
export type Alerta = { text: string; categoria: string } | null;

export type FullMonthInsight = MonthlyInsightSections & {
  topLancamentos: TopLancamento[];
  categoriasChart: CategoriaValor[];
  dailySaldo: SaldoDia[];
  alerta: Alerta;
};

type RawRow = {
  type: "despesa" | "receita";
  amount: number;
  description: string;
  categories: { name: string } | null;
  entry_date: string;
  card_invoice_id: string | null;
  investment_goal_id: string | null;
};

/**
 * Versão funda da análise do mês: reaproveita generatePartialInsight pros 5
 * blocos de sempre (resumo/categorias/metas/comparação/sugestão) e soma os
 * 5 maiores lançamentos nomeados (incluindo os de dentro de uma fatura), o
 * gasto por categoria completo, o saldo dia a dia, e um alerta quando uma
 * categoria fugiu bastante da própria média — só quando fizer sentido, não
 * força um alerta toda vez. Recurso do Completo, sempre sob demanda (quem
 * chama decide o momento, nunca roda sozinha).
 */
export async function generateFullMonthInsight(
  supabase: SupabaseClient,
  userId: string,
  salaryOnly: boolean,
): Promise<FullMonthInsight | null> {
  const base = await generatePartialInsight(supabase, userId, salaryOnly);
  if (!base) return null;

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstDayKey = toDateKey(firstDay);
  const todayKey = toDateKey(today);

  const paidDateByInvoiceId = await fetchPaidInvoiceDates(supabase, userId);
  const paidInvoiceIds = [...paidDateByInvoiceId.keys()];

  let query = supabase
    .from("entries")
    .select("type, amount, description, categories(name), entry_date, card_invoice_id, investment_goal_id")
    .eq("user_id", userId)
    .gte("entry_date", firstDayKey);
  query =
    paidInvoiceIds.length > 0
      ? query.or(`entry_date.lte.${todayKey},card_invoice_id.in.(${paidInvoiceIds.join(",")})`)
      : query.lte("entry_date", todayKey);

  const { data: rawRows } = await query;
  const rows = ((rawRows as unknown as RawRow[]) ?? [])
    .map((r) => ({ ...r, effectiveDate: effectiveDateOf(r, paidDateByInvoiceId) }))
    .filter((r) => r.effectiveDate >= firstDayKey && r.effectiveDate <= todayKey);

  const despesas = rows.filter((r) => r.type === "despesa");
  const despesasSemInvestimento = despesas.filter((d) => !d.investment_goal_id);

  // Nome do cartão de cada fatura envolvida, pra nomear os itens de dentro
  // dela igual qualquer outro lançamento (ex: "Sofá 3/10", não "Fatura").
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

  // Saldo dia a dia: líquido acumulado dentro do período (começa em 0, não
  // é o saldo bancário total) — mostra o formato do mês, não o valor absoluto.
  const byDay = new Map<number, number>();
  for (const r of rows) {
    const day = dayOfMonth(r.effectiveDate);
    const signed = r.type === "receita" ? r.amount : -r.amount;
    byDay.set(day, (byDay.get(day) ?? 0) + signed);
  }
  const lastDay = today.getDate();
  let running = 0;
  const dailySaldo: SaldoDia[] = [];
  for (let day = 1; day <= lastDay; day++) {
    running += byDay.get(day) ?? 0;
    dailySaldo.push({ day, acumulado: Math.round(running * 100) / 100 });
  }

  const alerta = await detectAlerta(supabase, userId, firstDay, categoriasChart);

  return { ...base, topLancamentos, categoriasChart, dailySaldo, alerta };
}

/**
 * Compara o gasto de cada categoria nesse mês com a média dela mesma nos 3
 * meses fechados anteriores (mesma lógica de anomalia já usada pra fatura
 * acima da média) — só gera alerta quando algo realmente destoa, e cita a
 * categoria que mais destoou entre as que estouraram.
 */
async function detectAlerta(
  supabase: SupabaseClient,
  userId: string,
  firstDay: Date,
  categoriasChart: CategoriaValor[],
): Promise<Alerta> {
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

  let best: { categoria: string; valor: number; media: number; ratio: number } | null = null;
  for (const { nome, valor } of categoriasChart) {
    const pastAmounts = pastMonthKeys
      .map((mk) => totalsByMonthCategory.get(`${mk}|${nome}`) ?? 0)
      .filter((v) => v > 0);
    const result = checkAmountAnomaly(valor, pastAmounts);
    if (!result.isAnomalous) continue;
    const ratio = valor / result.average;
    if (!best || ratio > best.ratio) {
      best = { categoria: nome, valor, media: result.average, ratio };
    }
  }
  if (!best) return null;

  const ai = await extractFromText<{ alerta: string }>(
    `Categoria: ${best.categoria}. Gasto nesse mês: ${currency(best.valor)}. Média dos últimos meses: ${currency(best.media)}.`,
    `Escreva 1 frase curta em português do Brasil, tom caloroso e prático (nunca de bronca ou julgamento), avisando que essa categoria fugiu do padrão esse mês, com uma sugestão simples do que fazer. Pode citar os valores em R$ exatamente como estão nos dados, nunca invente outro número.`,
    { type: Type.OBJECT, properties: { alerta: { type: Type.STRING } }, required: ["alerta"] },
  );

  return { text: ai.alerta, categoria: best.categoria };
}
