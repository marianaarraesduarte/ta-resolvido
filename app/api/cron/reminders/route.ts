import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend-email";
import { dayOfMonth } from "@/lib/date";
import { currency } from "@/lib/tokens";

const INTERVAL_DAYS: Record<number, number> = { 1: 30, 2: 15, 4: 7 };

type Profile = {
  id: string;
  reminder_frequency: number;
  last_reminder_sent_at: string | null;
  created_at: string;
};

function isDue(profile: Profile): boolean {
  const intervalDays = INTERVAL_DAYS[profile.reminder_frequency];
  if (!intervalDays) return false;

  const baseline = new Date(profile.last_reminder_sent_at ?? profile.created_at);
  const dueAt = new Date(baseline.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  return new Date() >= dueAt;
}

function reminderEmailHtml(lastEntry: { description: string; amount: number; entry_date: string } | null): string {
  const body = lastEntry
    ? `Já faz um tempo desde o seu último lançamento (dia ${dayOfMonth(lastEntry.entry_date)}). Foi &quot;${lastEntry.description}, ${currency(lastEntry.amount)}&quot; — continua a partir dali quando puder.`
    : "Assim que você marcar o primeiro gasto, a gente te ajuda a lembrar de onde parou no extrato.";

  return `
<div style="max-width:420px;margin:0 auto;padding:32px 24px;font-family:Arial,sans-serif;background:#FBFAF6;">
  <p style="margin:0 0 4px;font-size:12px;font-weight:bold;letter-spacing:0.05em;text-transform:uppercase;color:#1F3A3D;opacity:0.6;">Tá Resolvido</p>
  <h1 style="margin:0 0 20px;font-size:22px;color:#1F3A3D;">Continua de onde parou</h1>
  <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#1F3A3D;">${body}</p>
  <a href="https://taresolvido.app/app/novo" style="display:inline-block;background:#D9A441;color:#FBFAF6;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 28px;border-radius:14px;">
    Marcar lançamento
  </a>
  <p style="margin:28px 0 0;font-size:12.5px;line-height:1.5;color:#1F3A3D;opacity:0.6;">
    Pra mudar a frequência desse lembrete, entra em Configurações → Lembrete de lançamento no app.
  </p>
</div>`;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Sobras do "Compartilhar": no caminho normal, a tela de novo lançamento
  // busca a imagem e apaga na mesma hora. Quando a pessoa desiste no meio, a
  // linha ficava no banco pra sempre — e ela guarda o print do extrato inteiro
  // em base64. Apagar o que passou de um dia é o que torna verdadeira a
  // promessa da política de privacidade de que a imagem não fica guardada.
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: discardedShares } = await supabase
    .from("pending_shares")
    .delete({ count: "exact" })
    .lt("created_at", oneDayAgo);

  // Cancelamentos agendados: o plano segue "completo" até o fim do período já
  // pago (ver app/app/planos/actions.ts) e a virada acontece aqui, uma vez por
  // dia. Assim nenhuma tela precisou aprender uma regra nova de acesso — quem
  // lê `plan` continua lendo a verdade.
  const { count: downgraded } = await supabase
    .from("profiles")
    .update({ plan: "free", access_until: null }, { count: "exact" })
    .not("access_until", "is", null)
    .lte("access_until", new Date().toISOString());

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, reminder_frequency, last_reminder_sent_at, created_at")
    .gt("reminder_frequency", 0);

  if (error) {
    return NextResponse.json({ error: "Não deu pra buscar os perfis." }, { status: 500 });
  }

  const due = ((profiles as Profile[] | null) ?? []).filter(isDue);
  let sent = 0;

  for (const profile of due) {
    const [{ data: userData }, { data: lastEntry }] = await Promise.all([
      supabase.auth.admin.getUserById(profile.id),
      supabase
        .from("entries")
        .select("description, amount, entry_date")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const email = userData?.user?.email;
    if (!email) continue;

    try {
      await sendEmail({
        to: email,
        subject: "Um lembrete pra continuar de onde parou",
        html: reminderEmailHtml(lastEntry),
      });
      await supabase
        .from("profiles")
        .update({ last_reminder_sent_at: new Date().toISOString() })
        .eq("id", profile.id);
      sent += 1;
    } catch {
      // Segue pros próximos usuários mesmo se um envio falhar.
    }
  }

  return NextResponse.json({
    checked: due.length,
    sent,
    discardedShares: discardedShares ?? 0,
    downgraded: downgraded ?? 0,
  });
}
