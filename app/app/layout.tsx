import Link from "next/link";
import { Settings } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavLinks } from "./nav-links";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed, hide_goals_screen, accent_color")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  return (
    <div
      className="min-h-screen bg-brand-bg pb-24"
      style={{ "--accent": profile?.accent_color ?? "#D9A441" } as React.CSSProperties}
    >
      <header className="flex items-center justify-end gap-3 px-4 py-4">
        <Link href="/app/config" aria-label="Configurações" className="text-brand-ink-soft">
          <Settings size={22} />
        </Link>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-xs font-medium text-brand-ink-soft underline underline-offset-2"
          >
            Sair
          </button>
        </form>
      </header>
      <main>{children}</main>
      <NavLinks hideMetas={profile?.hide_goals_screen ?? false} />
    </div>
  );
}
