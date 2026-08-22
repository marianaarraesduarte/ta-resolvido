"use server";

import { createClient } from "@/lib/supabase/server";

export async function createFixedExpense(
  name: string,
  expectedAmount: number,
): Promise<{ id: string; name: string; expected_amount: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const trimmed = name.trim();
  if (!trimmed || !expectedAmount || expectedAmount <= 0) {
    throw new Error("Preenche nome e valor esperado.");
  }

  const { data, error } = await supabase
    .from("fixed_expenses")
    .insert({ user_id: user.id, name: trimmed, expected_amount: expectedAmount })
    .select("id, name, expected_amount")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Você já tem um gasto fixo com esse nome.");
    }
    throw new Error("Não deu pra criar esse gasto fixo agora.");
  }

  return data;
}

export async function updateFixedExpense(
  id: string,
  name: string,
  expectedAmount: number,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const trimmed = name.trim();
  if (!trimmed || !expectedAmount || expectedAmount <= 0) {
    throw new Error("Preenche nome e valor esperado.");
  }

  const { error } = await supabase
    .from("fixed_expenses")
    .update({ name: trimmed, expected_amount: expectedAmount })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Não deu pra salvar agora.");
  }
}

export async function deleteFixedExpense(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { error } = await supabase
    .from("fixed_expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Não deu pra excluir agora.");
  }
}

// Marca um gasto fixo como pago na mão, pra quando a IA não reconhece
// automaticamente — cria um lançamento de verdade (por isso abate do saldo),
// datado do dia informado.
export async function markFixedExpensePaid(
  name: string,
  amount: number,
  entryDate: string,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  if (!amount || amount <= 0) throw new Error("Valor inválido.");

  const { error } = await supabase.from("entries").insert({
    user_id: user.id,
    type: "despesa",
    description: name,
    amount,
    entry_date: entryDate,
    source: "manual",
  });

  if (error) throw new Error("Não deu pra marcar como pago agora.");
}
