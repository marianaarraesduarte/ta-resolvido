"use server";

import { createClient } from "@/lib/supabase/server";
import { generatePartialInsight, type MonthlyInsightSections } from "@/lib/monthly-insight";

export async function fetchPartialInsight(): Promise<MonthlyInsightSections | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
  if (profile?.plan !== "completo") throw new Error("Recurso do plano Completo.");

  try {
    return await generatePartialInsight(supabase, user.id);
  } catch {
    throw new Error("Não deu pra analisar agora. Tenta de novo em instantes.");
  }
}
