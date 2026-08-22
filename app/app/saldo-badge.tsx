import { currency, TOKENS } from "@/lib/tokens";

export function SaldoBadge({ saldo, previsto }: { saldo: number; previsto?: boolean }) {
  const positive = saldo >= 0;
  const color = positive ? TOKENS.sage : TOKENS.coral;

  return (
    <div
      className="flex items-baseline gap-2 rounded-full px-3.5 py-2"
      style={{ background: `color-mix(in srgb, ${color} 14%, ${TOKENS.card})` }}
    >
      <span className="text-[11px] font-medium text-brand-ink-soft">
        {previsto ? "Saldo previsto" : "Saldo"}
      </span>
      <span className="font-display text-[22px] font-bold" style={{ color }}>
        {currency(saldo)}
      </span>
    </div>
  );
}
