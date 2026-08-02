"use server";

import { createClient } from "@/lib/supabase/server";

type GoalKind = "liberdade_financeira" | "longo_prazo" | "curto_prazo";

export async function setIncomeBasis(basis: "all" | "salary_only"): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { error } = await supabase
    .from("profiles")
    .update({ income_basis: basis })
    .eq("id", user.id);

  if (error) throw new Error("Não deu pra salvar agora.");
}

export async function setGoalPercent(kind: GoalKind, percent: number): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  const { error } = await supabase
    .from("goals")
    .upsert({ user_id: user.id, kind, percent: clamped }, { onConflict: "user_id,kind" });

  if (error) throw new Error("Não deu pra salvar agora.");
}

export async function createReserve(
  name: string,
  targetAmount: number,
): Promise<{ id: string; name: string; target_amount: number; saved_amount: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const trimmed = name.trim();
  if (!trimmed || !targetAmount || targetAmount <= 0) {
    throw new Error("Preenche nome e valor alvo.");
  }

  const { data, error } = await supabase
    .from("reserves")
    .insert({ user_id: user.id, name: trimmed, target_amount: targetAmount })
    .select("id, name, target_amount, saved_amount")
    .single();

  if (error) throw new Error("Não deu pra criar essa reserva agora.");
  return data;
}

export async function updateReserveProgress(
  id: string,
  savedAmount: number,
  targetAmount: number,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  if (!targetAmount || targetAmount <= 0 || savedAmount < 0) {
    throw new Error("Valores inválidos.");
  }

  const { error } = await supabase
    .from("reserves")
    .update({ saved_amount: savedAmount, target_amount: targetAmount })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error("Não deu pra salvar agora.");
}

export async function deleteReserve(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { error } = await supabase.from("reserves").delete().eq("id", id).eq("user_id", user.id);
  if (error) throw new Error("Não deu pra excluir essa reserva agora.");
}
