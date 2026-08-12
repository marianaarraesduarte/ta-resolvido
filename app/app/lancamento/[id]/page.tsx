import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditEntryForm } from "./edit-entry-form";

export default async function EditEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: entry }, { data: categories }, { data: profile }] = await Promise.all([
    supabase
      .from("entries")
      .select(
        "id, type, amount, description, entry_date, category_id, income_type, account_name, card_invoice_id",
      )
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase.from("categories").select("id, name").eq("user_id", user.id).order("name"),
    supabase.from("profiles").select("separate_by_account").eq("id", user.id).single(),
  ]);

  if (!entry) notFound();

  return (
    <div className="flex justify-center px-3 py-7">
      <div className="w-full max-w-sm">
        <EditEntryForm
          entry={entry}
          categories={categories ?? []}
          separateByAccount={profile?.separate_by_account ?? false}
        />
      </div>
    </div>
  );
}
