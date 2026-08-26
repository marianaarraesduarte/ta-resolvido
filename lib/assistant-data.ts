import type { createClient } from "@/lib/supabase/server";
import { shortDateLabel, toDateKey } from "@/lib/date";
import { namesMatch } from "@/lib/text-match";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type PendingItem = { name: string; amount: number };
export type LimiteLine = { name: string; icon: string | null; spent: number; limit: number };
export type TopCategoria = { name: string; amount: number };

export type AssistantData = {
  isCompleto: boolean;
  setupChecklist: { saldoInicial: boolean; contasFixas: boolean; limites: boolean };
  limitesLines: LimiteLine[];
  topCategorias: TopCategoria[];
  pendingItems: PendingItem[];
  nextInvoice: { amount: number; dayLabel: string } | null;
};

/**
 * Escolhe uma frase de abertura de uma lista, trocando a cada 3 dias — só
 * pra não repetir sempre a mesma e cansar. Nunca é previsão, só rotação.
 */
export function pickTeaser(pool: string[], dayOfMonth: number): string {
  const idx = Math.floor((dayOfMonth - 1) / 3) % pool.length;
  return pool[idx];
}

type CategoryRow = { id: string; name: string; icon: string | null; monthly_limit: number | null };
type DespesaRow = { amount: number; category_id: string | null; description: string };
type FixedExpenseRow = { id: string; name: string; expected_amount: number };
type InvoiceRow = { id: string; invoice_date: string };

/**
 * Junta o que o assistente do mês precisa responder — tudo já calculado no
 * servidor a partir de dados reais (nunca inventa nem prevê nada sobre o
 * futuro). Reaproveita exatamente a mesma lógica das telas de Limites e
 * Quanto gastei, só resumida.
 */
export async function computeAssistantData(
  supabase: SupabaseClient,
  userId: string,
  today: Date,
): Promise<AssistantData> {
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const todayKey = toDateKey(today);

  const [
    { data: profile },
    { data: categoriesData },
    { data: despesasData },
    { data: fixedExpensesData },
    { data: nextInvoiceData },
  ] = await Promise.all([
    supabase.from("profiles").select("plan, initial_balance_date").eq("id", userId).single(),
    supabase.from("categories").select("id, name, icon, monthly_limit").eq("user_id", userId),
    supabase
      .from("entries")
      .select("amount, category_id, description")
      .eq("user_id", userId)
      .eq("type", "despesa")
      .gte("entry_date", toDateKey(monthStart))
      .lte("entry_date", toDateKey(monthEnd)),
    supabase.from("fixed_expenses").select("id, name, expected_amount").eq("user_id", userId),
    supabase
      .from("card_invoices")
      .select("id, invoice_date")
      .eq("user_id", userId)
      .gte("invoice_date", todayKey)
      .order("invoice_date", { ascending: true })
      .limit(1),
  ]);

  const isCompleto = profile?.plan === "completo";
  const categories = (categoriesData as CategoryRow[] | null) ?? [];
  const despesas = (despesasData as DespesaRow[] | null) ?? [];
  const fixedExpenses = (fixedExpensesData as FixedExpenseRow[] | null) ?? [];

  const spentByCategory = new Map<string, number>();
  for (const d of despesas) {
    if (!d.category_id) continue;
    spentByCategory.set(d.category_id, (spentByCategory.get(d.category_id) ?? 0) + d.amount);
  }

  const withLimit = categories
    .filter((c) => c.monthly_limit != null)
    .map((c) => ({
      name: c.name,
      icon: c.icon,
      spent: spentByCategory.get(c.id) ?? 0,
      limit: c.monthly_limit as number,
    }));

  // Mais perto (ou mais acima) do limite primeiro.
  const limitesLines = [...withLimit]
    .sort((a, b) => (b.spent - b.limit) / b.limit - (a.spent - a.limit) / a.limit)
    .slice(0, 3);

  const categoryNameById = new Map(categories.map((c) => [c.id, c.name] as const));
  const topCategorias = Array.from(spentByCategory.entries())
    .map(([categoryId, amount]) => ({ name: categoryNameById.get(categoryId) ?? "Sem categoria", amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const pendingItems: PendingItem[] = fixedExpenses
    .filter((fe) => !despesas.some((d) => namesMatch(fe.name, d.description)))
    .map((fe) => ({ name: fe.name, amount: fe.expected_amount }));

  const nextInvoiceRow = ((nextInvoiceData as InvoiceRow[] | null) ?? [])[0];
  let nextInvoice: AssistantData["nextInvoice"] = null;
  if (nextInvoiceRow) {
    const { data: invoiceEntries } = await supabase
      .from("entries")
      .select("amount")
      .eq("card_invoice_id", nextInvoiceRow.id);
    nextInvoice = {
      amount: (invoiceEntries ?? []).reduce((sum, e) => sum + e.amount, 0),
      dayLabel: shortDateLabel(nextInvoiceRow.invoice_date),
    };
  }

  return {
    isCompleto,
    setupChecklist: {
      saldoInicial: profile?.initial_balance_date != null,
      contasFixas: fixedExpenses.length > 0,
      limites: withLimit.length > 0,
    },
    limitesLines,
    topCategorias,
    pendingItems,
    nextInvoice,
  };
}
