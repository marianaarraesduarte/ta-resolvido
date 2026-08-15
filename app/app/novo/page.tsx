import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { toDateKey } from "@/lib/date";
import { EntryForm } from "./entry-form";

export default async function NovoLancamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: categories }, { data: profile }, { data: salaryPatterns }, { data: fixedExpenses }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name", { ascending: true }),
      supabase.from("profiles").select("separate_by_account").eq("id", user.id).single(),
      supabase.from("salary_patterns").select("description_pattern").eq("user_id", user.id),
      supabase.from("fixed_expenses").select("name, expected_amount").eq("user_id", user.id),
    ]);

  const { error } = await searchParams;

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
        />
      </div>
    </div>
  );
}
