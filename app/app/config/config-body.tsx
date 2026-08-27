"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { setAccentColor, setMonthlyInsightsEnabled, setSeparateByAccount } from "./actions";

const ACCENT_COLORS = [
  { key: "amber", label: "Âmbar", hex: "#D9A441" },
  { key: "sage", label: "Verde-oliva", hex: "#6F8F6A" },
  { key: "coral", label: "Terracota", hex: "#C1553D" },
  { key: "azul", label: "Azul-petróleo", hex: "#3E6E8E" },
  { key: "roxo", label: "Ameixa", hex: "#7A5C7E" },
];

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        on
          ? "relative h-[26px] w-11 flex-shrink-0 rounded-full bg-brand-ink-solid"
          : "relative h-[26px] w-11 flex-shrink-0 rounded-full bg-brand-line"
      }
    >
      <div
        className="absolute top-[3px] h-5 w-5 rounded-full bg-white transition-all"
        style={{ left: on ? 21 : 3 }}
      />
    </button>
  );
}

export function ConfigBody({
  initialSeparateByAccount,
  initialAccentColor,
  initialMonthlyInsightsEnabled,
}: {
  initialSeparateByAccount: boolean;
  initialAccentColor: string;
  initialMonthlyInsightsEnabled: boolean;
}) {
  const [separateByAccount, setSeparateByAccountState] = useState(initialSeparateByAccount);
  const [accentColor, setAccentColorState] = useState(initialAccentColor);
  const [monthlyInsightsEnabled, setMonthlyInsightsEnabledState] = useState(
    initialMonthlyInsightsEnabled,
  );

  function handleToggleAccount() {
    const next = !separateByAccount;
    setSeparateByAccountState(next);
    setSeparateByAccount(next).catch(() => {});
  }

  function handleSelectColor(hex: string) {
    setAccentColorState(hex);
    setAccentColor(hex).catch(() => {});
  }

  function handleToggleMonthlyInsights() {
    const next = !monthlyInsightsEnabled;
    setMonthlyInsightsEnabledState(next);
    setMonthlyInsightsEnabled(next).catch(() => {});
  }

  return (
    <>
      <div className="mb-2 text-[13px] font-semibold text-brand-ink">Contas e bancos</div>
      <div className="mb-6 flex items-center justify-between rounded-2xl bg-brand-card px-[18px] py-4">
        <div className="pr-4">
          <div className="text-[14.5px] font-medium text-brand-ink">Separar gastos por conta</div>
          <div className="mt-0.5 text-xs leading-snug text-brand-ink-soft">
            {separateByAccount
              ? "Cada gasto vai pedir qual conta/banco é a origem."
              : "Tudo fica unificado numa régua só, sem distinguir banco."}
          </div>
        </div>
        <Toggle on={separateByAccount} onClick={handleToggleAccount} />
      </div>

      <div className="mb-2 text-[13px] font-semibold text-brand-ink">Cor de destaque</div>
      <p className="mb-3.5 text-xs leading-snug text-brand-ink-soft">
        Muda a cor de &quot;hoje&quot; na régua e do botão principal. O resto do visual continua
        igual, pra manter tudo fácil de ler.
      </p>
      <div className="mb-6 rounded-2xl bg-brand-card px-[18px] py-4">
        <div className="flex flex-wrap gap-3.5">
          {ACCENT_COLORS.map((c) => {
            const isSelected = accentColor === c.hex;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => handleSelectColor(c.hex)}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                  style={{
                    background: c.hex,
                    border: isSelected ? "2.5px solid #1F3A3D" : "2.5px solid transparent",
                  }}
                >
                  {isSelected && <Check size={16} className="text-white" />}
                </div>
                <span className="text-[10.5px] text-brand-ink-soft">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-2 text-[13px] font-semibold text-brand-ink">Comentário do mês</div>
      <div className="flex items-center justify-between rounded-2xl bg-brand-card px-[18px] py-4">
        <div className="pr-4">
          <div className="text-[14.5px] font-medium text-brand-ink">
            Comentário sobre o mês anterior
          </div>
          <div className="mt-0.5 text-xs leading-snug text-brand-ink-soft">
            Um comentário curto e opcional sobre como foi seu mês, tipo um amigo comentando —
            avisado por um sininho no app, nunca por e-mail.
          </div>
        </div>
        <Toggle on={monthlyInsightsEnabled} onClick={handleToggleMonthlyInsights} />
      </div>
    </>
  );
}
