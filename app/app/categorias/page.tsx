import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { monthLabel, toDateKey } from "@/lib/date";
import { getSelectedMonthKey } from "@/lib/month-cookie";
import { resolveViewedMonth } from "@/lib/viewed-month";
import { currency } from "@/lib/tokens";
import { clearMonthSelection, goToMonth } from "../month-actions";
import { MonthPicker } from "../month-picker";
import { CategoryList, type CategoryTotal } from "./category-list";

type DespesaRow = {
  id: string;
  description: string;
  amount: number;
  entry_date: string;
  category_id: string | null;
  categories: { name: string; icon: string | null } | null;
};

export default async function CategoriasPage({
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

  const { data } = await supabase
    .from("entries")
    .select("id, description, amount, entry_date, category_id, categories(name, icon)")
    .eq("user_id", user.id)
    .eq("type", "despesa")
    .gte("entry_date", toDateKey(firstDay))
    .lte("entry_date", toDateKey(lastDay))
    .order("entry_date", { ascending: false });

  const despesas = (data as unknown as DespesaRow[]) ?? [];

  const totalsByCategory = new Map<string, CategoryTotal>();
  for (const d of despesas) {
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

  const ordered = Array.from(totalsByCategory.values()).sort((a, b) => b.total - a.total);
  const total = ordered.reduce((sum, c) => sum + c.total, 0);

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
            path="/app/categorias"
            monthName={monthLabel(viewedFirstDay)}
            viewedYear={viewedFirstDay.getFullYear()}
            viewedMonth={viewedFirstDay.getMonth()}
            size="sm"
          />
          <form action={goToMonth.bind(null, "/app/categorias", prevMonthKey)}>
            <button
              type="submit"
              aria-label="Mês anterior"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
            >
              <ChevronLeft size={16} />
            </button>
          </form>
          <form action={goToMonth.bind(null, "/app/categorias", nextMonthKey)}>
            <button
              type="submit"
              aria-label="Próximo mês"
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
            >
              <ChevronRight size={16} />
            </button>
          </form>
          <Link
            href="/app/config/categorias"
            aria-label="Editar categorias"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-card text-brand-ink-soft"
          >
            <Pencil size={16} />
          </Link>
        </div>
        {!isCurrentMonth && (
          <form action={clearMonthSelection.bind(null, "/app/categorias")}>
            <button
              type="submit"
              className="mb-5 text-[12px] font-medium text-brand-ink-soft underline underline-offset-2"
            >
              Voltar pro mês atual
            </button>
          </form>
        )}

        {ordered.length === 0 ? (
          <div className="rounded-2xl border border-brand-line bg-brand-card p-5">
            <div className="text-[15.5px] font-medium leading-snug text-brand-ink">
              Nada marcado ainda esse mês.
            </div>
            <div className="mt-1.5 text-[13.5px] leading-snug text-brand-ink-soft">
              Assim que você marcar um gasto, ele aparece aqui por categoria.
            </div>
          </div>
        ) : (
          <>
            <CategoryList categories={ordered} total={total} />

            <div className="flex items-center justify-between px-1 pt-4">
              <span className="text-[13px] text-brand-ink-soft">Total do mês</span>
              <span className="font-display text-base font-bold text-brand-ink">
                {currency(total)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
