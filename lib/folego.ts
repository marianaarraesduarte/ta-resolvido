import type { createClient } from "@/lib/supabase/server";
import { calculateSaldo } from "@/lib/saldo";
import { namesMatch } from "@/lib/text-match";
import { daysBetween, shortDateLabel, toDateKey } from "@/lib/date";

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

export type UpcomingInvoice = {
  amount: number;
  dayLabel: string;
  daysUntil: number;
};

export type FolegoData = {
  saldoAtual: number;
  fixedPendingTotal: number;
  fixedPendingCount: number;
  fixedPendingTop: { name: string; amount: number } | null;
  invoice: UpcomingInvoice | null;
};

/**
 * Junta saldo atual + o que já se sabe que ainda vai sair (contas fixas não
 * pagas esse mês e a próxima fatura de cartão em aberto) — a base de dados
 * pro card "Fôlego do mês" na home. Só considera a fatura mais próxima com
 * `invoice_date` a partir de hoje; faturas passadas já viraram saldo.
 */
export async function computeFolego(
  supabase: SupabaseClient,
  userId: string,
  today: Date,
): Promise<FolegoData> {
  const todayKey = toDateKey(today);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [
    { data: profile },
    { data: fixedExpensesData },
    { data: monthDespesasData },
    { data: nextInvoiceData },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("income_basis, initial_balance, initial_balance_date")
      .eq("id", userId)
      .single(),
    supabase.from("fixed_expenses").select("id, name, expected_amount").eq("user_id", userId),
    supabase
      .from("entries")
      .select("description, amount")
      .eq("user_id", userId)
      .eq("type", "despesa")
      .gte("entry_date", toDateKey(monthStart))
      .lte("entry_date", toDateKey(monthEnd)),
    supabase
      .from("card_invoices")
      .select("id, invoice_date")
      .eq("user_id", userId)
      .gte("invoice_date", todayKey)
      .order("invoice_date", { ascending: true })
      .limit(1),
  ]);

  const { data: saldoEntriesData } = await supabase
    .from("entries")
    .select("type, amount, income_type")
    .eq("user_id", userId)
    .gte("entry_date", profile?.initial_balance_date ?? "1900-01-01")
    .lte("entry_date", todayKey);

  const saldoAtual = calculateSaldo(saldoEntriesData ?? [], {
    initialBalance: profile?.initial_balance ?? 0,
    salaryOnly: profile?.income_basis === "salary_only",
  });

  const fixedExpenses = (fixedExpensesData as { id: string; name: string; expected_amount: number }[] | null) ?? [];
  const monthDespesas = (monthDespesasData as { description: string; amount: number }[] | null) ?? [];
  const pendingFixedExpenses = fixedExpenses.filter(
    (fe) => !monthDespesas.some((d) => namesMatch(fe.name, d.description)),
  );
  const fixedPendingTotal = pendingFixedExpenses.reduce((sum, fe) => sum + fe.expected_amount, 0);
  const fixedPendingTop = pendingFixedExpenses.reduce<{ name: string; amount: number } | null>(
    (top, fe) => (!top || fe.expected_amount > top.amount ? { name: fe.name, amount: fe.expected_amount } : top),
    null,
  );

  const nextInvoiceRow = ((nextInvoiceData as { id: string; invoice_date: string }[] | null) ?? [])[0];
  let invoice: UpcomingInvoice | null = null;
  if (nextInvoiceRow) {
    const { data: invoiceEntries } = await supabase
      .from("entries")
      .select("amount")
      .eq("card_invoice_id", nextInvoiceRow.id);
    const amount = (invoiceEntries ?? []).reduce((sum, e) => sum + e.amount, 0);
    invoice = {
      amount,
      dayLabel: shortDateLabel(nextInvoiceRow.invoice_date),
      daysUntil: daysBetween(todayKey, nextInvoiceRow.invoice_date),
    };
  }

  return {
    saldoAtual,
    fixedPendingTotal,
    fixedPendingCount: pendingFixedExpenses.length,
    fixedPendingTop,
    invoice,
  };
}
