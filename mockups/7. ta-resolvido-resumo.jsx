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

const ICONS = {
  mercado: ShoppingCart,
  contas: Zap,
  streaming: Music,
  saude: Heart,
  presente: Gift,
  transporte: Fuel,
  lazer: UtensilsCrossed,
};

const GASTOS = [
  { day: 28, label: "Restaurante", cat: "lazer", value: 95 },
  { day: 22, label: "Combustível", cat: "transporte", value: 180 },
  { day: 18, label: "Presente", cat: "presente", value: 120 },
  { day: 15, label: "Farmácia", cat: "saude", value: 68 },
  { day: 12, label: "Streaming", cat: "streaming", value: 39 },
  { day: 7, label: "Conta de luz", cat: "contas", value: 210 },
  { day: 3, label: "Mercado", cat: "mercado", value: 145 },
];

function levelFor(value) {
  if (value <= 100) return "sage";
  if (value <= 180) return "amber";
  return "coral";
}

function currency(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Resumo() {
  useState(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  const total = GASTOS.reduce((sum, g) => sum + g.value, 0);

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
            Julho
          </div>
        </div>

        {/* Total */}
        <div
          style={{
            background: TOKENS.card,
            borderRadius: 20,
            padding: "18px 20px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: TOKENS.inkSoft }}>Total do mês</div>
            <div
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 700,
                fontSize: 26,
                color: TOKENS.ink,
              }}
            >
              {currency(total)}
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: TOKENS.inkSoft, textAlign: "right" }}>
            {GASTOS.length} gastos
            <br />
            marcados
          </div>
        </div>

        {/* List */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: TOKENS.ink,
            marginBottom: 8,
          }}
        >
          Tudo que foi marcado
        </div>

        <div
          style={{
            background: TOKENS.card,
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {GASTOS.map((g, i) => {
            const Icon = ICONS[g.cat] || ShoppingCart;
            const color = TOKENS[levelFor(g.value)];
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  borderTop: i === 0 ? "none" : `1px solid ${TOKENS.bg}`,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: TOKENS.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} color={TOKENS.ink} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 14.5,
                      fontWeight: 500,
                      color: TOKENS.ink,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {g.label}
                  </div>
                  <div style={{ fontSize: 12, color: TOKENS.inkSoft }}>Dia {g.day}</div>
                </div>
                <div
                  style={{
                    fontFamily: "'Baloo 2', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color,
                    flexShrink: 0,
                  }}
                >
                  {currency(g.value)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
