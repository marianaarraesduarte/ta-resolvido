"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  return { supabase, user };
}

export async function setSeparateByAccount(value: boolean): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({ separate_by_account: value })
    .eq("id", user.id);
  if (error) throw new Error("Não deu pra salvar agora.");
  revalidatePath("/app", "layout");
}

export async function setAccentColor(hex: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({ accent_color: hex })
    .eq("id", user.id);
  if (error) throw new Error("Não deu pra salvar agora.");
  revalidatePath("/app", "layout");
}

export async function setHideGoalsScreen(value: boolean): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({ hide_goals_screen: value })
    .eq("id", user.id);
  if (error) throw new Error("Não deu pra salvar agora.");
  revalidatePath("/app", "layout");
}

export async function setMonthlyInsightsEnabled(value: boolean): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .update({ monthly_insights_enabled: value })
    .eq("id", user.id);
  if (error) throw new Error("Não deu pra salvar agora.");
  revalidatePath("/app", "layout");
}

export async function setInitialBalance(amount: number, date: string): Promise<void> {
  const { supabase, user } = await requireUser();
  if (!date) throw new Error("Escolhe uma data.");
  const { error } = await supabase
    .from("profiles")
    .update({ initial_balance: amount, initial_balance_date: date })
    .eq("id", user.id);
  if (error) throw new Error("Não deu pra salvar agora.");
  revalidatePath("/app", "layout");
}
