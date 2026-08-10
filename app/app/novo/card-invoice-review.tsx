"use client";

import { useState } from "react";
import { Check, ImagePlus, Trash2 } from "lucide-react";
import { currency } from "@/lib/tokens";
import { toDateKey } from "@/lib/date";
import { namesMatch } from "@/lib/text-match";
import { usePhotoRecognition } from "@/lib/use-photo-recognition";
import { recognizeCardInvoice, saveCardInvoice, type RecognizedCardItem } from "./actions";

type ReviewItem = RecognizedCardItem & { id: string };

export function CardInvoiceReview({ fixedExpenseNames }: { fixedExpenseNames: string[] }) {
  const { fileInputRef, previewUrl, items, setItems, analyzing, error, setError, handleFileChange } =
    usePhotoRecognition<ReviewItem>(async (dataUrl) => {
      const recognized = await recognizeCardInvoice(dataUrl);
      return recognized.map((item, i) => ({ ...item, id: `${i}-${item.description}` }));
    });

  const [invoiceDate, setInvoiceDate] = useState(() => toDateKey(new Date()));
  const [saving, setSaving] = useState(false);

  function removeItem(id: string) {
    setItems((prev) => (prev ? prev.filter((it) => it.id !== id) : prev));
  }

  function matchedFixedExpense(description: string): string | null {
    return fixedExpenseNames.find((name) => namesMatch(name, description)) ?? null;
  }

  const total = (items ?? []).reduce((sum, it) => sum + it.amount, 0);

  async function handleSave() {
    if (!items || items.length === 0) return;
    setSaving(true);
    setError("");
    try {
      await saveCardInvoice(
        items.map(({ description, amount }) => ({ description, amount })),
        invoiceDate,
      );
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
      <p className="mb-3.5 rounded-xl bg-brand-bg px-3 py-2 text-[11.5px] leading-snug text-brand-ink-soft">
        O reconhecimento automático ainda não está ligado a um serviço real — por enquanto ele
        simula um resultado de exemplo, só pra você testar como fica a revisão antes de salvar.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
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
            Toque pra tirar foto ou escolher da galeria
          </span>
        </button>
      ) : (
        <div>
          <div className="relative mb-3.5 h-[140px] w-full overflow-hidden rounded-2xl border border-brand-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Fatura enviada" className="h-full w-full object-cover" />
          </div>

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
                      <div className="truncate text-[13.5px] font-medium text-brand-ink">
                        {item.description}
                      </div>
                      {matchedFixedExpense(item.description) && (
                        <div className="mt-0.5 text-[11px] font-medium text-brand-amber">
                          Parece o gasto fixo &quot;{matchedFixedExpense(item.description)}&quot;
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 whitespace-nowrap font-display text-[14px] font-bold text-brand-ink">
                      -{currency(item.amount)}
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
