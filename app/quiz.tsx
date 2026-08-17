"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";

type Question = { text: string; options: { label: string; value: number }[] };

const QUESTIONS: Question[] = [
  {
    text: "Sem abrir o extrato, você sabe quanto gastou esse mês?",
    options: [
      { label: "Sei bem", value: 0 },
      { label: "Mais ou menos", value: 1 },
      { label: "Nem imagino", value: 2 },
    ],
  },
  {
    text: "Já perdeu o fio da meada nas contas alguma vez?",
    options: [
      { label: "Nunca", value: 0 },
      { label: "De vez em quando", value: 1 },
      { label: "Direto", value: 2 },
    ],
  },
  {
    text: "Hoje, como você acompanha seus gastos?",
    options: [
      { label: "Planilha", value: 1 },
      { label: "Anoto no papel ou de cabeça", value: 1 },
      { label: "De nenhum jeito", value: 2 },
    ],
  },
];

const RESULTS = [
  {
    max: 2,
    title: "Perfil Organizado(a) em risco",
    body: "Você já tem uma boa noção das contas, mas confia na memória — e memória falha. Um lugar só pra ver tudo evita a surpresa do fim do mês.",
  },
  {
    max: 4,
    title: "Perfil Consciente, sem sistema",
    body: "Você se preocupa e até tenta acompanhar, mas sem um jeito simples de fazer isso, o esforço não vira controle de verdade.",
  },
  {
    max: 6,
    title: "Perfil Só no Improviso",
    body: "Hoje o dinheiro passa e você descobre depois pra onde foi. É exatamente esse ponto que o Tá Resolvido resolve.",
  },
];

function resultFor(score: number) {
  return RESULTS.find((r) => score <= r.max) ?? RESULTS[RESULTS.length - 1];
}

export function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const done = step >= QUESTIONS.length;
  const score = answers.reduce((sum, v) => sum + v, 0);

  function choose(value: number) {
    setAnswers((prev) => [...prev, value]);
    setStep((s) => s + 1);
  }

  function restart() {
    setStep(0);
    setAnswers([]);
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-[28px] bg-brand-card p-7 shadow-sm">
      {!done ? (
        <>
          <div className="mb-5 flex gap-1.5">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full"
                style={{ background: i <= step ? "#7A5C7E" : "#D9D3C4" }}
              />
            ))}
          </div>
          <div className="mb-6 font-display text-xl font-bold leading-snug text-brand-ink">
            {QUESTIONS[step].text}
          </div>
          <div className="flex flex-col gap-2.5">
            {QUESTIONS[step].options.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => choose(opt.value)}
                className="rounded-2xl border-[1.5px] border-brand-line bg-white px-5 py-3.5 text-left text-[15px] font-medium text-brand-ink transition-colors hover:border-brand-plum"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center">
          <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-brand-plum">
            Seu resultado
          </div>
          <h3 className="mb-3 font-display text-2xl font-bold text-brand-ink">
            {resultFor(score).title}
          </h3>
          <p className="mb-6 text-[14.5px] leading-relaxed text-brand-ink-soft">
            {resultFor(score).body}
          </p>
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-plum py-4 font-display text-[15px] font-semibold text-white"
          >
            Quero resolver isso
            <ArrowRight size={17} />
          </Link>
          <button
            type="button"
            onClick={restart}
            className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-ink-soft"
          >
            <RotateCcw size={13} />
            Refazer o quiz
          </button>
        </div>
      )}
    </div>
  );
}
