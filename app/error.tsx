"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Tela de erro do app. Sem ela, uma falha não prevista mostrava o texto
 * padrão do Next.js — "Application error: a server-side exception has
 * occurred" — em inglês, sem a marca e sem saída nenhuma. Num app de
 * dinheiro isso assusta: a pessoa não sabe se perdeu os lançamentos dela.
 *
 * Por isso o texto diz, antes de tudo, que nada foi perdido. É verdade: os
 * lançamentos ficam no banco, e o que falhou foi a tela.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro não tratado na tela:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-5">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display text-2xl font-bold text-brand-ink">
          Alguma coisa travou aqui do nosso lado.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-brand-ink-soft">
          Seus lançamentos estão salvos — não se perdeu nada. Foi só esta tela que não
          carregou.
        </p>

        <div className="mt-7 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={reset}
            className="rounded-2xl bg-brand-plum py-3.5 font-display text-[14.5px] font-semibold text-white"
          >
            Tentar de novo
          </button>
          <Link
            href="/app"
            className="rounded-2xl border border-brand-line py-3.5 font-display text-[14.5px] font-semibold text-brand-ink"
          >
            Voltar pro meu mês
          </Link>
        </div>

        <p className="mt-6 text-[12.5px] text-brand-ink-soft">
          Se continuar acontecendo, escreve pra{" "}
          <a
            href="mailto:contato@taresolvido.app"
            className="underline underline-offset-2"
          >
            contato@taresolvido.app
          </a>
          {error.digest && (
            <>
              {" "}
              e manda este código: <span className="font-medium">{error.digest}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
