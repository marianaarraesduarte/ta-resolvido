import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CategoriasBody } from "./categorias-body";

export default async function CategoriasConfigPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("categories")
    .select("id, name, icon")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

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
          <div className="font-display text-xl font-bold text-brand-ink">Categorias</div>
        </div>

        <p className="mb-5 text-[13.5px] leading-snug text-brand-ink-soft">
          Renomeie, crie ou apague categorias. Gastos já marcados numa categoria apagada ficam sem
          categoria, mas continuam contando no seu mês.
        </p>

        <CategoriasBody categories={data ?? []} />
      </div>
    </div>
  );
}
