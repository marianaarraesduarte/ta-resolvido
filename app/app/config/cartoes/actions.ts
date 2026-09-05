"use server";

import { createClient } from "@/lib/supabase/server";

export type Card = {
  id: string;
  name: string;
  color: string;
  dueDay: number | null;
  closingDay: number | null;
};

function toCard(row: {
  id: string;
  name: string;
  color: string;
  due_day: number | null;
  closing_day: number | null;
}): Card {
  return { id: row.id, name: row.name, color: row.color, dueDay: row.due_day, closingDay: row.closing_day };
}

function validateDays(dueDay: number | null, closingDay: number | null): void {
  if (dueDay !== null && (dueDay < 1 || dueDay > 31)) {
    throw new Error("O dia de vencimento precisa ser entre 1 e 31.");
  }
  if (closingDay !== null && (closingDay < 1 || closingDay > 31)) {
    throw new Error("O dia de fechamento precisa ser entre 1 e 31.");
  }
}

// Reaproveita um cartão já existente com o mesmo nome (sem diferenciar
// maiúscula/minúscula) em vez de criar duplicado — mesma lógica que
// resolveInvoiceId já usa pra fatura, pra não repetir o problema com
// cartão (ex: "Nubank" cadastrado de novo sem perceber que já existia).
export async function createCard(
  name: string,
  color: string,
  dueDay: number | null = null,
  closingDay: number | null = null,
): Promise<Card> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Digite um nome pro cartão.");
  validateDays(dueDay, closingDay);

  const { data: existing } = await supabase
    .from("cards")
    .select("id, name, color, due_day, closing_day")
    .eq("user_id", user.id)
    .ilike("name", trimmed)
    .limit(1)
    .maybeSingle();

  if (existing) return toCard(existing);

  const { data, error } = await supabase
    .from("cards")
    .insert({ user_id: user.id, name: trimmed, color, due_day: dueDay, closing_day: closingDay })
    .select("id, name, color, due_day, closing_day")
    .single();

  if (error || !data) throw new Error("Não deu pra criar esse cartão agora.");

  return toCard(data);
}

export async function updateCard(
  id: string,
  name: string,
  color: string,
  dueDay: number | null = null,
  closingDay: number | null = null,
): Promise<Card> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Digite um nome pro cartão.");
  validateDays(dueDay, closingDay);

  const { data, error } = await supabase
    .from("cards")
    .update({ name: trimmed, color, due_day: dueDay, closing_day: closingDay })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id, name, color, due_day, closing_day")
    .single();

  if (error || !data) throw new Error("Não deu pra salvar esse cartão agora.");

  return toCard(data);
}

export async function deleteCard(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { error } = await supabase.from("cards").delete().eq("id", id).eq("user_id", user.id);

  if (error) throw new Error("Não deu pra excluir esse cartão agora.");
}
