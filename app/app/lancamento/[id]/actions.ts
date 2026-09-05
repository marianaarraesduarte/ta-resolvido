"use server";

import { createClient } from "@/lib/supabase/server";
import { entryAmountError } from "@/lib/entry-amount";

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

  if (!data.amount || !data.description.trim() || !data.entry_date) {
    throw new Error("Confere os campos antes de salvar.");
  }

  // A regra de valor mora em lib/entry-amount.ts, compartilhada com os outros
  // caminhos que salvam lançamento — antes cada um tinha a sua, e o de
  // foto/chat/áudio não tinha nenhuma.
  {
    const { data: existing } = await supabase
      .from("entries")
      .select("card_invoice_id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    const amountError = entryAmountError(data.amount, Boolean(existing?.card_invoice_id));
    if (amountError) throw new Error(amountError);
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
