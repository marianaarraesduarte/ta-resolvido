import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { monthLabel, toDateKey } from "@/lib/date";
import { currency } from "@/lib/tokens";
import { namesMatch } from "@/lib/text-match";
import { FixedExpensesSection } from "./fixed-expenses-section";
import { EntriesList } from "./entries-list";

type DespesaRow = {
  id: string;
  description: string;
  amount: number;
  entry_date: string;
  payment_method: "conta" | "cartao";
  category_id: string | null;
  categories: { name: string; icon: string | null } | null;
};

type FixedExpenseRow = { id: string; name: string; expected_amount: number };

export default async function ResumoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [{ data }, { data: fixedExpensesData }, { data: categoriesData }] = await Promise.all([
    supabase
      .from("entries")
      .select(
        "id, description, amount, entry_date, payment_method, category_id, categories(name, icon)",
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
  ]);

  const despesas = (data as unknown as DespesaRow[]) ?? [];
  const total = despesas.reduce((sum, d) => sum + d.amount, 0);

  const fixedExpenses = (fixedExpensesData as FixedExpenseRow[] | null) ?? [];
  const paidById: Record<string, { description: string; amount: number } | null> = {};
  for (const fe of fixedExpenses) {
    const match = despesas.find((d) => namesMatch(fe.name, d.description));
    paidById[fe.id] = match ? { description: match.description, amount: match.amount } : null;
  }

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

        <FixedExpensesSection fixedExpenses={fixedExpenses} paidById={paidById} />

        <div className="mb-5 flex items-center justify-between rounded-2xl border border-brand-line bg-brand-card px-5 py-[18px]">
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

        <EntriesList entries={despesas} categories={categoriesData ?? []} />
      </div>
    </div>
  );
}
