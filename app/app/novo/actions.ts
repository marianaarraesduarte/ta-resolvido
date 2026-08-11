"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { suggestCategoryName } from "@/lib/category-keywords";
import { extractFromDocument, Type } from "@/lib/gemini";

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
  category: string | null;
};

const NO_CATEGORY = "Sem categoria";

function statementSchema(categoryNames: string[]) {
  return {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        type: { type: Type.STRING, enum: ["despesa", "receita"] },
        date: { type: Type.STRING },
        category: { type: Type.STRING, enum: [...categoryNames, NO_CATEGORY] },
      },
      required: ["description", "amount", "type", "date", "category"],
    },
  };
}

function statementPrompt(categoryNames: string[]): string {
  return `Você está analisando uma foto ou PDF de um comprovante ou extrato bancário em português do Brasil. Identifique cada lançamento (transação) que aparece na imagem.

Para cada um, extraia:
- description: descrição curta (nome do estabelecimento ou origem do lançamento)
- amount: valor em reais, sempre um número positivo (sem sinal de + ou -)
- type: "despesa" se for uma saída/débito, "receita" se for uma entrada/crédito — use o sinal (+/-), a cor, ou o rótulo ("crédito"/"débito") que aparecer no extrato pra decidir
- date: data do lançamento no formato YYYY-MM-DD; se o ano não estiver visível na imagem, use ${new Date().getFullYear()}
- category: só pra despesas, escolha a categoria que melhor descreve o estabelecimento entre exatamente estas opções: ${categoryNames.join(", ") || "(nenhuma cadastrada)"}. Use seu conhecimento geral sobre o tipo de estabelecimento (ex: nomes de app de comida = provavelmente a categoria de lazer/alimentação, nome de posto de combustível = transporte). Se for uma receita, ou se nenhuma categoria se encaixar bem, use "${NO_CATEGORY}".

Se a imagem tiver várias transações (um extrato inteiro, não só um comprovante), retorne todas elas, uma por item. Se não conseguir identificar nenhum lançamento, retorne uma lista vazia.`;
}

export async function recognizeStatement(fileDataUrl: string): Promise<RecognizedItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Sessão expirada. Atualiza a página e entra de novo.");
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("name")
    .eq("user_id", user.id);
  const categoryNames = (categories ?? []).map((c) => c.name);

  try {
    const items = await extractFromDocument<RecognizedItem[]>(
      fileDataUrl,
      statementPrompt(categoryNames),
      statementSchema(categoryNames),
    );
    return items.map((item) => ({
      ...item,
      category: item.category === NO_CATEGORY ? null : item.category,
    }));
  } catch {
    throw new Error("Não deu pra analisar esse arquivo agora.");
  }
}

export async function saveRecognizedItems(
  items: {
    description: string;
    amount: number;
    type: "despesa" | "receita";
    isSalary: boolean;
    date: string;
    category: string | null;
  }[],
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sessão expirada. Atualiza a página e entra de novo.");
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
      const categoryName = item.category ?? suggestCategoryName(item.description);
      return {
        user_id: user.id,
        type: "despesa" as const,
        amount: item.amount,
        description: item.description,
        entry_date: item.date,
        category_id: categoryName ? (categoryByName.get(categoryName) ?? null) : null,
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
}

export type RecognizedCardItem = {
  description: string;
  amount: number;
  category: string | null;
};

function cardInvoiceSchema(categoryNames: string[]) {
  return {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        category: { type: Type.STRING, enum: [...categoryNames, NO_CATEGORY] },
      },
      required: ["description", "amount", "category"],
    },
  };
}

function cardInvoicePrompt(categoryNames: string[]): string {
  return `Você está analisando uma foto ou PDF de uma fatura de cartão de crédito em português do Brasil. Identifique cada compra/lançamento individual na fatura — não o total, taxas, juros ou dados de pagamento.

Para cada compra, extraia:
- description: descrição curta (nome do estabelecimento)
- amount: valor em reais, sempre um número positivo
- category: escolha a categoria que melhor descreve o estabelecimento entre exatamente estas opções: ${categoryNames.join(", ") || "(nenhuma cadastrada)"}. Use seu conhecimento geral sobre o tipo de estabelecimento pra decidir, mesmo que o nome seja abreviado ou tenha código (ex: "UBER *TRIP", "IFD*IFOOD"). Se nenhuma categoria se encaixar bem, use "${NO_CATEGORY}".

Se não conseguir identificar nenhuma compra, retorne uma lista vazia.`;
}

export async function recognizeCardInvoice(fileDataUrl: string): Promise<RecognizedCardItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Sessão expirada. Atualiza a página e entra de novo.");
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("name")
    .eq("user_id", user.id);
  const categoryNames = (categories ?? []).map((c) => c.name);

  try {
    const items = await extractFromDocument<RecognizedCardItem[]>(
      fileDataUrl,
      cardInvoicePrompt(categoryNames),
      cardInvoiceSchema(categoryNames),
    );
    return items.map((item) => ({
      ...item,
      category: item.category === NO_CATEGORY ? null : item.category,
    }));
  } catch {
    throw new Error("Não deu pra analisar esse arquivo agora.");
  }
}

export async function saveCardInvoice(
  items: { description: string; amount: number; category: string | null }[],
  invoiceDate: string,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sessão expirada. Atualiza a página e entra de novo.");
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
    const categoryName = item.category ?? suggestCategoryName(item.description);
    return {
      user_id: user.id,
      type: "despesa" as const,
      amount: item.amount,
      description: item.description,
      entry_date: invoiceDate,
      category_id: categoryName ? (categoryByName.get(categoryName) ?? null) : null,
      source: "foto" as const,
      payment_method: "cartao" as const,
      card_invoice_id: invoice.id as string,
    };
  });

  const { error } = await supabase.from("entries").insert(rows);
  if (error) {
    throw new Error("Não deu pra salvar os lançamentos agora.");
  }
}
