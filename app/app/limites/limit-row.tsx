"use client";

import { useState } from "react";
import { completeCents, currency, LEVEL_COLOR, TOKENS } from "@/lib/tokens";
import { iconForCategory } from "@/lib/category-icons";
import { setCategoryLimit } from "./actions";

export function CategoryLimitRow({
  id,
  name,
  icon,
  spent,
  limit,
}: {
  id: string;
  name: string;
  icon: string | null;
  spent: number;
  limit: number | null;
}) {
  const Icon = iconForCategory(icon);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(limit != null ? String(limit).replace(".", ",") : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const hasLimit = limit != null;
  const pct = hasLimit ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  const over = hasLimit && spent > limit;
  const barColor = over ? LEVEL_COLOR.coral : pct > 75 ? LEVEL_COLOR.amber : LEVEL_COLOR.sage;

  async function handleSave() {
    const normalized = Number(completeCents(value).replace(",", "."));
    if (!normalized || normalized <= 0) {
      setError("Digite um valor válido.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await setCategoryLimit(id, normalized);
      setEditing(false);
    } catch {
      setError("Não deu pra salvar agora.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4 py-4">
      <div className="mb-2.5 flex items-center gap-3">
        <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[11px] bg-brand-bg">
          <Icon size={15} className="text-brand-ink" />
        </div>
        <div className="flex-1">
          <div className="text-[14.5px] font-medium text-brand-ink">{name}</div>
        </div>
        <div className="text-right">
          <div
            className="text-[13.5px] font-semibold"
            style={{ color: over ? TOKENS.coral : TOKENS.ink }}
          >
            {currency(spent)}
          </div>
          {hasLimit && !editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-[11px] text-brand-ink-soft underline underline-offset-2"
            >
              de {currency(limit)}
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="0,00"
            inputMode="decimal"
            className="flex-1 rounded-xl border border-brand-line bg-white px-3 py-2 text-sm text-brand-ink outline-none focus:border-brand-ink"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
          />
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="rounded-xl bg-brand-ink px-3.5 text-sm font-semibold text-brand-card disabled:opacity-60"
          >
            {saving ? "..." : "Salvar"}
          </button>
        </div>
      ) : hasLimit ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-brand-bg">
          <div
            className="h-full rounded-full"
            style={{ width: `${pct}%`, background: barColor }}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="w-full rounded-[10px] border border-dashed border-brand-line px-3 py-2 text-left text-[12.5px] text-brand-ink-soft"
        >
          + Definir limite mensal
        </button>
      )}
      {error && <p className="mt-1.5 text-xs text-brand-coral">{error}</p>}
    </div>
  );
}
