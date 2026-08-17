import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Camera, Gauge, Ruler, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Quiz } from "./quiz";

const FEATURES = [
  {
    icon: Ruler,
    title: "Régua do mês",
    body: "Veja seus gastos e entradas, dia a dia, num relance — sem abrir planilha nenhuma.",
  },
  {
    icon: Camera,
    title: "Foto ou PDF",
    body: "Manda o print do extrato ou a fatura do cartão. A IA separa cada gasto sozinha.",
  },
  {
    icon: Gauge,
    title: "Limites e metas",
    body: "Um alerta antes de estourar o orçamento, e um jeito simples de guardar pro que importa.",
  },
  {
    icon: Wallet,
    title: "Saldo em tempo real",
    body: "Sabe exatamente quanto sobra, sempre visível, atualizado a cada lançamento.",
  },
];

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <header className="flex items-center justify-between px-5 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12.5L9 17.5L20 5"
                stroke="#FBFAF6"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-display text-[15px] font-bold text-brand-ink">Tá Resolvido</span>
        </div>
        <Link
          href="/login"
          className="text-[13.5px] font-semibold text-brand-ink underline underline-offset-2"
        >
          Entrar
        </Link>
      </header>

      {/* Hero */}
      <section className="px-5 pb-16 pt-10 text-center sm:px-10 sm:pt-16">
        <div className="mx-auto inline-block rounded-full bg-brand-plum/10 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-brand-plum">
          Controle financeiro sem esforço
        </div>
        <h1 className="mx-auto mt-5 max-w-xl text-balance font-display text-[34px] font-bold leading-tight text-brand-ink sm:text-[44px]">
          Seu dinheiro, organizado sem esforço.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-brand-ink-soft">
          Marque o que gasta, tire foto do extrato, e veja seu mês inteiro numa régua simples.
          Sem planilha, sem complicação.
        </p>
        <div className="mt-8 flex flex-col items-center gap-2.5">
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-2xl bg-brand-plum px-8 py-4 font-display text-[15.5px] font-semibold text-white shadow-sm"
          >
            Quero começar
            <ArrowRight size={17} />
          </Link>
          <span className="text-[12.5px] text-brand-ink-soft">
            Cadastro rápido. Sem cartão de crédito.
          </span>
        </div>
      </section>

      {/* Features */}
      <section className="px-5 pb-16 sm:px-10">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3.5 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-[22px] bg-brand-card p-6">
              <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-bg">
                <f.icon size={19} className="text-brand-ink" />
              </div>
              <div className="mb-1.5 font-display text-[16.5px] font-bold text-brand-ink">
                {f.title}
              </div>
              <p className="text-[14px] leading-relaxed text-brand-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quiz */}
      <section className="px-5 pb-16 sm:px-10">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-1.5 text-[11.5px] font-bold uppercase tracking-wide text-brand-sage">
            Rapidinho
          </div>
          <h2 className="mb-8 font-display text-2xl font-bold text-brand-ink">
            Qual é o seu perfil de gastos?
          </h2>
        </div>
        <Quiz />
      </section>

      {/* Final CTA */}
      <section className="px-5 pb-20 sm:px-10">
        <div className="mx-auto max-w-2xl rounded-[28px] bg-brand-ink px-8 py-12 text-center">
          <h2 className="mx-auto max-w-sm text-balance font-display text-2xl font-bold text-brand-card sm:text-[28px]">
            Comece agora. Seu próximo mês já pode ficar mais fácil.
          </h2>
          <Link
            href="/login"
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-brand-plum px-8 py-4 font-display text-[15px] font-semibold text-white"
          >
            Quero começar
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <footer className="px-5 pb-10 text-center text-[12.5px] text-brand-ink-soft sm:px-10">
        Tá Resolvido — taresolvido.app
      </footer>
    </div>
  );
}
