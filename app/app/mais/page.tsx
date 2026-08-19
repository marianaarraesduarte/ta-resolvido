import Link from "next/link";
import { Bell, ChevronRight, Gauge, Lock, Sparkles, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function MaisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, hide_goals_screen")
    .eq("id", user.id)
    .single();

  const isFree = (profile?.plan ?? "free") !== "completo";

  const items = [
    {
      href: "/app/limites",
      label: "Quanto posso gastar",
      desc: "Defina quanto gastar por categoria",
      icon: Gauge,
      locked: isFree,
    },
    !profile?.hide_goals_screen && {
      href: "/app/metas",
      label: "Guardando dinheiro",
      desc: "Investimentos e dinheiro guardado",
      icon: Target,
      locked: isFree,
    },
    {
      href: "/app/insights",
      label: "Comentário do mês",
      desc: "Um resumo simples do seu mês",
      icon: Sparkles,
      locked: isFree,
    },
    {
      href: "/app/config/lembrete",
      label: "Lembrete do print",
      desc: "Configure a frequência do aviso",
      icon: Bell,
      locked: isFree,
    },
  ].filter(Boolean) as {
    href: string;
    label: string;
    desc: string;
    icon: typeof Gauge;
    locked: boolean;
  }[];

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <div className="mb-5 font-display text-xl font-bold text-brand-ink">Mais</div>

        <div className="mb-3.5 overflow-hidden rounded-2xl bg-brand-card">
          {items.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                i === 0
                  ? "flex items-center gap-3 px-4 py-4"
                  : "flex items-center gap-3 border-t border-brand-bg px-4 py-4"
              }
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-bg">
                <item.icon size={18} className="text-brand-ink" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="truncate text-[14.5px] font-medium text-brand-ink">
                    {item.label}
                  </div>
                  {item.locked && (
                    <span className="flex flex-shrink-0 items-center gap-0.5 rounded-full bg-brand-amber/15 px-1.5 py-[1.5px] text-[9.5px] font-bold text-brand-amber">
                      <Lock size={8} />
                      COMPLETO
                    </span>
                  )}
                </div>
                <div className="truncate text-xs text-brand-ink-soft">{item.desc}</div>
              </div>
              <ChevronRight size={16} className="flex-shrink-0 text-brand-ink-soft" />
            </Link>
          ))}
        </div>

        <Link
          href="/app/planos"
          className="flex items-center justify-between rounded-2xl bg-brand-plum px-[18px] py-4"
        >
          <div className="text-[14.5px] font-semibold text-white">Ver planos</div>
          <ChevronRight size={16} className="text-white" />
        </Link>
      </div>
    </div>
  );
}
