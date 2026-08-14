import Link from "next/link";
import { ChevronLeft, Share, MoreVertical, PlusSquare, CheckCircle2 } from "lucide-react";

type Step = { icon: React.ReactNode; title: string; desc: string };

function StepCard({ number, step }: { number: number; step: Step }) {
  return (
    <div className="flex gap-3.5 rounded-2xl bg-brand-card px-[18px] py-4">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-bg text-[13px] font-bold text-brand-ink">
        {number}
      </div>
      <div>
        <div className="flex items-center gap-1.5 text-[14.5px] font-semibold text-brand-ink">
          {step.icon}
          {step.title}
        </div>
        <div className="mt-0.5 text-[13px] leading-snug text-brand-ink-soft">{step.desc}</div>
      </div>
    </div>
  );
}

const IOS_STEPS: Step[] = [
  {
    icon: <Share size={14} className="text-brand-ink-soft" />,
    title: "Toque no ícone Compartilhar",
    desc: "O quadradinho com a seta pra cima, na barra do Safari.",
  },
  {
    icon: <PlusSquare size={14} className="text-brand-ink-soft" />,
    title: 'Escolha "Adicionar à Tela de Início"',
    desc: "Role a lista de opções até encontrar.",
  },
  {
    icon: <CheckCircle2 size={14} className="text-brand-ink-soft" />,
    title: 'Confirme em "Adicionar"',
    desc: "O ícone aparece na sua tela inicial como um app.",
  },
];

const ANDROID_STEPS: Step[] = [
  {
    icon: <MoreVertical size={14} className="text-brand-ink-soft" />,
    title: "Toque nos três pontinhos",
    desc: "Menu do Chrome, no canto superior direito.",
  },
  {
    icon: <PlusSquare size={14} className="text-brand-ink-soft" />,
    title: 'Escolha "Instalar aplicativo"',
    desc: 'Em alguns aparelhos aparece como "Adicionar à tela inicial".',
  },
  {
    icon: <CheckCircle2 size={14} className="text-brand-ink-soft" />,
    title: "Confirme a instalação",
    desc: "Pronto: o app abre em tela cheia, sem barra de navegador.",
  },
];

export default function InstalarPage() {
  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <Link
            href="/app/config"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
          >
            <ChevronLeft size={18} />
          </Link>
          <div className="font-display text-xl font-bold text-brand-ink">
            Instalar o app
          </div>
        </div>

        <p className="mb-5 text-[13.5px] leading-snug text-brand-ink-soft">
          Coloca o Tá Resolvido na tela inicial do seu celular — abre rapidinho, em tela cheia,
          como um app de verdade.
        </p>

        <div className="mb-2 text-[13px] font-semibold text-brand-ink">iPhone / iPad (Safari)</div>
        <div className="mb-6 flex flex-col gap-2.5">
          {IOS_STEPS.map((step, i) => (
            <StepCard key={step.title} number={i + 1} step={step} />
          ))}
        </div>

        <div className="mb-2 text-[13px] font-semibold text-brand-ink">Android (Chrome)</div>
        <div className="flex flex-col gap-2.5">
          {ANDROID_STEPS.map((step, i) => (
            <StepCard key={step.title} number={i + 1} step={step} />
          ))}
        </div>
      </div>
    </div>
  );
}
