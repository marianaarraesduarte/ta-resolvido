import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Camera, MessageCircle, Mic, PenLine, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { caveat } from "@/lib/fonts";

const MIRROR_ITEMS = [
  "Já baixou um app de finanças. Ou dois. Ou três.",
  "Fez uma planilha linda — e usou ela por uma semana.",
  "Sabe que gasta mais do que devia, mas não sabe exatamente onde.",
  "Tem vergonha de admitir que não tem controle — mas queria ter.",
  "Não tem 10 minutos por dia sobrando pra lançar gasto nenhum.",
  "Já pensou em conectar o banco num app, mas não confiou.",
];

const HUB_SPOKES: { src: string; width: number; height: number; alt: string; name: string }[] = [
  {
    src: "/venda-metas.png",
    width: 744,
    height: 342,
    alt: "Meta de investimento Liberdade financeira em 10%, R$ 420 por mês",
    name: "Meta atualizada",
  },
  {
    src: "/venda-limites.png",
    width: 744,
    height: 464,
    alt: "Limites de gastos por categoria, um deles avisando que está perto do limite",
    name: "Limite avisado antes de estourar",
  },
  {
    src: "/venda-parcelas.png",
    width: 744,
    height: 388,
    alt: "Compra parcelada reconhecida em 6 de 10 parcelas pagas",
    name: "Parcela no lugar certo, sem reiniciar do zero",
  },
  {
    src: "/venda-insight.png",
    width: 740,
    height: 380,
    alt: "Comentário do mês gerado automaticamente sobre como o mês está indo",
    name: "Um comentário sincero do seu mês",
  },
];

const FIT_YES = [
  "Já tentou outros apps e não aguentou a rotina de lançar tudo, todo dia",
  "Prefere mandar uma foto, um áudio ou uma frase a preencher formulário",
  "Não quer conectar a conta do banco em nada",
  "Só consegue olhar as finanças de vez em quando, não todo dia",
];

const FIT_NO = [
  "Você já ama planilha e curte controlar categoria por categoria, na hora",
  "Precisa de integração automática, direto com o banco",
  "Quer gráfico de investimento e análise avançada",
  "Prefere um app com o menor preço do mercado, não o mais simples",
];

const FREE_FEATURES = [
  "Lançamento manual de gastos e receitas",
  "Régua do mês",
  "Quanto gastei, por categoria",
  "3 reconhecimentos por mês (foto, PDF, áudio ou frase)",
];

const PAID_FEATURES = [
  "Fotos, PDFs e áudios sem limite",
  "Lança por foto, áudio ou frase — a gente identifica tudo, até parcela que já tava andando",
  "Salário e contas fixas, todo mês, sem repetir",
  "Metas, limites e resumo do mês prontos",
  "Um comentário sincero de como foi seu mês",
  "Aprende com suas correções — não erra de novo",
];

const FAQ = [
  {
    q: "Funciona no iPhone e no Android?",
    a: "Sim — o Tá Resolvido é um site que funciona direto no navegador do seu celular, sem precisar baixar nada de loja de aplicativo.",
  },
  {
    q: "Preciso escrever, mandar foto ou pode ser na mão mesmo?",
    a: "Você escolhe: manda foto, grava áudio, escreve numa frase, ou prefere preencher campo por campo do jeito tradicional. Todos os jeitos convivem — use o que for melhor pra cada momento.",
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
    <div className={`${caveat.variable} min-h-screen bg-brand-bg`}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-ink-solid">
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
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-10 pt-4 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pt-8">
        <div>
          <div className="inline-block rounded-full bg-brand-plum/14 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-brand-plum">
            Pra quem já tentou de tudo — e cansou de tentar
          </div>
          <h1 className="mt-5 text-balance font-display text-[34px] font-extrabold leading-[1.06] text-brand-ink sm:text-[44px]">
            Seu mês cabe numa foto.
          </h1>
          <p className="mt-[18px] max-w-[46ch] text-[18px] font-medium leading-relaxed text-brand-ink">
            Você não precisa de mais disciplina. Precisa de um jeito que funcione mesmo nos dias
            em que sobra zero tempo.
          </p>
          <p className="mt-2.5 max-w-[46ch] text-[15px] leading-relaxed text-brand-ink-soft">
            Manda o print do extrato, grava um áudio ou escreve numa frase — a gente organiza
            tudo. E se preferir o jeito tradicional, lançar na mão também dá.
          </p>
          <div className="mt-[30px] flex flex-col items-start gap-2.5">
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-2xl bg-brand-plum px-8 py-4 font-display text-[15.5px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(122,92,126,0.55)]"
            >
              Quero começar, de graça
              <ArrowRight size={16} />
            </Link>
            <span className="flex items-center gap-1.5 text-[12.5px] text-brand-ink-soft">
              <ShieldCheck size={13} />
              Sem cartão de crédito. Sem conectar no banco.
            </span>
          </div>
        </div>

        <div className="relative flex justify-center">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, rgb(var(--color-brand-plum) / 0.30), rgb(var(--color-brand-plum) / 0) 70%)",
            }}
          />
          <div
            className="relative z-10 w-[240px] rounded-[34px] bg-brand-ink-solid p-2.5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)]"
            style={{ transform: "rotate(-4deg)" }}
          >
            <div className="absolute left-1/2 top-2.5 h-[18px] w-[70px] -translate-x-1/2 rounded-b-xl bg-brand-ink-solid" />
            <div className="rounded-[25px] bg-brand-bg px-3 pb-[18px] pt-[30px]">
              <div className="mb-2.5 font-display text-[9px] font-bold uppercase tracking-wide text-brand-ink opacity-50">
                Tá Resolvido
              </div>
              <div className="mb-3.5 flex gap-1">
                {["Jul", "Ago", "Set", "Out", "Nov"].map((m) => (
                  <div
                    key={m}
                    className={
                      m === "Set"
                        ? "flex-1 rounded-full bg-brand-plum py-1.5 text-center font-display text-[9px] font-bold text-white"
                        : "flex-1 rounded-full bg-brand-card py-1.5 text-center font-display text-[9px] font-bold text-brand-ink-soft"
                    }
                  >
                    {m}
                  </div>
                ))}
              </div>
              <div className="mb-3.5 flex items-start gap-1.5">
                <span className="mt-1 h-[5px] w-[5px] flex-shrink-0 rounded-full bg-brand-sage" />
                <span className="text-[10.5px] font-bold leading-snug text-brand-ink">
                  Você gastou 12% menos que no mês passado
                </span>
              </div>
              <div className="mb-1.5 text-[10px] font-bold text-brand-ink">Régua do mês</div>
              <div className="rounded-2xl bg-brand-card px-2 pb-2.5 pt-[11px]">
                <div className="mb-1 text-[8.5px] font-bold text-brand-sage">↑ entrou</div>
                <div className="relative flex h-[46px] items-center justify-between">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-brand-line" />
                  {[
                    { d: 3, in: true, out: 8 },
                    { d: 6, in: false, out: 6 },
                    { d: 9, in: true, out: 0 },
                    { d: 14, in: false, out: 13, today: true },
                    { d: 18, in: false, out: 7 },
                    { d: 23, in: true, out: 9 },
                    { d: 27, in: false, out: 6 },
                  ].map((day) => (
                    <div key={day.d} className="relative z-10 flex w-[9%] flex-col items-center gap-[3px]">
                      <span
                        className="rounded-full bg-brand-sage"
                        style={{ width: 5, height: 5, visibility: day.in ? "visible" : "hidden" }}
                      />
                      <span
                        className={
                          day.today
                            ? "font-display text-[7px] font-extrabold text-brand-plum"
                            : "text-[7px] font-semibold text-brand-ink-soft"
                        }
                      >
                        {day.d}
                      </span>
                      <span
                        className="rounded-full"
                        style={{
                          width: day.out || 1,
                          height: day.out || 1,
                          background: day.today
                            ? "rgb(var(--color-brand-plum))"
                            : day.out
                              ? "rgb(var(--color-brand-coral))"
                              : "transparent",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mb-0 mt-1 text-right text-[8.5px] font-bold text-brand-coral">↓ saiu</div>
                <div className="mt-3 flex justify-between text-[9.5px] text-brand-ink-soft [font-variant-numeric:tabular-nums]">
                  <span>
                    Entrou <b className="font-display text-brand-ink">R$ 4.200</b>
                  </span>
                  <span>
                    Saiu <b className="font-display text-brand-ink">R$ 2.877</b>
                  </span>
                </div>
              </div>
              <div className="mt-3.5 rounded-xl bg-brand-plum py-2.5 text-center font-display text-[11px] font-bold text-white">
                + Marcar lançamento
              </div>
            </div>
          </div>

          <div className="absolute right-[-8%] top-[2%] z-20 max-w-[190px] rounded-2xl border border-brand-line bg-brand-card px-3.5 py-2.5 text-[12.5px] shadow-[0_16px_30px_-10px_rgba(0,0,0,0.28)]">
            <div className="flex items-center gap-2">
              <span className="flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center rounded-full bg-brand-sage">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 12.5L9 17.5L20 5"
                    stroke="#fff"
                    strokeWidth="3.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span>&quot;gastei 45 no mercado hoje&quot; → categorizado sozinho</span>
            </div>
          </div>
          <div className="absolute bottom-[6%] left-[-12%] z-20 max-w-[175px] rounded-2xl border border-brand-line bg-brand-card px-3.5 py-2.5 text-[12.5px] shadow-[0_16px_30px_-10px_rgba(0,0,0,0.28)]">
            <div className="flex items-center gap-2">
              <span className="text-[17px]">🧾</span>
              <span>Foto do extrato inteiro, lançado em segundos</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Mirror */}
      <section className="bg-brand-card px-5 py-16 sm:px-10 sm:py-[88px]">
        <div className="mx-auto max-w-6xl">
          <div className="inline-block rounded-full bg-brand-coral/14 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-brand-coral">
            Se algum desses parece familiar...
          </div>
          <h2 className="mt-4 text-balance font-display text-[28px] font-bold text-brand-ink">
            Você já tentou. Mais de uma vez.
          </h2>
          <div className="mt-9 grid gap-x-7 gap-y-3.5 sm:grid-cols-2">
            {MIRROR_ITEMS.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 border-b border-brand-line pb-3.5 text-[15.5px] leading-relaxed text-brand-ink"
              >
                <span className="relative mt-0.5 h-[21px] w-[21px] flex-shrink-0 rounded-md border-2 border-brand-coral">
                  <svg
                    className="absolute left-[3px] top-[3px]"
                    width="9"
                    height="7"
                    viewBox="0 0 9 7"
                    fill="none"
                  >
                    <path d="M1 3.5L3.2 5.7L8 1" stroke="rgb(var(--color-brand-coral))" strokeWidth="1.6" />
                  </svg>
                </span>
                {item}
              </div>
            ))}
          </div>
          <p className="mt-[34px] max-w-[56ch] text-[17px] font-semibold leading-relaxed text-brand-ink">
            Não é falta de força de vontade. É que ninguém fez um método que coubesse na sua vida
            de verdade — até agora.
          </p>
        </div>
      </section>

      {/* 3. Como funciona */}
      <section className="px-5 py-16 sm:px-10 sm:py-[88px]">
        <div className="mx-auto max-w-6xl">
          <div className="inline-block rounded-full bg-brand-sage/16 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-brand-sage">
            Como funciona, de verdade
          </div>
          <h2 className="mt-4 text-balance font-display text-[28px] font-bold text-brand-ink">
            Você manda. A gente organiza.
          </h2>
          <p className="mt-2.5 max-w-[52ch] text-[15.5px] leading-relaxed text-brand-ink-soft">
            Do jeito que você já manda mensagem pra qualquer pessoa — só que aqui, quem recebe
            organiza seu mês inteiro. Escolhe o jeito que for melhor pra cada momento.
          </p>

          <div className="mx-auto mt-10 grid max-w-[380px] gap-4 sm:max-w-none sm:grid-cols-3 sm:items-start">
            {/* Foto */}
            <div className="flex flex-col rounded-[24px] border border-brand-line bg-brand-card p-5">
              <div className="mb-4 flex items-center gap-1.5 font-display text-[13px] font-bold text-brand-plum">
                <Camera size={16} />
                Manda uma foto
              </div>
              <div className="overflow-hidden rounded-2xl border border-brand-line shadow-[0_14px_28px_-12px_rgba(26,26,26,0.35)]">
                <Image src="/venda-foto.png" alt="Extrato com 5 compras diferentes, cada uma reconhecida e categorizada certinha: mercado, contas, saúde, transporte e lazer" width={724} height={1890} className="w-full" />
              </div>
              <span className="mt-2.5 inline-flex items-center gap-1.5 self-start text-[10px] font-bold uppercase tracking-wide text-brand-sage">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-sage" />
                tela real do app
              </span>
            </div>

            {/* Frase */}
            <div className="flex flex-col rounded-[24px] border border-brand-line bg-brand-card p-5">
              <div className="mb-4 flex items-center gap-1.5 font-display text-[13px] font-bold text-brand-plum">
                <MessageCircle size={16} />
                Escreve numa frase
              </div>
              <div className="mb-2.5 max-w-[88%] self-end rounded-2xl rounded-tr-[4px] bg-brand-ink-solid px-3.5 py-2.5 text-[13.5px] font-semibold text-white">
                gastei 45 no mercado hoje
              </div>
              <div className="overflow-hidden rounded-2xl border border-brand-line shadow-[0_14px_28px_-12px_rgba(26,26,26,0.35)]">
                <Image src="/venda-frase.png" alt="Tela real do app mostrando a frase reconhecida e lançada como Mercado, R$ 45,00" width={724} height={308} className="w-full" />
              </div>
              <span className="mt-2.5 inline-flex items-center gap-1.5 self-start text-[10px] font-bold uppercase tracking-wide text-brand-sage">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-sage" />
                tela real do app
              </span>
            </div>

            {/* Áudio */}
            <div className="flex flex-col rounded-[24px] border border-brand-line bg-brand-card p-5">
              <div className="mb-4 flex items-center gap-1.5 font-display text-[13px] font-bold text-brand-plum">
                <Mic size={16} />
                Grava um áudio
              </div>
              <div className="flex flex-col gap-2.5">
                <div className="flex max-w-[88%] items-center gap-2 self-end rounded-2xl rounded-tr-[4px] bg-brand-ink-solid px-2.5 py-2 text-white">
                  <Mic size={13} />
                  <span className="flex h-[18px] items-center gap-[2px]">
                    {[6, 12, 8, 16, 9, 13, 7].map((h, i) => (
                      <span
                        key={i}
                        className="w-[2.5px] rounded-sm bg-white/75"
                        style={{ height: h }}
                      />
                    ))}
                  </span>
                  <span className="text-[11px] opacity-85">0:07</span>
                </div>
                <div className="max-w-[88%] rounded-2xl rounded-tl-[4px] border border-brand-line bg-brand-bg px-3.5 py-2.5 text-[13px] leading-snug text-brand-ink">
                  Ouvi: &quot;gastei 32 de Uber indo pro trabalho&quot;.
                  <div className="mt-1.5 flex justify-between border-t border-dashed border-brand-line pt-1 [font-variant-numeric:tabular-nums]">
                    <span>Transporte</span>
                    <span>R$ 32,00</span>
                  </div>
                  <span className="mt-2 inline-block rounded-full bg-brand-sage/16 px-1.5 py-0.5 text-[10px] font-bold text-brand-sage">
                    na régua do mês ✓
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-center text-[13.5px] text-brand-ink-soft">
            <PenLine size={15} />
            Prefere fazer na mão, do jeito mais tradicional? Também dá — sem perder nenhuma
            função.
          </div>
        </div>
      </section>

      {/* 4. Simples por fora, completo por dentro */}
      <section className="bg-brand-card px-5 py-16 sm:px-10 sm:py-[88px]">
        <div className="mx-auto max-w-6xl">
          <div className="inline-block rounded-full bg-brand-amber/22 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-[#8c6214] dark:text-brand-amber">
            O que ninguém vê
          </div>
          <h2 className="mt-4 text-balance font-display text-[28px] font-bold text-brand-ink">
            Simples por fora. Completo por dentro.
          </h2>

          <div className="mt-14">
            <div className="mx-auto w-[168px] text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-brand-plum shadow-[0_14px_26px_-10px_rgba(122,92,126,0.55)]">
                <Camera size={24} className="text-white" />
              </div>
              <div className="font-display text-[14.5px] font-bold leading-snug text-brand-ink">
                Uma foto, um áudio
                <br />
                ou uma frase
              </div>
            </div>

            <div className="mt-11 grid gap-4 sm:grid-cols-2">
              {HUB_SPOKES.map((spoke) => (
                <div key={spoke.name} className="rounded-[20px] border border-brand-line bg-brand-bg p-4">
                  <div className="mb-3 overflow-hidden rounded-2xl">
                    <Image src={spoke.src} alt={spoke.alt} width={spoke.width} height={spoke.height} className="w-full" />
                  </div>
                  <div className="text-center font-display text-[13.5px] font-bold leading-snug text-brand-ink">
                    {spoke.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mx-auto mt-8 max-w-[52ch] text-center text-[15.5px] font-semibold text-brand-ink-soft">
            Telas reais do app — <strong className="text-brand-ink">você não vê nada disso acontecer</strong>, só vê o resultado pronto.
          </p>
        </div>
      </section>

      {/* 5. Bilhete da fundadora */}
      <section className="px-5 py-[70px] sm:px-10">
        <div
          className="relative mx-auto max-w-[480px] rounded-[3px] px-8 py-[34px] pb-[30px] shadow-[0_22px_40px_-16px_rgba(26,26,26,0.4)]"
          style={{ background: "#FBF4D9", color: "#2b2410", transform: "rotate(-1.6deg)" }}
        >
          <div
            className="absolute -top-3.5 left-1/2 h-[26px] w-[70px] -translate-x-1/2 border border-[rgba(180,170,130,0.5)] bg-[rgba(200,190,150,0.55)]"
            style={{ transform: "translateX(-50%) rotate(-3deg)" }}
          />
          <p className="font-caveat text-[24px] leading-snug">
            &quot;Eu criei o Tá Resolvido pra mim primeiro. Sou mãe, trabalho fora, e não sobra
            tempo nem energia pra ficar lançando gasto por gasto todo santo dia.
          </p>
          <p className="mt-3.5 font-caveat text-[24px] leading-snug">
            Não é fórmula mágica. É o que funciona pra quem, como eu, não tem tempo sobrando.&quot;
          </p>
          <div className="mt-2 text-right font-caveat text-[22px] font-bold">— Mariana, fundadora</div>
        </div>
      </section>

      {/* 6. Pra quem é */}
      <section className="bg-brand-card px-5 py-16 sm:px-10 sm:py-[88px]">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-[560px] text-center">
            <div className="inline-block rounded-full bg-brand-plum/14 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-brand-plum">
              Pra ser sincera com você
            </div>
            <h2 className="mt-4 text-balance font-display text-[28px] font-bold text-brand-ink">
              Isso é pra você — ou não é.
            </h2>
          </div>
          <div className="mt-11 grid gap-5 sm:grid-cols-2">
            <div className="rounded-[24px] border-[1.5px] border-brand-sage/35 bg-brand-sage/10 p-7">
              <div className="mb-4 font-display text-[16.5px] font-bold text-brand-sage">É pra você se</div>
              <ul className="flex flex-col gap-1">
                {FIT_YES.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 py-1.5 text-[14.5px] leading-relaxed text-brand-ink">
                    <span className="mt-0.5 flex-shrink-0 text-brand-sage">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[24px] border-[1.5px] border-brand-line bg-brand-ink-soft/8 p-7">
              <div className="mb-4 font-display text-[16.5px] font-bold text-brand-ink-soft">Não é pra você se</div>
              <ul className="flex flex-col gap-1">
                {FIT_NO.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 py-1.5 text-[14.5px] leading-relaxed text-brand-ink">
                    <span className="mt-0.5 flex-shrink-0 text-brand-ink-soft">−</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Preço */}
      <section className="px-5 py-16 sm:px-10 sm:py-[88px]">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-[560px] text-center">
            <div className="inline-block rounded-full bg-brand-sage/14 px-3.5 py-1.5 text-[11.5px] font-bold uppercase tracking-wide text-brand-sage">
              Preço
            </div>
            <h2 className="mt-4 text-balance font-display text-[28px] font-bold text-brand-ink">
              Comece de graça. Evolua quando fizer sentido.
            </h2>
          </div>
          <div className="mx-auto mt-11 grid max-w-[760px] gap-4 sm:grid-cols-2">
            <div className="rounded-[26px] border border-brand-line bg-brand-bg p-7">
              <div className="font-display text-[15px] font-bold text-brand-ink opacity-75">Plano Grátis</div>
              <div className="my-1.5 font-display text-[34px] font-extrabold text-brand-ink">R$0</div>
              <ul className="mb-5 mt-5 flex flex-col gap-1.5">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13.5px] leading-relaxed text-brand-ink">
                    ✓&nbsp; {f}
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

            <div className="relative rounded-[26px] bg-brand-ink-solid p-7 text-white">
              <div className="absolute -top-[13px] right-6 rounded-full bg-brand-amber px-3.5 py-1.5 font-display text-[11.5px] font-bold text-[#2b2005]">
                Mais popular
              </div>
              <div className="font-display text-[15px] font-bold opacity-75">Plano Completo</div>
              <div className="my-1.5 font-display text-[34px] font-extrabold">
                R$24,90<span className="text-[15px] font-medium opacity-65">/mês</span>
              </div>
              <ul className="mb-5 mt-5 flex flex-col gap-1.5">
                {PAID_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13.5px] leading-relaxed">
                    ✓&nbsp; {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="flex w-full items-center justify-center rounded-2xl bg-white py-3.5 font-display text-[14.5px] font-semibold text-brand-ink-solid"
              >
                Quero o plano completo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Confiança */}
      <section className="bg-brand-bg px-5 py-16 sm:px-10 sm:py-[88px]">
        <div className="mx-auto grid max-w-4xl gap-6 text-center sm:grid-cols-3">
          <div>
            <div className="mx-auto mb-3.5 flex h-[46px] w-[46px] items-center justify-center rounded-2xl bg-brand-card">
              <ShieldCheck size={20} className="text-brand-plum" />
            </div>
            <h3 className="mb-1.5 font-display text-[15px] font-bold text-brand-ink">Sem conectar no banco</h3>
            <p className="text-[13.5px] leading-relaxed text-brand-ink-soft">
              Você manda o print quando quiser. A gente lê só o que está ali — a imagem não fica
              guardada depois.
            </p>
          </div>
          <div>
            <div className="mx-auto mb-3.5 flex h-[46px] w-[46px] items-center justify-center rounded-2xl bg-brand-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 12l2 2 4-4M12 3l7 3v5c0 4.8-3 8.9-7 10.3-4-1.4-7-5.5-7-10.3V6l7-3z"
                  stroke="rgb(var(--color-brand-sage))"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h3 className="mb-1.5 font-display text-[15px] font-bold text-brand-ink">7 dias de garantia</h3>
            <p className="text-[13.5px] leading-relaxed text-brand-ink-soft">
              Se não gostar, é só pedir. A gente devolve tudo, sem perguntas e sem letra miúda.
            </p>
          </div>
          <div>
            <div className="mx-auto mb-3.5 flex h-[46px] w-[46px] items-center justify-center rounded-2xl bg-brand-card">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 18L18 6M6 6l12 12"
                  stroke="rgb(var(--color-brand-coral))"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h3 className="mb-1.5 font-display text-[15px] font-bold text-brand-ink">Cancela quando quiser</h3>
            <p className="text-[13.5px] leading-relaxed text-brand-ink-soft">
              Direto no app, sem precisar ligar pra ninguém nem justificar nada.
            </p>
          </div>
        </div>
      </section>

      {/* 9. FAQ */}
      <section className="px-5 py-16 sm:px-10 sm:py-[88px]">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center font-display text-2xl font-bold text-brand-ink">
            Perguntas frequentes
          </h2>
          <div className="flex flex-col gap-2.5">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-[18px] border border-brand-line bg-brand-card px-5 py-4"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-[15px] font-bold text-brand-ink">
                  {item.q}
                  <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-full bg-brand-bg text-[15px] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[13.5px] leading-relaxed text-brand-ink-soft">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Dúvidas / Contato */}
      <section className="px-5 pb-16 text-center sm:px-10">
        <h2 className="mb-2.5 font-display text-2xl font-bold text-brand-ink">Ficou com alguma dúvida?</h2>
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

      {/* 10. CTA final */}
      <section className="px-5 pb-20 sm:px-10">
        <div className="mx-auto max-w-2xl rounded-[28px] bg-brand-ink-solid px-8 py-12 text-center">
          <h2 className="mx-auto max-w-sm text-balance font-display text-2xl font-bold text-white sm:text-[28px]">
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

      <footer className="flex flex-col items-center gap-3 px-5 pb-10 text-center text-[12.5px] text-brand-ink-soft sm:px-10">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          <Link href="/termos" className="underline underline-offset-2">
            Termos de Uso
          </Link>
          <Link href="/privacidade" className="underline underline-offset-2">
            Política de Privacidade
          </Link>
        </div>
        <div>Tá Resolvido — taresolvido.app</div>
      </footer>
    </div>
  );
}
