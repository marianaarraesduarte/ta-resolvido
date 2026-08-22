"use server";

import { createClient } from "@/lib/supabase/server";
import { toDateKey } from "@/lib/date";

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

export async function createInvestmentGoal(
  name: string,
): Promise<{ id: string; name: string; percent: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Digite um nome pra meta.");

  const { data, error } = await supabase
    .from("investment_goals")
    .insert({ user_id: user.id, name: trimmed, percent: 0 })
    .select("id, name, percent")
    .single();

  if (error) throw new Error("Não deu pra criar essa meta agora.");
  return data;
}

export async function renameInvestmentGoal(id: string, name: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Digite um nome pra meta.");

  const { error } = await supabase
    .from("investment_goals")
    .update({ name: trimmed })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error("Não deu pra salvar agora.");
}

export async function deleteInvestmentGoal(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { error } = await supabase
    .from("investment_goals")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error("Não deu pra excluir essa meta agora.");
}

export async function setGoalPercent(goalId: string, percent: number): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  const { error } = await supabase
    .from("investment_goals")
    .update({ percent: clamped })
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) throw new Error("Não deu pra salvar agora.");
}

export async function confirmGoalInvestment(
  goalId: string,
  goalName: string,
  amount: number,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  if (!amount || amount <= 0) throw new Error("Defina uma % maior que zero antes de confirmar.");

  const { error } = await supabase.from("entries").insert({
    user_id: user.id,
    type: "despesa",
    amount,
    description: `Investimento — ${goalName}`,
    entry_date: toDateKey(new Date()),
    source: "manual",
    investment_goal_id: goalId,
  });

  if (error) throw new Error("Não deu pra confirmar agora.");
}

export async function unconfirmGoalInvestment(goalId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const { error } = await supabase
    .from("entries")
    .delete()
    .eq("user_id", user.id)
    .eq("investment_goal_id", goalId)
    .gte("entry_date", toDateKey(firstDay))
    .lte("entry_date", toDateKey(lastDay));

  if (error) throw new Error("Não deu pra desmarcar agora.");
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
