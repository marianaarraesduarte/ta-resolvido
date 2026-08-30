"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeftRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Layers,
  ListChecks,
  Pencil,
  Plus,
  Square,
  SquareCheck,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { currency, dotSizeForAmount, levelFor, LEVEL_COLOR, TOKENS } from "@/lib/tokens";
import { brDateLabel, dayOfMonth } from "@/lib/date";
import type { AssistantData } from "@/lib/assistant-data";
import type { FrequentExpense } from "@/lib/frequent-expenses";
import { useConfirm } from "./confirm-dialog";
import { bulkDeleteEntries, bulkSetCategory } from "./entries-actions";
import { deleteCardInvoice, markInvoicePaid, updateInvoiceCard } from "./novo/actions";
import { clearMonthSelection, goToMonth } from "./month-actions";
import { MonthPicker } from "./month-picker";
import { AssistantCard } from "./assistant-card";
import { FrequentExpenseChips } from "./frequent-expense-chips";

export type Entry = {
  id: string;
  type: "despesa" | "receita";
  amount: number;
  description: string;
  entry_date: string;
  category_id: string | null;
  income_type: string | null;
  card_invoice_id: string | null;
};

export type CardInvoiceSummary = {
  id: string;
  invoiceDate: string;
  total: number;
  items: { id: string; description: string; amount: number }[];
  cardId: string | null;
  cardName: string | null;
  cardColor: string | null;
  paidAt: string | null;
};

export type CardOption = { id: string; name: string; color: string };

const DAY_WIDTH = 22;

type DayBucket = { despesas: Entry[]; receitas: Entry[] };

type Selection =
  | { kind: "day"; day: number; type: "despesa" | "receita" }
  | { kind: "invoice"; invoiceId: string }
  | { kind: "dayInvoices"; day: number };

function tooltipLabel(items: Entry[], total: number): string {
  if (items.length === 1) return `${items[0].description} — ${currency(items[0].amount)}`;
  return `${items.length} lançamentos — ${currency(total)}`;
}

type Category = { id: string; name: string };

export function MonthRuler({
  monthName,
  viewedYear,
  viewedMonth,
  todayDayOfMonth,
  daysInMonth,
  entries,
  cardInvoices,
  cards,
  categories,
  comparisonSentence,
  prevMonthKey,
  nextMonthKey,
  isCurrentMonth,
  assistantData,
  frequentExpenses,
}: {
  monthName: string;
  viewedYear: number;
  viewedMonth: number;
  todayDayOfMonth: number | null;
  daysInMonth: number;
  entries: Entry[];
  cardInvoices: CardInvoiceSummary[];
  cards: CardOption[];
  categories: Category[];
  comparisonSentence?: string | null;
  prevMonthKey: string;
  nextMonthKey: string;
  isCurrentMonth: boolean;
  assistantData: AssistantData | null;
  frequentExpenses: FrequentExpense[];
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [selected, setSelected] = useState<Selection | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pickingCategory, setPickingCategory] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [bulkError, setBulkError] = useState("");
  const [switchingCard, setSwitchingCard] = useState(false);
  const todayRef = useRef<HTMLDivElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swipeLocked = useRef<"h" | "v" | null>(null);
  const swipeCooldownUntil = useRef(0);

  // A régua abre rolada pro dia 1 por padrão — sem isso, quem entra dia 20
  // teria que arrastar a tela toda vez só pra ver onde está hoje.
  useEffect(() => {
    todayRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, []);

  // Arrastar a tela pro lado troca de mês (além das setas e do seletor) — a
  // régua em si (data-swipe-exempt) fica de fora, já que ela rola sozinha.
  function handleSwipeStart(e: React.PointerEvent) {
    // Sem isso, um segundo arrasto disparado rápido demais (antes da troca de
    // mês anterior terminar) lia prevMonthKey/nextMonthKey desatualizados e
    // podia navegar pro lado errado, ou repetir o mês que já estava.
    if (Date.now() < swipeCooldownUntil.current) return;
    if ((e.target as HTMLElement).closest("[data-swipe-exempt]")) return;
    // Perto da borda o celular entende como "voltar" (gesto do sistema) — se a
    // gente também reagir aí, os dois gestos brigam.
    if (e.clientX < 24 || e.clientX > window.innerWidth - 24) return;
    swipeStart.current = { x: e.clientX, y: e.clientY };
    swipeLocked.current = null;
  }

  function handleSwipeMove(e: React.PointerEvent) {
    if (!swipeStart.current) return;
    const dx = e.clientX - swipeStart.current.x;
    const dy = e.clientY - swipeStart.current.y;
    if (!swipeLocked.current) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      swipeLocked.current = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
    }
  }

  function handleSwipeEnd(e: React.PointerEvent) {
    if (!swipeStart.current || swipeLocked.current !== "h") {
      swipeStart.current = null;
      return;
    }
    const dx = e.clientX - swipeStart.current.x;
    swipeStart.current = null;
    if (Math.abs(dx) < 70) return;
    swipeCooldownUntil.current = Date.now() + 700;
    void goToMonth("/app", dx < 0 ? nextMonthKey : prevMonthKey);
  }

  function handleSwipeCancel() {
    swipeStart.current = null;
  }

  function exitSelection() {
    setSelecting(false);
    setSelectedIds(new Set());
    setPickingCategory(false);
    setBulkError("");
  }

  function selectAndReset(next: Selection | null) {
    setSelected(next);
    exitSelection();
    setSwitchingCard(false);
  }

  async function handleSwitchCard(invoiceId: string, cardId: string) {
    setProcessing(true);
    setBulkError("");
    try {
      await updateInvoiceCard(invoiceId, cardId);
      setSwitchingCard(false);
      router.refresh();
    } catch (e) {
      setBulkError(e instanceof Error ? e.message : "Não deu pra trocar o cartão agora.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleTogglePaid(invoiceId: string, paid: boolean) {
    setProcessing(true);
    setBulkError("");
    try {
      await markInvoicePaid(invoiceId, paid);
      router.refresh();
    } catch (e) {
      setBulkError(e instanceof Error ? e.message : "Não deu pra atualizar essa fatura agora.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleDeleteInvoice(invoiceId: string) {
    const confirmed = await confirm("Excluir essa fatura vazia? Essa ação não pode ser desfeita.");
    if (!confirmed) return;

    setProcessing(true);
    setBulkError("");
    try {
      await deleteCardInvoice(invoiceId);
      selectAndReset(null);
      router.refresh();
    } catch (e) {
      setBulkError(e instanceof Error ? e.message : "Não deu pra excluir agora.");
    } finally {
      setProcessing(false);
    }
  }

  function toggleInvoice(invoiceId: string) {
    const isSame = selected?.kind === "invoice" && selected.invoiceId === invoiceId;
    selectAndReset(isSame ? null : { kind: "invoice", invoiceId });
  }

  function toggleDayInvoices(day: number) {
    const isSame = selected?.kind === "dayInvoices" && selected.day === day;
    selectAndReset(isSame ? null : { kind: "dayInvoices", day });
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllIds(ids: string[]) {
    setSelectedIds((prev) =>
      ids.length > 0 && ids.every((id) => prev.has(id)) ? new Set() : new Set(ids),
    );
  }

  async function handleBulkDelete() {
    const n = selectedIds.size;
    const confirmed = await confirm(
      `Excluir ${n} ${n === 1 ? "lançamento" : "lançamentos"}? Essa ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    setProcessing(true);
    setBulkError("");
    try {
      await bulkDeleteEntries([...selectedIds]);
      exitSelection();
      router.refresh();
    } catch {
      setBulkError("Não deu pra excluir agora.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleBulkCategory(categoryId: string | null) {
    setProcessing(true);
    setBulkError("");
    try {
      await bulkSetCategory([...selectedIds], categoryId);
      exitSelection();
      router.refresh();
    } catch {
      setBulkError("Não deu pra trocar a categoria agora.");
    } finally {
      setProcessing(false);
    }
  }

  const hasEntries = entries.length > 0;
  const despesas = entries.filter((e) => e.type === "despesa");
  // Itens de fatura de cartão viram um marcador consolidado só, não uma
  // bolinha por compra — por isso ficam de fora da régua "bolinha a bolinha"
  // e da média usada pra colorir as bolinhas (mas continuam contando no
  // total "Saiu", em categorias e em limites normalmente).
  const individualDespesas = despesas.filter((e) => !e.card_invoice_id);
  const despesaAvg =
    individualDespesas.length > 0
      ? individualDespesas.reduce((sum, e) => sum + e.amount, 0) / individualDespesas.length
      : 0;

  const byDay = new Map<number, DayBucket>();
  for (const entry of entries) {
    if (entry.type === "despesa" && entry.card_invoice_id) continue;
    const day = dayOfMonth(entry.entry_date);
    const bucket = byDay.get(day) ?? { despesas: [], receitas: [] };
    if (entry.type === "despesa") bucket.despesas.push(entry);
    else bucket.receitas.push(entry);
    byDay.set(day, bucket);
  }

  const invoicesByDay = new Map<number, CardInvoiceSummary[]>();
  for (const invoice of cardInvoices) {
    const day = dayOfMonth(invoice.invoiceDate);
    invoicesByDay.set(day, [...(invoicesByDay.get(day) ?? []), invoice]);
  }

  const selectedDayItems =
    selected?.kind === "day"
      ? (byDay.get(selected.day)?.[selected.type === "despesa" ? "despesas" : "receitas"] ?? [])
      : [];
  const selectedInvoice =
    selected?.kind === "invoice" ? (cardInvoices.find((i) => i.id === selected.invoiceId) ?? null) : null;

  return (
    <div
      className="flex justify-center px-3 pt-7 pb-2"
      onPointerDown={handleSwipeStart}
      onPointerMove={handleSwipeMove}
      onPointerUp={handleSwipeEnd}
      onPointerCancel={handleSwipeCancel}
    >
      <div className="w-full max-w-sm">
        <div className="mb-5">
          <div className="font-display text-xs font-bold uppercase tracking-wide text-brand-ink opacity-55">
            Tá Resolvido
          </div>
          <div className="mt-0.5 flex items-center gap-2">
            <form action={goToMonth.bind(null, "/app", prevMonthKey)}>
              <button
                type="submit"
                aria-label="Mês anterior"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
              >
                <ChevronLeft size={18} />
              </button>
            </form>
            <MonthPicker
              path="/app"
              monthName={monthName}
              viewedYear={viewedYear}
              viewedMonth={viewedMonth}
            />
            <form action={goToMonth.bind(null, "/app", nextMonthKey)}>
              <button
                type="submit"
                aria-label="Próximo mês"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
              >
                <ChevronRight size={18} />
              </button>
            </form>
          </div>
          {!isCurrentMonth && (
            <form action={clearMonthSelection.bind(null, "/app")}>
              <button
                type="submit"
                className="mt-1 text-[12px] font-medium text-brand-ink-soft underline underline-offset-2"
              >
                Voltar pro mês atual
              </button>
            </form>
          )}
          {hasEntries && comparisonSentence && (
            <div className="mt-2 flex items-start gap-1.5">
              <span className="mt-[5px] h-[6px] w-[6px] flex-shrink-0 rounded-full bg-brand-sage" />
              <p className="text-[13px] font-semibold leading-snug text-brand-ink">
                {comparisonSentence}
              </p>
            </div>
          )}
        </div>

        {!hasEntries && (
          <div className="mb-5 rounded-2xl bg-brand-card p-5">
            <div className="text-[15.5px] font-medium leading-snug text-brand-ink">
              {isCurrentMonth ? "Mês novinho em folha." : "Nada marcado nesse mês."}
            </div>
            <div className="mt-1.5 text-[13.5px] leading-snug text-brand-ink-soft">
              {isCurrentMonth
                ? "Marque o primeiro gasto quando aparecer."
                : "Nenhum lançamento ou fatura caiu por aqui."}
            </div>
          </div>
        )}

        <>
          <div className="mb-1.5 text-[13px] font-semibold text-brand-ink">Régua do mês</div>
          <div className="relative mb-4">
            <div
              data-swipe-exempt
              className="overflow-x-auto rounded-[20px] bg-brand-card p-3.5"
              style={{
                backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${TOKENS.sage} 14%, transparent), transparent 65%)`,
              }}
            >
              {hasEntries && (
                <div className="mb-0.5 text-[12px] font-semibold text-brand-sage">↑ entrou</div>
              )}
            <div className="relative" style={{ minWidth: daysInMonth * DAY_WIDTH, height: 76 }}>
              <div
                className="absolute left-0 right-0 bg-brand-line"
                style={{ top: hasEntries ? 38 : 26, height: 2 }}
              />
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const isToday = day === todayDayOfMonth;
                const bucket = byDay.get(day);
                const dayInvoices = invoicesByDay.get(day) ?? [];
                const despesaTotal = bucket?.despesas.reduce((sum, e) => sum + e.amount, 0) ?? 0;
                const receitaTotal = bucket?.receitas.reduce((sum, e) => sum + e.amount, 0) ?? 0;
                const hasDespesa = (bucket?.despesas.length ?? 0) > 0;
                const isSelectedDespesa =
                  selected?.kind === "day" && selected.day === day && selected.type === "despesa";
                const isSelectedReceita =
                  selected?.kind === "day" && selected.day === day && selected.type === "receita";

                return (
                  <div
                    key={day}
                    ref={isToday ? todayRef : undefined}
                    className="absolute top-0 flex h-full flex-col items-center"
                    style={{ left: (day - 1) * DAY_WIDTH, width: DAY_WIDTH }}
                  >
                    {isToday && (
                      <div
                        className="absolute inset-y-0 rounded-full"
                        style={{
                          left: 2,
                          right: 2,
                          background: "color-mix(in srgb, var(--accent) 12%, transparent)",
                        }}
                      />
                    )}
                    {hasEntries && (
                      <div className="flex flex-1 items-end justify-center">
                        {bucket?.receitas.length ? (
                          <div className="group relative mb-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                selectAndReset(
                                  isSelectedReceita ? null : { kind: "day", day, type: "receita" },
                                )
                              }
                              aria-label={`Entradas do dia ${day}`}
                              className="flex h-6 w-6 items-center justify-center"
                            >
                              <span
                                className={
                                  isSelectedReceita
                                    ? "h-4 w-4 rounded-full bg-brand-sage shadow-md ring-2 ring-brand-ink"
                                    : "h-3 w-3 rounded-full bg-brand-sage shadow-md"
                                }
                              />
                            </button>
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-ink-solid px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                              {tooltipLabel(bucket.receitas, receitaTotal)}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div
                      className={
                        isToday
                          ? "relative z-10 flex-shrink-0 rounded-full bg-[var(--accent)]"
                          : "w-px flex-shrink-0 bg-brand-line"
                      }
                      style={isToday ? { width: 3, height: 16 } : { height: 8 }}
                    />
                    <div
                      className={
                        isToday
                          ? "mt-0.5 flex-shrink-0 text-[12px] font-bold text-brand-ink"
                          : "mt-0.5 flex-shrink-0 text-[12px] text-brand-ink-soft"
                      }
                    >
                      {day}
                    </div>
                    {!hasEntries && isToday && (
                      <div className="mt-0.5 flex-shrink-0 whitespace-nowrap text-[12px] font-bold text-[var(--accent)]">
                        HOJE
                      </div>
                    )}

                    {hasEntries && (
                      <div className="mt-1 flex flex-1 flex-col items-center gap-1">
                        {dayInvoices.length > 0 &&
                          (() => {
                            const first = dayInvoices[0];
                            const isCluster = dayInvoices.length > 1;
                            const isSelected = isCluster
                              ? selected?.kind === "dayInvoices" && selected.day === day
                              : selected?.kind === "invoice" && selected.invoiceId === first.id;
                            return (
                              <div className="group relative">
                                <button
                                  type="button"
                                  onClick={() =>
                                    isCluster ? toggleDayInvoices(day) : toggleInvoice(first.id)
                                  }
                                  aria-label={
                                    isCluster
                                      ? `${dayInvoices.length} faturas do dia ${day}`
                                      : `Fatura do cartão do dia ${day}`
                                  }
                                  className="flex h-6 w-6 items-center justify-center"
                                >
                                  <span
                                    className={
                                      isSelected
                                        ? "flex h-3.5 w-3.5 rotate-12 items-center justify-center rounded-[4px] ring-2 ring-brand-ink"
                                        : "flex h-3 w-3 rotate-12 items-center justify-center rounded-[3px]"
                                    }
                                    style={{ background: first.cardColor ?? "var(--accent)" }}
                                  >
                                    <CreditCard size={8} className="-rotate-12 text-white" />
                                  </span>
                                </button>
                                {isCluster && (
                                  <span className="pointer-events-none absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-brand-ink-solid text-[9px] font-bold text-white">
                                    {dayInvoices.length}
                                  </span>
                                )}
                                <div className="pointer-events-none absolute top-full left-1/2 z-10 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-ink-solid px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  {isCluster
                                    ? `${dayInvoices.length} faturas — toque pra ver`
                                    : `${first.cardName ? `${first.cardName} · ` : "Fatura · "}${first.items.length} ${first.items.length === 1 ? "compra" : "compras"} — ${currency(first.total)}`}
                                </div>
                              </div>
                            );
                          })()}
                        {hasDespesa ? (
                          <div className="group relative">
                            <button
                              type="button"
                              onClick={() =>
                                selectAndReset(
                                  isSelectedDespesa ? null : { kind: "day", day, type: "despesa" },
                                )
                              }
                              aria-label={`Gastos do dia ${day}`}
                              className="flex h-6 w-6 items-center justify-center"
                            >
                              <span
                                className={
                                  isSelectedDespesa
                                    ? "rounded-full bg-brand-coral shadow-md ring-2 ring-brand-ink"
                                    : "rounded-full bg-brand-coral shadow-md"
                                }
                                style={(() => {
                                  const size =
                                    dotSizeForAmount(despesaTotal, despesaAvg) + (isSelectedDespesa ? 4 : 0);
                                  return { width: size, height: size };
                                })()}
                              />
                            </button>
                            <div className="pointer-events-none absolute top-full left-1/2 z-10 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-ink-solid px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                              {tooltipLabel(bucket!.despesas, despesaTotal)}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
              </div>
              {hasEntries && (
                <div className="mt-0.5 text-[12px] font-semibold text-brand-coral">↓ saiu</div>
              )}
            </div>
            <div
              className="pointer-events-none absolute inset-y-3.5 left-0 w-6 rounded-l-[20px]"
              style={{ background: `linear-gradient(90deg, ${TOKENS.card}, transparent)` }}
            />
            <div
              className="pointer-events-none absolute inset-y-3.5 right-0 w-6 rounded-r-[20px]"
              style={{ background: `linear-gradient(270deg, ${TOKENS.card}, transparent)` }}
            />
          </div>
        </>

        {assistantData && (
          <AssistantCard data={assistantData} comparisonSentence={comparisonSentence ?? null} dayOfMonth={todayDayOfMonth ?? 1} />
        )}

        {selected?.kind === "day" && selectedDayItems.length > 0 && (
          <div className="mb-4 rounded-2xl bg-brand-card px-4 py-3.5">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs text-brand-ink-soft">
                Dia {selected.day} · {selected.type === "receita" ? "entrada" : "saída"}
                {selectedDayItems.length > 1 ? ` · ${selectedDayItems.length} lançamentos` : ""}
              </div>
              {selected.type === "despesa" && selectedDayItems.length > 1 && (
                <button
                  type="button"
                  onClick={() => (selecting ? exitSelection() : setSelecting(true))}
                  className={
                    selecting
                      ? "flex flex-shrink-0 items-center gap-1.5 rounded-full bg-brand-ink-solid px-3 py-1.5 text-[12px] font-semibold text-white"
                      : "flex flex-shrink-0 items-center gap-1.5 rounded-full border border-brand-line bg-brand-bg px-3 py-1.5 text-[12px] font-semibold text-brand-ink"
                  }
                >
                  {selecting ? <X size={12} /> : <ListChecks size={12} />}
                  {selecting ? "Cancelar" : "Selecionar"}
                </button>
              )}
            </div>
            {selecting && (
              <button
                type="button"
                onClick={() => toggleAllIds(selectedDayItems.map((it) => it.id))}
                className="mb-2 flex items-center gap-2 text-[12px] font-medium text-brand-ink-soft"
              >
                {selectedDayItems.length > 0 &&
                selectedDayItems.every((it) => selectedIds.has(it.id)) ? (
                  <SquareCheck size={15} style={{ color: "var(--accent)" }} />
                ) : (
                  <Square size={15} />
                )}
                {selectedDayItems.length > 0 &&
                selectedDayItems.every((it) => selectedIds.has(it.id))
                  ? "Desmarcar tudo"
                  : "Selecionar tudo"}
              </button>
            )}
            <div className="flex flex-col gap-2">
              {selectedDayItems.map((item) => {
                const checked = selectedIds.has(item.id);
                const content = (
                  <>
                    {selecting &&
                      (checked ? (
                        <SquareCheck
                          size={17}
                          className="flex-shrink-0"
                          style={{ color: "var(--accent)" }}
                        />
                      ) : (
                        <Square size={17} className="flex-shrink-0 text-brand-ink-soft" />
                      ))}
                    <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-brand-ink">
                      {item.description}
                    </span>
                    <span
                      className="flex-shrink-0 whitespace-nowrap font-display text-[15px] font-bold"
                      style={{
                        color:
                          selected.type === "receita"
                            ? TOKENS.sage
                            : LEVEL_COLOR[levelFor(item.amount, despesaAvg)],
                      }}
                    >
                      {selected.type === "receita" ? "+" : "-"}
                      {currency(item.amount)}
                    </span>
                    {!selecting && <Pencil size={13} className="flex-shrink-0 text-brand-ink-soft" />}
                  </>
                );
                return selecting ? (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleOne(item.id)}
                    className="flex items-center gap-3 text-left"
                  >
                    {content}
                  </button>
                ) : (
                  <Link
                    key={item.id}
                    href={`/app/lancamento/${item.id}`}
                    className="flex items-center justify-between gap-3"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
            {bulkError && <p className="mt-2 text-xs text-brand-coral">{bulkError}</p>}
          </div>
        )}

        {selected?.kind === "dayInvoices" && (
          <div className="mb-4 rounded-2xl bg-brand-card px-4 py-3.5">
            <div className="mb-2 text-xs text-brand-ink-soft">
              Dia {selected.day} · {(invoicesByDay.get(selected.day) ?? []).length} faturas
            </div>
            <div className="flex flex-col gap-2">
              {(invoicesByDay.get(selected.day) ?? []).map((invoice) => (
                <button
                  key={invoice.id}
                  type="button"
                  onClick={() => selectAndReset({ kind: "invoice", invoiceId: invoice.id })}
                  className="flex items-center gap-2.5 rounded-xl bg-brand-bg px-3 py-2.5 text-left"
                >
                  <span
                    className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                    style={{ background: invoice.cardColor ?? "var(--accent)" }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-brand-ink">
                    {invoice.cardName ?? "Fatura do cartão"}
                  </span>
                  <span className="flex-shrink-0 text-[13px] font-semibold text-brand-ink-soft">
                    {currency(invoice.total)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedInvoice && (
          <div className="mb-4 rounded-2xl bg-brand-card px-4 py-3.5">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1 text-xs text-brand-ink-soft">
                {selectedInvoice.cardName ?? "Fatura do cartão"} · dia{" "}
                {dayOfMonth(selectedInvoice.invoiceDate)} · {selectedInvoice.items.length}{" "}
                {selectedInvoice.items.length === 1 ? "compra" : "compras"}
              </div>
              {selectedInvoice.items.length === 0 ? (
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => handleDeleteInvoice(selectedInvoice.id)}
                  className="flex flex-shrink-0 items-center gap-1.5 rounded-full bg-brand-coral px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-60"
                >
                  <Trash2 size={12} />
                  Excluir fatura vazia
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => (selecting ? exitSelection() : setSelecting(true))}
                  className={
                    selecting
                      ? "flex flex-shrink-0 items-center gap-1.5 rounded-full bg-brand-ink-solid px-3 py-1.5 text-[12px] font-semibold text-white"
                      : "flex flex-shrink-0 items-center gap-1.5 rounded-full border border-brand-line bg-brand-bg px-3 py-1.5 text-[12px] font-semibold text-brand-ink"
                  }
                >
                  {selecting ? <X size={12} /> : <ListChecks size={12} />}
                  {selecting ? "Cancelar" : "Selecionar"}
                </button>
              )}
            </div>

            <div className="mb-2.5 flex items-center justify-between gap-2 rounded-xl bg-brand-bg px-3 py-2.5">
              <div
                className="flex items-center gap-1.5 text-[12px] font-semibold"
                style={{ color: selectedInvoice.paidAt ? TOKENS.sage : TOKENS.amber }}
              >
                <span
                  className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                  style={{ background: selectedInvoice.paidAt ? TOKENS.sage : TOKENS.amber }}
                />
                {selectedInvoice.paidAt
                  ? `Paga em ${brDateLabel(selectedInvoice.paidAt.slice(0, 10))}`
                  : "Ainda não marcada como paga"}
              </div>
              <button
                type="button"
                disabled={processing}
                onClick={() => handleTogglePaid(selectedInvoice.id, !selectedInvoice.paidAt)}
                className={
                  selectedInvoice.paidAt
                    ? "flex-shrink-0 text-[11.5px] font-medium text-brand-ink-soft underline underline-offset-2 disabled:opacity-60"
                    : "flex flex-shrink-0 items-center gap-1 rounded-full bg-brand-sage px-3 py-1.5 text-[12px] font-semibold text-white disabled:opacity-60"
                }
              >
                {selectedInvoice.paidAt ? (
                  "Desmarcar"
                ) : (
                  <>
                    <Check size={12} />
                    Marcar como paga
                  </>
                )}
              </button>
            </div>

            <div className="mb-2.5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSwitchingCard((prev) => !prev)}
                className={
                  switchingCard
                    ? "flex items-center gap-1.5 rounded-full bg-brand-ink-solid px-3 py-1.5 text-[12px] font-semibold text-white"
                    : "flex items-center gap-1.5 rounded-full border border-brand-plum bg-brand-plum/10 px-3 py-1.5 text-[12px] font-semibold text-brand-plum"
                }
              >
                <ArrowLeftRight size={12} />
                Trocar cartão dessa fatura
              </button>
              <Link
                href="/app/parcelas"
                className="flex items-center gap-1.5 rounded-full border border-brand-line bg-brand-bg px-3 py-1.5 text-[12px] font-semibold text-brand-ink"
              >
                <Layers size={12} />
                Ver parcelas
              </Link>
            </div>
            {switchingCard && (
              <div className="mb-2.5 rounded-xl bg-brand-bg px-3 py-2.5">
                <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand-ink-soft">
                  Mudar para qual cartão?
                </div>
                {cards.length === 0 ? (
                  <p className="text-[12.5px] text-brand-ink-soft">
                    Você ainda não tem outro cartão cadastrado.
                  </p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {cards.map((c) => {
                      const isCurrent = c.id === selectedInvoice.cardId;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          disabled={processing || isCurrent}
                          onClick={() => handleSwitchCard(selectedInvoice.id, c.id)}
                          className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] font-medium text-brand-ink disabled:opacity-60"
                        >
                          <span
                            className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                            style={{ background: c.color }}
                          />
                          <span className="min-w-0 flex-1 truncate">{c.name}</span>
                          {isCurrent && <Check size={13} className="flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {selecting && (
              <button
                type="button"
                onClick={() => toggleAllIds(selectedInvoice.items.map((it) => it.id))}
                className="mb-2 flex items-center gap-2 text-[12px] font-medium text-brand-ink-soft"
              >
                {selectedInvoice.items.every((it) => selectedIds.has(it.id)) ? (
                  <SquareCheck size={15} style={{ color: "var(--accent)" }} />
                ) : (
                  <Square size={15} />
                )}
                {selectedInvoice.items.every((it) => selectedIds.has(it.id))
                  ? "Desmarcar tudo"
                  : "Selecionar tudo"}
              </button>
            )}
            {bulkError && <p className="mb-2 text-xs text-brand-coral">{bulkError}</p>}
            <div className="flex flex-col gap-2">
              {selectedInvoice.items.map((item) => {
                const checked = selectedIds.has(item.id);
                const content = (
                  <>
                    {selecting &&
                      (checked ? (
                        <SquareCheck
                          size={17}
                          className="flex-shrink-0"
                          style={{ color: "var(--accent)" }}
                        />
                      ) : (
                        <Square size={17} className="flex-shrink-0 text-brand-ink-soft" />
                      ))}
                    <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-brand-ink">
                      {item.description}
                    </span>
                    <span className="flex-shrink-0 whitespace-nowrap font-display text-[15px] font-bold text-brand-ink">
                      -{currency(item.amount)}
                    </span>
                    {!selecting && <Pencil size={13} className="flex-shrink-0 text-brand-ink-soft" />}
                  </>
                );
                return selecting ? (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleOne(item.id)}
                    className="flex items-center gap-3 text-left"
                  >
                    {content}
                  </button>
                ) : (
                  <Link
                    key={item.id}
                    href={`/app/lancamento/${item.id}`}
                    className="flex items-center justify-between gap-3"
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
            {bulkError && <p className="mt-2 text-xs text-brand-coral">{bulkError}</p>}
          </div>
        )}

        {selecting && selectedIds.size > 0 && (
          <div className="fixed inset-x-0 bottom-[68px] z-20 flex justify-center px-3">
            <div className="w-full max-w-sm rounded-2xl bg-brand-ink-solid px-4 py-3.5 shadow-lg">
              {pickingCategory ? (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[12.5px] font-semibold text-white">
                      Trocar categoria de {selectedIds.size}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPickingCategory(false)}
                      aria-label="Cancelar"
                      className="text-white/70"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleBulkCategory(null)}
                      className="rounded-full bg-brand-card/15 px-3 py-1.5 text-[12.5px] font-medium text-white"
                    >
                      Sem categoria
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleBulkCategory(c.id)}
                        className="rounded-full bg-brand-card/15 px-3 py-1.5 text-[12.5px] font-medium text-white"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-white">
                    {selectedIds.size} {selectedIds.size === 1 ? "selecionado" : "selecionados"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={processing}
                      onClick={() => setPickingCategory(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-brand-card/15 px-3 py-2 text-[12.5px] font-semibold text-white disabled:opacity-60"
                    >
                      <Tag size={13} />
                      Categoria
                    </button>
                    <button
                      type="button"
                      disabled={processing}
                      onClick={handleBulkDelete}
                      className="flex items-center gap-1.5 rounded-xl bg-brand-coral px-3 py-2 text-[12.5px] font-semibold text-white disabled:opacity-60"
                    >
                      <Trash2 size={13} />
                      Excluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {hasEntries && (
          <div className="mb-7 flex flex-wrap items-center gap-3.5">
            {(
              [
                [TOKENS.sage, "entrada"],
                [TOKENS.coral, "saída"],
              ] as const
            ).map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ background: color }} />
                <span className="text-[11.5px] text-brand-ink-soft">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 rotate-12 rounded-[2px]"
                style={{ background: TOKENS.inkSoft }}
              />
              <span className="text-[11.5px] text-brand-ink-soft">
                fatura do cartão (cor do seu cartão)
              </span>
            </div>
          </div>
        )}

        <FrequentExpenseChips items={frequentExpenses} />

        <Link
          href="/app/novo"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] py-3.5 font-display text-[15px] font-semibold text-white"
        >
          <Plus size={16} />
          Marcar lançamento
        </Link>
      </div>
    </div>
  );
}
