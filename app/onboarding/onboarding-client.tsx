"use client";

import { useState } from "react";
import { ArrowRight, Camera, Check, Gauge, Mic, MessageCircle, PenLine, Sparkles, Wallet } from "lucide-react";
import { TOKENS, formatCentsInput, parseCentsInput } from "@/lib/tokens";
import { completeOnboarding, type ExperienceLevel } from "./actions";

const WAYS = [
  { icon: PenLine, label: "Digitar", sub: "Nome e valor, na mão" },
  { icon: Camera, label: "Foto ou PDF", sub: "Fatura ou extrato inteiro" },
  { icon: MessageCircle, label: "Chat", sub: "Escreve como texto" },
  { icon: Mic, label: "Áudio", sub: "Fala e a gente entende" },
];

const LEVELS: { id: ExperienceLevel; label: string; sub: string }[] = [
  { id: "iniciante", label: "Nunca controlei meus gastos", sub: "Vou precisar de uma mãozinha" },
  { id: "intermediario", label: "Mais ou menos, quero melhorar", sub: "Já tenho uma ideia, mas é bagunçado" },
  { id: "avancado", label: "Já me organizo bem", sub: "Só quero centralizar tudo aqui" },
];

const SLIDES = [
  { kind: "ruler" as const },
  { kind: "ways" as const },
  { kind: "level" as const },
  { kind: "balance" as const },
  { kind: "guide" as const },
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
  const [balance, setBalance] = useState("");
  const [level, setLevel] = useState<ExperienceLevel | null>(null);
  const slide = SLIDES[step];
  const isFirst = step === 0;
  const isLast = step === SLIDES.length - 1;

  async function handleFinish(guided: boolean) {
    setFinishing(true);
    try {
      await completeOnboarding(balance ? parseCentsInput(balance) : 0, level, guided);
    } catch {
      setFinishing(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-3 py-7">
      <div className="flex min-h-[500px] w-full max-w-sm flex-col items-center rounded-[28px] bg-brand-card px-7 pb-7 pt-10 text-center">
        {!isFirst && !isLast && (
          <button
            type="button"
            onClick={() => setStep(SLIDES.length - 1)}
            className="-mb-2 self-end text-sm font-medium text-brand-ink-soft"
          >
            Pular
          </button>
        )}

        <div className="flex flex-1 flex-col justify-center gap-5">
          {slide.kind === "ruler" && (
            <>
              <div>
                <div className="mb-2.5 font-display text-[26px] font-bold text-brand-ink">Tá Resolvido</div>
                <div className="mx-auto max-w-[260px] text-[14.5px] leading-snug text-brand-ink-soft">
                  Cada gasto vira uma marquinha na linha do seu mês — olhe quando quiser, sem
                  planilha e sem complicação.
                </div>
              </div>
              <RulerPreview />
            </>
          )}

          {slide.kind === "ways" && (
            <>
              <div>
                <div className="mb-2.5 font-display text-[26px] font-bold text-brand-ink">Do seu jeito</div>
                <div className="mx-auto max-w-[260px] text-[14.5px] leading-snug text-brand-ink-soft">
                  Lança do jeito que for mais fácil na hora — a gente entende de qualquer forma.
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {WAYS.map((w) => (
                  <div key={w.label} className="rounded-2xl bg-brand-bg px-2.5 py-3.5 text-center">
                    <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-card">
                      <w.icon size={18} className="text-brand-ink" />
                    </div>
                    <div className="font-display text-[13px] font-semibold text-brand-ink">{w.label}</div>
                    <div className="mt-0.5 text-[10.5px] leading-tight text-brand-ink-soft">{w.sub}</div>
                  </div>
                ))}
              </div>
            </>
          )}

          {slide.kind === "level" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-bg">
                <Gauge size={30} className="text-brand-ink" />
              </div>
              <div>
                <div className="mb-2.5 font-display text-[24px] font-bold text-brand-ink">Qual seu nível hoje?</div>
                <div className="mx-auto max-w-[260px] text-[14px] leading-snug text-brand-ink-soft">
                  Isso só ajusta o quanto a gente explica em cada passo — não muda o que você pode
                  fazer.
                </div>
              </div>
              <div className="flex flex-col gap-2 text-left">
                {LEVELS.map((l) => {
                  const selected = level === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLevel(l.id)}
                      className={
                        selected
                          ? "flex items-center gap-2.5 rounded-2xl border-[1.5px] border-brand-plum bg-brand-plum/10 px-3.5 py-3"
                          : "flex items-center gap-2.5 rounded-2xl border-[1.5px] border-brand-line px-3.5 py-3"
                      }
                    >
                      <span
                        className={
                          selected
                            ? "flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-brand-plum"
                            : "h-[18px] w-[18px] flex-shrink-0 rounded-full border-[1.5px] border-brand-line"
                        }
                      >
                        {selected && <Check size={11} className="text-white" />}
                      </span>
                      <span>
                        <span className="block text-[13.5px] font-semibold text-brand-ink">{l.label}</span>
                        <span className="block text-[11.5px] text-brand-ink-soft">{l.sub}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {slide.kind === "balance" && (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-bg">
                <Wallet size={40} className="text-brand-ink" />
              </div>
              <div>
                <div className="mb-2.5 font-display text-[26px] font-bold text-brand-ink">Seu saldo atual</div>
                <div className="mx-auto max-w-[260px] text-[14.5px] leading-snug text-brand-ink-soft">
                  Quanto você tem hoje na conta? Isso vira o ponto de partida do seu saldo aqui no
                  app.
                </div>
              </div>
              <div className="w-full text-left">
                <div className="relative mx-auto max-w-[220px]">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-brand-ink-soft">
                    R$
                  </span>
                  <input
                    autoFocus
                    value={balance}
                    onChange={(e) => setBalance(formatCentsInput(e.target.value))}
                    inputMode="decimal"
                    placeholder="0,00"
                    className="w-full rounded-2xl border border-brand-line bg-brand-card py-3 pl-9 pr-3.5 text-center text-[16px] text-brand-ink outline-none focus:border-brand-ink"
                  />
                </div>
                <p className="mx-auto mt-3.5 max-w-[260px] text-center text-[12px] leading-snug text-brand-ink-soft">
                  Usa o saldo que você vê no banco <strong>agora</strong>, hoje — mesmo se for
                  lançar gastos de dias anteriores do mês.
                </p>
                <p className="mx-auto mt-2 max-w-[260px] text-center text-[12px] leading-snug text-brand-ink-soft">
                  Gastos antigos não mexem nesse saldo, só aparecem no resumo do mês — então nada
                  desacerta.
                </p>
              </div>
            </>
          )}

          {slide.kind === "guide" && (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-bg">
                <Sparkles size={38} className="text-brand-ink" />
              </div>
              <div>
                <div className="mb-2.5 font-display text-[26px] font-bold text-brand-ink">Quer que eu te guie?</div>
                <div className="mx-auto max-w-[260px] text-[14.5px] leading-snug text-brand-ink-soft">
                  Posso te acompanhar nos primeiros passos (categorias, gastos fixos, cartão) — ou
                  você já pode ir explorando sozinho(a).
                </div>
              </div>
              <div className="flex w-full flex-col gap-2.5">
                <button
                  type="button"
                  disabled={finishing}
                  onClick={() => handleFinish(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-plum py-[15px] font-display text-[15px] font-semibold text-white disabled:opacity-60"
                >
                  {finishing ? "Só um instante..." : "Sim, me guia nos primeiros passos"}
                </button>
                <button
                  type="button"
                  disabled={finishing}
                  onClick={() => handleFinish(false)}
                  className="w-full py-1.5 text-[13px] font-medium text-brand-ink-soft disabled:opacity-60"
                >
                  Não, prefiro explorar sozinho(a)
                </button>
              </div>
            </>
          )}
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

        {slide.kind !== "guide" && (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-ink-solid py-[15px] font-display text-[15px] font-semibold text-white"
          >
            Próximo
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
