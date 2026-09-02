import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { toDateKey } from "@/lib/date";
import { isCompleto, recognitionAllowance } from "@/lib/plan";
import { EntryForm } from "./entry-form";
import { listCardsWithInvoices } from "./actions";

// As server actions dessa tela chamam o Gemini com foto/PDF. Sem isso a
// Vercel corta a função no limite padrão (bem menor que a análise precisa) e
// a usuária recebe um erro sem mensagem nenhuma, no meio do "Analisando...".
// O orçamento interno de lib/gemini.ts é menor que esse teto de propósito.
export const maxDuration = 60;

export default async function NovoLancamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; shared?: string; sharedText?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { error, shared, sharedText } = await searchParams;
  let sharedPhoto: { dataUrl: string; isPdf: boolean } | null = null;
  if (shared) {
    const { data: pending } = await supabase
      .from("pending_shares")
      .select("id, data_url, is_pdf")
      .eq("id", shared)
      .eq("user_id", user.id)
      .maybeSingle();
    if (pending) {
      sharedPhoto = { dataUrl: pending.data_url, isPdf: pending.is_pdf };
      await supabase.from("pending_shares").delete().eq("id", pending.id);
    }
  }

  // O perfil vem antes das outras consultas porque a janela de contagem dos
  // reconhecimentos depende da data de criação da conta: nos primeiros 30 dias
  // a cota é maior e conta desde o cadastro, não desde o dia 1º.
  const { data: profile } = await supabase
    .from("profiles")
    .select("separate_by_account, plan, experience_level, guide_active, created_at")
    .eq("id", user.id)
    .single();

  const allowance = recognitionAllowance(profile?.created_at);

  const [
    { data: categories },
    { data: salaryPatterns },
    { data: fixedExpenses },
    { count: recognitionsUsed },
    { count: entriesCount },
    cards,
  ] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, icon")
      .eq("user_id", user.id)
      .order("name", { ascending: true }),
    supabase.from("salary_patterns").select("description_pattern").eq("user_id", user.id),
    supabase.from("fixed_expenses").select("name, expected_amount").eq("user_id", user.id),
    supabase
      .from("photo_recognitions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", allowance.countFrom.toISOString()),
    supabase.from("entries").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    listCardsWithInvoices(),
  ]);

  const recognitionsRemaining = isCompleto(profile?.plan)
    ? null
    : Math.max(0, allowance.limit - (recognitionsUsed ?? 0));

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex items-center gap-2.5">
          <Link
            href="/app"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-card text-brand-ink"
          >
            <ChevronLeft size={18} />
          </Link>
          <div className="font-display text-xl font-bold text-brand-ink">Novo lançamento</div>
        </div>

        <EntryForm
          categories={categories ?? []}
          defaultDate={toDateKey(new Date())}
          hasError={error === "1"}
          separateByAccount={profile?.separate_by_account ?? false}
          salaryPatterns={(salaryPatterns ?? []).map((p) => p.description_pattern)}
          fixedExpenses={fixedExpenses ?? []}
          recognitionsRemaining={recognitionsRemaining}
          isCompleto={isCompleto(profile?.plan)}
          cards={cards}
          sharedPhoto={sharedPhoto}
          sharedText={sharedText}
          guideActive={profile?.guide_active ?? false}
          experienceLevel={profile?.experience_level ?? null}
          hasEntries={(entriesCount ?? 0) > 0}
        />
      </div>
    </div>
  );
}
