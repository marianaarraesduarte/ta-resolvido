"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseCentsInput } from "@/lib/tokens";
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

// Em qual fatura uma compra no crédito entra: uma já existente (escolhida
// numa lista) ou uma nova, a criar na hora sob um cartão específico —
// "nova" ainda reaproveita a fatura existente se já tiver uma pro mesmo
// cartão+data, pra não duplicar por acidente.
export type CreditSelection =
  | { kind: "existing"; invoiceId: string }
  | { kind: "new"; cardId: string; dueDate: string };

async function resolveInvoiceId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  selection: CreditSelection,
): Promise<string> {
  if (selection.kind === "existing") return selection.invoiceId;

  const { data: existingInvoice } = await supabase
    .from("card_invoices")
    .select("id")
    .eq("user_id", userId)
    .eq("card_id", selection.cardId)
    .eq("invoice_date", selection.dueDate)
    .limit(1)
    .maybeSingle();

  if (existingInvoice) return existingInvoice.id;

  const { data: created, error } = await supabase
    .from("card_invoices")
    .insert({ user_id: userId, card_id: selection.cardId, invoice_date: selection.dueDate })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error("Não deu pra salvar a fatura agora.");
  }
  return created.id;
}

export type CardWithInvoices = {
  id: string;
  name: string;
  color: string;
  invoices: { id: string; dueDate: string }[];
};

export async function listCardsWithInvoices(): Promise<CardWithInvoices[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: cards }, { data: invoices }] = await Promise.all([
    supabase.from("cards").select("id, name, color").eq("user_id", user.id).order("name"),
    supabase
      .from("card_invoices")
      .select("id, card_id, invoice_date")
      .eq("user_id", user.id)
      .not("card_id", "is", null)
      .order("invoice_date", { ascending: false }),
  ]);

  return (cards ?? []).map((card) => ({
    ...card,
    invoices: (invoices ?? [])
      .filter((inv) => inv.card_id === card.id)
      .map((inv) => ({ id: inv.id, dueDate: inv.invoice_date })),
  }));
}

export async function checkExistingInvoiceDate(cardId: string, invoiceDate: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("card_invoices")
    .select("id")
    .eq("user_id", user.id)
    .eq("card_id", cardId)
    .eq("invoice_date", invoiceDate)
    .limit(1)
    .maybeSingle();

  return !!data;
}

// Só deixa excluir uma fatura vazia (sem lançamentos) — se tiver compras
// dentro, é pra excluir as compras primeiro, não a fatura por baixo delas.
export async function deleteCardInvoice(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { count } = await supabase
    .from("entries")
    .select("id", { count: "exact", head: true })
    .eq("card_invoice_id", id)
    .eq("user_id", user.id);

  if ((count ?? 0) > 0) {
    throw new Error("Essa fatura ainda tem compras — exclua elas primeiro.");
  }

  const { error } = await supabase
    .from("card_invoices")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Não deu pra excluir essa fatura agora.");
  }
}

// Pra quando a pessoa escolheu o cartão errado na hora de lançar — muda a
// fatura de cartão sem mexer nas compras dela.
export async function updateInvoiceCard(invoiceId: string, cardId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { error } = await supabase
    .from("card_invoices")
    .update({ card_id: cardId })
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Não deu pra trocar o cartão dessa fatura agora.");
  }
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
  const amount = parseCentsInput(String(formData.get("amount") ?? ""));
  const description = String(formData.get("description") ?? "").trim();
  const entryDate = String(formData.get("entry_date") ?? "");
  const invoiceKind = String(formData.get("invoice_kind") ?? "");
  const isCreditCard = type === "despesa" && (invoiceKind === "existing" || invoiceKind === "new");

  let creditSelection: CreditSelection | null = null;
  if (isCreditCard) {
    if (invoiceKind === "existing") {
      const invoiceId = String(formData.get("invoice_id") ?? "");
      if (!invoiceId) redirect("/app/novo?error=1");
      creditSelection = { kind: "existing", invoiceId };
    } else {
      const cardId = String(formData.get("card_id") ?? "");
      const dueDate = String(formData.get("due_date") ?? "");
      if (!cardId || !dueDate) redirect("/app/novo?error=1");
      creditSelection = { kind: "new", cardId, dueDate };
    }
  }

  if (!amount || amount <= 0 || !description || (isCreditCard ? !creditSelection : !entryDate)) {
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
    payment_method?: "cartao";
    card_invoice_id?: string;
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
    if (isCreditCard && creditSelection) {
      const invoiceId = await resolveInvoiceId(supabase, user.id, creditSelection);
      const { data: invoiceRow } = await supabase
        .from("card_invoices")
        .select("invoice_date")
        .eq("id", invoiceId)
        .single();
      if (!invoiceRow) redirect("/app/novo?error=1");

      payload.entry_date = invoiceRow.invoice_date;
      payload.payment_method = "cartao";
      payload.card_invoice_id = invoiceId;
    }
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
  } catch (err) {
    console.error("recognizeStatement falhou:", err);
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

function chatItemProperties(categoryNames: string[]) {
  return {
    description: { type: Type.STRING },
    amount: { type: Type.NUMBER, nullable: true },
    type: { type: Type.STRING, enum: ["despesa", "receita"] },
    date: { type: Type.STRING },
    category: { type: Type.STRING, enum: [...categoryNames, NO_CATEGORY] },
    isCreditCard: { type: Type.BOOLEAN },
  };
}

const CHAT_ITEM_REQUIRED = ["description", "type", "date", "category", "isCreditCard"];

function chatSchema(categoryNames: string[]) {
  return {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: chatItemProperties(categoryNames),
      required: CHAT_ITEM_REQUIRED,
    },
  };
}

function audioSchema(categoryNames: string[]) {
  return {
    type: Type.OBJECT,
    properties: {
      transcript: { type: Type.STRING },
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: chatItemProperties(categoryNames),
          required: CHAT_ITEM_REQUIRED,
        },
      },
    },
    required: ["transcript", "items"],
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

function audioPrompt(categoryNames: string[], today: string): string {
  return `Você está ouvindo um áudio em português do Brasil em que uma pessoa fala, naturalmente, um ou mais gastos ou recebimentos do dia a dia dela. Hoje é ${today}.

Primeiro, em transcript, escreva uma transcrição literal do que foi dito (sem hesitações tipo "é", "tipo", "ãh").

Depois, pra cada lançamento que você identificar na fala, extraia, em items:
- description: descrição curta (o que foi, ou de onde veio o dinheiro)
- amount: o valor em reais, sempre um número positivo. Números falados por extenso (ex: "cinquenta reais", "uns quarenta e oito") devem virar o valor numérico correspondente. Se a fala não deixar o valor claro, deixe null — não invente um número.
- type: "despesa" se foi um gasto, "receita" se foi dinheiro que entrou
- date: data no formato YYYY-MM-DD. Resolva termos relativos ("hoje", "ontem", "anteontem") usando ${today} como referência. Se não disser nada sobre quando, use ${today}.
- category: só pra despesas, escolha a categoria que melhor combina entre exatamente estas opções: ${categoryNames.join(", ") || "(nenhuma cadastrada)"}. Se for receita, ou se nenhuma categoria combinar bem, use "${NO_CATEGORY}".
- isCreditCard: true somente se a fala disser claramente que esse gasto específico foi no crédito ou no cartão. Se for receita, ou se não houver menção a crédito/cartão, use false.

Se a fala descrever mais de um lançamento, retorne todos em items, um por item. Se não conseguir identificar nenhum lançamento de dinheiro, items deve ser uma lista vazia — mas ainda assim preencha transcript com o que você ouviu.`;
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
  } catch (err) {
    console.error("recognizeChatMessage falhou:", err);
    throw new Error("Não deu pra entender essa mensagem agora.");
  }
}

export async function recognizeAudioMessage(
  audioDataUrl: string,
): Promise<{ transcript: string; items: ChatItem[] }> {
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

  const today = new Date().toISOString().slice(0, 10);

  try {
    const result = await extractFromDocument<{
      transcript: string;
      items: Omit<ChatItem, "possibleDuplicate">[];
    }>(audioDataUrl, audioPrompt(categoryNames, today), audioSchema(categoryNames));
    await logRecognition(supabase, user.id);

    // Fala solta é menos previsível que texto digitado — se a IA devolver uma
    // data fora do formato YYYY-MM-DD, cai pra hoje em vez de tentar salvar
    // algo que a coluna de data do banco vai rejeitar.
    const isValidDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
    result.items = result.items.map((item) => ({
      ...item,
      date: isValidDate(item.date) ? item.date : today,
    }));

    const dates = [...new Set(result.items.map((item) => item.date))];
    const { data: existing } = dates.length
      ? await supabase
          .from("entries")
          .select("amount, entry_date, description")
          .eq("user_id", user.id)
          .in("entry_date", dates)
      : { data: [] };

    const items = result.items.map((item) => {
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

    return { transcript: result.transcript, items };
  } catch (err) {
    // Feature nova (áudio) — loga a causa real enquanto valida em produção,
    // já que a mensagem pra usuária precisa continuar genérica.
    console.error("recognizeAudioMessage falhou:", err);
    throw new Error("Não deu pra entender esse áudio agora.");
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
    creditSelection?: CreditSelection | null;
  }[],
  source: "foto" | "chat" | "audio" = "foto",
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sessão expirada. Atualiza a página e entra de novo.");
  }
  const userId = user.id;

  if (items.length === 0 || items.some((item) => !item.date)) {
    throw new Error("Confere as datas antes de salvar.");
  }

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("user_id", userId);
  const categoryByName = new Map((categories ?? []).map((c) => [c.name, c.id]));

  // Duas compras diferentes podem escolher a mesma fatura (existente ou
  // "nova" com o mesmo cartão+data) — resolve uma vez só por chave, senão
  // "nova fatura" criaria uma linha duplicada pra cada item.
  const invoiceIdByKey = new Map<string, string>();
  async function resolveKeyed(selection: CreditSelection): Promise<string> {
    const key =
      selection.kind === "existing"
        ? `existing:${selection.invoiceId}`
        : `new:${selection.cardId}:${selection.dueDate}`;
    const cached = invoiceIdByKey.get(key);
    if (cached) return cached;
    const id = await resolveInvoiceId(supabase, userId, selection);
    invoiceIdByKey.set(key, id);
    return id;
  }

  const resolvedInvoiceIdByItemIndex = new Map<number, string>();
  for (let i = 0; i < items.length; i++) {
    const selection = items[i].creditSelection;
    if (selection) {
      resolvedInvoiceIdByItemIndex.set(i, await resolveKeyed(selection));
    }
  }

  const uniqueInvoiceIds = [...new Set(resolvedInvoiceIdByItemIndex.values())];
  const invoiceDateById = new Map<string, string>();
  if (uniqueInvoiceIds.length > 0) {
    const { data: invoiceRows } = await supabase
      .from("card_invoices")
      .select("id, invoice_date")
      .in("id", uniqueInvoiceIds);
    for (const row of invoiceRows ?? []) invoiceDateById.set(row.id, row.invoice_date);
  }

  const rows = items.map((item, i) => {
    if (item.type === "despesa") {
      const categoryName = item.category ?? suggestCategoryName(item.description);
      const categoryId = categoryName ? (categoryByName.get(categoryName) ?? null) : null;
      const invoiceId = resolvedInvoiceIdByItemIndex.get(i);
      if (invoiceId) {
        return {
          user_id: user.id,
          type: "despesa" as const,
          amount: item.amount,
          description: item.description,
          entry_date: invoiceDateById.get(invoiceId) as string,
          category_id: categoryId,
          source,
          payment_method: "cartao" as const,
          card_invoice_id: invoiceId,
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
    console.error("saveRecognizedItems: insert em entries falhou:", error);
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
  } catch (err) {
    console.error("recognizeCardInvoice falhou:", err);
    throw new Error("Não deu pra analisar esse arquivo agora.");
  }
}

export async function saveCardInvoice(
  items: { description: string; amount: number; category: string | null }[],
  selection: CreditSelection,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Sessão expirada. Atualiza a página e entra de novo.");
  }

  if (items.length === 0) {
    throw new Error("Nada pra salvar.");
  }

  const invoiceId = await resolveInvoiceId(supabase, user.id, selection);
  const { data: invoiceRow } = await supabase
    .from("card_invoices")
    .select("invoice_date")
    .eq("id", invoiceId)
    .single();

  if (!invoiceRow) {
    throw new Error("Não deu pra salvar a fatura agora.");
  }
  const invoiceDate = invoiceRow.invoice_date;

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
      card_invoice_id: invoiceId,
    };
  });

  const { error } = await supabase.from("entries").insert(rows);
  if (error) {
    console.error("saveCardInvoice: insert em entries falhou:", error);
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
