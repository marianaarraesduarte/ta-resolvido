"use server";

import { createClient } from "@/lib/supabase/server";
import { generatePartialInsight, type MonthlyInsightSections } from "@/lib/monthly-insight";
import { calculateSaldo } from "@/lib/saldo";
import { toDateKey } from "@/lib/date";

export async function fetchPartialInsight(): Promise<{
  sections: MonthlyInsightSections;
  saldoAtMonthEnd: number;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, income_basis, initial_balance, initial_balance_date")
    .eq("id", user.id)
    .single();
  if (profile?.plan !== "completo") throw new Error("Recurso do plano Completo.");

  const salaryOnly = profile?.income_basis === "salary_only";

  try {
    const sections = await generatePartialInsight(supabase, user.id, salaryOnly);
    if (!sections) return null;

    const { data: entriesData } = await supabase
      .from("entries")
      .select("type, amount, income_type")
      .eq("user_id", user.id)
      .gte("entry_date", profile?.initial_balance_date ?? "1900-01-01")
      .lte("entry_date", toDateKey(new Date()));

    const saldoAtMonthEnd = calculateSaldo(entriesData ?? [], {
      initialBalance: profile?.initial_balance ?? 0,
      salaryOnly,
    });

    return { sections, saldoAtMonthEnd };
  } catch {
    throw new Error("Não deu pra analisar agora. Tenta de novo em instantes.");
  }
}
