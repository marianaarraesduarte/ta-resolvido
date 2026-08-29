"use client";

import { useState } from "react";
import { Check, ChevronDown, Repeat, X } from "lucide-react";
import { amountToInputValue, formatCentsInput } from "@/lib/tokens";
import { toDateKey } from "@/lib/date";
import type { FrequentExpense } from "@/lib/frequent-expenses";
import { createEntry } from "./novo/actions";

export function FrequentExpenseChips({ items }: { items: FrequentExpense[] }) {
  const [expanded, setExpanded] = useState(false);
  const [openKey, setOpenKey] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mb-1.5 flex w-full items-center gap-2.5 rounded-2xl bg-brand-card px-4 py-3.5 text-left"
      >
        <Repeat size={15} className="flex-shrink-0 text-brand-ink-soft" />
        <span className="flex-1 text-[13px] font-semibold text-brand-ink">Lançar de novo</span>
        {!expanded && (
          <span className="flex-shrink-0 text-[12px] text-brand-ink-soft">
            {items.length} {items.length === 1 ? "opção" : "opções"}
          </span>
        )}
        <ChevronDown
          size={15}
          className="flex-shrink-0 text-brand-ink-soft transition-transform"
          style={{ transform: expanded ? "rotate(180deg)" : "none" }}
        />
      </button>
      {expanded && (
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => {
          const isOpen = openKey === item.description;
          return isOpen ? (
            <form
              key={item.description}
              action={createEntry}
              className="flex w-full items-center gap-1.5 rounded-full bg-brand-card py-1 pl-3.5 pr-1.5"
            >
              <input type="hidden" name="type" value="despesa" />
              <input type="hidden" name="description" value={item.description} />
              <input type="hidden" name="entry_date" value={toDateKey(new Date())} />
              {item.categoryId && (
                <input type="hidden" name="category_id" value={item.categoryId} />
              )}
              <span className="truncate text-[12.5px] font-medium text-brand-ink">
                {item.description}
              </span>
              <span className="text-[12.5px] text-brand-ink-soft">R$</span>
              <input
                name="amount"
                autoFocus
                required
                inputMode="decimal"
                defaultValue={amountToInputValue(item.amount)}
                onChange={(e) => {
                  e.target.value = formatCentsInput(e.target.value);
                }}
                className="w-16 rounded-lg border border-brand-line bg-brand-card px-1.5 py-1 text-[12.5px] text-brand-ink outline-none focus:border-brand-ink"
              />
              <button
                type="submit"
                aria-label={`Lançar ${item.description} de novo`}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-sage text-white"
              >
                <Check size={13} />
              </button>
              <button
                type="button"
                onClick={() => setOpenKey(null)}
                aria-label="Cancelar"
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-brand-ink-soft"
              >
                <X size={13} />
              </button>
            </form>
          ) : (
            <button
              key={item.description}
              type="button"
              onClick={() => setOpenKey(item.description)}
              className="rounded-full bg-brand-card px-3.5 py-2 text-[12.5px] font-medium text-brand-ink"
            >
              {item.description} de novo
            </button>
          );
        })}
      </div>
      )}
    </div>
  );
}
