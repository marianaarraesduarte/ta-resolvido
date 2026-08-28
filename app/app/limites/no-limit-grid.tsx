"use client";

import { useState } from "react";
import { amountToInputValue, currency, formatCentsInput, parseCentsInput } from "@/lib/tokens";
import { iconForCategory } from "@/lib/category-icons";
import { setCategoryLimit } from "./actions";

type Category = { id: string; name: string; icon: string | null };

export function NoLimitCategoryGrid({
  categories,
  receita,
}: {
  categories: Category[];
  receita: number;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [pctValue, setPctValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const selected = categories.find((c) => c.id === selectedId) ?? null;

  function selectCategory(c: Category) {
    setSelectedId(c.id);
    setValue("");
    setPctValue("");
    setError("");
  }

  function handleValueChange(raw: string) {
    const formatted = formatCentsInput(raw);
    setValue(formatted);
    if (receita > 0) {
      const amount = parseCentsInput(formatted);
      setPctValue(String(Math.round((amount / receita) * 100)));
    }
  }

  function handlePctChange(next: string) {
    const digits = next.replace(/[^0-9]/g, "");
    setPctValue(digits);
    const amount = digits === "" ? 0 : (receita * Number(digits)) / 100;
    setValue(amountToInputValue(amount));
  }

  async function handleSave() {
    if (!selected) return;
    const normalized = parseCentsInput(value);
    if (!normalized || normalized <= 0) {
      setError("Digite um valor pra salvar.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await setCategoryLimit(selected.id, normalized);
      setSelectedId(null);
    } catch {
      setError("Não deu pra salvar agora.");
    } finally {
      setSaving(false);
    }
  }

  if (categories.length === 0) return null;

  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink-soft">
        Ainda sem limite — toque pra definir
      </div>
      <div className="grid grid-cols-4 gap-2">
        {categories.map((c) => {
          const Icon = iconForCategory(c.icon);
          const active = selectedId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => selectCategory(c)}
              className={
                active
                  ? "flex flex-col items-center gap-1.5 rounded-2xl border border-brand-ink bg-brand-ink-solid px-1 py-2.5"
                  : "flex flex-col items-center gap-1.5 rounded-2xl border border-dashed border-brand-line bg-brand-card px-1 py-2.5"
              }
            >
              <span
                className={
                  active
                    ? "flex h-8 w-8 items-center justify-center rounded-[10px] bg-white/15"
                    : "flex h-8 w-8 items-center justify-center rounded-[10px] bg-brand-bg"
                }
              >
                <Icon size={15} className={active ? "text-white" : "text-brand-ink"} />
              </span>
              <span
                className={
                  active
                    ? "line-clamp-2 text-center text-[10.5px] font-medium leading-tight text-white"
                    : "line-clamp-2 text-center text-[10.5px] font-medium leading-tight text-brand-ink-soft"
                }
              >
                {c.name}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-2.5 rounded-2xl bg-brand-bg px-3.5 py-3">
          <div className="mb-1.5 text-[11px] font-semibold text-brand-ink-soft">
            Limite mensal — {selected.name}
          </div>
          <div className="flex gap-2">
            <input
              autoFocus
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="0,00"
              inputMode="decimal"
              className="min-w-0 flex-1 rounded-xl border border-brand-line bg-brand-card px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-ink"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSave();
                }
              }}
            />
            {receita > 0 && (
              <div className="flex w-20 flex-shrink-0 items-center gap-1 rounded-xl border border-brand-line bg-brand-card px-2.5 py-2">
                <input
                  value={pctValue}
                  onChange={(e) => handlePctChange(e.target.value)}
                  placeholder="0"
                  inputMode="numeric"
                  className="w-full min-w-0 bg-transparent text-sm text-brand-ink outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                />
                <span className="text-sm text-brand-ink-soft">%</span>
              </div>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="flex-shrink-0 rounded-xl bg-brand-ink-solid px-3.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "..." : "Salvar"}
            </button>
          </div>
          {receita > 0 && (
            <p className="mt-1.5 text-[11px] text-brand-ink-soft">
              {pctValue || "0"}% da sua renda de {currency(receita)}
            </p>
          )}
          {error && <p className="mt-1.5 text-xs text-brand-coral">{error}</p>}
        </div>
      )}
    </div>
  );
}
