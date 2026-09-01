"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { monthKey } from "@/lib/date";
import { goToMonth } from "./month-actions";

export const MONTH_ABBRS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

/** Chip do mês atual dentro da MonthStrip — toca pra abrir o seletor completo. */
export function MonthPicker({
  path,
  monthName,
  shortLabel,
  viewedYear,
  viewedMonth,
}: {
  path: string;
  monthName: string;
  /** Abreviação de 3 letras (ex: "Set") — o que aparece no chip. */
  shortLabel?: string;
  viewedYear: number;
  /** 0-indexado, igual Date.getMonth() */
  viewedMonth: number;
}) {
  const [open, setOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(viewedYear);

  function openPicker() {
    setPickerYear(viewedYear);
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openPicker}
        className="flex flex-shrink-0 items-center gap-1 rounded-full px-3.5 py-2 text-left"
        style={{ background: "var(--accent)" }}
      >
        <span className="font-display text-[13px] font-semibold text-white">
          {shortLabel ?? monthName}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-brand-ink-solid/40 px-4 pb-6 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-[22px] bg-brand-card p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPickerYear((y) => y - 1)}
                aria-label="Ano anterior"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-bg text-brand-ink"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-display text-lg font-bold text-brand-ink">{pickerYear}</span>
              <button
                type="button"
                onClick={() => setPickerYear((y) => y + 1)}
                aria-label="Próximo ano"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-bg text-brand-ink"
              >
                <ChevronRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="ml-2 flex h-9 w-9 items-center justify-center text-brand-ink-soft"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {MONTH_ABBRS.map((label, i) => {
                const isSelected = pickerYear === viewedYear && i === viewedMonth;
                const key = monthKey(new Date(pickerYear, i, 1));
                return (
                  <form key={key} action={goToMonth.bind(null, path, key)}>
                    <button
                      type="submit"
                      className={
                        isSelected
                          ? "w-full rounded-xl bg-brand-ink-solid py-2.5 font-display text-sm font-semibold text-white"
                          : "w-full rounded-xl bg-brand-bg py-2.5 font-display text-sm font-semibold text-brand-ink"
                      }
                    >
                      {label}
                    </button>
                  </form>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
