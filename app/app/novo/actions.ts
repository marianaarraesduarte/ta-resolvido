"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { suggestCategoryName } from "@/lib/category-keywords";
import { toDateKey } from "@/lib/date";

export async function createEntry(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const type = formData.get("type") === "receita" ? "receita" : "despesa";
  const rawAmount = String(formData.get("amount") ?? "").replace(",", ".");
  const amount = Number(rawAmount);
  const description = String(formData.get("description") ?? "").trim();
  const entryDate = String(formData.get("entry_date") ?? "");

  if (!amount || amount <= 0 || !description || !entryDate) {
    redirect("/app/novo?error=1");
  }

  const payload: {
    user_id: string;
    type: "despesa" | "receita";
    amount: number;
    description: string;
    entry_date: string;
    source: "manual";
    category_id?: string | null;
    income_type?: string | null;
    account_name?: string | null;
  } = {
    user_id: user.id,
    type,
    amount,
    description,
    entry_date: entryDate,
    source: "manual",
    account_name: String(formData.get("account_name") ?? "").trim() || null,
  };

  if (type === "despesa") {
    payload.category_id = String(formData.get("category_id") ?? "") || null;
  } else {
    payload.income_type = formData.get("income_type") === "salario" ? "salario" : "outra";
  }

  const { error } = await supabase.from("entries").insert(payload);

  if (error) {
    redirect("/app/novo?error=1");
  }

  redirect("/app");
}

export async function createCategory(name: string): Promise<{ id: string; name: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado.");
  }

  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("Digite um nome pra categoria.");
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ user_id: user.id, name: trimmed })
    .select("id, name")
    .single();

  if (error) {
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("categories")
        .select("id, name")
        .eq("user_id", user.id)
        .eq("name", trimmed)
        .single();
      if (existing) return existing;
    }
    throw new Error("Não deu pra criar essa categoria agora.");
  }

  return data;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Não autenticado.");
  }

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Não deu pra excluir essa categoria agora.");
  }
}

export type RecognizedItem = {
  description: string;
  amount: number;
  type: "despesa" | "receita";
  date: string;
};

/**
 * PLACEHOLDER: ainda não está ligado a um serviço real de leitura de imagem.
 * Simula um resultado fixo pra permitir testar o fluxo de revisão e
 * confirmação por completo. Trocar o corpo desta função por uma chamada a
 * uma API de visão (ex: Claude, GPT-4V) quando houver uma chave de API —
 * a assinatura (recebe a imagem em data URL, devolve RecognizedItem[])
 * não deve precisar mudar. Uma API real deve extrair a data de cada linha
 * do extrato individualmente (não é a mesma data pra tudo).
 */
export async function recognizeStatement(_imageDataUrl: string): Promise<RecognizedItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  // Datas fixas dentro do mês atual (não "dias atrás", pra não cair no mês
  // anterior quando o teste acontece logo no começo do mês).
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayInThisMonth = (day: number) =>
    toDateKey(new Date(now.getFullYear(), now.getMonth(), Math.min(day, lastDayOfMonth)));

  return [
    { description: "Salário", amount: 4500, type: "receita", date: dayInThisMonth(1) },
    { description: "Mercado São João", amount: 89.9, type: "despesa", date: dayInThisMonth(8) },
    { description: "Uber", amount: 24.5, type: "despesa", date: dayInThisMonth(15) },
    { description: "Farmácia", amount: 42.0, type: "despesa", date: toDateKey(now) },
  ];
}

export async function saveRecognizedItems(
  items: {
    description: string;
    amount: number;
    type: "despesa" | "receita";
    isSalary: boolean;
    date: string;
  }[],
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (items.length === 0 || items.some((item) => !item.date)) {
    throw new Error("Confere as datas antes de salvar.");
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", user.id);
  const categoryByName = new Map((categories ?? []).map((c) => [c.name, c.id]));

  const rows = items.map((item) => {
    if (item.type === "despesa") {
      const suggested = suggestCategoryName(item.description);
      return {
        user_id: user.id,
        type: "despesa" as const,
        amount: item.amount,
        description: item.description,
        entry_date: item.date,
        category_id: suggested ? (categoryByName.get(suggested) ?? null) : null,
        source: "foto" as const,
      };
    }
    return {
      user_id: user.id,
      type: "receita" as const,
      amount: item.amount,
      description: item.description,
      entry_date: item.date,
      income_type: item.isSalary ? ("salario" as const) : ("outra" as const),
      source: "foto" as const,
    };
  });

  const { error } = await supabase.from("entries").insert(rows);
  if (error) {
    throw new Error("Não deu pra salvar os lançamentos agora.");
  }

  const salaryPatterns = items
    .filter((item) => item.type === "receita" && item.isSalary)
    .map((item) => ({
      user_id: user.id,
      description_pattern: item.description.trim().toLowerCase(),
    }));

  if (salaryPatterns.length > 0) {
    await supabase
      .from("salary_patterns")
      .upsert(salaryPatterns, { onConflict: "user_id,description_pattern" });
  }

  redirect("/app");
}

export type RecognizedCardItem = {
  description: string;
  amount: number;
};

/**
 * PLACEHOLDER: mesma ressalva de recognizeStatement — ainda simula um
 * resultado fixo. Itens de fatura de cartão são sempre despesa (sem
 * receita/salário), por isso a assinatura é mais simples.
 */
export async function recognizeCardInvoice(_imageDataUrl: string): Promise<RecognizedCardItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  return [
    { description: "Netflix", amount: 39.9 },
    { description: "Amazon", amount: 156.5 },
    { description: "Posto Ipiranga", amount: 120 },
    { description: "Restaurante", amount: 78.4 },
  ];
}

export async function saveCardInvoice(
  items: { description: string; amount: number }[],
  invoiceDate: string,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (items.length === 0 || !invoiceDate) {
    throw new Error("Nada pra salvar.");
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("card_invoices")
    .insert({ user_id: user.id, invoice_date: invoiceDate })
    .select("id")
    .single();

  if (invoiceError || !invoice) {
    throw new Error("Não deu pra salvar a fatura agora.");
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", user.id);
  const categoryByName = new Map((categories ?? []).map((c) => [c.name, c.id]));

  const rows = items.map((item) => {
    const suggested = suggestCategoryName(item.description);
    return {
      user_id: user.id,
      type: "despesa" as const,
      amount: item.amount,
      description: item.description,
      entry_date: invoiceDate,
      category_id: suggested ? (categoryByName.get(suggested) ?? null) : null,
      source: "foto" as const,
      payment_method: "cartao" as const,
      card_invoice_id: invoice.id as string,
    };
  });

  const { error } = await supabase.from("entries").insert(rows);
  if (error) {
    throw new Error("Não deu pra salvar os lançamentos agora.");
  }

  redirect("/app");
}
