import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { toDateKey } from "@/lib/date";
import { calculateSaldo } from "@/lib/saldo";
import { MetasBody } from "./metas-body";
import { Upsell } from "../upsell";

type ReceitaRow = { amount: number; income_type: string | null };
type GoalRow = { id: string; name: string; percent: number };
type ReserveRow = { id: string; name: string; target_amount: number; saved_amount: number };
type SaldoEntryRow = { type: "despesa" | "receita"; amount: number; income_type: string | null };

export default async function MetasPage() {
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
      <div className="font-display text-xl font-bold text-brand-ink">Guardando dinheiro</div>
    </div>
  );

  const { data: planRow } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  if (planRow?.plan !== "completo") {
    return (
      <div className="flex justify-center px-3 py-7">
        <div className="w-full max-w-sm">
          {header}
          <Upsell feature="Guardando dinheiro" />
        </div>
      </div>
    );
  }

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const { data: profile } = await supabase
    .from("profiles")
    .select("income_basis, initial_balance, initial_balance_date")
    .eq("id", user.id)
    .single();

  const [
    { data: receitasData },
    { data: goalsData },
    { data: reservesData },
    { data: confirmedData },
    { data: saldoEntriesData },
  ] = await Promise.all([
    supabase
      .from("entries")
      .select("amount, income_type")
      .eq("user_id", user.id)
      .eq("type", "receita")
      .gte("entry_date", toDateKey(firstDay))
      .lte("entry_date", toDateKey(lastDay)),
    supabase
      .from("investment_goals")
      .select("id, name, percent")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("reserves")
      .select("id, name, target_amount, saved_amount")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("entries")
      .select("investment_goal_id")
      .eq("user_id", user.id)
      .not("investment_goal_id", "is", null)
      .gte("entry_date", toDateKey(firstDay))
      .lte("entry_date", toDateKey(lastDay)),
    supabase
      .from("entries")
      .select("type, amount, income_type")
      .eq("user_id", user.id)
      .gte("entry_date", profile?.initial_balance_date ?? "1900-01-01")
      .lte("entry_date", toDateKey(today)),
  ]);

  const receitas = (receitasData as ReceitaRow[] | null) ?? [];
  const receitaAll = receitas.reduce((sum, r) => sum + r.amount, 0);
  const receitaSalaryOnly = receitas
    .filter((r) => r.income_type === "salario")
    .reduce((sum, r) => sum + r.amount, 0);

  const goals = (goalsData as GoalRow[] | null) ?? [];
  const confirmedGoalIds = new Set(
    ((confirmedData as { investment_goal_id: string | null }[] | null) ?? [])
      .map((e) => e.investment_goal_id)
      .filter((id): id is string => id != null),
  );

  const saldo = calculateSaldo((saldoEntriesData as SaldoEntryRow[] | null) ?? [], {
    initialBalance: profile?.initial_balance ?? 0,
    salaryOnly: profile?.income_basis === "salary_only",
  });

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        {header}

        <MetasBody
          incomeBasis={(profile?.income_basis as "all" | "salary_only") ?? "all"}
          receitaAll={receitaAll}
          receitaSalaryOnly={receitaSalaryOnly}
          goals={goals}
          confirmedGoalIds={[...confirmedGoalIds]}
          reserves={(reservesData as ReserveRow[] | null) ?? []}
          saldo={saldo}
        />
      </div>
    </div>
  );
}
