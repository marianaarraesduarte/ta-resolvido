"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Check,
  FileText,
  ImagePlus,
  Repeat,
  Square,
  SquareCheck,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { completeCents, parseCurrencyInput } from "@/lib/tokens";
import { matchFixedExpense } from "@/lib/fixed-expense-match";
import { usePhotoRecognition } from "@/lib/use-photo-recognition";
import { recognizeStatement, saveRecognizedItems, type RecognizedItem } from "./actions";

type Category = { id: string; name: string };
type FixedExpense = { name: string; expected_amount: number };
type ReviewItem = RecognizedItem & { id: string; isSalary: boolean; amountText: string };

export function BankStatementReview({
  salaryPatterns,
  fixedExpenses,
  categories,
}: {
  salaryPatterns: string[];
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
    const recognized = await recognizeStatement(dataUrl);
    return recognized.map((item, i) => ({
      ...item,
      id: `${i}-${item.description}`,
      isSalary:
        item.type === "receita" && salaryPatterns.includes(item.description.trim().toLowerCase()),
      amountText: item.amount.toFixed(2).replace(".", ","),
    }));
  });

  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pickingCategory, setPickingCategory] = useState(false);

  const despesaItems = (items ?? []).filter((it) => it.type === "despesa");

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
      prev.size === despesaItems.length ? new Set() : new Set(despesaItems.map((it) => it.id)),
    );
  }

  function applyBulkCategory(category: string | null) {
    setItems((prev) =>
      prev ? prev.map((it) => (selectedIds.has(it.id) ? { ...it, category } : it)) : prev,
    );
    exitSelection();
  }

  function toggleSalary(id: string) {
    setItems((prev) =>
      prev ? prev.map((it) => (it.id === id ? { ...it, isSalary: !it.isSalary } : it)) : prev,
    );
  }

  function removeItem(id: string) {
    setItems((prev) => (prev ? prev.filter((it) => it.id !== id) : prev));
  }

  function updateItemDate(id: string, date: string) {
    setItems((prev) => (prev ? prev.map((it) => (it.id === id ? { ...it, date } : it)) : prev));
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

  async function handleSave() {
    if (!items || items.length === 0) return;
    setSaving(true);
    setError("");
    try {
      await saveRecognizedItems(
        items.map(({ description, amount, type, isSalary, date, category }) => ({
          description,
          amount,
          type,
          isSalary,
          date,
          category,
        })),
      );
      router.push(`/app?saved=lote&count=${items.length}`);
      router.refresh();
    } catch {
      setError("Não deu pra salvar os lançamentos agora.");
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="mb-3.5 text-[13px] leading-snug text-brand-ink-soft">
        Tire uma foto do comprovante ou print do extrato inteiro — a gente separa cada gasto e
        cada entrada de dinheiro pra você.
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
              <img src={previewUrl} alt="Print enviado" className="h-full w-full object-cover" />
            </div>
          )}

          {analyzing && (
            <p className="mb-3 text-[13px] text-brand-ink-soft">Analisando a imagem...</p>
          )}

          {items && items.length > 0 && (
            <>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-brand-ink-soft">
                  {items.length} {items.length === 1 ? "item identificado" : "itens identificados"}{" "}
                  — confere se está tudo certo antes de salvar
                </p>
                {despesaItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => (selecting ? exitSelection() : setSelecting(true))}
                    className="flex-shrink-0 text-[12px] font-semibold text-brand-ink-soft underline underline-offset-2"
                  >
                    {selecting ? "Cancelar" : "Selecionar"}
                  </button>
                )}
              </div>

              {selecting && (
                <button
                  type="button"
                  onClick={toggleAll}
                  className="mb-2 flex items-center gap-2 text-[12px] font-medium text-brand-ink-soft"
                >
                  {selectedIds.size === despesaItems.length ? (
                    <SquareCheck size={15} style={{ color: "var(--accent)" }} />
                  ) : (
                    <Square size={15} />
                  )}
                  {selectedIds.size === despesaItems.length ? "Desmarcar tudo" : "Selecionar tudo"}
                </button>
              )}

              <div className="mb-3.5 divide-y divide-brand-bg overflow-hidden rounded-2xl border border-brand-line">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={
                      item.possibleDuplicate
                        ? "flex items-center gap-2.5 bg-brand-coral/10 px-3.5 py-3"
                        : "flex items-center gap-2.5 px-3.5 py-3"
                    }
                  >
                    {selecting && item.type === "despesa" && (
                      <button
                        type="button"
                        onClick={() => toggleOne(item.id)}
                        aria-label={`Selecionar ${item.description}`}
                        className="flex-shrink-0"
                      >
                        {selectedIds.has(item.id) ? (
                          <SquareCheck size={18} style={{ color: "var(--accent)" }} />
                        ) : (
                          <Square size={18} className="text-brand-ink-soft" />
                        )}
                      </button>
                    )}
                    {item.type === "receita" ? (
                      <ArrowUpCircle size={15} className="flex-shrink-0 text-brand-sage" />
                    ) : (
                      <ArrowDownCircle size={15} className="flex-shrink-0 text-brand-coral" />
                    )}
                    <div className="min-w-0 flex-1">
                      <input
                        value={item.description}
                        onChange={(e) => updateItemDescription(item.id, e.target.value)}
                        aria-label="Descrição"
                        className="w-full truncate rounded-md border border-transparent bg-transparent px-0.5 text-[13.5px] font-medium text-brand-ink outline-none focus:border-brand-line focus:bg-white"
                      />
                      {item.possibleDuplicate && (
                        <div className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-brand-coral">
                          <AlertTriangle size={11} className="flex-shrink-0" />
                          Pode ser repetido — já tem algo parecido nessa data
                        </div>
                      )}
                      {item.type === "despesa" && matchedFixedExpense(item.description, item.amount) && (
                        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-amber px-2 py-0.5 text-[11px] font-semibold text-white">
                          <Repeat size={10} className="flex-shrink-0" />
                          Gasto fixo &quot;{matchedFixedExpense(item.description, item.amount)}&quot;
                        </div>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-2.5">
                        <input
                          type="date"
                          value={item.date}
                          onChange={(e) => updateItemDate(item.id, e.target.value)}
                          aria-label={`Data de ${item.description}`}
                          className="rounded-md border border-brand-line bg-white px-1.5 py-0.5 text-[11px] text-brand-ink-soft outline-none focus:border-brand-ink"
                        />
                        {item.type === "despesa" && (
                          <select
                            value={item.category ?? ""}
                            onChange={(e) => updateItemCategory(item.id, e.target.value || null)}
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
                            onClick={() => toggleSalary(item.id)}
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
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-0.5 whitespace-nowrap font-display text-[14px] font-bold text-brand-ink">
                      {item.type === "receita" ? "+" : "-"}
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
                            onClick={() => applyBulkCategory(null)}
                            className="rounded-full bg-brand-card/15 px-3 py-1.5 text-[12.5px] font-medium text-brand-card"
                          >
                            Sem categoria
                          </button>
                          {categories.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => applyBulkCategory(c.name)}
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
                        <button
                          type="button"
                          onClick={() => setPickingCategory(true)}
                          className="flex items-center gap-1.5 rounded-xl bg-brand-card/15 px-3 py-2 text-[12.5px] font-semibold text-brand-card"
                        >
                          <Tag size={13} />
                          Categoria
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

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

      {error && <p className="mt-3 text-sm text-brand-coral">{error}</p>}
    </div>
  );
}
