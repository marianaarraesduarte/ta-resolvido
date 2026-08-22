import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { monthKey, monthLabel, parseMonthKey, toDateKey } from "@/lib/date";
import { getSelectedMonthKey } from "@/lib/month-cookie";
import { currency } from "@/lib/tokens";
import { iconForCategory } from "@/lib/category-icons";
import { clearMonthSelection, goToMonth } from "../month-actions";
import { MonthPicker } from "../month-picker";

type DespesaRow = {
  amount: number;
  category_id: string | null;
  categories: { name: string; icon: string | null } | null;
};

type CategoryTotal = {
  key: string;
  name: string;
  icon: string | null;
  total: number;
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

  const today = new Date();
  const { mes } = await searchParams;
  const effectiveMes = mes ?? (await getSelectedMonthKey()) ?? undefined;
  const viewedFirstDay = effectiveMes
    ? parseMonthKey(effectiveMes)
    : new Date(today.getFullYear(), today.getMonth(), 1);
  const isCurrentMonth =
    viewedFirstDay.getFullYear() === today.getFullYear() &&
    viewedFirstDay.getMonth() === today.getMonth();

  const firstDay = viewedFirstDay;
  const lastDay = new Date(viewedFirstDay.getFullYear(), viewedFirstDay.getMonth() + 1, 0);
  const prevMonthKey = monthKey(new Date(viewedFirstDay.getFullYear(), viewedFirstDay.getMonth() - 1, 1));
  const nextMonthKey = monthKey(new Date(viewedFirstDay.getFullYear(), viewedFirstDay.getMonth() + 1, 1));

  const { data } = await supabase
    .from("entries")
    .select("amount, category_id, categories(name, icon)")
    .eq("user_id", user.id)
    .eq("type", "despesa")
    .gte("entry_date", toDateKey(firstDay))
    .lte("entry_date", toDateKey(lastDay));

  const despesas = (data as unknown as DespesaRow[]) ?? [];

  const totalsByCategory = new Map<string, CategoryTotal>();
  for (const d of despesas) {
    const key = d.category_id ?? "sem-categoria";
    const existing = totalsByCategory.get(key);
    if (existing) {
      existing.total += d.amount;
    } else {
      totalsByCategory.set(key, {
        key,
        name: d.categories?.name ?? "Sem categoria",
        icon: d.categories?.icon ?? null,
        total: d.amount,
      });
    }
  }

  const ordered = Array.from(totalsByCategory.values()).sort((a, b) => b.total - a.total);
  const total = ordered.reduce((sum, c) => sum + c.total, 0);
  const maior = ordered[0]?.total ?? 0;

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
            monthName={
              isCurrentMonth
                ? monthLabel(viewedFirstDay)
                : `${monthLabel(viewedFirstDay)} de ${viewedFirstDay.getFullYear()}`
            }
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
            <div className="overflow-hidden rounded-2xl border border-brand-line bg-brand-card">
              {ordered.map((c, i) => {
                const Icon = iconForCategory(c.icon);
                const pct = total > 0 ? Math.round((c.total / total) * 100) : 0;
                const barPct = maior > 0 ? Math.round((c.total / maior) * 100) : 0;
                return (
                  <div
                    key={c.key}
                    className={
                      i === 0
                        ? "px-4 py-3.5"
                        : "border-t border-brand-bg px-4 py-3.5"
                    }
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[11px] bg-brand-bg">
                        <Icon size={15} className="text-brand-ink" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[14.5px] font-medium text-brand-ink">
                          {c.name}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="font-display text-[15px] font-bold text-brand-ink">
                          {currency(c.total)}
                        </div>
                        <div className="text-[11px] text-brand-ink-soft">{pct}% do mês</div>
                      </div>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-brand-bg">
                      <div
                        className="h-full rounded-full bg-brand-ink opacity-75"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

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
