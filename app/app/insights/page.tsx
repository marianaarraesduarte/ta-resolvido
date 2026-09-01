import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { monthLabel, toDateKey } from "@/lib/date";
import type { MonthlyInsightSections } from "@/lib/monthly-insight";
import { calculateSaldo } from "@/lib/saldo";
import { InsightThread } from "./insight-thread";
import { PartialInsightButton } from "./partial-insight-button";
import { Upsell } from "../upsell";

// A análise mensal também passa pelo Gemini — mesmo motivo do maxDuration
// em app/app/novo/page.tsx.
export const maxDuration = 60;

type InsightRow = {
  id: string;
  month_start: string;
  sections: MonthlyInsightSections;
  read_at: string | null;
};

export default async function InsightsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const header = (
    <div className="mb-5 flex items-center gap-2.5">
      <Link
        href="/app/mais"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
      >
        <ChevronLeft size={18} />
      </Link>
      <div className="font-display text-xl font-bold text-brand-ink">Comentário do mês</div>
    </div>
  );

  const { data: planRow } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  if (planRow?.plan !== "completo") {
    return (
      <div className="flex justify-center px-3 py-7">
        <div className="w-full max-w-sm">
          {header}
          <Upsell feature="Comentário do mês" />
        </div>
      </div>
    );
  }

  const [{ data }, { data: balanceProfile }] = await Promise.all([
    supabase
      .from("monthly_insights")
      .select("id, month_start, sections, read_at")
      .eq("user_id", user.id)
      .order("month_start", { ascending: false }),
    supabase
      .from("profiles")
      .select("initial_balance, initial_balance_date, income_basis")
      .eq("id", user.id)
      .single(),
  ]);

  const insights = (data as InsightRow[] | null) ?? [];

  const unreadIds = insights.filter((i) => !i.read_at).map((i) => i.id);
  if (unreadIds.length > 0) {
    await supabase
      .from("monthly_insights")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds);
  }

  // Saldo total dá contexto pro "sobrou/faltou no mês" (que só olha aquele
  // mês) — busca todas as entradas desde o saldo inicial até o fim do mês
  // mais recente com análise, uma vez só, e acumula por mês a partir daí.
  const salaryOnly = balanceProfile?.income_basis === "salary_only";
  const initialBalance = balanceProfile?.initial_balance ?? 0;
  const initialBalanceDate = balanceProfile?.initial_balance_date ?? "1900-01-01";

  const saldoEntriesByInsightId = new Map<string, number>();
  if (insights.length > 0) {
    const latestMonthStart = new Date(`${insights[0].month_start}T00:00:00`);
    const latestMonthEnd = toDateKey(
      new Date(latestMonthStart.getFullYear(), latestMonthStart.getMonth() + 1, 0),
    );
    const { data: balanceEntries } = await supabase
      .from("entries")
      .select("type, amount, income_type, entry_date")
      .eq("user_id", user.id)
      .gte("entry_date", initialBalanceDate)
      .lte("entry_date", latestMonthEnd);

    const rows = balanceEntries ?? [];
    for (const insight of insights) {
      const monthStart = new Date(`${insight.month_start}T00:00:00`);
      const monthEnd = toDateKey(new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0));
      const relevant = rows.filter((e) => e.entry_date <= monthEnd);
      saldoEntriesByInsightId.set(
        insight.id,
        calculateSaldo(relevant, { initialBalance, salaryOnly }),
      );
    }
  }

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        {header}

        <PartialInsightButton />

        {insights.length === 0 ? (
          <div className="rounded-2xl bg-brand-card p-5">
            <div className="text-[15.5px] font-medium leading-snug text-brand-ink">
              Nada por aqui ainda.
            </div>
            <div className="mt-1.5 text-[13.5px] leading-snug text-brand-ink-soft">
              Assim que fechar um mês com gastos marcados, a gente escreve um comentário rápido
              sobre como foi.
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {insights.map((insight) => {
              const date = new Date(`${insight.month_start}T00:00:00`);
              return (
                <div key={insight.id}>
                  <div className="mb-2.5 text-[13px] font-bold text-brand-ink-soft">
                    {monthLabel(date)}
                  </div>
                  <InsightThread
                    sections={insight.sections}
                    saldoAtMonthEnd={saldoEntriesByInsightId.get(insight.id) ?? 0}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
