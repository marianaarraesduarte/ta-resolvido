import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { toDateKey } from "@/lib/date";
import { MetasBody } from "./metas-body";
import { Upsell } from "../upsell";

type GoalKind = "liberdade_financeira" | "longo_prazo" | "curto_prazo";
type ReceitaRow = { amount: number; income_type: string | null };
type GoalRow = { kind: GoalKind; percent: number };
type ReserveRow = { id: string; name: string; target_amount: number; saved_amount: number };

const GOAL_KINDS: GoalKind[] = ["liberdade_financeira", "longo_prazo", "curto_prazo"];
const GOAL_LABELS: Record<GoalKind, string> = {
  liberdade_financeira: "Liberdade financeira",
  longo_prazo: "Longo prazo",
  curto_prazo: "Curto prazo",
};

export default async function MetasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const header = (
    <div className="mb-5 flex items-center gap-2.5">
      <Link
        href="/app"
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
      >
        <ChevronLeft size={18} />
      </Link>
      <div className="font-display text-xl font-bold text-brand-ink">Metas e reservas</div>
    </div>
  );

  const { data: planRow } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  if (planRow?.plan !== "completo") {
    return (
      <div className="flex justify-center px-3 py-7">
        <div className="w-full max-w-sm">
          {header}
          <Upsell feature="Metas e reservas" />
        </div>
      </div>
    );
  }

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const [
    { data: profile },
    { data: receitasData },
    { data: goalsData },
    { data: reservesData },
    { data: confirmedData },
  ] = await Promise.all([
    supabase.from("profiles").select("income_basis").eq("id", user.id).single(),
    supabase
      .from("entries")
      .select("amount, income_type")
      .eq("user_id", user.id)
      .eq("type", "receita")
      .gte("entry_date", toDateKey(firstDay))
      .lte("entry_date", toDateKey(lastDay)),
    supabase.from("goals").select("kind, percent").eq("user_id", user.id),
    supabase
      .from("reserves")
      .select("id, name, target_amount, saved_amount")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("entries")
      .select("description")
      .eq("user_id", user.id)
      .eq("type", "despesa")
      .gte("entry_date", toDateKey(firstDay))
      .lte("entry_date", toDateKey(lastDay))
      .in(
        "description",
        GOAL_KINDS.map((kind) => `Investimento — ${GOAL_LABELS[kind]}`),
      ),
  ]);

  const receitas = (receitasData as ReceitaRow[] | null) ?? [];
  const receitaAll = receitas.reduce((sum, r) => sum + r.amount, 0);
  const receitaSalaryOnly = receitas
    .filter((r) => r.income_type === "salario")
    .reduce((sum, r) => sum + r.amount, 0);

  const goalsByKind = new Map<GoalKind, number>();
  for (const g of (goalsData as GoalRow[] | null) ?? []) {
    goalsByKind.set(g.kind, g.percent);
  }
  const goals = GOAL_KINDS.map((kind) => ({ kind, percent: goalsByKind.get(kind) ?? 0 }));

  const confirmedDescriptions = new Set((confirmedData ?? []).map((e) => e.description));
  const confirmedKinds = GOAL_KINDS.filter((kind) =>
    confirmedDescriptions.has(`Investimento — ${GOAL_LABELS[kind]}`),
  );

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        {header}

        <MetasBody
          incomeBasis={(profile?.income_basis as "all" | "salary_only") ?? "all"}
          receitaAll={receitaAll}
          receitaSalaryOnly={receitaSalaryOnly}
          goals={goals}
          confirmedKinds={confirmedKinds}
          reserves={(reservesData as ReserveRow[] | null) ?? []}
        />
      </div>
    </div>
  );
}
