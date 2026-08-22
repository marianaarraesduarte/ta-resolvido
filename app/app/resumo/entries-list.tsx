"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  CreditCard,
  ListChecks,
  Pencil,
  Square,
  SquareCheck,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { currency } from "@/lib/tokens";
import { dayOfMonth } from "@/lib/date";
import { iconForCategory } from "@/lib/category-icons";
import { useConfirm } from "../confirm-dialog";
import { bulkDeleteEntries, bulkSetCategory } from "../entries-actions";

type Category = { id: string; name: string };
type EntryRow = {
  id: string;
  description: string;
  amount: number;
  entry_date: string;
  payment_method: "conta" | "cartao";
  category_id: string | null;
  categories: { name: string; icon: string | null } | null;
};
export type CardInvoiceRow = {
  id: string;
  invoiceDate: string;
  total: number;
  items: { id: string; description: string; amount: number }[];
};

export function EntriesList({
  entries,
  categories,
  cardInvoices,
}: {
  entries: EntryRow[];
  categories: Category[];
  cardInvoices: CardInvoiceRow[];
}) {
  const router = useRouter();
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pickingCategory, setPickingCategory] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [expandedInvoiceIds, setExpandedInvoiceIds] = useState<Set<string>>(new Set());
  const confirm = useConfirm();

  function toggleInvoiceExpanded(id: string) {
    setExpandedInvoiceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function exitSelection() {
    setSelecting(false);
    setSelectedIds(new Set());
    setPickingCategory(false);
    setError("");
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allSelectableIds = [
    ...entries.map((e) => e.id),
    ...cardInvoices.flatMap((inv) => inv.items.map((it) => it.id)),
  ];

  function toggleAll() {
    setSelectedIds((prev) =>
      prev.size === allSelectableIds.length ? new Set() : new Set(allSelectableIds),
    );
  }

  async function handleBulkDelete() {
    const n = selectedIds.size;
    const confirmed = await confirm(
      `Excluir ${n} ${n === 1 ? "lançamento" : "lançamentos"}? Essa ação não pode ser desfeita.`,
    );
    if (!confirmed) return;

    setProcessing(true);
    setError("");
    try {
      await bulkDeleteEntries([...selectedIds]);
      exitSelection();
      router.refresh();
    } catch {
      setError("Não deu pra excluir agora.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleBulkCategory(categoryId: string | null) {
    setProcessing(true);
    setError("");
    try {
      await bulkSetCategory([...selectedIds], categoryId);
      exitSelection();
      router.refresh();
    } catch {
      setError("Não deu pra trocar a categoria agora.");
    } finally {
      setProcessing(false);
    }
  }

  const isEmpty = entries.length === 0 && cardInvoices.length === 0;
  type ListRow =
    | { kind: "entry"; entry: EntryRow; date: string }
    | { kind: "invoice"; invoice: CardInvoiceRow; date: string };
  const rows: ListRow[] = [
    ...entries.map((entry): ListRow => ({ kind: "entry", entry, date: entry.entry_date })),
    ...cardInvoices.map((invoice): ListRow => ({ kind: "invoice", invoice, date: invoice.invoiceDate })),
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <div className="pb-24">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[13px] font-semibold text-brand-ink">Tudo que foi marcado</div>
        {allSelectableIds.length > 0 && (
          <button
            type="button"
            onClick={() => (selecting ? exitSelection() : setSelecting(true))}
            className={
              selecting
                ? "flex flex-shrink-0 items-center gap-1.5 rounded-full bg-brand-ink px-3 py-1.5 text-[12.5px] font-semibold text-brand-card"
                : "flex flex-shrink-0 items-center gap-1.5 rounded-full border border-brand-line bg-brand-card px-3 py-1.5 text-[12.5px] font-semibold text-brand-ink"
            }
          >
            {selecting ? <X size={13} /> : <ListChecks size={13} />}
            {selecting ? "Cancelar" : "Selecionar"}
          </button>
        )}
      </div>

      {selecting && (
        <button
          type="button"
          onClick={toggleAll}
          className="mb-2 flex items-center gap-2 text-[12.5px] font-medium text-brand-ink-soft"
        >
          {selectedIds.size === allSelectableIds.length ? (
            <SquareCheck size={16} style={{ color: "var(--accent)" }} />
          ) : (
            <Square size={16} />
          )}
          {selectedIds.size === allSelectableIds.length ? "Desmarcar tudo" : "Selecionar tudo"}
        </button>
      )}

      {isEmpty ? (
        <div className="rounded-2xl border border-brand-line bg-brand-card p-5">
          <div className="text-[15.5px] font-medium leading-snug text-brand-ink">
            Nada marcado ainda esse mês.
          </div>
          <div className="mt-1.5 text-[13.5px] leading-snug text-brand-ink-soft">
            Assim que você marcar um gasto, ele aparece aqui.
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-line bg-brand-card">
          {rows.map((row, i) => {
            const borderClass = i === 0 ? "" : "border-t border-brand-bg";

            if (row.kind === "invoice") {
              const invoice = row.invoice;
              const expanded = expandedInvoiceIds.has(invoice.id);
              return (
                <div key={`invoice-${invoice.id}`} className={borderClass}>
                  <button
                    type="button"
                    onClick={() => toggleInvoiceExpanded(invoice.id)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ background: "var(--accent)" }}
                    >
                      <CreditCard size={16} className="text-brand-card" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14.5px] font-medium text-brand-ink">
                        Fatura do cartão · dia {dayOfMonth(invoice.invoiceDate)}
                      </div>
                      <div className="text-xs text-brand-ink-soft">
                        {invoice.items.length} {invoice.items.length === 1 ? "compra" : "compras"}
                      </div>
                    </div>
                    <div className="flex-shrink-0 whitespace-nowrap font-display text-[15px] font-bold text-brand-ink">
                      {currency(invoice.total)}
                    </div>
                    <ChevronDown
                      size={14}
                      className={
                        expanded
                          ? "flex-shrink-0 rotate-180 text-brand-ink-soft transition-transform"
                          : "flex-shrink-0 text-brand-ink-soft transition-transform"
                      }
                    />
                  </button>
                  {expanded && (
                    <div className="bg-brand-bg/60 px-4 pb-2">
                      {invoice.items.map((item) => {
                        const itemChecked = selectedIds.has(item.id);
                        const itemContent = (
                          <>
                            {selecting &&
                              (itemChecked ? (
                                <SquareCheck
                                  size={16}
                                  className="flex-shrink-0"
                                  style={{ color: "var(--accent)" }}
                                />
                              ) : (
                                <Square size={16} className="flex-shrink-0 text-brand-ink-soft" />
                              ))}
                            <span className="min-w-0 flex-1 truncate text-[13.5px] text-brand-ink">
                              {item.description}
                            </span>
                            <span className="flex-shrink-0 whitespace-nowrap text-[13.5px] font-semibold text-brand-ink">
                              {currency(item.amount)}
                            </span>
                          </>
                        );
                        return selecting ? (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleOne(item.id)}
                            className="flex w-full items-center gap-2.5 py-2 pl-11 text-left"
                          >
                            {itemContent}
                          </button>
                        ) : (
                          <Link
                            key={item.id}
                            href={`/app/lancamento/${item.id}`}
                            className="flex items-center justify-between gap-3 py-2 pl-11"
                          >
                            {itemContent}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const d = row.entry;
            const Icon = iconForCategory(d.categories?.icon);
            const checked = selectedIds.has(d.id);
            const rowClass =
              i === 0
                ? "flex items-center gap-3 px-4 py-3.5"
                : "flex items-center gap-3 border-t border-brand-bg px-4 py-3.5";
            const content = (
              <>
                {selecting &&
                  (checked ? (
                    <SquareCheck size={18} className="flex-shrink-0" style={{ color: "var(--accent)" }} />
                  ) : (
                    <Square size={18} className="flex-shrink-0 text-brand-ink-soft" />
                  ))}
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-bg">
                  <Icon size={16} className="text-brand-ink" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14.5px] font-medium text-brand-ink">
                    {d.description}
                  </div>
                  <div className="text-xs text-brand-ink-soft">Dia {dayOfMonth(d.entry_date)}</div>
                </div>
                <div className="flex-shrink-0 whitespace-nowrap font-display text-[15px] font-bold text-brand-ink">
                  {currency(d.amount)}
                </div>
                {!selecting && <Pencil size={13} className="flex-shrink-0 text-brand-ink-soft" />}
              </>
            );

            return selecting ? (
              <button
                key={d.id}
                type="button"
                onClick={() => toggleOne(d.id)}
                className={rowClass}
              >
                {content}
              </button>
            ) : (
              <Link key={d.id} href={`/app/lancamento/${d.id}`} className={rowClass}>
                {content}
              </Link>
            );
          })}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-brand-coral">{error}</p>}

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
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      disabled={processing}
                      onClick={() => handleBulkCategory(c.id)}
                      className="rounded-full bg-brand-card/15 px-3 py-1.5 text-[12.5px] font-medium text-brand-card disabled:opacity-60"
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
    </div>
  );
}
