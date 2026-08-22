import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { monthLabel, toDateKey } from "@/lib/date";
import { getSelectedMonthKey } from "@/lib/month-cookie";
import { resolveViewedMonth } from "@/lib/viewed-month";
import { currency } from "@/lib/tokens";
import { namesMatch } from "@/lib/text-match";
import { clearMonthSelection, goToMonth } from "../month-actions";
import { MonthPicker } from "../month-picker";
import { FixedExpensesSection } from "./fixed-expenses-section";
import { EntriesList, type CardInvoiceRow } from "./entries-list";

type DespesaRow = {
  id: string;
  description: string;
  amount: number;
  entry_date: string;
  payment_method: "conta" | "cartao";
  category_id: string | null;
  card_invoice_id: string | null;
  categories: { name: string; icon: string | null } | null;
};

type FixedExpenseRow = { id: string; name: string; expected_amount: number };
type CardInvoiceDbRow = { id: string; invoice_date: string };

export default async function ResumoPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { mes } = await searchParams;
  const viewed = resolveViewedMonth(mes, await getSelectedMonthKey());
  const { firstDay, lastDay, isCurrentMonth, prevMonthKey, nextMonthKey } = viewed;
  const viewedFirstDay = firstDay;

  const [{ data }, { data: fixedExpensesData }, { data: categoriesData }, { data: invoicesData }] =
    await Promise.all([
      supabase
        .from("entries")
        .select(
          "id, description, amount, entry_date, payment_method, category_id, card_invoice_id, categories(name, icon)",
        )
        .eq("user_id", user.id)
        .eq("type", "despesa")
        .gte("entry_date", toDateKey(firstDay))
        .lte("entry_date", toDateKey(lastDay))
        .order("entry_date", { ascending: false }),
      supabase
        .from("fixed_expenses")
        .select("id, name, expected_amount")
        .eq("user_id", user.id)
        .order("name", { ascending: true }),
      supabase.from("categories").select("id, name").eq("user_id", user.id).order("name"),
      supabase
        .from("card_invoices")
        .select("id, invoice_date")
        .eq("user_id", user.id)
        .gte("invoice_date", toDateKey(firstDay))
        .lte("invoice_date", toDateKey(lastDay)),
    ]);

  const allDespesas = (data as unknown as DespesaRow[]) ?? [];
  const total = allDespesas.reduce((sum, d) => sum + d.amount, 0);

  const fixedExpenses = (fixedExpensesData as FixedExpenseRow[] | null) ?? [];
  const paidById: Record<string, { description: string; amount: number } | null> = {};
  for (const fe of fixedExpenses) {
    const match = allDespesas.find((d) => namesMatch(fe.name, d.description));
    paidById[fe.id] = match ? { description: match.description, amount: match.amount } : null;
  }

  const pendingFixedExpenses = fixedExpenses.filter((fe) => !paidById[fe.id]);
  const pendingTotal = pendingFixedExpenses.reduce((sum, fe) => sum + fe.expected_amount, 0);
  const pendingCount = pendingFixedExpenses.length;

  // Compras no cartão aparecem agrupadas numa fatura só (igual na régua),
  // não espalhadas na lista — por isso ficam de fora de `despesas`.
  const despesas = allDespesas.filter((d) => !d.card_invoice_id);
  const cardInvoices: CardInvoiceRow[] = ((invoicesData as CardInvoiceDbRow[] | null) ?? []).map(
    (invoice) => {
      const items = allDespesas
        .filter((d) => d.card_invoice_id === invoice.id)
        .map((d) => ({ id: d.id, description: d.description, amount: d.amount }));
      return {
        id: invoice.id,
        invoiceDate: invoice.invoice_date,
        total: items.reduce((sum, item) => sum + item.amount, 0),
        items,
      };
    },
  );

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <div className={isCurrentMonth ? "mb-5 flex items-center gap-2.5" : "mb-1.5 flex items-center gap-2.5"}>
          <Link
            href="/app"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
          >
            <ChevronLeft size={18} />
          </Link>
          <MonthPicker
            path="/app/resumo"
            monthName={monthLabel(viewedFirstDay)}
            viewedYear={viewedFirstDay.getFullYear()}
            viewedMonth={viewedFirstDay.getMonth()}
            size="sm"
          />
          <form action={goToMonth.bind(null, "/app/resumo", prevMonthKey)}>
            <button
              type="submit"
              aria-label="Mês anterior"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
            >
              <ChevronLeft size={16} />
            </button>
          </form>
          <form action={goToMonth.bind(null, "/app/resumo", nextMonthKey)}>
            <button
              type="submit"
              aria-label="Próximo mês"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
            >
              <ChevronRight size={16} />
            </button>
          </form>
        </div>
        {!isCurrentMonth && (
          <form action={clearMonthSelection.bind(null, "/app/resumo")}>
            <button
              type="submit"
              className="mb-5 text-[12px] font-medium text-brand-ink-soft underline underline-offset-2"
            >
              Voltar pro mês atual
            </button>
          </form>
        )}

        <FixedExpensesSection
          fixedExpenses={fixedExpenses}
          paidById={paidById}
          pendingTotal={pendingTotal}
          pendingCount={pendingCount}
        />

        <div className="mb-5 flex items-center justify-between rounded-2xl border border-brand-line bg-brand-card px-5 py-[18px]">
          <div>
            <div className="text-[13px] text-brand-ink-soft">Total do mês</div>
            <div className="font-display text-2xl font-bold text-brand-ink">
              {currency(total)}
            </div>
          </div>
          <div className="text-right text-[12.5px] leading-snug text-brand-ink-soft">
            {allDespesas.length} {allDespesas.length === 1 ? "gasto" : "gastos"}
            <br />
            marcados
          </div>
        </div>

        <EntriesList entries={despesas} categories={categoriesData ?? []} cardInvoices={cardInvoices} />
      </div>
    </div>
  );
}
