"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseCentsInput } from "@/lib/tokens";
import { suggestCategoryName } from "@/lib/category-keywords";
import { isCompleto, isRecognitionLimitReached, recognitionAllowance } from "@/lib/plan";
import { isPossibleDuplicate } from "@/lib/duplicate-check";
import { matchCategoryPattern } from "@/lib/category-pattern-match";
import { parseInstallmentInfo } from "@/lib/installment-detect";
import { checkAmountAnomaly, type AnomalyResult } from "@/lib/anomaly-check";
import {
  extractFromDocument,
  extractFromText,
  recognitionErrorMessage,
  Type,
} from "@/lib/gemini";

async function enforceRecognitionLimit(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<void> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, created_at")
    .eq("id", userId)
    .single();
  if (isCompleto(profile?.plan)) return;

  // A cota e a janela de contagem andam juntas: nos primeiros 30 dias são 10,
  // contados desde a criação da conta; depois, 3 por mês do calendário.
  const allowance = recognitionAllowance(profile?.created_at);

  const { count } = await supabase
    .from("photo_recognitions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", allowance.countFrom.toISOString());

  if (isRecognitionLimitReached(profile?.plan, count ?? 0, allowance.limit)) {
    throw new Error(
      allowance.isFirstMonth
        ? `Você já usou seus ${allowance.limit} reconhecimentos por IA do primeiro mês. Assine o Completo pra reconhecer sem limite.`
        : `Você já usou seus ${allowance.limit} reconhecimentos por IA grátis desse mês. Assine o Completo pra reconhecer sem limite.`,
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

  if (created) return created.id;

  // Corrida: duas faturas novas do mesmo cartão+data podem ser criadas ao
  // mesmo tempo (ex: duas fotos da fatura salvas em sequência rápida) — a
  // constraint única barra a segunda, então reaproveita a que ganhou em vez
  // de falhar (ou pior, criar duas de qualquer jeito).
  if (error?.code === "23505") {
    const { data: afterRace } = await supabase
      .from("card_invoices")
      .select("id")
      .eq("user_id", userId)
      .eq("card_id", selection.cardId)
      .eq("invoice_date", selection.dueDate)
      .limit(1)
      .maybeSingle();
    if (afterRace) return afterRace.id;
  }

  throw new Error("Não deu pra salvar a fatura agora.");
}

// Depois de salvar lançamentos no crédito, vê se a descrição termina com uma
// marcação de parcela (ex: "3/10") e junta com o grupo certo em
// installments — reaproveitando um já existente pro mesmo cartão+nome+total,
// ou criando um novo. Best-effort: nunca bloqueia o salvamento do
// lançamento em si, só não fica de fora das Parcelas se não der certo.
async function linkInstallments(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  inserted: {
    id: string;
    description: string;
    amount: number;
    category_id: string | null;
    card_invoice_id: string | null | undefined;
  }[],
): Promise<void> {
  try {
    const candidates = inserted.flatMap((row) => {
      if (!row.card_invoice_id) return [];
      const parsed = parseInstallmentInfo(row.description);
      return parsed ? [{ row, parsed }] : [];
    });
    if (candidates.length === 0) return;

    const invoiceIds = [...new Set(candidates.map((c) => c.row.card_invoice_id as string))];
    const { data: invoiceRows } = await supabase
      .from("card_invoices")
      .select("id, card_id")
      .in("id", invoiceIds);
    const cardIdByInvoice = new Map((invoiceRows ?? []).map((r) => [r.id, r.card_id as string | null]));

    for (const { row, parsed } of candidates) {
      const cardId = cardIdByInvoice.get(row.card_invoice_id as string) ?? null;

      let existingQuery = supabase
        .from("installments")
        .select("id")
        .eq("user_id", userId)
        .eq("description", parsed.baseDescription)
        .eq("total_installments", parsed.total);
      existingQuery = cardId ? existingQuery.eq("card_id", cardId) : existingQuery.is("card_id", null);
      const { data: existingGroup } = await existingQuery.limit(1).maybeSingle();

      let installmentId = existingGroup?.id as string | undefined;
      if (!installmentId) {
        const { data: created } = await supabase
          .from("installments")
          .insert({
            user_id: userId,
            card_id: cardId,
            description: parsed.baseDescription,
            total_installments: parsed.total,
            monthly_amount: row.amount,
            category_id: row.category_id,
          })
          .select("id")
          .single();
        if (!created) continue;
        installmentId = created.id;
      }

      await supabase
        .from("entries")
        .update({ installment_id: installmentId, installment_number: parsed.number })
        .eq("id", row.id);
    }
  } catch (err) {
    console.error("linkInstallments falhou:", err);
  }
}

// Roda depois de QUALQUER caminho que adicione um lançamento a uma fatura
// de cartão (manual, chat, foto/PDF) — não só na revisão de fatura inteira,
// que é onde a pessoa vê o aviso na hora. Aqui é o registro que garante que
// a administradora fica sabendo mesmo quando a compra entrou por um jeito
// sem tela de revisão própria (ex: lançamento manual).
async function checkAndLogInvoiceAnomaly(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  cardInvoiceId: string,
): Promise<void> {
  try {
    const { data: invoiceRow } = await supabase
      .from("card_invoices")
      .select("card_id")
      .eq("id", cardInvoiceId)
      .single();
    const cardId = invoiceRow?.card_id;
    if (!cardId) return;

    const { data: cardInvoices } = await supabase
      .from("card_invoices")
      .select("id")
      .eq("user_id", userId)
      .eq("card_id", cardId);
    const invoiceIds = (cardInvoices ?? []).map((i) => i.id);
    if (invoiceIds.length === 0) return;

    const { data: entryRows } = await supabase
      .from("entries")
      .select("amount, card_invoice_id")
      .eq("user_id", userId)
      .in("card_invoice_id", invoiceIds);

    const totalsByInvoice = new Map<string, number>();
    for (const e of entryRows ?? []) {
      if (!e.card_invoice_id) continue;
      totalsByInvoice.set(e.card_invoice_id, (totalsByInvoice.get(e.card_invoice_id) ?? 0) + e.amount);
    }

    const currentTotal = totalsByInvoice.get(cardInvoiceId) ?? 0;
    const pastTotals = [...totalsByInvoice.entries()]
      .filter(([id]) => id !== cardInvoiceId)
      .map(([, total]) => total);

    const result = checkAmountAnomaly(currentTotal, pastTotals);
    if (!result.isAnomalous) return;

    await supabase.from("anomaly_flags").insert({
      user_id: userId,
      kind: "invoice_total",
      description: "Fatura acima da média do cartão",
      amount: currentTotal,
      reference_amount: result.average,
      user_flagged: false,
    });
  } catch (err) {
    console.error("checkAndLogInvoiceAnomaly falhou:", err);
  }
}

export type CardWithInvoices = {
  id: string;
  name: string;
  color: string;
  dueDay: number | null;
  closingDay: number | null;
  invoices: { id: string; dueDate: string }[];
};

export async function listCardsWithInvoices(): Promise<CardWithInvoices[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const [{ data: cards }, { data: invoices }] = await Promise.all([
    supabase
      .from("cards")
      .select("id, name, color, due_day, closing_day")
      .eq("user_id", user.id)
      .order("name"),
    supabase
      .from("card_invoices")
      .select("id, card_id, invoice_date")
      .eq("user_id", user.id)
      .not("card_id", "is", null)
      .order("invoice_date", { ascending: false }),
  ]);

  return (cards ?? []).map((card) => ({
    id: card.id,
    name: card.name,
    color: card.color,
    dueDay: card.due_day,
    closingDay: card.closing_day,
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

// Pra quando o vencimento cai num dia sem expediente (ex: domingo) só num mês
// específico — muda a data só dessa fatura, sem mexer no dia de vencimento
// cadastrado no cartão (que continua valendo pras próximas). Os lançamentos
// já salvos nessa fatura têm entry_date == invoice_date (é assim que
// createEntry/saveRecognizedItems gravam), então precisam mudar junto —
// senão eles somem do mês novo da fatura e ficam "fantasmas" no mês antigo.
export async function updateInvoiceDueDate(invoiceId: string, dueDate: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { error } = await supabase
    .from("card_invoices")
    .update({ invoice_date: dueDate })
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Não deu pra mudar a data dessa fatura agora.");
  }

  await supabase
    .from("entries")
    .update({ entry_date: dueDate })
    .eq("card_invoice_id", invoiceId)
    .eq("user_id", user.id);
}

// Lançar a compra e pagar a fatura são coisas diferentes — isso só marca
// que o boleto/fatura em si já foi resolvido, sem mexer nas compras dela.
// É também o gatilho que avança as parcelas que caíram nessa fatura.
export async function markInvoicePaid(invoiceId: string, paid: boolean): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado.");

  const { error } = await supabase
    .from("card_invoices")
    .update({ paid_at: paid ? new Date().toISOString() : null })
    .eq("id", invoiceId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error("Não deu pra atualizar essa fatura agora.");
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
  const entryDate = String(formData.get("entry_date") ?? "");
  const invoiceKind = String(formData.get("invoice_kind") ?? "");
  const isCreditCard = type === "despesa" && (invoiceKind === "existing" || invoiceKind === "new");

  // Marca a compra como "1/N" no mesmo formato que a leitura de fatura já
  // reconhece (parseInstallmentInfo), pra reaproveitar o agrupamento em
  // installments sem precisar de um caminho separado pro lançamento manual.
  const installmentTotal = parseInt(String(formData.get("installment_total") ?? ""), 10);
  const hasInstallments = isCreditCard && installmentTotal >= 2 && installmentTotal <= 48;
  const rawDescription = String(formData.get("description") ?? "").trim();
  const description = hasInstallments ? `${rawDescription} 1/${installmentTotal}` : rawDescription;

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

  if (!amount || amount <= 0 || !rawDescription || (isCreditCard ? !creditSelection : !entryDate)) {
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

  const { data: insertedEntry, error } = await supabase
    .from("entries")
    .insert(payload)
    .select("id")
    .single();

  if (error || !insertedEntry) {
    redirect("/app/novo?error=1");
  }

  if (payload.card_invoice_id) {
    await linkInstallments(supabase, user.id, [
      {
        id: insertedEntry.id,
        description: payload.description,
        amount: payload.amount,
        category_id: payload.category_id ?? null,
        card_invoice_id: payload.card_invoice_id,
      },
    ]);
    await checkAndLogInvoiceAnomaly(supabase, user.id, payload.card_invoice_id);
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
    throw recognitionErrorMessage(err, "Não deu pra analisar esse arquivo agora.");
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
- isCreditCard: true se a mensagem disser claramente que esse gasto foi no crédito ou no cartão (ex: "no crédito", "no cartão"), ou se mencionar que a compra foi parcelada (ex: "em 2 vezes", "parcelado em 3x", "dividido em 4", "5 parcelas") — parcelamento no Brasil é sempre no cartão de crédito. Se for receita, ou se não houver nenhuma dessas menções, use false.

Se a mensagem mencionar em quantas vezes a compra foi parcelada, adicione ao final de description a marcação "1/N" (N = total de parcelas), no mesmo formato que aparece numa fatura — ex: "Sofá 1/10" pra uma compra "em 10 vezes". Use sempre 1 como número da parcela, já que é uma compra sendo registrada agora, não uma fatura antiga. Se não houver menção a parcelamento, não adicione nada em description.

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
- isCreditCard: true se a fala disser claramente que esse gasto foi no crédito ou no cartão, ou se mencionar que a compra foi parcelada (ex: "em 2 vezes", "parcelado em 3x", "dividido em 4", "5 parcelas") — parcelamento no Brasil é sempre no cartão de crédito. Se for receita, ou se não houver nenhuma dessas menções, use false.

Se a fala mencionar em quantas vezes a compra foi parcelada, adicione ao final de description a marcação "1/N" (N = total de parcelas), no mesmo formato que aparece numa fatura — ex: "Sofá 1/10" pra uma compra "em 10 vezes". Use sempre 1 como número da parcela, já que é uma compra sendo registrada agora, não uma fatura antiga. Se não houver menção a parcelamento, não adicione nada em description.

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
    throw recognitionErrorMessage(err, "Não deu pra entender essa mensagem agora.");
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
    throw recognitionErrorMessage(err, "Não deu pra entender esse áudio agora.");
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

  const { data: insertedRows, error } = await supabase.from("entries").insert(rows).select("id");
  if (error) {
    console.error("saveRecognizedItems: insert em entries falhou:", error);
    throw new Error("Não deu pra salvar os lançamentos agora.");
  }

  const cardRows = rows.flatMap((r, i) =>
    r.type === "despesa" && "card_invoice_id" in r && insertedRows?.[i]
      ? [
          {
            id: insertedRows[i].id,
            description: r.description,
            amount: r.amount,
            category_id: r.category_id,
            card_invoice_id: r.card_invoice_id,
          },
        ]
      : [],
  );
  if (cardRows.length > 0) await linkInstallments(supabase, user.id, cardRows);

  const touchedInvoiceIds = [
    ...new Set(cardRows.map((r) => r.card_invoice_id).filter((id): id is string => !!id)),
  ];
  for (const invoiceId of touchedInvoiceIds) {
    await checkAndLogInvoiceAnomaly(supabase, user.id, invoiceId);
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
  isRefund: boolean;
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
        isRefund: { type: Type.BOOLEAN },
      },
      required: ["description", "amount", "category", "isRefund"],
    },
  };
}

function cardInvoicePrompt(categoryNames: string[]): string {
  return `Você está analisando uma foto ou PDF de uma fatura de cartão de crédito em português do Brasil. Identifique cada compra/lançamento individual na fatura — não o total, taxas, juros ou dados de pagamento.

Para cada compra, extraia:
- description: descrição curta (nome do estabelecimento)
- amount: valor em reais, sempre um número positivo — mesmo pra estorno/devolução (o sinal é indicado só por isRefund, não por amount)
- category: escolha a categoria que melhor descreve o estabelecimento entre exatamente estas opções: ${categoryNames.join(", ") || "(nenhuma cadastrada)"}. Use seu conhecimento geral sobre o tipo de estabelecimento pra decidir, mesmo que o nome seja abreviado ou tenha código (ex: "UBER *TRIP", "IFD*IFOOD"). Se nenhuma categoria se encaixar bem, use "${NO_CATEGORY}".
- isRefund: true se essa linha for um estorno, devolução, crédito ou ajuste a favor — normalmente aparece com sinal negativo (ex: "-45,00") ou entre parênteses na fatura, e reduz o total em vez de aumentar. false pras compras normais.

Se a compra for parcelada (a fatura mostrar algo como "3/10", "PARC 3/10" ou "3 de 10" junto do nome), mantenha essa marcação exatamente como aparece, no final de description — não invente parcelamento que não estiver escrito na fatura.

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
    throw recognitionErrorMessage(err, "Não deu pra analisar esse arquivo agora.");
  }
}

// Diferente das outras análises, uma fatura inteira não vem com data própria
// por item — todos os itens caem na data da fatura, que só se sabe depois
// que a pessoa escolhe em qual fatura entram. Por isso o duplicado-check
// aqui é uma chamada separada, feita quando essa escolha muda, em vez de já
// vir pronto junto do reconhecimento.
export async function checkCardInvoiceDuplicates(
  entryDate: string,
  items: { amount: number; description: string }[],
): Promise<boolean[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return items.map(() => false);

  const { data: existing } = await supabase
    .from("entries")
    .select("amount, entry_date, description")
    .eq("user_id", user.id)
    .eq("entry_date", entryDate);

  return items.map((item) =>
    isPossibleDuplicate(
      { date: entryDate, amount: item.amount, description: item.description },
      existing ?? [],
    ),
  );
}

// Compara o total dessa fatura em revisão com a média das faturas
// anteriores desse mesmo cartão — pra pegar o tipo de coisa que a fatura
// duplicada do Nubank causou (total bem maior que o normal), antes de
// salvar, não só depois de já ter acontecido.
export async function checkInvoiceTotalAnomaly(
  cardId: string,
  currentTotal: number,
): Promise<AnomalyResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { isAnomalous: false, average: 0 };

  const { data: cardInvoices } = await supabase
    .from("card_invoices")
    .select("id")
    .eq("user_id", user.id)
    .eq("card_id", cardId);

  const invoiceIds = (cardInvoices ?? []).map((i) => i.id);
  if (invoiceIds.length === 0) return { isAnomalous: false, average: 0 };

  const { data: entryRows } = await supabase
    .from("entries")
    .select("amount, card_invoice_id")
    .eq("user_id", user.id)
    .in("card_invoice_id", invoiceIds);

  const totalsByInvoice = new Map<string, number>();
  for (const e of entryRows ?? []) {
    if (!e.card_invoice_id) continue;
    totalsByInvoice.set(e.card_invoice_id, (totalsByInvoice.get(e.card_invoice_id) ?? 0) + e.amount);
  }

  return checkAmountAnomaly(currentTotal, [...totalsByInvoice.values()]);
}

// Registro simples de "isso ficou estranho" — só escrita, ninguém lê de
// volta por aqui (quem revisa é a administradora, em /admin, com acesso
// direto ao banco).
export async function logAnomalyFlag(
  kind: string,
  description: string,
  amount: number,
  referenceAmount: number,
  userFlagged: boolean,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("anomaly_flags").insert({
    user_id: user.id,
    kind,
    description,
    amount,
    reference_amount: referenceAmount,
    user_flagged: userFlagged,
  });
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

  const { data: insertedRows, error } = await supabase.from("entries").insert(rows).select("id");
  if (error) {
    console.error("saveCardInvoice: insert em entries falhou:", error);
    throw new Error("Não deu pra salvar os lançamentos agora.");
  }

  const cardRows = rows.flatMap((r, i) =>
    insertedRows?.[i]
      ? [
          {
            id: insertedRows[i].id,
            description: r.description,
            amount: r.amount,
            category_id: r.category_id,
            card_invoice_id: r.card_invoice_id,
          },
        ]
      : [],
  );
  if (cardRows.length > 0) await linkInstallments(supabase, user.id, cardRows);
  await checkAndLogInvoiceAnomaly(supabase, user.id, invoiceId);

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
