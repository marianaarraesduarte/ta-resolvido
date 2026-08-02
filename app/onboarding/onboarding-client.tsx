"use client";

import { useState } from "react";
import { ArrowRight, Camera, PenLine, Ruler } from "lucide-react";
import { TOKENS } from "@/lib/tokens";
import { completeOnboarding } from "./actions";

const SLIDES = [
  {
    icon: <Ruler size={40} className="text-brand-ink" />,
    title: "Tá Resolvido",
    text: "O jeito simples de acompanhar o seu mês, sem planilha e sem complicação.",
    isIntro: true,
  },
  {
    icon: <Ruler size={40} className="text-brand-ink" />,
    title: "Sua régua do mês",
    text: "Cada gasto vira uma marca na linha do mês. Olhe quando quiser — não precisa lançar todo dia.",
  },
  {
    icon: (
      <div className="flex gap-2.5">
        <PenLine size={34} className="text-brand-ink" />
        <Camera size={34} className="text-brand-ink" />
      </div>
    ),
    title: "Do seu jeito",
    text: "Digite o gasto na mão ou manda um print do extrato do banco. A gente lê pra você.",
  },
];

function RulerPreview() {
  const dots = [
    { day: 4, color: TOKENS.sage },
    { day: 10, color: TOKENS.amber },
    { day: 16, color: TOKENS.coral },
    { day: 23, color: TOKENS.sage },
  ];
  return (
    <div className="relative mx-auto h-[34px] w-[220px]">
      <div className="absolute left-0 right-0 top-4 h-0.5 bg-brand-line" />
      {dots.map((d, i) => (
        <div
          key={i}
          className="absolute top-2.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full"
          style={{ left: `${(d.day / 30) * 100}%`, background: d.color }}
        />
      ))}
    </div>
  );
}

export function OnboardingClient() {
  const [step, setStep] = useState(0);
  const [finishing, setFinishing] = useState(false);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  async function handleFinish() {
    setFinishing(true);
    try {
      await completeOnboarding();
    } catch {
      setFinishing(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-3 py-7">
      <div className="flex min-h-[480px] w-full max-w-sm flex-col items-center rounded-[28px] bg-brand-card px-7 pb-7 pt-10 text-center">
        {!slide.isIntro && (
          <button
            type="button"
            onClick={() => setStep(SLIDES.length - 1)}
            className="-mb-2 self-end text-sm font-medium text-brand-ink-soft"
          >
            Pular
          </button>
        )}

        <div className="flex flex-1 flex-col justify-center gap-5">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-bg">
            {slide.icon}
          </div>

          <div>
            <div className="mb-2.5 font-display text-[26px] font-bold text-brand-ink">
              {slide.title}
            </div>
            <div className="mx-auto max-w-[260px] text-[14.5px] leading-snug text-brand-ink-soft">
              {slide.text}
            </div>
          </div>

          {step === 1 && <RulerPreview />}
        </div>

        <div className="mb-5 mt-4 flex gap-1.5">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === step ? 18 : 6,
                background: i === step ? TOKENS.ink : TOKENS.line,
              }}
            />
          ))}
        </div>

        <button
          type="button"
          disabled={finishing}
          onClick={() => (isLast ? handleFinish() : setStep((s) => s + 1))}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-ink py-[15px] font-display text-[15px] font-semibold text-brand-card disabled:opacity-60"
        >
          {isLast ? (finishing ? "Só um instante..." : "Começar") : "Próximo"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
