import { useState } from "react";
import { ChevronLeft, ShoppingCart, Zap, Music, Heart, Gift, Fuel, UtensilsCrossed } from "lucide-react";

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
  { key: "mercado", label: "Mercado", icon: ShoppingCart, value: 145 },
  { key: "contas", label: "Contas", icon: Zap, value: 210 },
  { key: "transporte", label: "Transporte", icon: Fuel, value: 180 },
  { key: "presente", label: "Presentes", icon: Gift, value: 120 },
  { key: "lazer", label: "Lazer", icon: UtensilsCrossed, value: 95 },
  { key: "saude", label: "Saúde", icon: Heart, value: 68 },
  { key: "streaming", label: "Streaming", icon: Music, value: 39 },
];

function currency(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Categorias() {
  useState(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  const total = CATEGORIAS.reduce((sum, c) => sum + c.value, 0);
  const ordenadas = [...CATEGORIAS].sort((a, b) => b.value - a.value);
  const maior = ordenadas[0].value;

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
              fontSize: 22,
              color: TOKENS.ink,
            }}
          >
            Onde foi
          </div>
        </div>

        {/* List with inline bars — no chart, just proportion per row */}
        <div
          style={{
            background: TOKENS.card,
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {ordenadas.map((c, i) => {
            const Icon = c.icon;
            const pct = Math.round((c.value / total) * 100);
            const barPct = Math.round((c.value / maior) * 100);
            return (
              <div
                key={c.key}
                style={{
                  padding: "14px 16px",
                  borderTop: i === 0 ? "none" : `1px solid ${TOKENS.bg}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
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
                    <div
                      style={{
                        fontFamily: "'Baloo 2', sans-serif",
                        fontWeight: 700,
                        fontSize: 15,
                        color: TOKENS.ink,
                      }}
                    >
                      {currency(c.value)}
                    </div>
                    <div style={{ fontSize: 11, color: TOKENS.inkSoft }}>{pct}% do mês</div>
                  </div>
                </div>
                <div
                  style={{
                    height: 6,
                    borderRadius: 999,
                    background: TOKENS.bg,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${barPct}%`,
                      borderRadius: 999,
                      background: TOKENS.ink,
                      opacity: 0.75,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 4px 0",
          }}
        >
          <span style={{ fontSize: 13, color: TOKENS.inkSoft }}>Total do mês</span>
          <span
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              color: TOKENS.ink,
            }}
          >
            {currency(total)}
          </span>
        </div>
      </div>
    </div>
  );
}
