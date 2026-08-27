import { currency, TOKENS } from "@/lib/tokens";

export function SaldoBadge({ saldo, previsto }: { saldo: number; previsto?: boolean }) {
  const positive = saldo >= 0;
  const color = positive ? TOKENS.sage : TOKENS.coral;

  return (
    <div>
      <div className="mb-0.5 text-[11.5px] font-semibold text-brand-ink-soft">
        {previsto ? "Saldo previsto" : "Saldo"}
      </div>
      <div
        className="font-display text-[30px] font-bold leading-none [font-variant-numeric:tabular-nums]"
        style={{ color }}
      >
        {currency(saldo)}
      </div>
    </div>
  );
}
