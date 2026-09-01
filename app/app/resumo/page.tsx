import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { monthLabel, toDateKey } from "@/lib/date";
import { getSelectedMonthKey } from "@/lib/month-cookie";
import { resolveViewedMonth } from "@/lib/viewed-month";
import { currency } from "@/lib/tokens";
import { namesMatch } from "@/lib/text-match";
import { clearMonthSelection, goToMonth } from "../month-actions";
import { MonthStrip } from "../month-strip";
import { FixedExpensesSection } from "./fixed-expenses-section";
import { type CardInvoiceRow } from "./entries-list";
import { GastosView } from "./gastos-view";
import type { CategoryTotal } from "../categorias/category-list";

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
type CardInvoiceDbRow = {
  id: string;
  invoice_date: string;
  card_id: string | null;
  paid_at: string | null;
  cards: { name: string; color: string } | null;
};

export default async function ResumoPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; view?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { mes, view } = await searchParams;
  const viewed = resolveViewedMonth(mes, await getSelectedMonthKey());
  const { firstDay, lastDay, isCurrentMonth, prevMonthKey, nextMonthKey } = viewed;
  const viewedFirstDay = firstDay;

  const [
    { data },
    { data: fixedExpensesData },
    { data: categoriesData },
    { data: invoicesData },
    { data: allCardsData },
  ] = await Promise.all([
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
      .select("id, invoice_date, card_id, paid_at, cards(name, color)")
      .eq("user_id", user.id)
      .gte("invoice_date", toDateKey(firstDay))
      .lte("invoice_date", toDateKey(lastDay)),
    supabase.from("cards").select("id, name, color").eq("user_id", user.id).order("name"),
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
  // não espalhadas na lista por data — mas continuam contando na quebra por
  // categoria normalmente, cada compra na sua categoria.
  const despesas = allDespesas.filter((d) => !d.card_invoice_id);
  const cardInvoices: CardInvoiceRow[] = ((invoicesData as CardInvoiceDbRow[] | null) ?? []).map(
    (invoice) => {
      const items = allDespesas
        .filter((d) => d.card_invoice_id === invoice.id)
        .map((d) => ({
          id: d.id,
          description: d.description,
          amount: d.amount,
          categoryName: d.categories?.name ?? null,
        }));
      return {
        id: invoice.id,
        invoiceDate: invoice.invoice_date,
        total: items.reduce((sum, item) => sum + item.amount, 0),
        items,
        cardId: invoice.card_id,
        cardName: invoice.cards?.name ?? null,
        cardColor: invoice.cards?.color ?? null,
        paidAt: invoice.paid_at,
      };
    },
  );

  const totalsByCategory = new Map<string, CategoryTotal>();
  for (const d of allDespesas) {
    const key = d.category_id ?? "sem-categoria";
    const existing = totalsByCategory.get(key);
    const item = { id: d.id, description: d.description, amount: d.amount };
    if (existing) {
      existing.total += d.amount;
      existing.items.push(item);
    } else {
      totalsByCategory.set(key, {
        key,
        name: d.categories?.name ?? "Sem categoria",
        icon: d.categories?.icon ?? null,
        total: d.amount,
        items: [item],
      });
    }
  }
  const categoryTotals = Array.from(totalsByCategory.values()).sort((a, b) => b.total - a.total);

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <div className="mb-2.5 flex items-center justify-between">
          <Link
            href="/app"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
          >
            <ChevronLeft size={18} />
          </Link>
          <Link
            href="/app/config/categorias"
            aria-label="Editar categorias"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-card text-brand-ink-soft"
          >
            <Pencil size={16} />
          </Link>
        </div>
        <div className={isCurrentMonth ? "mb-5" : "mb-1.5"}>
          <MonthStrip
            path="/app/resumo"
            monthName={monthLabel(viewedFirstDay)}
            viewedYear={viewedFirstDay.getFullYear()}
            viewedMonth={viewedFirstDay.getMonth()}
          />
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

        <div className="mb-5 flex items-center gap-2.5">
          <div className="w-1 self-stretch rounded-full bg-brand-plum" />
          <div>
            <div className="text-[13px] text-brand-ink-soft">Total do mês</div>
            <div className="font-display text-[26px] font-bold leading-none text-brand-ink [font-variant-numeric:tabular-nums]">
              {currency(total)}
            </div>
            <div className="mt-1 text-[12px] text-brand-ink-soft">
              {allDespesas.length} {allDespesas.length === 1 ? "gasto" : "gastos"} ·{" "}
              {categoryTotals.length} {categoryTotals.length === 1 ? "categoria" : "categorias"}
            </div>
          </div>
        </div>

        <FixedExpensesSection
          fixedExpenses={fixedExpenses}
          paidById={paidById}
          pendingTotal={pendingTotal}
          pendingCount={pendingCount}
        />

        <GastosView
          entries={despesas}
          categories={categoriesData ?? []}
          cardInvoices={cardInvoices}
          cards={allCardsData ?? []}
          categoryTotals={categoryTotals}
          initialView={view === "categoria" ? "categoria" : "data"}
        />
      </div>
    </div>
  );
}
