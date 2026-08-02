import { createClient } from "@/lib/supabase/server";
import { daysInMonth, monthLabel, toDateKey } from "@/lib/date";
import { MonthRuler, type Entry } from "./month-ruler";

export default async function AppHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const { data: entries } = await supabase
    .from("entries")
    .select("id, type, amount, description, entry_date, category_id, income_type")
    .eq("user_id", user.id)
    .gte("entry_date", toDateKey(firstDay))
    .lte("entry_date", toDateKey(lastDay))
    .order("entry_date", { ascending: true });

  return (
    <MonthRuler
      monthName={monthLabel(today)}
      today={today.getDate()}
      daysInMonth={daysInMonth(today)}
      entries={(entries as Entry[]) ?? []}
    />
  );
}
