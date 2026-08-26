"use client";

import { useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";
import { currency, TOKENS } from "@/lib/tokens";
import { iconForCategory } from "@/lib/category-icons";
import { pickTeaser, type AssistantData } from "@/lib/assistant-data";

type LineItem = { label: string; icon?: string | null; valueText: string; tone?: "sage" | "coral" | "ink" };
type ChecklistItem = { label: string; done: boolean };
type Answer = {
  text?: string;
  intro?: string;
  lines?: LineItem[];
  checklist?: ChecklistItem[];
  cta?: { label: string; href: string };
};
type Question = { id: string; label: string; primary?: boolean; answer: Answer };

const STATIC_ANSWERS: Record<string, string> = {
  gastofixo:
    "É uma conta que se repete todo mês, tipo aluguel, internet ou plano de saúde. Cadastrando uma vez, a gente já conta com esse valor sempre — sem você ter que lembrar de lançar de novo.",
  metainvest:
    "É um valor (ou % da sua renda) que você decide guardar todo mês, tipo “Liberdade financeira” ou “Viagem”. Quando você confirma que guardou, a gente desconta do saldo — porque saiu da sua conta de verdade.",
  saldoinicial:
    "É o valor que você tinha quando começou a usar o app. A partir dali, a gente soma tudo que entra e desconta tudo que sai — pra você sempre saber quanto tem, sem precisar abrir o banco.",
  parcelado:
    "Fotografa a fatura do cartão, ou digita no chat de lançamento algo como “tênis 300 no crédito” — a gente já separa certinho pra fatura e conta no mês certo.",
  marcarpago:
    "Na tela de Quanto gastei, toca na conta fixa e marca como paga — ou já lança normal com o mesmo nome (tipo “Aluguel”) que a gente reconhece sozinho.",
  salarioonly:
    "É uma opção nas Configurações pra quem não quer contar outras entradas (tipo reembolso ou venda avulsa) no saldo — só o salário mesmo.",
  editar: "Dá sim — toca em qualquer lançamento na lista (Quanto gastei ou Meu mês) e você pode editar o valor, a categoria ou excluir.",
  semibanco:
    "Porque funciona melhor pra vida real: dinheiro em espécie, Pix de um amigo, renda informal — nada disso some ou vira “não categorizado”. E você nunca precisa dar sua senha do banco pra gente.",
  lancarnamao:
    "Muita gente conecta o banco, acha bonito no primeiro dia, e nunca mais abre o app — de nada adianta ter o extrato inteiro se ninguém presta atenção nele. Lançar na mão leva só uns segundos (chat ou foto), e é isso que faz você perceber o gasto na hora, não só depois. É de propósito, não falta de recurso.",
  dadosseguro: "Sim — a gente nunca pede senha de banco, e só você tem acesso aos seus lançamentos.",
  semia:
    "Porque isso aqui precisa responder na hora, sempre — IA de verdade às vezes fica sobrecarregada e falha. O Comentário do mês, esse sim, usa IA de verdade pra analisar seu mês (é recurso do plano Completo).",
};

const TEASER_POOL_RODANDO = [
  "Alguma dúvida sobre esse mês?",
  "Quer ver como foi seu mês até agora?",
  "Já sabe quanto ainda pode gastar esse mês?",
  "Bora dar uma olhada nas suas contas?",
  "Precisa de uma mãozinha com alguma coisa?",
];
const TEASER_POOL_NOVA = [
  "Ainda falta configurar algumas coisas — quer ver o quê?",
  "Bora organizar suas contas fixas?",
  "Já viu por onde começar por aqui?",
  "Alguma dúvida de como o app funciona?",
];

function toneColor(tone: LineItem["tone"]): string {
  if (tone === "sage") return TOKENS.sage;
  if (tone === "coral") return TOKENS.coral;
  return TOKENS.ink;
}

function buildQuestions(data: AssistantData, comparisonSentence: string | null): { primary: Question[]; secondary: Question[] } {
  var needsSetup = !data.setupChecklist.contasFixas || !data.setupChecklist.limites;

  var comecar: Question = {
    id: "comecar",
    label: "Por onde eu começo?",
    primary: true,
    answer: {
      checklist: [
        { label: "Saldo inicial", done: data.setupChecklist.saldoInicial },
        { label: "Cadastrar suas contas fixas", done: data.setupChecklist.contasFixas },
        { label: "Definir quanto pode gastar por categoria", done: data.setupChecklist.limites },
      ],
      cta: !data.setupChecklist.contasFixas
        ? { label: "Cadastrar contas fixas", href: "/app/resumo" }
        : { label: "Definir limites", href: "/app/limites" },
    },
  };

  var limitesAnswer: Answer;
  if (!data.isCompleto) {
    limitesAnswer = { text: "Isso é um recurso do plano Completo.", cta: { label: "Ver planos", href: "/app/planos" } };
  } else if (data.limitesLines.length === 0) {
    limitesAnswer = {
      text: "Você ainda não definiu quanto pode gastar por categoria.",
      cta: { label: "Definir limites", href: "/app/limites" },
    };
  } else {
    limitesAnswer = {
      lines: data.limitesLines.map((l) => {
        var over = l.spent > l.limit;
        var restante = Math.abs(l.limit - l.spent);
        return {
          label: l.name,
          icon: l.icon,
          valueText: (over ? "passou " : "sobram ") + currency(restante),
          tone: over ? "coral" : "sage",
        } as LineItem;
      }),
      cta: { label: "Ver limites completos", href: "/app/limites" },
    };
  }

  var ondefoiAnswer: Answer =
    data.topCategorias.length === 0
      ? { text: "Ainda não tem gasto registrado esse mês." }
      : {
          intro: "Até agora, o que mais pesou:",
          lines: data.topCategorias.map((c) => ({ label: c.name, valueText: currency(c.amount), tone: "ink" as const })),
          cta: { label: "Ver Quanto gastei", href: "/app/resumo" },
        };

  var faltaSairLines: LineItem[] = [
    ...data.pendingItems.map((p) => ({ label: p.name, valueText: currency(p.amount), tone: "ink" as const })),
    ...(data.nextInvoice
      ? [{ label: "Fatura do cartão (dia " + data.nextInvoice.dayLabel + ")", valueText: currency(data.nextInvoice.amount), tone: "ink" as const }]
      : []),
  ];
  var faltaSairAnswer: Answer =
    faltaSairLines.length === 0
      ? { text: "Não tem nada pendente que a gente saiba." }
      : { intro: "Ainda não saiu:", lines: faltaSairLines, cta: { label: "Ver Quanto gastei", href: "/app/resumo" } };

  var comparacaoAnswer: Answer = { text: comparisonSentence ?? "Ainda não dá pra comparar com o mês passado." };

  var oquefaltaAnswer: Answer = {
    checklist: [
      { label: "Saldo inicial", done: data.setupChecklist.saldoInicial },
      { label: "Contas fixas", done: data.setupChecklist.contasFixas },
      { label: "Limites por categoria", done: data.setupChecklist.limites },
    ],
    cta: needsSetup
      ? !data.setupChecklist.contasFixas
        ? { label: "Cadastrar contas fixas", href: "/app/resumo" }
        : { label: "Definir limites", href: "/app/limites" }
      : undefined,
  };

  var QUESTIONS: Record<string, Question> = {
    comecar: comecar,
    limites: { id: "limites", label: "Quanto posso gastar esse mês?", answer: limitesAnswer },
    ondefoi: { id: "ondefoi", label: "Pra onde foi meu dinheiro?", answer: ondefoiAnswer },
    faltasair: { id: "faltasair", label: "O que ainda falta sair esse mês?", answer: faltaSairAnswer },
    comparacao: { id: "comparacao", label: "Gastei mais ou menos que mês passado?", answer: comparacaoAnswer },
    oquefalta: { id: "oquefalta", label: "O que ainda falta eu configurar?", answer: oquefaltaAnswer },
    gastofixo: { id: "gastofixo", label: "O que é ‘gasto fixo’?", answer: { text: STATIC_ANSWERS.gastofixo } },
    metainvest: { id: "metainvest", label: "O que é ‘meta de investimento’?", answer: { text: STATIC_ANSWERS.metainvest } },
    saldoinicial: { id: "saldoinicial", label: "Como funciona o saldo inicial?", answer: { text: STATIC_ANSWERS.saldoinicial } },
    parcelado: { id: "parcelado", label: "Como marco uma compra parcelada?", answer: { text: STATIC_ANSWERS.parcelado } },
    marcarpago: { id: "marcarpago", label: "Como marco um gasto fixo como pago?", answer: { text: STATIC_ANSWERS.marcarpago } },
    salarioonly: { id: "salarioonly", label: "O que é ‘considerar só salário’?", answer: { text: STATIC_ANSWERS.salarioonly } },
    editar: { id: "editar", label: "Dá pra editar ou apagar um lançamento?", answer: { text: STATIC_ANSWERS.editar } },
    semibanco: { id: "semibanco", label: "Por que o app não conecta direto com meu banco?", answer: { text: STATIC_ANSWERS.semibanco } },
    lancarnamao: { id: "lancarnamao", label: "Por que eu preciso lançar na mão?", answer: { text: STATIC_ANSWERS.lancarnamao } },
    dadosseguro: { id: "dadosseguro", label: "Meus dados estão seguros?", answer: { text: STATIC_ANSWERS.dadosseguro } },
    semia: { id: "semia", label: "Por que não tem uma IA conversando aqui?", answer: { text: STATIC_ANSWERS.semia } },
  };

  if (needsSetup) {
    return {
      primary: [QUESTIONS.comecar, QUESTIONS.limites, QUESTIONS.ondefoi],
      secondary: [
        QUESTIONS.faltasair, QUESTIONS.comparacao, QUESTIONS.gastofixo, QUESTIONS.metainvest,
        QUESTIONS.saldoinicial, QUESTIONS.parcelado, QUESTIONS.marcarpago, QUESTIONS.salarioonly,
        QUESTIONS.editar, QUESTIONS.semibanco, QUESTIONS.lancarnamao, QUESTIONS.dadosseguro, QUESTIONS.semia,
      ],
    };
  }
  return {
    primary: [QUESTIONS.limites, QUESTIONS.ondefoi, QUESTIONS.faltasair, QUESTIONS.comparacao],
    secondary: [
      QUESTIONS.oquefalta, QUESTIONS.gastofixo, QUESTIONS.metainvest, QUESTIONS.saldoinicial,
      QUESTIONS.parcelado, QUESTIONS.marcarpago, QUESTIONS.salarioonly, QUESTIONS.editar,
      QUESTIONS.semibanco, QUESTIONS.lancarnamao, QUESTIONS.dadosseguro, QUESTIONS.semia,
    ],
  };
}

function AnswerBubble({ answer }: { answer: Answer }) {
  return (
    <div className="rounded-[4px_16px_16px_16px] bg-brand-card px-3.5 py-2.5 text-[13px] leading-relaxed text-brand-ink">
      {answer.intro && <div className="mb-1.5">{answer.intro}</div>}
      {answer.text && <div>{answer.text}</div>}
      {answer.lines && (
        <div className="flex flex-col">
          {answer.lines.map((line, i) => {
            const Icon = line.icon !== undefined ? iconForCategory(line.icon) : null;
            return (
              <div key={i} className="flex items-center justify-between gap-2.5 py-1">
                <span className="flex min-w-0 items-center gap-1.5 truncate">
                  {Icon && <Icon size={12} className="flex-shrink-0 text-brand-ink-soft" />}
                  {line.label}
                </span>
                <span className="flex-shrink-0 font-semibold" style={{ color: toneColor(line.tone) }}>
                  {line.valueText}
                </span>
              </div>
            );
          })}
        </div>
      )}
      {answer.checklist && (
        <div className="flex flex-col gap-1">
          {answer.checklist.map((item, i) => (
            <div key={i} className={"flex items-center gap-2" + (item.done ? " text-brand-ink-soft line-through" : "")}>
              <span
                className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[5px] border text-[10px] font-bold text-white"
                style={{
                  borderColor: item.done ? TOKENS.sage : TOKENS.inkSoft,
                  background: item.done ? TOKENS.sage : "transparent",
                }}
              >
                {item.done ? "✓" : ""}
              </span>
              {item.label}
            </div>
          ))}
        </div>
      )}
      {answer.cta && (
        <a href={answer.cta.href} className="mt-2 inline-flex rounded-[10px] bg-brand-bg px-3 py-1.5 text-[11.5px] font-bold text-brand-ink">
          {answer.cta.label} →
        </a>
      )}
    </div>
  );
}

export function AssistantCard({
  data,
  comparisonSentence,
  dayOfMonth,
}: {
  data: AssistantData;
  comparisonSentence: string | null;
  dayOfMonth: number;
}) {
  const [open, setOpen] = useState(false);
  const [asked, setAsked] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);

  const { primary, secondary } = buildQuestions(data, comparisonSentence);
  const needsSetup = !data.setupChecklist.contasFixas || !data.setupChecklist.limites;
  const teaser = pickTeaser(needsSetup ? TEASER_POOL_NOVA : TEASER_POOL_RODANDO, dayOfMonth);
  const greeting = needsSetup
    ? "Oi! Vi que você tá começando agora. Bora organizar as coisas?"
    : "Oi! Como posso ajudar hoje?";

  const askedQuestions = asked.map((id) => [...primary, ...secondary].find((q) => q.id === id)).filter(Boolean) as Question[];
  const visible = primary.concat(expanded ? secondary : []).filter((q) => !asked.includes(q.id));
  const hasMore = !expanded && secondary.some((q) => !asked.includes(q.id));

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-2xl bg-brand-card px-4 py-3.5 text-left"
      >
        <Sparkles size={15} className="flex-shrink-0 text-brand-ink-soft" />
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-brand-ink">
          {open ? greeting : teaser}
        </span>
        <ChevronDown
          size={15}
          className="flex-shrink-0 text-brand-ink-soft transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>

      {open && (
        <div className="mt-2 rounded-2xl bg-brand-bg p-3">
          <div className="mb-2 flex items-start gap-2">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-ink">
              <Sparkles size={11} className="text-brand-card" />
            </div>
            <div className="rounded-[4px_16px_16px_16px] bg-brand-card px-3.5 py-2.5 text-[13px] font-medium text-brand-ink">
              {greeting}
            </div>
          </div>

          {askedQuestions.map((q) => (
            <div key={q.id} className="mb-2 flex flex-col gap-2">
              <div className="flex justify-end">
                <div className="max-w-[78%] rounded-[16px_4px_16px_16px] bg-[var(--accent)] px-3.5 py-2.5 text-[13px] font-medium text-brand-card">
                  {q.label}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-ink">
                  <Sparkles size={11} className="text-brand-card" />
                </div>
                <AnswerBubble answer={q.answer} />
              </div>
            </div>
          ))}

          <div className="mt-2 flex flex-wrap gap-1.5">
            {visible.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setAsked((prev) => [...prev, q.id])}
                className={
                  q.primary
                    ? "rounded-full bg-[var(--accent)] px-3 py-2 text-[12px] font-semibold text-brand-card"
                    : "rounded-full border border-brand-line bg-brand-card px-3 py-2 text-[12px] font-semibold text-brand-ink"
                }
              >
                {q.label}
              </button>
            ))}
            {hasMore && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                className="rounded-full border border-dashed border-brand-line bg-brand-card px-3 py-2 text-[12px] font-semibold text-brand-ink"
              >
                Ver mais perguntas
              </button>
            )}
            {expanded && (
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="rounded-full border border-dashed border-brand-line bg-brand-card px-3 py-2 text-[12px] font-semibold text-brand-ink"
              >
                Ver menos perguntas
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
