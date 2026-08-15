import Link from "next/link";
import { Bell, Settings } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureMonthlyInsight } from "@/lib/monthly-insight";
import { toDateKey } from "@/lib/date";
import { SaldoProvider, type GoalKind } from "@/lib/saldo-context";
import { SaldoBadge } from "./saldo-badge";
import { NavLinks } from "./nav-links";

const GOAL_KINDS: GoalKind[] = ["liberdade_financeira", "longo_prazo", "curto_prazo"];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "onboarding_completed, hide_goals_screen, accent_color, monthly_insights_enabled, income_basis, initial_balance, initial_balance_date",
    )
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  await ensureMonthlyInsight(supabase, user.id, profile?.monthly_insights_enabled ?? true);

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const firstDayKey = toDateKey(firstDay);
  const lastDayKey = toDateKey(lastDay);

  const [{ count: unreadInsights }, { data: entriesData }, { data: goalsData }] =
    await Promise.all([
      supabase
        .from("monthly_insights")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .is("read_at", null),
      supabase
        .from("entries")
        .select("type, amount, income_type, entry_date")
        .eq("user_id", user.id)
        .gte("entry_date", profile?.initial_balance_date ?? "1900-01-01"),
      supabase.from("goals").select("kind, percent").eq("user_id", user.id),
    ]);

  const entries = entriesData ?? [];
  const salaryOnly = profile?.income_basis === "salary_only";
  const isReceita = (e: (typeof entries)[number]) =>
    e.type === "receita" && (!salaryOnly || e.income_type === "salario");
  const isDoMes = (e: (typeof entries)[number]) =>
    e.entry_date >= firstDayKey && e.entry_date <= lastDayKey;

  const receitaAcumulada = entries.filter(isReceita).reduce((sum, e) => sum + e.amount, 0);
  const despesaAcumulada = entries
    .filter((e) => e.type === "despesa")
    .reduce((sum, e) => sum + e.amount, 0);
  const receitaDoMes = entries
    .filter((e) => isReceita(e) && isDoMes(e))
    .reduce((sum, e) => sum + e.amount, 0);

  const goalsByKind = new Map((goalsData ?? []).map((g) => [g.kind as GoalKind, g.percent]));
  const initialGoalPercents = Object.fromEntries(
    GOAL_KINDS.map((kind) => [kind, goalsByKind.get(kind) ?? 0]),
  ) as Record<GoalKind, number>;

  return (
    <SaldoProvider
      saldoInicial={profile?.initial_balance ?? 0}
      receitaAcumulada={receitaAcumulada}
      despesaAcumulada={despesaAcumulada}
      receitaDoMes={receitaDoMes}
      initialGoalPercents={initialGoalPercents}
    >
      <div
        className="min-h-screen bg-brand-bg pb-24"
        style={{ "--accent": profile?.accent_color ?? "#D9A441" } as React.CSSProperties}
      >
        <header className="flex items-center justify-between gap-3.5 px-4 py-4">
          <SaldoBadge />
          <div className="flex flex-shrink-0 items-center gap-3.5">
            <Link
              href="/app/insights"
              aria-label="Análises"
              className="relative text-brand-ink-soft"
            >
              <Bell size={20} />
              {!!unreadInsights && (
                <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                    style={{ background: "var(--accent)" }}
                  />
                  <span
                    className="relative inline-flex h-2.5 w-2.5 rounded-full"
                    style={{ background: "var(--accent)" }}
                  />
                </span>
              )}
            </Link>
            <Link href="/app/config" aria-label="Configurações" className="text-brand-ink-soft">
              <Settings size={22} />
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="text-xs font-medium text-brand-ink-soft underline underline-offset-2"
              >
                Sair
              </button>
            </form>
          </div>
        </header>
        <main>{children}</main>
        <NavLinks hideMetas={profile?.hide_goals_screen ?? false} />
      </div>
    </SaldoProvider>
  );
}
