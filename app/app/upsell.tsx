import Link from "next/link";
import { Lock } from "lucide-react";

export function Upsell({ feature }: { feature: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[24px] bg-brand-card px-6 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-amber/15">
        <Lock size={20} className="text-brand-amber" />
      </div>
      <div className="font-display text-lg font-bold text-brand-ink">
        {feature} é do plano Completo
      </div>
      <p className="max-w-[240px] text-[13.5px] leading-snug text-brand-ink-soft">
        Assine o Completo pra desbloquear essa e outras funcionalidades.
      </p>
      <Link
        href="/app/planos"
        className="mt-1 rounded-2xl bg-brand-plum px-6 py-3 font-display text-[14px] font-semibold text-white"
      >
        Ver planos
      </Link>
    </div>
  );
}
