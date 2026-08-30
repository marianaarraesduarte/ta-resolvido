import { createClient } from "@/lib/supabase/server";
import { daysInMonth, monthLabel, toDateKey } from "@/lib/date";
import { getSelectedMonthKey } from "@/lib/month-cookie";
import { resolveViewedMonth } from "@/lib/viewed-month";
import { comparePeriods, periodComparisonSentence, type SpendEntry } from "@/lib/period-comparison";
import { computeAssistantData, type AssistantData } from "@/lib/assistant-data";
import { computeFrequentExpenses, type FrequentExpense } from "@/lib/frequent-expenses";
import { MonthRuler, type CardInvoiceSummary, type Entry } from "./month-ruler";

type EntryWithCategory = Entry & { categories: { name: string } | null };

export default async function AppHomePage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = new Date();
  const { mes } = await searchParams;
  const viewed = resolveViewedMonth(mes, await getSelectedMonthKey(), today);
  const { firstDay, lastDay, isCurrentMonth, prevMonthKey, nextMonthKey } = viewed;
  const viewedFirstDay = firstDay;

  // Mesmo intervalo de dias (1 até hoje), mas no mês passado — pra comparar
  // "quanto eu já gastei" com "quanto eu já tinha gastado nessa altura do mês
  // passado". min() porque o mês passado pode ter menos dias (ex: hoje dia
  // 31, mês passado só foi até dia 30 ou 28). Só faz sentido pro mês atual.
  const lastMonthFirstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastPeriodEndDay = Math.min(today.getDate(), daysInMonth(lastMonthFirstDay));
  const lastPeriodEnd = new Date(today.getFullYear(), today.getMonth() - 1, lastPeriodEndDay);

  // Janela larga (não o mês em exibição) pra detectar gastos que se repetem
  // com frequência, tipo cafezinho ou Uber — só faz sentido pro mês atual,
  // já que é um atalho pra lançar algo agora.
  const frequentLookbackStart = new Date(today);
  frequentLookbackStart.setDate(frequentLookbackStart.getDate() - 60);

  const [
    { data: entriesData },
    { data: cardInvoicesData },
    { data: lastPeriodData },
    { data: categoriesData },
    { data: recentDespesasData },
    { data: fixedExpensesData },
    { data: allCardsData },
  ] = await Promise.all([
    supabase
      .from("entries")
      .select(
        "id, type, amount, description, entry_date, category_id, income_type, card_invoice_id, categories(name)",
      )
      .eq("user_id", user.id)
      .gte("entry_date", toDateKey(firstDay))
      .lte("entry_date", toDateKey(lastDay))
      .order("entry_date", { ascending: true }),
    supabase
      .from("card_invoices")
      .select("id, invoice_date, card_id, cards(name, color)")
      .eq("user_id", user.id)
      .gte("invoice_date", toDateKey(firstDay))
      .lte("invoice_date", toDateKey(lastDay)),
    isCurrentMonth
      ? supabase
          .from("entries")
          .select("amount, categories(name)")
          .eq("user_id", user.id)
          .eq("type", "despesa")
          .gte("entry_date", toDateKey(lastMonthFirstDay))
          .lte("entry_date", toDateKey(lastPeriodEnd))
      : Promise.resolve({ data: [] }),
    supabase.from("categories").select("id, name").eq("user_id", user.id).order("name"),
    isCurrentMonth
      ? supabase
          .from("entries")
          .select("description, amount, category_id, entry_date")
          .eq("user_id", user.id)
          .eq("type", "despesa")
          .gte("entry_date", toDateKey(frequentLookbackStart))
      : Promise.resolve({ data: [] }),
    isCurrentMonth
      ? supabase.from("fixed_expenses").select("name, expected_amount").eq("user_id", user.id)
      : Promise.resolve({ data: [] }),
    supabase.from("cards").select("id, name, color").eq("user_id", user.id).order("name"),
  ]);

  const entriesWithCategory = (entriesData as unknown as EntryWithCategory[]) ?? [];
  const entries = entriesWithCategory as Entry[];

  let comparisonSentence: string | null = null;
  if (isCurrentMonth) {
    const todayKey = toDateKey(today);
    const thisPeriod: SpendEntry[] = entriesWithCategory
      .filter((e) => e.type === "despesa" && e.entry_date <= todayKey)
      .map((e) => ({ amount: e.amount, categoryName: e.categories?.name ?? null }));
    const lastPeriod: SpendEntry[] = (
      (lastPeriodData as unknown as { amount: number; categories: { name: string } | null }[]) ?? []
    ).map((e) => ({ amount: e.amount, categoryName: e.categories?.name ?? null }));

    const comparison = comparePeriods(thisPeriod, lastPeriod);
    comparisonSentence = comparison ? periodComparisonSentence(comparison) : null;
  }

  const cardInvoices: CardInvoiceSummary[] = (
    (cardInvoicesData as unknown as {
      id: string;
      invoice_date: string;
      card_id: string | null;
      cards: { name: string; color: string } | null;
    }[]) ?? []
  ).map((invoice) => {
    const items = entries
      .filter((e) => e.card_invoice_id === invoice.id)
      .map((e) => ({ id: e.id, description: e.description, amount: e.amount }));
    return {
      id: invoice.id,
      invoiceDate: invoice.invoice_date,
      total: items.reduce((sum, item) => sum + item.amount, 0),
      items,
      cardId: invoice.card_id,
      cardName: invoice.cards?.name ?? null,
      cardColor: invoice.cards?.color ?? null,
    };
  });

  const monthName = monthLabel(viewedFirstDay);
  const assistantData: AssistantData | null = isCurrentMonth
    ? await computeAssistantData(supabase, user.id, today)
    : null;

  const frequentExpenses: FrequentExpense[] = isCurrentMonth
    ? computeFrequentExpenses(recentDespesasData ?? [], fixedExpensesData ?? [])
    : [];

  return (
    <MonthRuler
      monthName={monthName}
      viewedYear={viewedFirstDay.getFullYear()}
      viewedMonth={viewedFirstDay.getMonth()}
      todayDayOfMonth={isCurrentMonth ? today.getDate() : null}
      daysInMonth={daysInMonth(viewedFirstDay)}
      entries={entries}
      cardInvoices={cardInvoices}
      cards={allCardsData ?? []}
      categories={categoriesData ?? []}
      comparisonSentence={comparisonSentence}
      prevMonthKey={prevMonthKey}
      nextMonthKey={nextMonthKey}
      isCurrentMonth={isCurrentMonth}
      assistantData={assistantData}
      frequentExpenses={frequentExpenses}
    />
  );
}
