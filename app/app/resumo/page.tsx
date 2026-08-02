import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { dayOfMonth, monthLabel, toDateKey } from "@/lib/date";
import { currency, levelFor, LEVEL_COLOR } from "@/lib/tokens";
import { iconForCategory } from "@/lib/category-icons";

type DespesaRow = {
  id: string;
  description: string;
  amount: number;
  entry_date: string;
  categories: { name: string; icon: string | null } | null;
};

export default async function ResumoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const { data } = await supabase
    .from("entries")
    .select("id, description, amount, entry_date, categories(name, icon)")
    .eq("user_id", user.id)
    .eq("type", "despesa")
    .gte("entry_date", toDateKey(firstDay))
    .lte("entry_date", toDateKey(lastDay))
    .order("entry_date", { ascending: false });

  const despesas = (data as unknown as DespesaRow[]) ?? [];
  const total = despesas.reduce((sum, d) => sum + d.amount, 0);
  const average = despesas.length > 0 ? total / despesas.length : 0;

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <div className="mb-5 flex items-center gap-2.5">
          <Link
            href="/app"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
          >
            <ChevronLeft size={18} />
          </Link>
          <div className="font-display text-xl font-bold text-brand-ink">
            {monthLabel(today)}
          </div>
        </div>

        <div className="mb-5 flex items-center justify-between rounded-2xl bg-brand-card px-5 py-[18px]">
          <div>
            <div className="text-[13px] text-brand-ink-soft">Total do mês</div>
            <div className="font-display text-2xl font-bold text-brand-ink">
              {currency(total)}
            </div>
          </div>
          <div className="text-right text-[12.5px] leading-snug text-brand-ink-soft">
            {despesas.length} {despesas.length === 1 ? "gasto" : "gastos"}
            <br />
            marcados
          </div>
        </div>

        <div className="mb-2 text-[13px] font-semibold text-brand-ink">Tudo que foi marcado</div>

        {despesas.length === 0 ? (
          <div className="rounded-2xl bg-brand-card p-5">
            <div className="text-[15.5px] font-medium leading-snug text-brand-ink">
              Nada marcado ainda esse mês.
            </div>
            <div className="mt-1.5 text-[13.5px] leading-snug text-brand-ink-soft">
              Assim que você marcar um gasto, ele aparece aqui.
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-brand-card">
            {despesas.map((d, i) => {
              const Icon = iconForCategory(d.categories?.icon);
              const color = LEVEL_COLOR[levelFor(d.amount, average)];
              return (
                <div
                  key={d.id}
                  className={
                    i === 0
                      ? "flex items-center gap-3 px-4 py-3.5"
                      : "flex items-center gap-3 border-t border-brand-bg px-4 py-3.5"
                  }
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-bg">
                    <Icon size={16} className="text-brand-ink" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[14.5px] font-medium text-brand-ink">
                      {d.description}
                    </div>
                    <div className="text-xs text-brand-ink-soft">
                      Dia {dayOfMonth(d.entry_date)}
                    </div>
                  </div>
                  <div
                    className="flex-shrink-0 whitespace-nowrap font-display text-[15px] font-bold"
                    style={{ color }}
                  >
                    {currency(d.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
