"use client";

import { useState } from "react";
import { currency, TOKENS } from "@/lib/tokens";
import type { FolegoData } from "@/lib/folego";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function FolegoCard({ saldoAtual, fixedPendingTotal, fixedPendingCount, fixedPendingTop, invoice }: FolegoData) {
  const [hypothetical, setHypothetical] = useState(0);

  const comprometidoBase = fixedPendingTotal + (invoice?.amount ?? 0);
  const sobraLivreReal = saldoAtual - comprometidoBase;
  const sobraLivre = sobraLivreReal - hypothetical;
  const tranquilo = sobraLivre >= 0;
  const jaApertado = sobraLivreReal < 0;
  const color = tranquilo ? TOKENS.sage : TOKENS.coral;
  const extra =
    fixedPendingCount > 1 ? `, e mais ${fixedPendingCount - 1} conta${fixedPendingCount > 2 ? "s" : ""}` : "";

  let headline: string;
  let sub: string;

  if (tranquilo) {
    headline = invoice
      ? `Tá resolvido até ${invoice.dayLabel}.`
      : fixedPendingTop
        ? `Tá resolvido — falta só ${fixedPendingTop.name}.`
        : "Tá tudo resolvido.";
    if (invoice) {
      sub = `Sua fatura do cartão de ${currency(invoice.amount)} (dia ${invoice.dayLabel}) já cabe. Sobram ${currency(sobraLivre)}.`;
    } else if (fixedPendingTop) {
      sub = `${capitalize(fixedPendingTop.name)}${extra}: ${currency(fixedPendingTotal)} já cabe. Sobram ${currency(sobraLivre)}.`;
    } else {
      sub = "Seu saldo tá livre pra usar.";
    }
  } else if (jaApertado) {
    // Já não fecha mesmo sem nenhuma compra hipotética — problema real, não
    // causado pelo controle (que pode estar parado em zero).
    if (invoice) {
      headline = `Não fecha até ${invoice.dayLabel}.`;
      sub = `Sua fatura do cartão de ${currency(invoice.amount)} (dia ${invoice.dayLabel}) já não cabe no saldo — faltam ${currency(Math.abs(sobraLivre))}.`;
    } else if (fixedPendingTop) {
      headline = "Suas contas não cabem no saldo.";
      sub = `${capitalize(fixedPendingTop.name)}${extra}: ${currency(fixedPendingTotal)} já não cabe no saldo — faltam ${currency(Math.abs(sobraLivre))}.`;
    } else {
      headline = "Seu saldo já está negativo.";
      sub = `Faltam ${currency(Math.abs(sobraLivre))} pra fechar as contas.`;
    }
  } else {
    // Só fica assim por causa da compra hipotética simulada no controle.
    headline = "Essa compra deixa uma conta sem cobrir.";
    if (invoice) {
      sub = `Com essa compra, sua fatura do cartão de ${currency(invoice.amount)} (dia ${invoice.dayLabel}) não cabe mais — faltariam ${currency(Math.abs(sobraLivre))}.`;
    } else if (fixedPendingTop) {
      sub = `Com essa compra, ${fixedPendingTop.name}${extra}: ${currency(fixedPendingTotal)} não cabe mais — faltariam ${currency(Math.abs(sobraLivre))}.`;
    } else {
      sub = `Com essa compra, seu saldo fica negativo em ${currency(Math.abs(sobraLivre))}.`;
    }
  }

  const sliderMax = Math.max(300, Math.round((Math.max(sobraLivreReal, 0) * 1.6 + 300) / 10) * 10);

  return (
    <div className="mb-5 rounded-[20px] bg-brand-card p-4">
      <div className="flex items-center gap-1.5 text-[11px] font-bold">
        <span className="h-[7px] w-[7px] rounded-full" style={{ background: color }} />
        <span style={{ color }}>{tranquilo ? "Seu mês está tranquilo" : "Tem uma diferença a resolver"}</span>
      </div>

      <div className="mt-2 font-display text-xl font-extrabold leading-snug text-brand-ink">{headline}</div>
      <p className="mt-1.5 text-[12.5px] leading-snug text-brand-ink-soft">{sub}</p>

      {invoice && (
        <svg viewBox="0 0 300 100" className="mt-3 block h-auto w-full">
          <path
            d="M28,42 C110,42 140,74 180,70 C220,66 240,42 272,38"
            fill="none"
            stroke={TOKENS.line}
            strokeWidth="2.5"
            strokeDasharray="1 8"
            strokeLinecap="round"
          />
          <circle cx="28" cy="42" r="16" fill={TOKENS.ink} />
          <text x="28" y="46" textAnchor="middle" fontSize="9" fontWeight="700" fill={TOKENS.card}>
            hoje
          </text>
          <circle cx="272" cy="38" r="16" fill={color} />
          <rect x="266" y="32" width="12" height="9" rx="2" fill="none" stroke={TOKENS.card} strokeWidth="1.5" />
          <line x1="266" y1="35.5" x2="278" y2="35.5" stroke={TOKENS.card} strokeWidth="1.3" />
          <text x="272" y="20" textAnchor="middle" fontSize="9" fontWeight="700" fill={TOKENS.ink}>
            Fatura
          </text>
          <text x="272" y="64" textAnchor="middle" fontSize="9" fill={TOKENS.inkSoft}>
            {invoice.dayLabel}
          </text>
        </svg>
      )}

      <div className="mt-3 rounded-2xl bg-brand-bg p-3">
        <div className="flex items-center justify-between text-[12.5px] font-semibold text-brand-ink">
          <span>E se eu gastar agora?</span>
          <span
            className="font-display text-[15px] font-bold"
            style={{ color: hypothetical > 0 ? color : TOKENS.ink }}
          >
            {currency(hypothetical)}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={sliderMax}
          step={10}
          value={hypothetical}
          onChange={(e) => setHypothetical(Number(e.target.value))}
          className="mt-2.5 w-full accent-[var(--accent)]"
        />
        <p className="mt-2 text-[11px] leading-snug text-brand-ink-soft">
          Arraste pra ver o efeito antes de gastar de verdade.
        </p>
      </div>
    </div>
  );
}
