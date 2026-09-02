import Link from "next/link";
import { ChevronLeft, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CancelButton } from "./cancel-button";

const FREE_FEATURES = [
  "Lançamento manual de gastos e receitas",
  "Régua do mês",
  "Quanto gastei",
  "Categorias",
  "3 fotos/PDFs reconhecidos por mês",
];

const PAID_FEATURES = [
  "Fotos/PDFs sem limite (extrato e fatura)",
  "Reconhecimento automático de salário e gastos fixos recorrentes",
  "Comentário do mês — um resumo simples de como foi, sem gráfico complicado",
  "Metas de investimento e reservas planejadas",
  "Limites por categoria com alerta",
  "Lembrete configurável de lançamento",
];

export default async function PlanosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan ?? "free";

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-2.5">
          <Link
            href="/app/mais"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
          >
            <ChevronLeft size={18} />
          </Link>
          <div className="font-display text-xl font-bold text-brand-ink">Seu plano</div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-[26px] bg-brand-card p-7">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-display text-[15px] font-bold text-brand-ink">
                Plano Grátis
              </span>
              {plan === "free" && (
                <span className="rounded-full bg-brand-sage/15 px-2.5 py-1 text-[10.5px] font-bold text-brand-sage">
                  SEU PLANO
                </span>
              )}
            </div>
            <div className="mb-5 font-display text-3xl font-bold text-brand-ink">R$0</div>
            <ul className="flex flex-col gap-2.5">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13.5px] text-brand-ink-soft">
                  <Check size={15} className="mt-0.5 flex-shrink-0 text-brand-sage" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[26px] bg-brand-ink-solid p-7">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-display text-[15px] font-bold text-white">
                Plano Completo
              </span>
              {plan === "completo" && (
                <span className="rounded-full bg-brand-sage/20 px-2.5 py-1 text-[10.5px] font-bold text-brand-sage">
                  SEU PLANO
                </span>
              )}
            </div>
            <div className="mb-1 font-display text-3xl font-bold text-white">
              R$29,90<span className="text-[15px] font-medium text-white/70">/mês</span>
            </div>
            <div className="mb-5 text-[12.5px] text-white/70">Tudo do plano grátis, mais:</div>
            <ul className="mb-6 flex flex-col gap-2.5">
              {PAID_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-[13.5px] text-white/85">
                  <Check size={15} className="mt-0.5 flex-shrink-0" style={{ color: "#D9A441" }} />
                  {f}
                </li>
              ))}
            </ul>
            {plan !== "completo" && (
              <a
                href="https://pay.hotmart.com/S107243172M"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-2xl bg-brand-plum py-3.5 font-display text-[14.5px] font-semibold text-white"
              >
                Assinar o Plano Completo
              </a>
            )}
            {plan === "completo" && <CancelButton />}
          </div>
        </div>

        {/* No lugar do antigo banner de "preço fundador": ele prometia R$19,90
            nos 3 primeiros meses, mas o checkout cobrava o preço cheio e não
            havia cupom nenhum pra aplicar — a pessoa só descobria na hora de
            pagar. Aqui ficam só promessas que a gente cumpre de verdade. */}
        {plan !== "completo" && (
          <div className="mt-4 rounded-2xl bg-brand-card px-5 py-4 text-center">
            <div className="text-[12.5px] leading-relaxed text-brand-ink-soft">
              7 dias de garantia — se não gostar, devolvemos tudo. E você cancela quando quiser,
              aqui mesmo, sem precisar justificar nada.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
