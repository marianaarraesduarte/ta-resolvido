"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownCircle,
  Check,
  FileText,
  ImagePlus,
  ListChecks,
  Repeat,
  RotateCw,
  Square,
  SquareCheck,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { amountToInputValue, currency, formatCentsInput, parseCentsInput } from "@/lib/tokens";
import { toDateKey } from "@/lib/date";
import { matchFixedExpense } from "@/lib/fixed-expense-match";
import { usePhotoRecognition } from "@/lib/use-photo-recognition";
import { recognizeCardInvoice, saveCardInvoice, type CardWithInvoices, type RecognizedCardItem } from "./actions";
import { InvoicePicker, invoiceValueToSelection, type InvoiceValue } from "./invoice-picker";

type Category = { id: string; name: string };
type FixedExpense = { name: string; expected_amount: number };
type ReviewItem = RecognizedCardItem & { id: string; amountText: string };

export function CardInvoiceReview({
  fixedExpenses,
  categories,
  cards,
}: {
  fixedExpenses: FixedExpense[];
  categories: Category[];
  cards: CardWithInvoices[];
}) {
  const {
    fileInputRef,
    previewUrl,
    isPdf,
    fileName,
    items,
    setItems,
    analyzing,
    slowAnalyzing,
    error,
    setError,
    handleFileChange,
    retry,
  } = usePhotoRecognition<ReviewItem>(async (dataUrl) => {
    const recognized = await recognizeCardInvoice(dataUrl);
    return recognized.map((item, i) => ({
      ...item,
      id: `${i}-${item.description}`,
      amountText: amountToInputValue(item.amount),
    }));
  });

  const router = useRouter();
  const defaultDate = toDateKey(new Date());
  const [invoiceValue, setInvoiceValue] = useState<InvoiceValue | null>(null);
  const [saving, setSaving] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pickingCategory, setPickingCategory] = useState(false);

  function exitSelection() {
    setSelecting(false);
    setSelectedIds(new Set());
    setPickingCategory(false);
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelectedIds((prev) =>
      prev.size === (items?.length ?? 0) ? new Set() : new Set((items ?? []).map((it) => it.id)),
    );
  }

  function applyBulkCategory(category: string | null) {
    setItems((prev) =>
      prev ? prev.map((it) => (selectedIds.has(it.id) ? { ...it, category } : it)) : prev,
    );
    exitSelection();
  }

  function removeItem(id: string) {
    setItems((prev) => (prev ? prev.filter((it) => it.id !== id) : prev));
  }

  function updateItemCategory(id: string, category: string | null) {
    setItems((prev) => (prev ? prev.map((it) => (it.id === id ? { ...it, category } : it)) : prev));
  }

  function updateItemDescription(id: string, description: string) {
    setItems((prev) =>
      prev ? prev.map((it) => (it.id === id ? { ...it, description } : it)) : prev,
    );
  }

  function updateItemAmountText(id: string, raw: string) {
    const amountText = formatCentsInput(raw);
    setItems((prev) =>
      prev
        ? prev.map((it) => (it.id === id ? { ...it, amountText, amount: parseCentsInput(amountText) } : it))
        : prev,
    );
  }

  function matchedFixedExpense(description: string, amount: number): string | null {
    return matchFixedExpense(description, amount, fixedExpenses);
  }

  const total = (items ?? []).reduce((sum, it) => sum + it.amount, 0);

  async function handleSave() {
    if (!items || items.length === 0) return;
    const selection = invoiceValueToSelection(invoiceValue);
    if (!selection) {
      setError("Escolhe em qual fatura essa compra entra antes de salvar.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await saveCardInvoice(
        items.map(({ description, amount, category }) => ({ description, amount, category })),
        selection,
      );
      router.push(`/app?saved=lote&count=${items.length}`);
      router.refresh();
    } catch {
      setError("Não deu pra salvar a fatura agora.");
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="mb-3.5 text-[13px] leading-snug text-brand-ink-soft">
        Tire uma foto da fatura do cartão inteira — a gente junta todas as compras numa marcação
        só na régua, mas cada uma mantém sua própria categoria.
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleFileChange}
      />

      {!previewUrl ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-brand-line bg-brand-card py-9 text-brand-ink-soft"
        >
          <ImagePlus size={26} className="text-brand-ink" />
          <span className="text-[13.5px] font-medium">
            Toque pra tirar foto, escolher da galeria ou selecionar um PDF
          </span>
        </button>
      ) : (
        <div>
          {isPdf ? (
            <div className="mb-3.5 flex items-center gap-3 rounded-2xl border border-brand-line bg-brand-card px-4 py-3.5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-bg">
                <FileText size={18} className="text-brand-ink" />
              </div>
              <div className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-brand-ink">
                {fileName}
              </div>
            </div>
          ) : (
            <div className="relative mb-3.5 h-[140px] w-full overflow-hidden rounded-2xl border border-brand-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Fatura enviada" className="h-full w-full object-cover" />
            </div>
          )}

          {analyzing && (
            <p className="mb-3 text-[13px] text-brand-ink-soft">
              {slowAnalyzing
                ? "Ainda analisando... pode levar até um minuto, não sai da tela"
                : "Analisando a imagem..."}
            </p>
          )}

          {items && items.length > 0 && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-brand-ink-soft">
                  {items.length} {items.length === 1 ? "compra identificada" : "compras identificadas"}{" "}
                  — confere se está tudo certo antes de salvar
                </p>
                <button
                  type="button"
                  onClick={() => (selecting ? exitSelection() : setSelecting(true))}
                  className={
                    selecting
                      ? "flex flex-shrink-0 items-center gap-1.5 rounded-full bg-brand-ink-solid px-3 py-1.5 text-[12px] font-semibold text-white"
                      : "flex flex-shrink-0 items-center gap-1.5 rounded-full border border-brand-line bg-brand-card px-3 py-1.5 text-[12px] font-semibold text-brand-ink"
                  }
                >
                  {selecting ? <X size={12} /> : <ListChecks size={12} />}
                  {selecting ? "Cancelar" : "Selecionar"}
                </button>
              </div>

              {selecting && (
                <button
                  type="button"
                  onClick={toggleAll}
                  className="mb-2 flex items-center gap-2 text-[12px] font-medium text-brand-ink-soft"
                >
                  {selectedIds.size === items.length ? (
                    <SquareCheck size={15} style={{ color: "var(--accent)" }} />
                  ) : (
                    <Square size={15} />
                  )}
                  {selectedIds.size === items.length ? "Desmarcar tudo" : "Selecionar tudo"}
                </button>
              )}

              <div className="mb-3.5 divide-y divide-brand-line/70 overflow-hidden rounded-2xl border border-brand-line">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5 px-3.5 py-3.5">
                    {selecting && (
                      <button
                        type="button"
                        onClick={() => toggleOne(item.id)}
                        aria-label={`Selecionar ${item.description}`}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {selectedIds.has(item.id) ? (
                          <SquareCheck size={18} style={{ color: "var(--accent)" }} />
                        ) : (
                          <Square size={18} className="text-brand-ink-soft" />
                        )}
                      </button>
                    )}
                    <span className="flex h-[26px] w-[26px] flex-shrink-0 items-center justify-center rounded-full bg-brand-coral/15">
                      <ArrowDownCircle size={14} className="text-brand-coral" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <input
                        value={item.description}
                        onChange={(e) => updateItemDescription(item.id, e.target.value)}
                        aria-label="Descrição"
                        className="w-full truncate rounded-md border border-transparent bg-transparent px-0.5 text-[13.5px] font-medium text-brand-ink outline-none focus:border-brand-line focus:bg-brand-card"
                      />
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <select
                          value={item.category ?? ""}
                          onChange={(e) => updateItemCategory(item.id, e.target.value || null)}
                          aria-label={`Categoria de ${item.description}`}
                          className="rounded-lg bg-brand-bg px-2.5 py-1.5 text-[11px] text-brand-ink-soft outline-none focus:ring-1 focus:ring-brand-ink"
                        >
                          <option value="">Sem categoria</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        {matchedFixedExpense(item.description, item.amount) && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-brand-amber px-2 py-1 text-[10.5px] font-semibold text-brand-amber">
                            <Repeat size={10} className="flex-shrink-0" />
                            fixo
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-baseline gap-0.5 whitespace-nowrap pt-0.5 font-display text-[14px] font-bold text-brand-ink">
                      -
                      <input
                        value={item.amountText}
                        onChange={(e) => updateItemAmountText(item.id, e.target.value)}
                        inputMode="decimal"
                        aria-label="Valor"
                        className="w-16 rounded-md border border-transparent bg-transparent px-0.5 text-right text-[14px] font-bold text-brand-ink outline-none focus:border-brand-line focus:bg-brand-card"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remover ${item.description}`}
                      className="flex-shrink-0 p-1 text-brand-ink-soft/70"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

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
                            onClick={() => applyBulkCategory(null)}
                            className="rounded-full bg-brand-card/15 px-3 py-1.5 text-[12.5px] font-medium text-white"
                          >
                            Sem categoria
                          </button>
                          {categories.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => applyBulkCategory(c.name)}
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
                          {selectedIds.size} {selectedIds.size === 1 ? "selecionada" : "selecionadas"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPickingCategory(true)}
                          className="flex items-center gap-1.5 rounded-xl bg-brand-card/15 px-3 py-2 text-[12.5px] font-semibold text-white"
                        >
                          <Tag size={13} />
                          Categoria
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-4 flex items-center justify-between rounded-2xl bg-brand-bg px-4 py-3">
                <span className="text-[13px] text-brand-ink-soft">Total da fatura</span>
                <span className="font-display text-base font-bold text-brand-ink">
                  {currency(total)}
                </span>
              </div>

              <div className="mb-4">
                <div className="mb-1.5 text-xs font-medium text-brand-ink-soft">Em qual fatura?</div>
                <InvoicePicker
                  cards={cards}
                  value={invoiceValue}
                  onChange={setInvoiceValue}
                  defaultDate={defaultDate}
                />
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-sage py-3.5 font-display text-[15px] font-semibold text-white disabled:opacity-60"
              >
                <Check size={17} />
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </>
          )}

          {items && items.length === 0 && (
            <p className="text-[13px] text-brand-ink-soft">
              Nenhum item pra salvar — todos foram removidos da lista.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3">
          <p className="text-sm text-brand-coral">{error}</p>
          <button
            type="button"
            onClick={retry}
            disabled={analyzing}
            className="mt-2 flex items-center gap-1.5 rounded-full bg-brand-ink-solid px-3.5 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
          >
            <RotateCw size={13} />
            Tentar de novo
          </button>
        </div>
      )}
    </div>
  );
}
