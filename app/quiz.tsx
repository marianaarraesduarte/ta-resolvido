"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, RotateCcw } from "lucide-react";

type Profile = "organizada" | "meio" | "piloto";

type Question = { text: string; options: { label: string; profile: Profile }[] };

const QUESTIONS: Question[] = [
  {
    text: "Sem abrir o extrato, você sabe quanto gastou esse mês?",
    options: [
      { label: "Sei bem", profile: "organizada" },
      { label: "Mais ou menos", profile: "meio" },
      { label: "Nem imagino", profile: "piloto" },
    ],
  },
  {
    text: "Quando um gasto inesperado aparece, o que costuma acontecer?",
    options: [
      { label: "Eu já tenho uma reserva pra isso", profile: "organizada" },
      { label: "Eu ajusto o resto do mês na correria", profile: "meio" },
      { label: "Eu descubro o problema só quando já é tarde", profile: "piloto" },
    ],
  },
  {
    text: "Como você guarda hoje o controle dos seus gastos?",
    options: [
      { label: "Planilha ou app, mas não uso direito", profile: "organizada" },
      { label: "Papel ou nota no celular", profile: "meio" },
      { label: "Não guardo em lugar nenhum", profile: "piloto" },
    ],
  },
];

const RESULTS: Record<Profile, { title: string; body: string }> = {
  organizada: {
    title: "Organizada, mas cansada",
    body: "Você já tem uma noção boa das suas finanças — só que mantém isso funcionando na base do esforço. O Tá Resolvido tira esse peso sem te fazer perder o controle que você já tem.",
  },
  meio: {
    title: "No meio do caminho",
    body: "Você não está perdida, mas também não tem uma visão clara do mês inteiro. A régua do Tá Resolvido é feita pra fechar exatamente essa lacuna.",
  },
  piloto: {
    title: "Sobrevivendo no piloto automático",
    body: "Você não é desorganizada — só está sobrecarregada, igual muita gente. O Tá Resolvido foi pensado exatamente pra quem não tem tempo nem cabeça sobrando pra mais um sistema complicado.",
  },
};

function majorityProfile(answers: Profile[]): Profile {
  const counts: Record<Profile, number> = { organizada: 0, meio: 0, piloto: 0 };
  for (const a of answers) counts[a] += 1;
  return (Object.keys(counts) as Profile[]).reduce((best, key) =>
    counts[key] > counts[best] ? key : best,
  );
}

export function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Profile[]>([]);

  const done = step >= QUESTIONS.length;

  function choose(profile: Profile) {
    setAnswers((prev) => [...prev, profile]);
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
                onClick={() => choose(opt.profile)}
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
            Seu perfil
          </div>
          <h3 className="mb-3 font-display text-2xl font-bold text-brand-ink">
            {RESULTS[majorityProfile(answers)].title}
          </h3>
          <p className="mb-6 text-[14.5px] leading-relaxed text-brand-ink-soft">
            {RESULTS[majorityProfile(answers)].body}
          </p>
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-plum py-4 font-display text-[15px] font-semibold text-white"
          >
            Quero organizar meu mês
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
