import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Camera, Check, PenLine, Ruler } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Quiz } from "./quiz";

const STEPS = [
  {
    icon: PenLine,
    title: "1. Marca o que já sabe",
    body: "Digite um gasto ou uma entrada de dinheiro na mão, quando quiser.",
  },
  {
    icon: Camera,
    title: "2. Manda o print quando lembrar",
    body: "Foto do extrato, do comprovante, da fatura do cartão, ou só escreve numa frase o que rolou — a gente entende sozinho o que é gasto e o que é receita, sem você precisar preencher nada.",
  },
  {
    icon: Ruler,
    title: "3. Olha sua régua quando quiser",
    body: "Sem precisar lançar nada todo dia. O mês fica ali, esperando por você.",
  },
];

const FREE_FEATURES = [
  "Lançamento manual de gastos e receitas",
  "Régua do mês",
  "Quanto gastei",
  "Categorias",
  "3 reconhecimentos de IA por mês (foto, PDF ou chat)",
];

const PAID_FEATURES: { text: string; image?: string; imageHeight?: number }[] = [
  { text: "Fotos e PDFs sem limite — manda o extrato inteiro de uma vez, sem digitar gasto por gasto" },
  { text: "Escreve numa frase o que gastou e a IA lança sozinho, categorizado" },
  { text: "Seu salário e as contas fixas já entram sozinhos, mês após mês" },
  { text: "Um resumo do seu mês pronto, sem precisar montar gráfico nenhum" },
  {
    text: "Vê quanto já guardou pra cada meta, sem abrir conta separada",
    image: "/metas-preview.png",
    imageHeight: 773,
  },
  {
    text: "Sabe antes de estourar o orçamento, não só depois",
    image: "/limites-preview.png",
    imageHeight: 763,
  },
  { text: "Um empurrãozinho pra lembrar de mandar o extrato, do jeito que você escolher" },
  { text: "Aprende a categoria certa a partir das suas correções — não erra de novo" },
];

const FAQ = [
  {
    q: "Funciona no iPhone e no Android?",
    a: "Sim — o Tá Resolvido é um site que funciona direto no navegador do seu celular, sem precisar baixar nada de loja de aplicativo.",
  },
  {
    q: "Preciso entender de finanças pra usar?",
    a: "Não. Não tem termo técnico nem fórmula — só marcar o que entra e o que sai.",
  },
  {
    q: "Meus dados bancários ficam salvos em algum lugar?",
    a: "Não. O Tá Resolvido não se conecta com seu banco. Você manda o print de um extrato quando quiser, a gente lê só o que está ali, e a imagem não fica guardada depois.",
  },
  {
    q: "E se eu esquecer de usar por um tempo?",
    a: "Sem problema — não tem cobrança por atraso nem lembrete chato. Quando lembrar, é só mandar o print de onde parou.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim, direto no app, sem precisar justificar nada. E se cancelar nos primeiros 7 dias, devolvemos o valor pago.",
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

      {/* 1. Hero */}
      <section className="px-5 pb-14 pt-10 text-center sm:px-10 sm:pt-16">
        <div className="mx-auto inline-block rounded-full bg-brand-plum/10 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-brand-plum">
          Controle financeiro que cabe na sua vida real
        </div>
        <h1 className="mx-auto mt-5 max-w-xl text-balance font-display text-[32px] font-bold leading-tight text-brand-ink sm:text-[44px]">
          Você lembra de tudo. Até esquecer uma coisa.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[18px] font-medium leading-relaxed text-brand-ink">
          O que pesa na sua cabeça sobre dinheiro finalmente sai dela.
        </p>
        <p className="mx-auto mt-2.5 max-w-md text-[15px] leading-relaxed text-brand-ink-soft">
          Marque o que gasta, tire foto do extrato ou escreve numa frase, e veja seu mês inteiro
          numa régua simples.
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
            Cadastro rápido. Plano grátis pra sempre.
          </span>
        </div>
      </section>

      {/* 2. Agitação */}
      <section className="px-5 pb-16 sm:px-10">
        <div className="mx-auto max-w-md text-center text-[16px] leading-relaxed text-brand-ink-soft">
          <p>Toda semana você jura que vai organizar as contas.</p>
          <p className="mt-4">
            Chega o fim de semana. Chega também roupa suja, mercado, sono atrasado.
          </p>
          <p className="mt-4">Contas? Semana que vem, com certeza.</p>
          <p className="mt-4 font-medium text-brand-ink">
            Não é falta de dinheiro. É falta de organização mesmo — e ninguém te ensinou um jeito
            que coubesse na sua vida real.
          </p>
        </div>
      </section>

      {/* 3. A virada */}
      <section className="px-5 pb-16 sm:px-10">
        <div className="mx-auto max-w-md text-center">
          <h2 className="text-balance font-display text-[26px] font-bold leading-tight text-brand-ink sm:text-[30px]">
            E se o seu mês inteiro coubesse numa única linha?
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-brand-ink-soft">
            Não um gráfico. Não uma planilha. Uma régua — com cada gasto e cada entrada de
            dinheiro marcados nela, do jeito que sua semana realmente aconteceu.
          </p>
        </div>
        <div className="mx-auto mt-8 max-w-[280px] overflow-hidden rounded-[28px] shadow-lg">
          <Image
            src="/regua-preview.png"
            alt="Tela da régua do mês no Tá Resolvido, mostrando o total que entrou e saiu no mês e cada gasto marcado dia a dia"
            width={650}
            height={1408}
            className="w-full"
          />
        </div>
      </section>

      {/* 4. Como funciona */}
      <section className="px-5 pb-16 sm:px-10">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-brand-ink">
          Como funciona
        </h2>
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3.5 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-[22px] bg-brand-card p-6">
              <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-bg">
                <s.icon size={19} className="text-brand-ink" />
              </div>
              <div className="mb-1.5 font-display text-[16px] font-bold text-brand-ink">
                {s.title}
              </div>
              <p className="text-[14px] leading-relaxed text-brand-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Prova real */}
      <section className="px-5 pb-16 sm:px-10">
        <div className="mx-auto max-w-md rounded-[28px] bg-brand-ink px-7 py-10 text-center">
          <h2 className="mb-4 font-display text-xl font-bold text-brand-card">
            Por que eu criei isso
          </h2>
          <p className="text-[14.5px] leading-relaxed text-brand-card/85">
            Eu criei o Tá Resolvido pra mim primeiro. Sou mãe, trabalho fora, e é comigo mesma
            que testo cada tela antes de qualquer outra pessoa usar.
          </p>
          <p className="mt-3 text-[14.5px] leading-relaxed text-brand-card/85">
            Não é fórmula mágica. É o que funciona pra quem, como eu, não tem tempo sobrando.
          </p>
        </div>
      </section>

      {/* 6. Diferencial */}
      <section className="px-5 pb-16 sm:px-10">
        <div className="mx-auto max-w-md text-center">
          <h2 className="mb-4 font-display text-2xl font-bold text-brand-ink">
            Por que não é só mais um app financeiro
          </h2>
          <p className="text-[15px] leading-relaxed text-brand-ink-soft">
            A maioria dos apps de finanças exige uma disciplina que ninguém tem sobra pra dar —
            lançar tudo, todo dia, sem falhar.
          </p>
          <p className="mt-3 text-[15px] font-medium leading-relaxed text-brand-ink">
            O Tá Resolvido foi feito ao contrário: pra funcionar mesmo quando você esquece,
            atrasa, ou só consegue olhar uma vez por semana.
          </p>
        </div>
      </section>

      {/* 7. Planos e preço */}
      <section className="px-5 pb-16 sm:px-10">
        <h2 className="mx-auto mb-8 max-w-md text-balance text-center font-display text-2xl font-bold text-brand-ink">
          Comece de graça. Evolua quando fizer sentido.
        </h2>
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-[26px] bg-brand-card p-7">
            <div className="mb-1 font-display text-[15px] font-bold text-brand-ink">
              Plano Grátis
            </div>
            <div className="mb-5 font-display text-3xl font-bold text-brand-ink">R$0</div>
            <ul className="mb-6 flex flex-col gap-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13.5px] text-brand-ink-soft">
                  <Check size={15} className="mt-0.5 flex-shrink-0 text-brand-sage" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-2xl border-[1.5px] border-brand-ink py-3.5 font-display text-[14.5px] font-semibold text-brand-ink"
            >
              Quero começar de graça
            </Link>
          </div>

          <div className="rounded-[26px] bg-brand-ink p-7">
            <div className="mb-1 font-display text-[15px] font-bold text-brand-card">
              Plano Completo
            </div>
            <div className="mb-1 font-display text-3xl font-bold text-brand-card">
              R$29,90<span className="text-[15px] font-medium text-brand-card/70">/mês</span>
            </div>
            <div className="mb-5 text-[12.5px] text-brand-card/70">Tudo do plano grátis, mais:</div>
            <ul className="mb-6 flex flex-col gap-2.5">
              {PAID_FEATURES.map((f) => (
                <li key={f.text} className="flex flex-col gap-2.5">
                  <div className="flex items-start gap-2 text-[13.5px] text-brand-card/85">
                    <Check size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#D9A441" }} />
                    {f.text}
                  </div>
                  {f.image && (
                    <div className="ml-[23px] max-w-[170px] overflow-hidden rounded-2xl shadow-lg">
                      <Image
                        src={f.image}
                        alt={f.text}
                        width={375}
                        height={f.imageHeight ?? 812}
                        className="w-full"
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-2xl bg-brand-plum py-3.5 font-display text-[14.5px] font-semibold text-white"
            >
              Quero o plano completo
            </Link>
            <div className="mt-2.5 text-center text-[11.5px] leading-snug text-brand-card/60">
              Cria sua conta grátis primeiro — o upgrade pro Completo acontece de dentro do app.
            </div>
          </div>
        </div>

        <div className="mx-auto mt-4 max-w-3xl rounded-2xl bg-brand-amber/12 px-6 py-4 text-center">
          <div className="font-display text-[14.5px] font-bold text-brand-ink">
            🎉 Preço fundador: R$19,90/mês nos primeiros 3 meses
          </div>
          <div className="mt-0.5 text-[12.5px] text-brand-ink-soft">
            Depois, volta pro preço cheio (R$29,90/mês).
          </div>
        </div>
      </section>

      {/* 8. Redução de risco */}
      <section className="px-5 pb-16 sm:px-10">
        <div className="mx-auto max-w-md text-center text-[14.5px] leading-relaxed text-brand-ink-soft">
          <p className="font-semibold text-brand-ink">
            7 dias de garantia. Se não gostar, é só pedir — devolvemos tudo, sem perguntas.
          </p>
          <p className="mt-2.5">
            Sem letra miúda. Cancela quando quiser, direto no app, sem precisar justificar nada.
          </p>
          <p className="mt-2.5">
            Seus dados bancários nunca ficam salvos aqui — a gente só lê o que está no print que
            você manda, e depois disso ele não fica guardado.
          </p>
        </div>
      </section>

      {/* 9. Quiz */}
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

      {/* 10. FAQ */}
      <section className="px-5 pb-16 sm:px-10">
        <h2 className="mb-8 text-center font-display text-2xl font-bold text-brand-ink">
          Perguntas frequentes
        </h2>
        <div className="mx-auto flex max-w-xl flex-col gap-2.5">
          {FAQ.map((item) => (
            <div key={item.q} className="rounded-2xl bg-brand-card px-6 py-5">
              <div className="mb-1.5 font-display text-[15px] font-bold text-brand-ink">
                {item.q}
              </div>
              <p className="text-[13.5px] leading-relaxed text-brand-ink-soft">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dúvidas / Contato */}
      <section className="px-5 pb-16 text-center sm:px-10">
        <h2 className="mb-2.5 font-display text-2xl font-bold text-brand-ink">
          Ficou com alguma dúvida?
        </h2>
        <p className="text-[15px] text-brand-ink-soft">
          Manda um e-mail pra gente:{" "}
          <a
            href="mailto:contato@taresolvido.app"
            className="font-semibold text-brand-ink underline underline-offset-2"
          >
            contato@taresolvido.app
          </a>
        </p>
      </section>

      {/* 11. CTA final */}
      <section className="px-5 pb-20 sm:px-10">
        <div className="mx-auto max-w-2xl rounded-[28px] bg-brand-ink px-8 py-12 text-center">
          <h2 className="mx-auto max-w-sm text-balance font-display text-2xl font-bold text-brand-card sm:text-[28px]">
            Tá na hora de tirar isso da sua cabeça.
          </h2>
          <Link
            href="/login"
            className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-brand-plum px-8 py-4 font-display text-[15px] font-semibold text-white"
          >
            Quero organizar meu mês
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
