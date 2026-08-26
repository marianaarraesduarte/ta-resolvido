import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_SHARE_SIZE = 8 * 1024 * 1024; // 8mb, mesmo limite usado pra PDF no upload manual

/**
 * Recebe o que o sistema operacional manda quando a pessoa aperta
 * "Compartilhar" em outro app (ex: um print no WhatsApp) e escolhe o Tá
 * Resolvido — registrado como Web Share Target no manifest. Guarda a
 * imagem/PDF numa tabela de curta duração e manda pra tela de novo
 * lançamento, que busca e já joga na revisão por foto.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }

  const formData = await request.formData();
  const file = formData.get("files");
  const text = formData.get("text");

  if (!(file instanceof File) || file.size === 0) {
    // Só texto compartilhado (sem imagem) — manda pro chat de lançamento.
    if (typeof text === "string" && text.trim()) {
      const url = new URL("/app/novo", request.url);
      url.searchParams.set("sharedText", text.trim().slice(0, 2000));
      return NextResponse.redirect(url, 303);
    }
    return NextResponse.redirect(new URL("/app/novo", request.url), 303);
  }

  if (file.size > MAX_SHARE_SIZE) {
    const url = new URL("/app/novo", request.url);
    url.searchParams.set("error", "1");
    return NextResponse.redirect(url, 303);
  }

  const isPdf = file.type === "application/pdf";
  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

  const { data: pending, error } = await supabase
    .from("pending_shares")
    .insert({ user_id: user.id, data_url: dataUrl, is_pdf: isPdf })
    .select("id")
    .single();

  const url = new URL("/app/novo", request.url);
  if (!error && pending) {
    url.searchParams.set("shared", pending.id);
  }
  return NextResponse.redirect(url, 303);
}
