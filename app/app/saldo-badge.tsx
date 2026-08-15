"use client";

import { useSaldo } from "@/lib/saldo-context";
import { currency, TOKENS } from "@/lib/tokens";

export function SaldoBadge() {
  const { saldo } = useSaldo();
  const positive = saldo >= 0;
  const color = positive ? TOKENS.sage : TOKENS.coral;

  return (
    <div
      className="flex items-baseline gap-1.5 rounded-full px-3 py-[7px]"
      style={{ background: `color-mix(in srgb, ${color} 14%, ${TOKENS.card})` }}
    >
      <span className="text-[10px] font-medium text-brand-ink-soft">Saldo</span>
      <span className="font-display text-[13.5px] font-bold" style={{ color }}>
        {currency(saldo)}
      </span>
    </div>
  );
}
