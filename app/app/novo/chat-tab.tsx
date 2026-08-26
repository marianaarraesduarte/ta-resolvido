"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Check,
  CreditCard,
  Lock,
  MessageCircle,
  Repeat,
  Send,
  Trash2,
} from "lucide-react";
import { amountToInputValue, formatCentsInput, parseCentsInput } from "@/lib/tokens";
import { toDateKey } from "@/lib/date";
import { matchFixedExpense } from "@/lib/fixed-expense-match";
import {
  checkExistingInvoiceDate,
  recognizeChatMessage,
  saveRecognizedItems,
  type ChatItem,
} from "./actions";

type Category = { id: string; name: string };
type FixedExpense = { name: string; expected_amount: number };
type ReviewItem = ChatItem & { id: string; isSalary: boolean; amountText: string; dueDate: string };
type ChatEntry =
  | { kind: "user"; id: string; text: string }
  | { kind: "batch"; id: string; items: ReviewItem[] }
  | { kind: "saved"; id: string; count: number }
  | { kind: "empty"; id: string };

export function ChatTab({
  fixedExpenses,
  categories,
  salaryPatterns,
  recognitionsRemaining,
  isCompleto,
  initialText,
}: {
  fixedExpenses: FixedExpense[];
  categories: Category[];
  salaryPatterns: string[];
  recognitionsRemaining: number | null;
  isCompleto: boolean;
  initialText?: string | null;
}) {
  const router = useRouter();
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [savingBatch, setSavingBatch] = useState<string | null>(null);
  const [duplicateDates, setDuplicateDates] = useState<Record<string, boolean>>({});

  const creditItems = isCompleto
    ? entries.flatMap((e) => (e.kind === "batch" ? e.items : [])).filter(
        (it) => it.isCreditCard && it.dueDate,
      )
    : [];
  const creditItemsKey = creditItems.map((it) => `${it.id}:${it.dueDate}`).join("|");

  useEffect(() => {
    if (creditItems.length === 0) return;
    let cancelled = false;
    Promise.all(
      creditItems.map(async (it) => ({ id: it.id, dup: await checkExistingInvoiceDate(it.dueDate) })),
    ).then((results) => {
      if (cancelled) return;
      setDuplicateDates((prev) => {
        const next = { ...prev };
        for (const r of results) next[r.id] = r.dup;
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditItemsKey]);

  // Texto compartilhado de outro app (ex: copiar uma mensagem) — já manda
  // pra análise sozinho, sem esperar a pessoa apertar enviar de novo.
  useEffect(() => {
    if (initialText) handleSend(initialText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateBatch(batchId: string, updater: (items: ReviewItem[]) => ReviewItem[]) {
    setEntries((prev) =>
      prev.map((e) => (e.kind === "batch" && e.id === batchId ? { ...e, items: updater(e.items) } : e)),
    );
  }

  function removeItem(batchId: string, itemId: string) {
    updateBatch(batchId, (items) => items.filter((it) => it.id !== itemId));
  }

  function updateItemDescription(batchId: string, itemId: string, description: string) {
    updateBatch(batchId, (items) =>
      items.map((it) => (it.id === itemId ? { ...it, description } : it)),
    );
  }

  function updateItemCategory(batchId: string, itemId: string, category: string | null) {
    updateBatch(batchId, (items) =>
      items.map((it) => (it.id === itemId ? { ...it, category } : it)),
    );
  }

  function toggleSalary(batchId: string, itemId: string) {
    updateBatch(batchId, (items) =>
      items.map((it) => (it.id === itemId ? { ...it, isSalary: !it.isSalary } : it)),
    );
  }

  function updateItemDueDate(batchId: string, itemId: string, dueDate: string) {
    updateBatch(batchId, (items) =>
      items.map((it) => (it.id === itemId ? { ...it, dueDate } : it)),
    );
  }

  function updateItemAmountText(batchId: string, itemId: string, raw: string) {
    const amountText = formatCentsInput(raw);
    updateBatch(batchId, (items) =>
      items.map((it) => (it.id === itemId ? { ...it, amountText, amount: parseCentsInput(amountText) } : it)),
    );
  }

  function matchedFixedExpense(description: string, amount: number | null): string | null {
    if (amount === null) return null;
    return matchFixedExpense(description, amount, fixedExpenses);
  }

  async function handleSend(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || analyzing) return;
    setInput("");
    setError("");
    const userId = `u-${Date.now()}`;
    setEntries((prev) => [...prev, { kind: "user", id: userId, text }]);
    setAnalyzing(true);

    try {
      const recognized = await recognizeChatMessage(text);
      if (recognized.length === 0) {
        setEntries((prev) => [...prev, { kind: "empty", id: `e-${Date.now()}` }]);
        return;
      }
      const items: ReviewItem[] = recognized.map((item, i) => ({
        ...item,
        id: `${Date.now()}-${i}`,
        isSalary:
          item.type === "receita" && salaryPatterns.includes(item.description.trim().toLowerCase()),
        amountText: item.amount !== null ? amountToInputValue(item.amount) : "",
        dueDate: item.isCreditCard ? toDateKey(new Date()) : "",
      }));
      setEntries((prev) => [...prev, { kind: "batch", id: `b-${Date.now()}`, items }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não deu pra entender essa mensagem agora.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSaveBatch(batchId: string, items: ReviewItem[]) {
    const missingAmount = items.some((it) => it.amount === null || it.amount <= 0);
    if (missingAmount) {
      setError("Completa o valor que falta antes de salvar.");
      return;
    }

    const missingDueDate = isCompleto && items.some((it) => it.isCreditCard && !it.dueDate);
    if (missingDueDate) {
      setError("Completa a data de vencimento da fatura antes de salvar.");
      return;
    }

    setSavingBatch(batchId);
    setError("");
    try {
      await saveRecognizedItems(
        items.map(({ description, amount, type, isSalary, date, category, isCreditCard, dueDate }) => ({
          description,
          amount: amount as number,
          type,
          isSalary,
          date,
          category,
          isCreditCard: isCompleto && isCreditCard,
          dueDate: isCompleto && isCreditCard ? dueDate : null,
        })),
        "chat",
      );
      setEntries((prev) =>
        prev
          .filter((e) => e.id !== batchId)
          .concat({ kind: "saved", id: `s-${Date.now()}`, count: items.length }),
      );
      router.refresh();
    } catch {
      setError("Não deu pra salvar os lançamentos agora.");
    } finally {
      setSavingBatch(null);
    }
  }

  return (
    <div className="flex flex-col">
      {recognitionsRemaining !== null &&
        (recognitionsRemaining > 0 ? (
          <p className="mb-3.5 text-[12.5px] text-brand-ink-soft">
            Você ainda tem {recognitionsRemaining}{" "}
            {recognitionsRemaining === 1 ? "reconhecimento grátis" : "reconhecimentos grátis"} esse
            mês (foto ou chat).
          </p>
        ) : (
          <p className="mb-3.5 text-[12.5px] font-medium text-brand-coral">
            Você já usou seus reconhecimentos grátis desse mês.{" "}
            <Link href="/app/planos" className="underline underline-offset-2">
              Assine o Completo
            </Link>{" "}
            pra reconhecer sem limite.
          </p>
        ))}

      {entries.length === 0 && (
        <div className="mb-3.5 rounded-2xl border-2 border-dashed border-brand-line bg-white py-9 text-center">
          <MessageCircle size={26} className="mx-auto mb-2 text-brand-ink" />
          <p className="mx-auto max-w-[240px] text-[13.5px] font-medium text-brand-ink-soft">
            Escreve o que você gastou ou recebeu, do seu jeito. Ex: &quot;gastei 45 no
            mercado hoje&quot;
          </p>
        </div>
      )}

      <div className="mb-3.5 flex flex-col gap-3">
        {entries.map((entry) => {
          if (entry.kind === "user") {
            return (
              <div key={entry.id} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand-ink px-3.5 py-2.5 text-[13.5px] text-brand-card">
                  {entry.text}
                </div>
              </div>
            );
          }

          if (entry.kind === "empty") {
            return (
              <div key={entry.id} className="rounded-2xl bg-brand-bg px-3.5 py-2.5 text-[13px] text-brand-ink-soft">
                Não consegui identificar nenhum lançamento nessa mensagem. Tenta descrever
                de outro jeito.
              </div>
            );
          }

          if (entry.kind === "saved") {
            return (
              <div
                key={entry.id}
                className="flex w-fit items-center gap-1.5 rounded-2xl bg-brand-sage/15 px-3.5 py-2.5 text-[13px] font-semibold text-brand-sage"
              >
                <Check size={14} />
                {entry.count === 1 ? "Lançamento salvo!" : `${entry.count} lançamentos salvos!`}
              </div>
            );
          }

          return (
            <div key={entry.id} className="rounded-2xl bg-brand-bg p-2.5">
              <p className="mb-2 px-1 text-[11.5px] text-brand-ink-soft">
                {entry.items.length === 1
                  ? "1 lançamento identificado"
                  : `${entry.items.length} lançamentos identificados`}{" "}
                — confere antes de salvar
              </p>
              <div className="mb-2.5 divide-y divide-brand-bg overflow-hidden rounded-2xl border border-brand-line">
                {entry.items.map((item) => {
                  const missing = item.amount === null;
                  return (
                    <div
                      key={item.id}
                      className={
                        missing
                          ? "flex items-start gap-2.5 bg-brand-coral/10 px-3.5 py-3"
                          : item.possibleDuplicate
                            ? "flex items-start gap-2.5 bg-brand-coral/10 px-3.5 py-3"
                            : "flex items-start gap-2.5 bg-white px-3.5 py-3"
                      }
                    >
                      {item.type === "receita" ? (
                        <ArrowUpCircle size={15} className="flex-shrink-0 text-brand-sage" />
                      ) : (
                        <ArrowDownCircle size={15} className="flex-shrink-0 text-brand-coral" />
                      )}
                      <div className="min-w-0 flex-1">
                        <input
                          value={item.description}
                          onChange={(e) => updateItemDescription(entry.id, item.id, e.target.value)}
                          aria-label="Descrição"
                          className="w-full truncate rounded-md border border-transparent bg-transparent px-0.5 text-[13.5px] font-medium text-brand-ink outline-none focus:border-brand-line focus:bg-white"
                        />
                        {missing && (
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-brand-coral">
                            <AlertTriangle size={11} className="flex-shrink-0" />
                            Não achei o valor — completa aqui
                          </div>
                        )}
                        {!missing && item.possibleDuplicate && (
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-brand-coral">
                            <AlertTriangle size={11} className="flex-shrink-0" />
                            Pode ser repetido — já tem algo parecido nessa data
                          </div>
                        )}
                        {item.isCreditCard && (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-plum px-2 py-0.5 text-[11px] font-semibold text-white">
                            <CreditCard size={10} className="flex-shrink-0" />
                            crédito
                          </div>
                        )}
                        {item.type === "despesa" &&
                          matchedFixedExpense(item.description, item.amount) && (
                            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-amber px-2 py-0.5 text-[11px] font-semibold text-white">
                              <Repeat size={10} className="flex-shrink-0" />
                              Gasto fixo &quot;
                              {matchedFixedExpense(item.description, item.amount)}&quot;
                            </div>
                          )}
                        <div className="mt-1 flex flex-wrap items-center gap-2.5">
                          <span className="text-[11px] text-brand-ink-soft">{item.date}</span>
                          {item.type === "despesa" && (
                            <select
                              value={item.category ?? ""}
                              onChange={(e) =>
                                updateItemCategory(entry.id, item.id, e.target.value || null)
                              }
                              aria-label={`Categoria de ${item.description}`}
                              className="rounded-md border border-brand-line bg-white px-1.5 py-0.5 text-[11px] text-brand-ink-soft outline-none focus:border-brand-ink"
                            >
                              <option value="">Sem categoria</option>
                              {categories.map((c) => (
                                <option key={c.id} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          )}
                          {item.type === "receita" && (
                            <button
                              type="button"
                              onClick={() => toggleSalary(entry.id, item.id)}
                              className={
                                item.isSalary
                                  ? "text-[11px] font-semibold text-brand-sage"
                                  : "text-[11px] font-semibold text-brand-ink-soft"
                              }
                            >
                              {item.isSalary ? "✓ marcado como salário" : "marcar como salário"}
                            </button>
                          )}
                        </div>
                        {item.isCreditCard && isCompleto && (
                          <div className="mt-2 border-t border-dashed border-brand-line pt-2">
                            <label
                              htmlFor={`due-date-${item.id}`}
                              className="mb-1 block text-[10.5px] font-semibold uppercase tracking-wide text-brand-ink-soft"
                            >
                              Vencimento da fatura
                            </label>
                            <input
                              id={`due-date-${item.id}`}
                              type="date"
                              value={item.dueDate}
                              onChange={(e) => updateItemDueDate(entry.id, item.id, e.target.value)}
                              className="w-full rounded-md border border-brand-line bg-white px-2 py-1 text-[12.5px] text-brand-ink outline-none focus:border-brand-ink"
                            />
                            {duplicateDates[item.id] && (
                              <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-brand-coral">
                                <AlertTriangle size={11} className="flex-shrink-0" />
                                Você já tem uma fatura salva com essa data de vencimento
                              </div>
                            )}
                          </div>
                        )}
                        {item.isCreditCard && !isCompleto && (
                          <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-brand-plum/10 px-2.5 py-2 text-[11px] leading-snug text-brand-plum">
                            <Lock size={11} className="mt-0.5 flex-shrink-0" />
                            <span>
                              Rastrear isso certinho na fatura (com data de vencimento) é um
                              recurso do{" "}
                              <Link href="/app/planos" className="font-semibold underline underline-offset-2">
                                Completo
                              </Link>
                              . Por enquanto, vai entrar como um gasto normal, na data acima.
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-0.5 whitespace-nowrap font-display text-[14px] font-bold text-brand-ink">
                        {item.type === "receita" ? "+" : "-"}
                        <input
                          value={item.amountText}
                          onChange={(e) => updateItemAmountText(entry.id, item.id, e.target.value)}
                          placeholder="0,00"
                          inputMode="decimal"
                          aria-label="Valor"
                          className={
                            missing
                              ? "w-16 rounded-md border border-dashed border-brand-coral bg-white px-0.5 text-right text-[14px] font-bold text-brand-coral outline-none"
                              : "w-16 rounded-md border border-transparent bg-transparent px-0.5 text-right text-[14px] font-bold text-brand-ink outline-none focus:border-brand-line focus:bg-white"
                          }
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(entry.id, item.id)}
                        aria-label={`Remover ${item.description}`}
                        className="flex-shrink-0 text-brand-ink-soft"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                disabled={savingBatch === entry.id}
                onClick={() => handleSaveBatch(entry.id, entry.items)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-sage py-3 font-display text-[14px] font-semibold text-white disabled:opacity-60"
              >
                <Check size={16} />
                {savingBatch === entry.id ? "Salvando..." : "Salvar"}
              </button>
            </div>
          );
        })}

        {analyzing && (
          <div className="w-fit rounded-2xl rounded-bl-sm bg-brand-bg px-4 py-3 text-[13px] text-brand-ink-soft">
            Analisando...
          </div>
        )}
      </div>

      {error && <p className="mb-3 text-sm text-brand-coral">{error}</p>}

      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Escreve aqui..."
          className="flex-1 rounded-2xl border border-brand-line bg-white px-3.5 py-3 text-[14px] text-brand-ink outline-none focus:border-brand-ink"
        />
        <button
          type="button"
          disabled={analyzing || !input.trim()}
          onClick={() => handleSend()}
          aria-label="Enviar"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-ink text-brand-card disabled:opacity-40"
        >
          <Send size={17} />
        </button>
      </div>
    </div>
  );
}
