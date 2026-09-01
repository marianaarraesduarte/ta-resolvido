import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { currency } from "@/lib/tokens";

// Único lugar do app pensado só pra administradora — lista os alertas de
// "isso ficou estranho" de todo mundo, pra saber quando algo deu errado sem
// precisar que a pessoa mande mensagem contando.
const ADMIN_EMAIL = "marianaarraesduarte@gmail.com";

type AnomalyRow = {
  id: string;
  user_id: string;
  kind: string;
  description: string;
  amount: number;
  reference_amount: number;
  user_flagged: boolean;
  created_at: string;
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/app");
  }

  const admin = createAdminClient();

  const [{ data: flagsData }, { data: usersPage }] = await Promise.all([
    admin
      .from("anomaly_flags")
      .select("id, user_id, kind, description, amount, reference_amount, user_flagged, created_at")
      .order("created_at", { ascending: false })
      .limit(100),
    admin.auth.admin.listUsers(),
  ]);

  const rows = (flagsData as AnomalyRow[] | null) ?? [];
  const emailById = new Map((usersPage?.users ?? []).map((u) => [u.id, u.email ?? u.id]));

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-lg">
        <div className="mb-1 font-display text-xl font-bold text-brand-ink">
          Alertas de gasto estranho
        </div>
        <p className="mb-5 text-[13px] text-brand-ink-soft">
          Toda vez que o app avisa alguém que uma fatura ficou bem acima da média, cai aqui.
        </p>

        {rows.length === 0 ? (
          <div className="rounded-2xl bg-brand-card p-5 text-[14px] text-brand-ink-soft">
            Nada por aqui ainda.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {rows.map((r) => (
              <div key={r.id} className="rounded-2xl bg-brand-card px-4 py-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[13px] font-semibold text-brand-ink">
                    {emailById.get(r.user_id) ?? r.user_id}
                  </span>
                  {r.user_flagged && (
                    <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-brand-coral/15 px-2 py-0.5 text-[10.5px] font-bold text-brand-coral">
                      <AlertTriangle size={10} />
                      MARCOU
                    </span>
                  )}
                </div>
                <div className="mt-1.5 text-[13px] leading-snug text-brand-ink">{r.description}</div>
                <div className="mt-1 text-[12px] text-brand-ink-soft">
                  {currency(r.amount)} vs. média {currency(r.reference_amount)} ·{" "}
                  {new Date(r.created_at).toLocaleString("pt-BR")}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
