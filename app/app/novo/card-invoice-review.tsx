"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, FileText, ImagePlus, Repeat, Trash2 } from "lucide-react";
import { completeCents, currency, parseCurrencyInput } from "@/lib/tokens";
import { toDateKey } from "@/lib/date";
import { matchFixedExpense } from "@/lib/fixed-expense-match";
import { usePhotoRecognition } from "@/lib/use-photo-recognition";
import {
  checkExistingInvoiceDate,
  recognizeCardInvoice,
  saveCardInvoice,
  type RecognizedCardItem,
} from "./actions";

type Category = { id: string; name: string };
type FixedExpense = { name: string; expected_amount: number };
type ReviewItem = RecognizedCardItem & { id: string; amountText: string };

export function CardInvoiceReview({
  fixedExpenses,
  categories,
}: {
  fixedExpenses: FixedExpense[];
  categories: Category[];
}) {
  const {
    fileInputRef,
    previewUrl,
    isPdf,
    fileName,
    items,
    setItems,
    analyzing,
    error,
    setError,
    handleFileChange,
  } = usePhotoRecognition<ReviewItem>(async (dataUrl) => {
    const recognized = await recognizeCardInvoice(dataUrl);
    return recognized.map((item, i) => ({
      ...item,
      id: `${i}-${item.description}`,
      amountText: item.amount.toFixed(2).replace(".", ","),
    }));
  });

  const router = useRouter();
  const [invoiceDate, setInvoiceDate] = useState(() => toDateKey(new Date()));
  const [saving, setSaving] = useState(false);
  const [duplicateDate, setDuplicateDate] = useState(false);

  useEffect(() => {
    if (!items || items.length === 0) return;
    let cancelled = false;
    checkExistingInvoiceDate(invoiceDate).then((exists) => {
      if (!cancelled) setDuplicateDate(exists);
    });
    return () => {
      cancelled = true;
    };
  }, [invoiceDate, items]);

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

  function updateItemAmountText(id: string, amountText: string) {
    setItems((prev) =>
      prev ? prev.map((it) => (it.id === id ? { ...it, amountText } : it)) : prev,
    );
  }

  function commitItemAmount(id: string) {
    setItems((prev) =>
      prev
        ? prev.map((it) => {
            if (it.id !== id) return it;
            const amountText = completeCents(it.amountText);
            return { ...it, amountText, amount: parseCurrencyInput(amountText) };
          })
        : prev,
    );
  }

  function matchedFixedExpense(description: string, amount: number): string | null {
    return matchFixedExpense(description, amount, fixedExpenses);
  }

  const total = (items ?? []).reduce((sum, it) => sum + it.amount, 0);

  async function handleSave() {
    if (!items || items.length === 0) return;
    setSaving(true);
    setError("");
    try {
      await saveCardInvoice(
        items.map(({ description, amount, category }) => ({ description, amount, category })),
        invoiceDate,
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
          className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-brand-line bg-white py-9 text-brand-ink-soft"
        >
          <ImagePlus size={26} className="text-brand-ink" />
          <span className="text-[13.5px] font-medium">
            Toque pra tirar foto, escolher da galeria ou selecionar um PDF
          </span>
        </button>
      ) : (
        <div>
          {isPdf ? (
            <div className="mb-3.5 flex items-center gap-3 rounded-2xl border border-brand-line bg-white px-4 py-3.5">
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
            <p className="mb-3 text-[13px] text-brand-ink-soft">Analisando a imagem...</p>
          )}

          {items && items.length > 0 && (
            <>
              <p className="mb-2 text-xs text-brand-ink-soft">
                {items.length} {items.length === 1 ? "compra identificada" : "compras identificadas"}{" "}
                — confere se está tudo certo antes de salvar
              </p>
              <div className="mb-3.5 divide-y divide-brand-bg overflow-hidden rounded-2xl border border-brand-line">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2.5 px-3.5 py-3">
                    <div className="min-w-0 flex-1">
                      <input
                        value={item.description}
                        onChange={(e) => updateItemDescription(item.id, e.target.value)}
                        aria-label="Descrição"
                        className="w-full truncate rounded-md border border-transparent bg-transparent px-0.5 text-[13.5px] font-medium text-brand-ink outline-none focus:border-brand-line focus:bg-white"
                      />
                      {matchedFixedExpense(item.description, item.amount) && (
                        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-amber px-2 py-0.5 text-[11px] font-semibold text-white">
                          <Repeat size={10} className="flex-shrink-0" />
                          Gasto fixo &quot;{matchedFixedExpense(item.description, item.amount)}&quot;
                        </div>
                      )}
                      <select
                        value={item.category ?? ""}
                        onChange={(e) => updateItemCategory(item.id, e.target.value || null)}
                        aria-label={`Categoria de ${item.description}`}
                        className="mt-1 rounded-md border border-brand-line bg-white px-1.5 py-0.5 text-[11px] text-brand-ink-soft outline-none focus:border-brand-ink"
                      >
                        <option value="">Sem categoria</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-0.5 whitespace-nowrap font-display text-[14px] font-bold text-brand-ink">
                      -
                      <input
                        value={item.amountText}
                        onChange={(e) => updateItemAmountText(item.id, e.target.value)}
                        onBlur={() => commitItemAmount(item.id)}
                        inputMode="decimal"
                        aria-label="Valor"
                        className="w-16 rounded-md border border-transparent bg-transparent px-0.5 text-right text-[14px] font-bold text-brand-ink outline-none focus:border-brand-line focus:bg-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remover ${item.description}`}
                      className="flex-shrink-0 text-brand-ink-soft"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mb-4 flex items-center justify-between rounded-2xl bg-brand-bg px-4 py-3">
                <span className="text-[13px] text-brand-ink-soft">Total da fatura</span>
                <span className="font-display text-base font-bold text-brand-ink">
                  {currency(total)}
                </span>
              </div>

              <div className="mb-4">
                <label
                  className="mb-1.5 block text-xs font-medium text-brand-ink-soft"
                  htmlFor="invoice-date"
                >
                  Data de vencimento da fatura
                </label>
                <input
                  id="invoice-date"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full rounded-2xl border border-brand-line bg-white px-3.5 py-3 text-[15px] text-brand-ink outline-none focus:border-brand-ink"
                />
                {duplicateDate && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[12px] font-medium text-brand-coral">
                    <AlertTriangle size={12} className="flex-shrink-0" />
                    Você já tem uma fatura salva com essa data de vencimento — confere se não é a
                    mesma fatura enviada de novo
                  </div>
                )}
              </div>

              {error && <p className="mb-3 text-sm text-brand-coral">{error}</p>}

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

      {!previewUrl && error && <p className="mt-3 text-sm text-brand-coral">{error}</p>}
    </div>
  );
}
