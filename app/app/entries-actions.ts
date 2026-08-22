"use server";

import { createClient } from "@/lib/supabase/server";

// Compartilhado entre a régua (dentro de uma fatura selecionada) e a tela
// de Resumo (lista principal e itens de uma fatura expandida) — mesma
// lógica de seleção em lote nos dois lugares, sobre a tabela entries.

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

  const { data: updated, error } = await supabase
    .from("entries")
    .update({ category_id: categoryId })
    .in("id", ids)
    .eq("user_id", user.id)
    .select("description");

  if (error) {
    throw new Error("Não deu pra trocar a categoria agora.");
  }

  if (categoryId && updated && updated.length > 0) {
    const patterns = updated.map((e) => ({
      user_id: user.id,
      description_pattern: e.description.trim(),
      category_id: categoryId,
    }));
    await supabase
      .from("category_patterns")
      .upsert(patterns, { onConflict: "user_id,description_pattern" });
  }
}
