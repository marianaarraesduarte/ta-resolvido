"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { suggestCategoryName } from "@/lib/category-keywords";
import { isCompleto, isRecognitionLimitReached, FREE_RECOGNITION_LIMIT } from "@/lib/plan";
import { isPossibleDuplicate } from "@/lib/duplicate-check";
import { matchCategoryPattern } from "@/lib/category-pattern-match";
import { extractFromDocument, extractFromText, Type } from "@/lib/gemini";

async function enforceRecognitionLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<void> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();
  if (isCompleto(profile?.plan)) return;

  const firstDay = new Date();
  firstDay.setDate(1);
  firstDay.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("photo_recognitions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", firstDay.toISOString());

  if (isRecognitionLimitReached(profile?.plan, count ?? 0)) {
    throw new Error(
      `Você já usou seus ${FREE_RECOGNITION_LIMIT} reconhecimentos por IA grátis desse mês. Assine o Completo pra reconhecer sem limite.`,
    );
  }
}

async function logRecognition(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<void> {
  await supabase.from("photo_recognitions").insert({ user_id: userId });
}

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

  let categoryName = "";
  if (payload.category_id) {
    const { data: category } = await supabase
      .from("categories")
      .select("name")
      .eq("id", payload.category_id)
      .eq("user_id", user.id)
      .single();
    categoryName = category?.name ?? "";
  }

  const toastParams = new URLSearchParams({ saved: description, amount: String(amount) });
  if (categoryName) toastParams.set("category", categoryName);
  redirect(`/app?${toastParams.toString()}`);
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

export async function renameCategory(
  categoryId: string,
  name: string,
): Promise<{ id: string; name: string }> {
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
    .update({ name: trimmed })
    .eq("id", categoryId)
    .eq("user_id", user.id)
    .select("id, name")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Já existe uma categoria com esse nome.");
    }
    throw new Error("Não deu pra renomear essa categoria agora.");
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
  possibleDuplicate: boolean;
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

  await enforceRecognitionLimit(supabase, user.id);

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", user.id);
  const categoryNames = (categories ?? []).map((c) => c.name);
  const categoryNameById = new Map((categories ?? []).map((c) => [c.id, c.name]));

  const { data: patternsData } = await supabase
    .from("category_patterns")
    .select("description_pattern, category_id")
    .eq("user_id", user.id);
  const patterns = patternsData ?? [];

  try {
    const items = await extractFromDocument<Omit<RecognizedItem, "possibleDuplicate">[]>(
      fileDataUrl,
      statementPrompt(categoryNames),
      statementSchema(categoryNames),
    );
    await logRecognition(supabase, user.id);

    const dates = [...new Set(items.map((item) => item.date))];
    const { data: existing } = dates.length
      ? await supabase
          .from("entries")
          .select("amount, entry_date, description")
          .eq("user_id", user.id)
          .in("entry_date", dates)
      : { data: [] };

    return items.map((item) => {
      const baseCategory = item.category === NO_CATEGORY ? null : item.category;
      const learnedCategoryId =
        item.type === "despesa" ? matchCategoryPattern(item.description, patterns) : null;
      const category = learnedCategoryId
        ? (categoryNameById.get(learnedCategoryId) ?? baseCategory)
        : baseCategory;

      return {
        ...item,
        category,
        possibleDuplicate: isPossibleDuplicate(item, existing ?? []),
      };
    });
  } catch {
    throw new Error("Não deu pra analisar esse arquivo agora.");
  }
}

export type ChatItem = {
  description: string;
  amount: number | null;
  type: "despesa" | "receita";
  date: string;
  category: string | null;
  isCreditCard: boolean;
  possibleDuplicate: boolean;
};

function chatSchema(categoryNames: string[]) {
  return {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING },
        amount: { type: Type.NUMBER, nullable: true },
        type: { type: Type.STRING, enum: ["despesa", "receita"] },
        date: { type: Type.STRING },
        category: { type: Type.STRING, enum: [...categoryNames, NO_CATEGORY] },
        isCreditCard: { type: Type.BOOLEAN },
      },
      required: ["description", "type", "date", "category", "isCreditCard"],
    },
  };
}

function chatPrompt(categoryNames: string[], today: string): string {
  return `Você está lendo uma mensagem em português que uma pessoa escreveu contando um ou mais gastos ou recebimentos do dia a dia dela. Hoje é ${today}.

Para cada lançamento que você identificar na mensagem, extraia:
- description: descrição curta (o que foi, ou de onde veio o dinheiro)
- amount: o valor em reais, sempre um número positivo. Se a mensagem não disser o valor claramente, deixe null — não invente um número.
- type: "despesa" se foi um gasto, "receita" se foi dinheiro que entrou
- date: data no formato YYYY-MM-DD. Resolva termos relativos ("hoje", "ontem", "anteontem") usando ${today} como referência. Se a mensagem não disser nada sobre quando, use ${today}.
- category: só pra despesas, escolha a categoria que melhor combina entre exatamente estas opções: ${categoryNames.join(", ") || "(nenhuma cadastrada)"}. Se for receita, ou se nenhuma categoria combinar bem, use "${NO_CATEGORY}".
- isCreditCard: true somente se a mensagem disser claramente que esse gasto específico foi no crédito ou no cartão (ex: "no crédito", "no cartão"). Se for receita, ou se não houver menção a crédito/cartão, use false.

Se a mensagem descrever mais de um lançamento, retorne todos, um por item. Se não conseguir identificar nenhum lançamento de dinheiro na mensagem, retorne uma lista vazia.`;
}

export async function recognizeChatMessage(message: string): Promise<ChatItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Sessão expirada. Atualiza a página e entra de novo.");
  }

  if (!message.trim()) {
    throw new Error("Escreve alguma coisa antes de enviar.");
  }

  await enforceRecognitionLimit(supabase, user.id);

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", user.id);
  const categoryNames = (categories ?? []).map((c) => c.name);
  const categoryNameById = new Map((categories ?? []).map((c) => [c.id, c.name]));

  const { data: patternsData } = await supabase
    .from("category_patterns")
    .select("description_pattern, category_id")
    .eq("user_id", user.id);
  const patterns = patternsData ?? [];

  const today = new Date().toISOString().slice(0, 10);

  try {
    const items = await extractFromText<Omit<ChatItem, "possibleDuplicate">[]>(
      message,
      chatPrompt(categoryNames, today),
      chatSchema(categoryNames),
    );
    await logRecognition(supabase, user.id);

    const dates = [...new Set(items.map((item) => item.date))];
    const { data: existing } = dates.length
      ? await supabase
          .from("entries")
          .select("amount, entry_date, description")
          .eq("user_id", user.id)
          .in("entry_date", dates)
      : { data: [] };

    return items.map((item) => {
      const baseCategory = item.category === NO_CATEGORY ? null : item.category;
      const learnedCategoryId =
        item.type === "despesa" ? matchCategoryPattern(item.description, patterns) : null;
      const category = learnedCategoryId
        ? (categoryNameById.get(learnedCategoryId) ?? baseCategory)
        : baseCategory;

      return {
        ...item,
        category,
        possibleDuplicate:
          item.amount !== null ? isPossibleDuplicate({ ...item, amount: item.amount }, existing ?? []) : false,
      };
    });
  } catch {
    throw new Error("Não deu pra entender essa mensagem agora.");
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
    isCreditCard?: boolean;
    dueDate?: string | null;
  }[],
  source: "foto" | "chat" = "foto",
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sessão expirada. Atualiza a página e entra de novo.");
  }

  if (
    items.length === 0 ||
    items.some((item) => !item.date || (item.isCreditCard && !item.dueDate))
  ) {
    throw new Error("Confere as datas antes de salvar.");
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", user.id);
  const categoryByName = new Map((categories ?? []).map((c) => [c.name, c.id]));

  const dueDates = [
    ...new Set(items.filter((item) => item.isCreditCard).map((item) => item.dueDate as string)),
  ];
  const invoiceIdByDueDate = new Map<string, string>();
  for (const dueDate of dueDates) {
    const { data: existing } = await supabase
      .from("card_invoices")
      .select("id")
      .eq("user_id", user.id)
      .eq("invoice_date", dueDate)
      .limit(1)
      .maybeSingle();

    if (existing) {
      invoiceIdByDueDate.set(dueDate, existing.id);
      continue;
    }

    const { data: created, error: invoiceError } = await supabase
      .from("card_invoices")
      .insert({ user_id: user.id, invoice_date: dueDate })
      .select("id")
      .single();
    if (invoiceError || !created) {
      throw new Error("Não deu pra salvar a fatura agora.");
    }
    invoiceIdByDueDate.set(dueDate, created.id);
  }

  const rows = items.map((item) => {
    if (item.type === "despesa") {
      const categoryName = item.category ?? suggestCategoryName(item.description);
      const categoryId = categoryName ? (categoryByName.get(categoryName) ?? null) : null;
      if (item.isCreditCard) {
        return {
          user_id: user.id,
          type: "despesa" as const,
          amount: item.amount,
          description: item.description,
          entry_date: item.dueDate as string,
          category_id: categoryId,
          source,
          payment_method: "cartao" as const,
          card_invoice_id: invoiceIdByDueDate.get(item.dueDate as string) as string,
        };
      }
      return {
        user_id: user.id,
        type: "despesa" as const,
        amount: item.amount,
        description: item.description,
        entry_date: item.date,
        category_id: categoryId,
        source,
      };
    }
    return {
      user_id: user.id,
      type: "receita" as const,
      amount: item.amount,
      description: item.description,
      entry_date: item.date,
      income_type: item.isSalary ? ("salario" as const) : ("outra" as const),
      source,
    };
  });

  const { error } = await supabase.from("entries").insert(rows);
  if (error) {
    throw new Error("Não deu pra salvar os lançamentos agora.");
  }

  const categoryPatterns = rows
    .filter((r) => r.type === "despesa" && r.category_id)
    .map((r) => ({
      user_id: user.id,
      description_pattern: r.description.trim(),
      category_id: r.category_id as string,
    }));

  if (categoryPatterns.length > 0) {
    await supabase
      .from("category_patterns")
      .upsert(categoryPatterns, { onConflict: "user_id,description_pattern" });
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

  await enforceRecognitionLimit(supabase, user.id);

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", user.id);
  const categoryNames = (categories ?? []).map((c) => c.name);
  const categoryNameById = new Map((categories ?? []).map((c) => [c.id, c.name]));

  const { data: patternsData } = await supabase
    .from("category_patterns")
    .select("description_pattern, category_id")
    .eq("user_id", user.id);
  const patterns = patternsData ?? [];

  try {
    const items = await extractFromDocument<RecognizedCardItem[]>(
      fileDataUrl,
      cardInvoicePrompt(categoryNames),
      cardInvoiceSchema(categoryNames),
    );
    await logRecognition(supabase, user.id);
    return items.map((item) => {
      const baseCategory = item.category === NO_CATEGORY ? null : item.category;
      const learnedCategoryId = matchCategoryPattern(item.description, patterns);
      const category = learnedCategoryId
        ? (categoryNameById.get(learnedCategoryId) ?? baseCategory)
        : baseCategory;
      return { ...item, category };
    });
  } catch {
    throw new Error("Não deu pra analisar esse arquivo agora.");
  }
}

export async function checkExistingInvoiceDate(invoiceDate: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("card_invoices")
    .select("id")
    .eq("user_id", user.id)
    .eq("invoice_date", invoiceDate)
    .limit(1)
    .maybeSingle();

  return !!data;
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

  const categoryPatterns = rows
    .filter((r) => r.category_id)
    .map((r) => ({
      user_id: user.id,
      description_pattern: r.description.trim(),
      category_id: r.category_id as string,
    }));

  if (categoryPatterns.length > 0) {
    await supabase
      .from("category_patterns")
      .upsert(categoryPatterns, { onConflict: "user_id,description_pattern" });
  }
}
