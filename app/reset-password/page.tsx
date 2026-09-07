"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "rounded-xl border border-brand-line bg-brand-card px-4 py-3 text-brand-ink outline-none focus:border-brand-ink";

type PendingLink =
  | { kind: "tokens"; accessToken: string; refreshToken: string }
  | { kind: "code"; code: string }
  | { kind: "token_hash"; tokenHash: string }
  | { kind: "session-only" }
  | null;

// O link do e-mail de redefinição de senha pode chegar de formas diferentes
// dependendo de onde é aberto e de quem mexeu nele no caminho (o app de
// e-mail, um antivírus, um filtro de segurança corporativo). Muitos desses
// programas "clicam" no link sozinhos, antes da pessoa, só pra checar se é
// seguro — e como cada link só vale uma vez, isso já consome o link, e aí a
// pessoa clica de verdade e ele já não vale mais, mesmo sem ter passado nem
// um minuto. Por isso a gente não gasta o link assim que a página abre: só
// guarda o que veio nele e só usa de verdade quando a pessoa escreve a senha
// nova e aperta "Salvar" — um programa automático não faz isso.
function readPendingLink(): PendingLink {
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const accessToken = hash.get("access_token");
  const refreshToken = hash.get("refresh_token");
  if (accessToken && refreshToken) {
    return { kind: "tokens", accessToken, refreshToken };
  }

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (code) return { kind: "code", code };

  const tokenHash = params.get("token_hash");
  if (tokenHash) return { kind: "token_hash", tokenHash };

  return null;
}

export default function ResetPasswordPage() {
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [pending, setPending] = useState<PendingLink>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    // O Supabase já avisa aqui mesmo, sem a gente precisar tentar nada, quando
    // o link foi aberto por outra coisa antes da pessoa (o caso mais comum).
    if (params.get("error") || hash.get("error")) {
      setLinkInvalid(true);
      return;
    }

    const found = readPendingLink();
    if (found) {
      setPending(found);
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    // Sem nada na URL: só segue se já tiver uma sessão válida (ex: a pessoa
    // atualizou a página depois de já ter aberto o link corretamente).
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setPending({ kind: "session-only" });
      } else {
        setLinkInvalid(true);
      }
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("A senha precisa ter pelo menos 6 caracteres.");
      setStatus("error");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("As senhas não são iguais.");
      setStatus("error");
      return;
    }

    setStatus("saving");
    const supabase = createClient();

    if (pending && pending.kind !== "session-only") {
      let sessionError: { message?: string } | null = null;
      if (pending.kind === "tokens") {
        ({ error: sessionError } = await supabase.auth.setSession({
          access_token: pending.accessToken,
          refresh_token: pending.refreshToken,
        }));
      } else if (pending.kind === "code") {
        ({ error: sessionError } = await supabase.auth.exchangeCodeForSession(pending.code));
      } else {
        ({ error: sessionError } = await supabase.auth.verifyOtp({
          type: "recovery",
          token_hash: pending.tokenHash,
        }));
      }

      if (sessionError) {
        setLinkInvalid(true);
        setStatus("idle");
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setErrorMessage("Não deu pra salvar a senha agora. Tenta de novo.");
      setStatus("error");
    } else {
      setStatus("done");
    }
  }

  if (linkInvalid) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-bg px-4">
        <div className="w-full max-w-sm rounded-2xl bg-brand-card p-8 shadow-sm">
          <h1 className="mb-1 font-display text-2xl font-bold text-brand-ink">
            Link expirado ou já usado
          </h1>
          <p className="mb-6 text-sm text-brand-ink-soft">
            Esse link de redefinição de senha não é mais válido — cada link só funciona uma vez.
            Pede um novo na tela de login.
          </p>
          <a
            href="/login"
            className="block rounded-xl bg-brand-ink-solid px-4 py-3 text-center font-display font-semibold text-white"
          >
            Voltar pro login
          </a>
        </div>
      </main>
    );
  }

  if (!pending) return null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-sm rounded-2xl bg-brand-card p-8 shadow-sm">
        <h1 className="mb-1 font-display text-2xl font-bold text-brand-ink">Nova senha</h1>
        <p className="mb-6 text-sm text-brand-ink-soft">Escolhe uma senha nova pra sua conta.</p>

        {status === "done" ? (
          <div>
            <p className="mb-4 text-sm text-brand-ink">Senha alterada! Já pode entrar com ela.</p>
            <a
              href="/app"
              className="block rounded-xl bg-brand-ink-solid px-4 py-3 text-center font-display font-semibold text-white"
            >
              Ir pro app
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="text-sm font-medium text-brand-ink" htmlFor="password">
              Senha nova
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Pelo menos 6 caracteres"
              className={inputClass}
            />
            <label className="text-sm font-medium text-brand-ink" htmlFor="confirm">
              Confirma a senha
            </label>
            <input
              id="confirm"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={status === "saving"}
              className="mt-2 rounded-xl bg-brand-ink-solid px-4 py-3 font-display font-semibold text-white disabled:opacity-60"
            >
              {status === "saving" ? "Salvando..." : "Salvar senha"}
            </button>
            {status === "error" && <p className="text-sm text-brand-coral">{errorMessage}</p>}
          </form>
        )}
      </div>
    </main>
  );
}
