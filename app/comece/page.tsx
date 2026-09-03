"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { TOKENS } from "@/lib/tokens";

type Level = {
  label: string;
  accent: string;
  image: string;
  steps: { title: string; body: string[] }[];
};

/** Fundo suave a partir da cor de destaque do nível — acompanha claro/escuro sozinho. */
function tintOf(accent: string): string {
  return `color-mix(in srgb, ${accent} 16%, transparent)`;
}

const LEVELS: Level[] = [
  {
    label: "Nível 1 · Começando do zero",
    accent: TOKENS.sage,
    image: "/guia-nivel1.png",
    steps: [
      {
        title: "Abra a fatura",
        body: ["Hoje, só abre a fatura ou o extrato.", "Não precisa fazer nada com ele ainda — só ver o que tem lá."],
      },
      {
        title: "Duas listas só",
        body: [
          "Separa o que se repete todo mês (aluguel, internet, plano do celular) do que muda (mercado, farmácia, um lanche fora).",
          "Não precisa categoria bonita, só essas duas.",
        ],
      },
      {
        title: "Escolha 1 jeito",
        body: ["Papel, Notas do celular, um áudio pra você mesma — o que for mais fácil.", "Só escolhe 1 e usa esse dali pra frente."],
      },
      {
        title: "Separe antes de gastar",
        body: ["Assim que cair um dinheiro, separa uma partezinha antes de mexer no resto.", "R$20 já conta.", "Essa parte fica de reserva, não se mexe."],
      },
      {
        title: "Sobrou ou faltou?",
        body: ["No fim da semana, uma pergunta só: sobrou ou faltou?", "Não precisa fechar conta certinha, só essa resposta."],
      },
    ],
  },
  {
    label: "Nível 2 · Achando o buraco",
    accent: TOKENS.amber,
    image: "/guia-nivel2.png",
    steps: [
      {
        title: "Confira o óbvio primeiro",
        body: ["Antes de sair caçando gasto por gasto atrás da diferença, confere se não foi só um número digitado errado.", "É o motivo mais comum — e o mais rápido de achar."],
      },
      {
        title: "Compare com o extrato",
        body: ["Pega o que você anotou e põe do lado do extrato de verdade, só pra ver se o total bate.", "Não precisa comparar item por item ainda."],
      },
      {
        title: "É a parcela, não o total",
        body: ["Confere se você tá somando a parcela certa da fatura, não a compra inteira.", "Comprou em 10x? É só aquela parcela que entra esse mês."],
      },
      {
        title: "Cartão x conta",
        body: ["Separa o que foi no cartão do que foi na conta ou no pix.", "Misturar os dois é o jeito mais comum de nunca fechar a conta."],
      },
      {
        title: "Ache o motivo",
        body: ["No fim da semana, pergunta: esse buraco é de um gasto que esqueci, ou de um número que digitei errado?", "Isso já aponta pro problema."],
      },
    ],
  },
  {
    label: "Nível 3 · Menos esforço",
    accent: TOKENS.plum,
    image: "/guia-nivel3.png",
    steps: [
      {
        title: "Corte 1 passo",
        body: ["Tira 1 passo do seu processo atual — não o mais importante, o mais chato.", "Só pra testar se você sente falta dele ou não."],
      },
      {
        title: "Só 2 ou 3 categorias",
        body: ["Confere quantas categorias você realmente olha pra decidir alguma coisa.", "Geralmente são 2 ou 3 — o resto é detalhe que ninguém revisita depois."],
      },
      {
        title: "Pare de repetir",
        body: ["Se uma compra já tá parcelada, para de digitar o mesmo lançamento todo mês.", "Anota uma vez, deixa rodar — só mexe se o valor mudar."],
      },
      {
        title: "1 vez por semana",
        body: ["Troca “olhar todo dia” por “olhar 1 vez por semana”, num dia fixo.", "Menos check-in, mesmo controle."],
      },
      {
        title: "Decisão x registro",
        body: ["Separa o que é decisão do que é só registro.", "Decisão (quanto sobrou, o que cortar) você faz 1x por semana.", "Registro (cada gasto, cada categoria) não precisa ser manual."],
      },
    ],
  },
];

const TRIAGEM_OPTIONS = [
  { title: "Nunca consegui manter um controle" },
  { title: "Controlo, mas as contas não batem" },
  { title: "Já controlo bem, quero simplificar" },
];

/** 2 perguntas de sim/não que já separam certinho nos 3 níveis. */
const QUIZ_QUESTIONS = [
  {
    question: "Você tem algum jeito de controlar seus gastos hoje?",
    yes: "Sim, de algum jeito",
    no: "Não, nunca consegui",
  },
  {
    question: "Quando você confere, os números costumam bater?",
    yes: "Sim, bate certinho",
    no: "Não, nunca sei de onde vem a diferença",
  },
];

type View = "triagem" | "quiz" | "steps" | "done";

export default function ComecePage() {
  const [view, setView] = useState<View>("triagem");
  const [levelIndex, setLevelIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [quizStep, setQuizStep] = useState(0);

  const level = LEVELS[levelIndex];

  function startLevel(index: number) {
    setLevelIndex(index);
    setStepIndex(0);
    setView("steps");
  }

  function startQuiz() {
    setQuizStep(0);
    setView("quiz");
  }

  function answerQuiz(answer: "yes" | "no") {
    if (quizStep === 0) {
      if (answer === "no") {
        startLevel(0);
      } else {
        setQuizStep(1);
      }
    } else {
      startLevel(answer === "no" ? 1 : 2);
    }
  }

  function next() {
    if (stepIndex < level.steps.length - 1) {
      setStepIndex((s) => s + 1);
    } else {
      setView("done");
    }
  }

  function prev() {
    if (stepIndex > 0) setStepIndex((s) => s - 1);
  }

  function backToTriagem() {
    setView("triagem");
  }

  return (
    <div className="flex min-h-screen justify-center bg-brand-bg px-5 py-7">
      <div className="w-full max-w-[420px]">
        <div className="mb-7 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-ink-solid">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M4 12.5L9 17.5L20 5" stroke="#FBFAF6" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="font-display text-[15px] font-bold text-brand-ink">Tá Resolvido</span>
        </div>

        {view === "triagem" && (
          <div>
            <h1 className="text-balance font-display text-[28px] font-extrabold leading-tight text-brand-ink">
              Qual desses é mais você?
            </h1>
            <p className="mt-2.5 text-[15px] leading-relaxed text-brand-ink-soft">
              Escolhe uma opção e a gente te mostra os passos certos pra sua situação — nada de lista genérica.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {TRIAGEM_OPTIONS.map((opt, i) => (
                <button
                  key={opt.title}
                  type="button"
                  onClick={() => startLevel(i)}
                  className="flex items-center gap-4 rounded-[22px] border-[1.5px] border-brand-line bg-brand-card p-5 text-left active:scale-[0.98]"
                >
                  <span
                    className="flex h-[50px] w-[50px] flex-shrink-0 items-center justify-center rounded-full font-display text-[21px] font-extrabold"
                    style={{ background: tintOf(LEVELS[i].accent), color: LEVELS[i].accent }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 text-balance font-display text-[18px] font-bold leading-tight text-brand-ink">
                    {opt.title}
                  </span>
                  <ArrowRight size={18} className="flex-shrink-0 text-brand-ink-soft" />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={startQuiz}
              className="mx-auto mt-6 block text-[13px] font-medium text-brand-ink-soft underline underline-offset-2"
            >
              Não sabe qual é o seu? Faz um teste rápido
            </button>
          </div>
        )}

        {view === "quiz" && (
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={backToTriagem}
                aria-label="Voltar"
                className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-xl border border-brand-line bg-brand-card"
              >
                <ArrowLeft size={17} className="text-brand-ink" />
              </button>
              <span className="font-display text-[12px] font-bold uppercase tracking-wide text-brand-ink-soft">
                Teste rápido
              </span>
            </div>

            <div className="mt-5 flex gap-1.5">
              {QUIZ_QUESTIONS.map((_, i) => (
                <span
                  key={i}
                  className="h-[5px] flex-1 rounded-full bg-brand-ink-solid"
                  style={{ opacity: i <= quizStep ? 1 : 0.15 }}
                />
              ))}
            </div>

            <div className="mt-10 text-balance font-display text-[26px] font-extrabold leading-[1.2] text-brand-ink">
              {QUIZ_QUESTIONS[quizStep].question}
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => answerQuiz("no")}
                className="rounded-2xl border-[1.5px] border-brand-line bg-brand-card p-5 text-left font-display text-[16px] font-bold text-brand-ink active:scale-[0.98]"
              >
                {QUIZ_QUESTIONS[quizStep].no}
              </button>
              <button
                type="button"
                onClick={() => answerQuiz("yes")}
                className="rounded-2xl border-[1.5px] border-brand-line bg-brand-card p-5 text-left font-display text-[16px] font-bold text-brand-ink active:scale-[0.98]"
              >
                {QUIZ_QUESTIONS[quizStep].yes}
              </button>
            </div>
          </div>
        )}

        {view === "steps" && (
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={backToTriagem}
                aria-label="Voltar"
                className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-xl border border-brand-line bg-brand-card"
              >
                <ArrowLeft size={17} className="text-brand-ink" />
              </button>
              <span className="font-display text-[12px] font-bold uppercase tracking-wide" style={{ color: level.accent }}>
                {level.label}
              </span>
            </div>

            <div className="mt-5 flex gap-1.5">
              {level.steps.map((_, i) => (
                <span
                  key={i}
                  className="h-[5px] flex-1 rounded-full transition-colors"
                  style={{ background: i <= stepIndex ? level.accent : TOKENS.line }}
                />
              ))}
            </div>

            <div className="mt-7 flex flex-1 flex-col">
              <div
                className="flex h-[52px] w-[52px] items-center justify-center rounded-full font-display text-[22px] font-extrabold"
                style={{ background: tintOf(level.accent), color: level.accent }}
              >
                {stepIndex + 1}
              </div>
              <div className="mt-5 text-balance font-display text-[32px] font-extrabold leading-[1.15]" style={{ color: level.accent }}>
                {level.steps[stepIndex].title}
              </div>
              <div className="mt-4 flex flex-col gap-3 text-[17px] leading-relaxed text-brand-ink">
                {level.steps[stepIndex].body.map((sentence, i) => (
                  <p key={i} className="m-0">
                    {sentence}
                  </p>
                ))}
              </div>

              <div className="mt-auto flex gap-2.5 pt-8">
                {stepIndex > 0 && (
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Passo anterior"
                    className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-2xl border border-brand-line bg-brand-card text-brand-ink"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={next}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-[15px] font-display text-[15px] font-bold text-white"
                  style={{ background: level.accent }}
                >
                  {stepIndex === level.steps.length - 1 ? "Terminar" : "Próximo"}
                  {stepIndex < level.steps.length - 1 && <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "done" && (
          <div className="flex flex-col pt-8 text-center">
            <div
              className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-full"
              style={{ background: tintOf(level.accent) }}
            >
              <Check size={30} style={{ color: level.accent }} />
            </div>
            <h2 className="mt-5 text-balance font-display text-[26px] font-extrabold leading-tight text-brand-ink">
              Pronto — seus 5 passos
            </h2>
            <p className="mx-auto mt-2.5 max-w-[34ch] text-[15px] leading-relaxed text-brand-ink-soft">
              Guarda esse resumo pra consultar sempre que precisar. Não precisa decorar nada.
            </p>
            <div className="mt-8 flex flex-col gap-2.5">
              <a
                href={level.image}
                download
                className="rounded-2xl bg-brand-ink-solid py-[15px] text-center font-display text-[15px] font-bold text-white"
              >
                ⬇ Baixar meus 5 passos
              </a>
              <Link
                href="/"
                className="rounded-2xl border-[1.5px] border-brand-ink py-[15px] text-center font-display text-[15px] font-bold text-brand-ink"
              >
                Quero um app que faz isso sozinho
              </Link>
            </div>
            <button
              type="button"
              onClick={backToTriagem}
              className="mt-5 text-[13px] font-medium text-brand-ink-soft underline underline-offset-2"
            >
              Ver outro nível
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
