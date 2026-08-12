"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateEntry(
  id: string,
  data: {
    amount: number;
    description: string;
    entry_date: string;
    category_id: string | null;
    income_type: "salario" | "outra" | null;
    account_name: string | null;
  },
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sessão expirada. Atualiza a página e entra de novo.");
  }

  if (!data.amount || data.amount <= 0 || !data.description.trim() || !data.entry_date) {
    throw new Error("Confere os campos antes de salvar.");
  }

  const { error } = await supabase
    .from("entries")
    .update({
      amount: data.amount,
      description: data.description.trim(),
      entry_date: data.entry_date,
      category_id: data.category_id,
      income_type: data.income_type,
      account_name: data.account_name,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Não deu pra salvar essa alteração agora.");
  }
}

export async function deleteEntry(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sessão expirada. Atualiza a página e entra de novo.");
  }

  const { error } = await supabase.from("entries").delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    throw new Error("Não deu pra excluir esse lançamento agora.");
  }
}
