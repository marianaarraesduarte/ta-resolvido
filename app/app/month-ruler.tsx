"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ListChecks,
  Pencil,
  Plus,
  Square,
  SquareCheck,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { currency, levelFor, LEVEL_COLOR, TOKENS } from "@/lib/tokens";
import { dayOfMonth } from "@/lib/date";
import type { FolegoData } from "@/lib/folego";
import { useConfirm } from "./confirm-dialog";
import { bulkDeleteEntries, bulkSetCategory } from "./entries-actions";
import { clearMonthSelection, goToMonth } from "./month-actions";
import { MonthPicker } from "./month-picker";
import { FolegoCard } from "./folego-card";

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
};

const DAY_WIDTH = 22;

type DayBucket = { despesas: Entry[]; receitas: Entry[] };

type Selection =
  | { kind: "day"; day: number; type: "despesa" | "receita" }
  | { kind: "invoice"; invoiceId: string };

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
  categories,
  comparisonSentence,
  prevMonthKey,
  nextMonthKey,
  isCurrentMonth,
  isFutureMonth,
  saldoAtual,
  folego,
}: {
  monthName: string;
  viewedYear: number;
  viewedMonth: number;
  todayDayOfMonth: number | null;
  daysInMonth: number;
  entries: Entry[];
  cardInvoices: CardInvoiceSummary[];
  categories: Category[];
  comparisonSentence?: string | null;
  prevMonthKey: string;
  nextMonthKey: string;
  isCurrentMonth: boolean;
  isFutureMonth: boolean;
  saldoAtual: number;
  folego: FolegoData | null;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [selected, setSelected] = useState<Selection | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pickingCategory, setPickingCategory] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [bulkError, setBulkError] = useState("");

  function exitSelection() {
    setSelecting(false);
    setSelectedIds(new Set());
    setPickingCategory(false);
    setBulkError("");
  }

  function selectAndReset(next: Selection | null) {
    setSelected(next);
    exitSelection();
  }

  function toggleInvoice(invoiceId: string) {
    const isSame = selected?.kind === "invoice" && selected.invoiceId === invoiceId;
    selectAndReset(isSame ? null : { kind: "invoice", invoiceId });
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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
    <div className="flex justify-center px-3 py-7">
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
            <p className="mt-1.5 text-[12.5px] leading-snug text-brand-ink-soft">
              {comparisonSentence}
            </p>
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

        {folego ? (
          <FolegoCard {...folego} />
        ) : (
          <>
          <div className="mb-1.5 text-[13px] font-semibold text-brand-ink">Régua do mês</div>
          <div className="mb-4 overflow-x-auto rounded-[20px] bg-brand-card p-3.5">
            {hasEntries && (
              <div className="mb-0.5 text-[10px] font-semibold text-brand-sage">↑ entrou</div>
            )}
            <div
              className="relative"
              style={{ minWidth: daysInMonth * DAY_WIDTH, height: hasEntries ? 130 : 76 }}
            >
              <div
                className="absolute left-0 right-0 bg-brand-line"
                style={{ top: hasEntries ? 65 : 26, height: 2 }}
              />
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const isToday = day === todayDayOfMonth;
                const bucket = byDay.get(day);
                const dayInvoices = invoicesByDay.get(day) ?? [];
                const despesaTotal = bucket?.despesas.reduce((sum, e) => sum + e.amount, 0) ?? 0;
                const receitaTotal = bucket?.receitas.reduce((sum, e) => sum + e.amount, 0) ?? 0;
                const level = bucket?.despesas.length ? levelFor(despesaTotal, despesaAvg) : null;
                const isSelectedDespesa =
                  selected?.kind === "day" && selected.day === day && selected.type === "despesa";
                const isSelectedReceita =
                  selected?.kind === "day" && selected.day === day && selected.type === "receita";

                return (
                  <div
                    key={day}
                    className="absolute top-0 flex h-full flex-col items-center"
                    style={{ left: (day - 1) * DAY_WIDTH, width: DAY_WIDTH }}
                  >
                    {hasEntries && (
                      <div className="flex flex-1 items-end justify-center">
                        {bucket?.receitas.length ? (
                          <div className="group relative mb-1.5">
                            <button
                              type="button"
                              onClick={() => selectAndReset({ kind: "day", day, type: "receita" })}
                              aria-label={`Entradas do dia ${day}`}
                              className={
                                isSelectedReceita
                                  ? "h-3.5 w-3.5 rounded-full bg-brand-sage ring-2 ring-brand-ink"
                                  : "h-2.5 w-2.5 rounded-full bg-brand-sage"
                              }
                            />
                            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-ink px-2 py-1 text-[11px] font-medium text-brand-card opacity-0 transition-opacity group-hover:opacity-100">
                              {tooltipLabel(bucket.receitas, receitaTotal)}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div
                      className={isToday ? "w-px bg-[var(--accent)]" : "w-px bg-brand-line"}
                      style={{ height: isToday ? 14 : 8 }}
                    />
                    <div
                      className={
                        isToday
                          ? "mt-0.5 text-[10px] font-bold text-brand-ink"
                          : "mt-0.5 text-[10px] text-brand-ink-soft"
                      }
                    >
                      {day}
                    </div>
                    {!hasEntries && isToday && (
                      <div className="mt-0.5 whitespace-nowrap text-[8.5px] font-bold text-[var(--accent)]">
                        HOJE
                      </div>
                    )}

                    {hasEntries && (
                      <div className="mt-1 flex flex-1 flex-col items-center gap-1">
                        {dayInvoices.map((invoice) => {
                          const isSelectedInvoice =
                            selected?.kind === "invoice" && selected.invoiceId === invoice.id;
                          return (
                            <div key={invoice.id} className="group relative">
                              <button
                                type="button"
                                onClick={() => toggleInvoice(invoice.id)}
                                aria-label={`Fatura do cartão do dia ${day}`}
                                className={
                                  isSelectedInvoice
                                    ? "flex h-3.5 w-3.5 rotate-12 items-center justify-center rounded-[4px] ring-2 ring-brand-ink"
                                    : "flex h-3 w-3 rotate-12 items-center justify-center rounded-[3px]"
                                }
                                style={{ background: "var(--accent)" }}
                              >
                                <CreditCard size={8} className="-rotate-12 text-brand-card" />
                              </button>
                              <div className="pointer-events-none absolute top-full left-1/2 z-10 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-ink px-2 py-1 text-[11px] font-medium text-brand-card opacity-0 transition-opacity group-hover:opacity-100">
                                Fatura · {invoice.items.length}{" "}
                                {invoice.items.length === 1 ? "compra" : "compras"} —{" "}
                                {currency(invoice.total)}
                              </div>
                            </div>
                          );
                        })}
                        {level ? (
                          <div className="group relative">
                            <button
                              type="button"
                              onClick={() => selectAndReset({ kind: "day", day, type: "despesa" })}
                              aria-label={`Gastos do dia ${day}`}
                              className={
                                isSelectedDespesa
                                  ? "h-3.5 w-3.5 rounded-full ring-2 ring-brand-ink"
                                  : "h-2.5 w-2.5 rounded-full"
                              }
                              style={{ background: LEVEL_COLOR[level] }}
                            />
                            <div className="pointer-events-none absolute top-full left-1/2 z-10 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-brand-ink px-2 py-1 text-[11px] font-medium text-brand-card opacity-0 transition-opacity group-hover:opacity-100">
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
              <div className="mt-0.5 text-[10px] font-semibold text-brand-coral">↓ saiu</div>
            )}
          </div>
          </>
        )}

        {cardInvoices.map((invoice) => (
          <button
            key={invoice.id}
            type="button"
            onClick={() => toggleInvoice(invoice.id)}
            className="mb-3 flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left"
            style={{ background: "color-mix(in srgb, var(--accent) 16%, #FBFAF6)" }}
          >
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
              style={{ background: "var(--accent)" }}
            >
              <CreditCard size={16} className="text-brand-card" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-semibold text-brand-ink">
                Fatura do cartão · dia {dayOfMonth(invoice.invoiceDate)}
              </div>
              <div className="text-xs text-brand-ink-soft">
                {invoice.items.length} {invoice.items.length === 1 ? "compra" : "compras"}
              </div>
            </div>
            <div className="flex-shrink-0 font-display text-[15px] font-bold text-brand-ink">
              {currency(invoice.total)}
            </div>
          </button>
        ))}

        {selected?.kind === "day" && selectedDayItems.length > 0 && (
          <div className="mb-4 rounded-2xl bg-brand-card px-4 py-3.5">
            <div className="mb-2 text-xs text-brand-ink-soft">
              Dia {selected.day} · {selected.type === "receita" ? "entrada" : "saída"}
              {selectedDayItems.length > 1 ? ` · ${selectedDayItems.length} lançamentos` : ""}
            </div>
            <div className="flex flex-col gap-2">
              {selectedDayItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/app/lancamento/${item.id}`}
                  className="flex items-center justify-between gap-3"
                >
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
                  <Pencil size={13} className="flex-shrink-0 text-brand-ink-soft" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {selectedInvoice && (
          <div className="mb-4 rounded-2xl bg-brand-card px-4 py-3.5">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs text-brand-ink-soft">
                Fatura do cartão · dia {dayOfMonth(selectedInvoice.invoiceDate)} ·{" "}
                {selectedInvoice.items.length}{" "}
                {selectedInvoice.items.length === 1 ? "compra" : "compras"}
              </div>
              <button
                type="button"
                onClick={() => (selecting ? exitSelection() : setSelecting(true))}
                className={
                  selecting
                    ? "flex flex-shrink-0 items-center gap-1.5 rounded-full bg-brand-ink px-3 py-1.5 text-[12px] font-semibold text-brand-card"
                    : "flex flex-shrink-0 items-center gap-1.5 rounded-full border border-brand-line bg-brand-bg px-3 py-1.5 text-[12px] font-semibold text-brand-ink"
                }
              >
                {selecting ? <X size={12} /> : <ListChecks size={12} />}
                {selecting ? "Cancelar" : "Selecionar"}
              </button>
            </div>
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
            <div className="w-full max-w-sm rounded-2xl bg-brand-ink px-4 py-3.5 shadow-lg">
              {pickingCategory ? (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[12.5px] font-semibold text-brand-card">
                      Trocar categoria de {selectedIds.size}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPickingCategory(false)}
                      aria-label="Cancelar"
                      className="text-brand-card/70"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleBulkCategory(null)}
                      className="rounded-full bg-brand-card/15 px-3 py-1.5 text-[12.5px] font-medium text-brand-card"
                    >
                      Sem categoria
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleBulkCategory(c.id)}
                        className="rounded-full bg-brand-card/15 px-3 py-1.5 text-[12.5px] font-medium text-brand-card"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-brand-card">
                    {selectedIds.size} {selectedIds.size === 1 ? "selecionado" : "selecionados"}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={processing}
                      onClick={() => setPickingCategory(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-brand-card/15 px-3 py-2 text-[12.5px] font-semibold text-brand-card disabled:opacity-60"
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

        {hasEntries && !folego && (
          <div className="mb-7 flex flex-wrap items-center gap-3.5">
            {(
              [
                [TOKENS.sage, "entrada / gasto leve"],
                [TOKENS.amber, "gasto médio"],
                [TOKENS.coral, "gasto alto"],
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
                style={{ background: "var(--accent)" }}
              />
              <span className="text-[11.5px] text-brand-ink-soft">fatura do cartão</span>
            </div>
          </div>
        )}

        <Link
          href="/app/novo"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] py-3.5 font-display text-[15px] font-semibold text-brand-card"
        >
          <Plus size={16} />
          Marcar lançamento
        </Link>
      </div>
    </div>
  );
}
