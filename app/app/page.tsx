import { createClient } from "@/lib/supabase/server";
import { daysInMonth, monthLabel, toDateKey } from "@/lib/date";
import { comparePeriods, periodComparisonSentence, type SpendEntry } from "@/lib/period-comparison";
import { MonthRuler, type CardInvoiceSummary, type Entry } from "./month-ruler";

type EntryWithCategory = Entry & { categories: { name: string } | null };

export default async function AppHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Mesmo intervalo de dias (1 até hoje), mas no mês passado — pra comparar
  // "quanto eu já gastei" com "quanto eu já tinha gastado nessa altura do mês
  // passado". min() porque o mês passado pode ter menos dias (ex: hoje dia
  // 31, mês passado só foi até dia 30 ou 28).
  const lastMonthFirstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastPeriodEndDay = Math.min(today.getDate(), daysInMonth(lastMonthFirstDay));
  const lastPeriodEnd = new Date(today.getFullYear(), today.getMonth() - 1, lastPeriodEndDay);

  const [{ data: entriesData }, { data: cardInvoicesData }, { data: lastPeriodData }] =
    await Promise.all([
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
        .select("id, invoice_date")
        .eq("user_id", user.id)
        .gte("invoice_date", toDateKey(firstDay))
        .lte("invoice_date", toDateKey(lastDay)),
      supabase
        .from("entries")
        .select("amount, categories(name)")
        .eq("user_id", user.id)
        .eq("type", "despesa")
        .gte("entry_date", toDateKey(lastMonthFirstDay))
        .lte("entry_date", toDateKey(lastPeriodEnd)),
    ]);

  const entriesWithCategory = (entriesData as unknown as EntryWithCategory[]) ?? [];
  const entries = entriesWithCategory as Entry[];

  const todayKey = toDateKey(today);
  const thisPeriod: SpendEntry[] = entriesWithCategory
    .filter((e) => e.type === "despesa" && e.entry_date <= todayKey)
    .map((e) => ({ amount: e.amount, categoryName: e.categories?.name ?? null }));
  const lastPeriod: SpendEntry[] = (
    (lastPeriodData as unknown as { amount: number; categories: { name: string } | null }[]) ?? []
  ).map((e) => ({ amount: e.amount, categoryName: e.categories?.name ?? null }));

  const comparison = comparePeriods(thisPeriod, lastPeriod);
  const comparisonSentence = comparison ? periodComparisonSentence(comparison) : null;

  const cardInvoices: CardInvoiceSummary[] = (cardInvoicesData ?? []).map((invoice) => {
    const items = entries
      .filter((e) => e.card_invoice_id === invoice.id)
      .map((e) => ({ id: e.id, description: e.description, amount: e.amount }));
    return {
      id: invoice.id,
      invoiceDate: invoice.invoice_date,
      total: items.reduce((sum, item) => sum + item.amount, 0),
      items,
    };
  });

  return (
    <MonthRuler
      monthName={monthLabel(today)}
      today={today.getDate()}
      daysInMonth={daysInMonth(today)}
      entries={entries}
      cardInvoices={cardInvoices}
      comparisonSentence={comparisonSentence}
    />
  );
}
