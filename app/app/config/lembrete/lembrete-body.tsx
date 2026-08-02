"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { setReminderFrequency } from "./actions";

const OPTIONS = [
  { key: 1 as const, label: "1x por mês", desc: "Um lembrete no fim do mês" },
  { key: 2 as const, label: "2x por mês", desc: "A cada 15 dias, aproximadamente" },
  { key: 4 as const, label: "4x por mês", desc: "Toda semana" },
  { key: 0 as const, label: "Não quero lembretes", desc: "Eu mando o print quando lembrar" },
];

export function LembreteBody({ initialFrequency }: { initialFrequency: number }) {
  const [selected, setSelected] = useState(initialFrequency);

  function handleSelect(key: 0 | 1 | 2 | 4) {
    setSelected(key);
    setReminderFrequency(key).catch(() => {});
  }

  return (
    <div className="mb-6 flex flex-col gap-2.5">
      {OPTIONS.map((op) => {
        const isSelected = selected === op.key;
        return (
          <button
            key={op.key}
            type="button"
            onClick={() => handleSelect(op.key)}
            className={
              isSelected
                ? "flex items-center justify-between rounded-2xl border-[1.5px] border-brand-ink bg-brand-card px-[18px] py-4 text-left"
                : "flex items-center justify-between rounded-2xl border-[1.5px] border-transparent bg-brand-card px-[18px] py-4 text-left"
            }
          >
            <div>
              <div className="text-[15px] font-semibold text-brand-ink">{op.label}</div>
              <div className="mt-0.5 text-xs text-brand-ink-soft">{op.desc}</div>
            </div>
            <div
              className={
                isSelected
                  ? "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-sage"
                  : "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-bg"
              }
            >
              {isSelected && <Check size={14} className="text-white" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
