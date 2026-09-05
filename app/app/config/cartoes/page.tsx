import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CartoesBody } from "./cartoes-body";

export default async function CartoesConfigPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("cards")
    .select("id, name, color, due_day, closing_day")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  const cards = (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    color: c.color,
    dueDay: c.due_day,
    closingDay: c.closing_day,
  }));

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <div className="mb-5 flex items-center gap-2.5">
          <Link
            href="/app/config"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
          >
            <ChevronLeft size={18} />
          </Link>
          <div className="font-display text-xl font-bold text-brand-ink">Meus cartões</div>
        </div>

        <p className="mb-5 text-[13.5px] leading-snug text-brand-ink-soft">
          Cadastre o cartão com o dia de vencimento (e o de fechamento, se souber) — depois, ao
          lançar uma compra no crédito, é só escolher o cartão que o app já acha a fatura certa
          sozinho.
        </p>

        <CartoesBody cards={cards} />
      </div>
    </div>
  );
}
