import Link from "next/link";
import { Bell, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { currency } from "@/lib/tokens";
import { dayOfMonth } from "@/lib/date";
import { LembreteBody } from "./lembrete-body";

export default async function LembretePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: lastEntry }] = await Promise.all([
    supabase.from("profiles").select("reminder_frequency").eq("id", user.id).single(),
    supabase
      .from("entries")
      .select("description, amount, entry_date")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

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
          <div className="font-display text-xl font-bold text-brand-ink">Lembrete do print</div>
        </div>

        <div className="mb-5 rounded-xl bg-brand-coral/10 px-3.5 py-2.5">
          <p className="text-[12px] font-medium leading-snug text-brand-coral">
            Versão beta: essa preferência já fica salva, mas o envio automático do lembrete por
            e-mail ainda não está ativo. Em breve a gente liga de vez.
          </p>
        </div>

        <p className="mb-5 text-[13.5px] leading-snug text-brand-ink-soft">
          Com que frequência você quer que a gente te lembre de mandar o print do extrato?
        </p>

        <LembreteBody initialFrequency={profile?.reminder_frequency ?? 0} />

        <div className="mb-2 text-[13px] font-semibold text-brand-ink">
          Assim vai chegar o lembrete
        </div>
        <div className="flex gap-3 rounded-2xl bg-brand-card px-[18px] py-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-bg">
            <Bell size={18} className="text-brand-amber" />
          </div>
          <div>
            <div className="text-sm font-semibold text-brand-ink">Tá Resolvido</div>
            <div className="mt-0.5 text-[13px] leading-snug text-brand-ink-soft">
              {lastEntry
                ? `Já faz um tempo desde o seu último lançamento (dia ${dayOfMonth(lastEntry.entry_date)}). Foi "${lastEntry.description}, ${currency(lastEntry.amount)}" — continua a partir dali quando puder.`
                : "Assim que você marcar o primeiro gasto, a gente te ajuda a lembrar de onde parou no extrato."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
