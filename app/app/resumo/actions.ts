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

export async function bulkDeleteEntries(ids: string[]): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  if (ids.length === 0) return;

  const { error } = await supabase.from("entries").delete().in("id", ids).eq("user_id", user.id);

  if (error) {
    throw new Error("Não deu pra excluir esses lançamentos agora.");
  }
}

export async function bulkSetCategory(ids: string[], categoryId: string | null): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");
  if (ids.length === 0) return;

  const { error } = await supabase
    .from("entries")
    .update({ category_id: categoryId })
    .in("id", ids)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Não deu pra trocar a categoria agora.");
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
