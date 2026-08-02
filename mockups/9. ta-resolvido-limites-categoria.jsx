import { useState } from "react";
import { ChevronLeft, ShoppingCart, Zap, Fuel, UtensilsCrossed, Bell, Check } from "lucide-react";

const TOKENS = {
  bg: "#EDE9DE",
  card: "#FBFAF6",
  ink: "#1F3A3D",
  inkSoft: "#5B6E6C",
  amber: "#D9A441",
  coral: "#C1553D",
  sage: "#6F8F6A",
  line: "#D9D3C4",
};

const CATEGORIAS = [
  { key: "mercado", label: "Mercado", icon: ShoppingCart, gasto: 2140, limite: 2000 },
  { key: "contas", label: "Contas", icon: Zap, gasto: 480, limite: 600 },
  { key: "transporte", label: "Transporte", icon: Fuel, gasto: 210, limite: 300 },
  { key: "lazer", label: "Lazer", icon: UtensilsCrossed, gasto: 95, limite: null },
];

function currency(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function LimitesCategoria() {
  useState(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: TOKENS.bg,
        display: "flex",
        justifyContent: "center",
        padding: "28px 12px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: TOKENS.card,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: TOKENS.ink,
            }}
          >
            <ChevronLeft size={18} />
          </div>
          <div
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: TOKENS.ink,
            }}
          >
            Limites por categoria
          </div>
        </div>

        <div style={{ fontSize: 13.5, color: TOKENS.inkSoft, lineHeight: 1.55, marginBottom: 22 }}>
          Defina quanto você não quer passar em cada categoria. A gente avisa quando
          chegar perto ou ultrapassar.
        </div>

        {/* Alert banner for the category that's over */}
        <div
          style={{
            display: "flex",
            gap: 12,
            background: TOKENS.coral,
            borderRadius: 16,
            padding: "14px 16px",
            marginBottom: 20,
          }}
        >
          <Bell size={18} color="#fff" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 13, color: "#fff", lineHeight: 1.5 }}>
            Você passou do limite de <b>Mercado</b>. Já foi {currency(2140)} de{" "}
            {currency(2000)} combinados.
          </div>
        </div>

        {/* Category list with limit bars */}
        <div style={{ background: TOKENS.card, borderRadius: 20, overflow: "hidden" }}>
          {CATEGORIAS.map((c, i) => {
            const Icon = c.icon;
            const hasLimite = c.limite != null;
            const pct = hasLimite ? Math.min(100, Math.round((c.gasto / c.limite) * 100)) : 0;
            const over = hasLimite && c.gasto > c.limite;
            const barColor = over ? TOKENS.coral : pct > 75 ? TOKENS.amber : TOKENS.sage;

            return (
              <div
                key={c.key}
                style={{
                  padding: "16px 16px",
                  borderTop: i === 0 ? "none" : `1px solid ${TOKENS.bg}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 11,
                      background: TOKENS.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={15} color={TOKENS.ink} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 500, color: TOKENS.ink }}>
                      {c.label}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: over ? TOKENS.coral : TOKENS.ink }}>
                      {currency(c.gasto)}
                    </div>
                    <div style={{ fontSize: 11, color: TOKENS.inkSoft }}>
                      {hasLimite ? `de ${currency(c.limite)}` : "sem limite definido"}
                    </div>
                  </div>
                </div>

                {hasLimite ? (
                  <div style={{ height: 6, borderRadius: 999, background: TOKENS.bg, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        borderRadius: 999,
                        background: barColor,
                      }}
                    />
                  </div>
                ) : (
                  <button
                    style={{
                      fontSize: 12.5,
                      color: TOKENS.inkSoft,
                      background: "none",
                      border: `1px dashed ${TOKENS.line}`,
                      borderRadius: 10,
                      padding: "8px 12px",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    + Definir limite mensal
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
