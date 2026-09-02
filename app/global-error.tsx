"use client";

import { useEffect } from "react";

/**
 * Rede de segurança pro caso raro de o próprio layout raiz falhar. Quando
 * isso acontece, o layout não renderiza — então esta tela precisa trazer o
 * próprio <html> e <body>, e não pode contar com as fontes nem com as classes
 * do Tailwind carregadas por ele. Daí o estilo escrito à mão, com as cores da
 * marca em valor fixo.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro no layout raiz:", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#EDE9DE",
          color: "#1F3A3D",
          fontFamily: "system-ui, -apple-system, Arial, sans-serif",
          padding: "20px",
        }}
      >
        <div style={{ maxWidth: "340px", textAlign: "center" }}>
          <h1 style={{ fontSize: "22px", margin: "0 0 12px", lineHeight: 1.25 }}>
            O app não conseguiu carregar.
          </h1>
          <p style={{ fontSize: "15px", lineHeight: 1.5, color: "#5B6E6C", margin: "0 0 24px" }}>
            Seus lançamentos estão salvos. Tenta de novo em instantes.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "16px",
              background: "#7A5C7B",
              color: "#FBFAF6",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}
