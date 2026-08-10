import { createClient } from "@/lib/supabase/server";
import { daysInMonth, monthLabel, toDateKey } from "@/lib/date";
import { MonthRuler, type CardInvoiceSummary, type Entry } from "./month-ruler";

export default async function AppHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [{ data: entriesData }, { data: cardInvoicesData }] = await Promise.all([
    supabase
      .from("entries")
      .select("id, type, amount, description, entry_date, category_id, income_type, card_invoice_id")
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
  ]);

  const entries = (entriesData as Entry[]) ?? [];

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
    />
  );
}
