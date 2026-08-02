import { useState } from "react";
import { Plus, Camera, Pencil, X, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

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

const MONTH = "Julho";
const TODAY = 28;
const DAYS_IN_MONTH = 31;
const DAY_WIDTH = 22;

const DESPESAS = {
  3: { label: "Mercado", value: 145 },
  7: { label: "Conta de luz", value: 210 },
  12: { label: "Streaming", value: 39 },
  15: { label: "Farmácia", value: 68 },
  18: { label: "Presente", value: 120 },
  22: { label: "Combustível", value: 180 },
  28: { label: "Restaurante", value: 95 },
};

const RECEITAS = {
  1: { label: "Salário", value: 4500, tipo: "salario" },
  15: { label: "Freela", value: 800, tipo: "outra" },
};

function levelFor(value) {
  if (value <= 100) return "sage";
  if (value <= 180) return "amber";
  return "coral";
}

function currency(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function TaResolvidoRuler() {
  useState(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  const [selected, setSelected] = useState({ day: TODAY, tipo: "despesa" });
  const [addOpen, setAddOpen] = useState(false);

  const gastoSoFar = Object.entries(DESPESAS)
    .filter(([day]) => Number(day) <= TODAY)
    .reduce((sum, [, e]) => sum + e.value, 0);
  const receitaSoFar = Object.entries(RECEITAS)
    .filter(([day]) => Number(day) <= TODAY)
    .reduce((sum, [, e]) => sum + e.value, 0);

  const selectedEntry =
    selected.tipo === "despesa" ? DESPESAS[selected.day] : RECEITAS[selected.day];

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
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 1,
              color: TOKENS.ink,
              opacity: 0.55,
              textTransform: "uppercase",
            }}
          >
            Tá Resolvido
          </div>
          <div
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 700,
              fontSize: 30,
              color: TOKENS.ink,
              marginTop: 2,
            }}
          >
            {MONTH}
          </div>
        </div>

        {/* Summary cards: receita e despesa lado a lado */}
        <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
          <div style={{ flex: 1, background: TOKENS.card, borderRadius: 18, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <ArrowUpCircle size={13} color={TOKENS.sage} />
              <span style={{ fontSize: 11.5, color: TOKENS.inkSoft }}>Entrou</span>
            </div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 20, color: TOKENS.ink }}>
              {currency(receitaSoFar)}
            </div>
          </div>
          <div style={{ flex: 1, background: TOKENS.card, borderRadius: 18, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
              <ArrowDownCircle size={13} color={TOKENS.coral} />
              <span style={{ fontSize: 11.5, color: TOKENS.inkSoft }}>Saiu</span>
            </div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 20, color: TOKENS.ink }}>
              {currency(gastoSoFar)}
            </div>
          </div>
        </div>

        {/* Ruler */}
        <div style={{ marginBottom: 6, fontSize: 13, fontWeight: 600, color: TOKENS.ink }}>
          Régua do mês
        </div>
        <div
          style={{
            background: TOKENS.card,
            borderRadius: 20,
            padding: "14px 14px",
            marginBottom: 16,
            overflowX: "auto",
          }}
        >
          <div style={{ fontSize: 10, color: TOKENS.sage, fontWeight: 600, marginBottom: 2 }}>↑ entrou</div>
          <div
            style={{
              position: "relative",
              minWidth: DAYS_IN_MONTH * DAY_WIDTH,
              height: 130,
            }}
          >
            {/* baseline */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 65,
                height: 2,
                background: TOKENS.line,
              }}
            />
            {Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1).map((day) => {
              const despesa = DESPESAS[day];
              const receita = RECEITAS[day];
              const isToday = day === TODAY;
              const isSelectedDespesa = selected.day === day && selected.tipo === "despesa";
              const isSelectedReceita = selected.day === day && selected.tipo === "receita";
              const dotColor = despesa ? TOKENS[levelFor(despesa.value)] : null;

              return (
                <div
                  key={day}
                  style={{
                    position: "absolute",
                    left: (day - 1) * DAY_WIDTH,
                    top: 0,
                    width: DAY_WIDTH,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  {/* receita acima da linha */}
                  <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    {receita && (
                      <div
                        onClick={() => setSelected({ day, tipo: "receita" })}
                        style={{
                          width: isSelectedReceita ? 13 : 10,
                          height: isSelectedReceita ? 13 : 10,
                          borderRadius: "50%",
                          background: TOKENS.sage,
                          border: isSelectedReceita ? `2px solid ${TOKENS.ink}` : "none",
                          marginBottom: 6,
                          cursor: "pointer",
                        }}
                      />
                    )}
                  </div>
                  {/* tick + número */}
                  <div
                    style={{
                      width: 1,
                      height: isToday ? 14 : 8,
                      background: isToday ? TOKENS.ink : TOKENS.line,
                    }}
                  />
                  <div
                    style={{
                      fontSize: 10,
                      color: isToday ? TOKENS.ink : TOKENS.inkSoft,
                      fontWeight: isToday ? 700 : 400,
                      marginTop: 3,
                    }}
                  >
                    {day}
                  </div>
                  {/* despesa abaixo da linha */}
                  <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", marginTop: 4 }}>
                    {despesa && (
                      <div
                        onClick={() => setSelected({ day, tipo: "despesa" })}
                        style={{
                          width: isSelectedDespesa ? 13 : 10,
                          height: isSelectedDespesa ? 13 : 10,
                          borderRadius: "50%",
                          background: dotColor,
                          border: isSelectedDespesa ? `2px solid ${TOKENS.ink}` : "none",
                          cursor: "pointer",
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 10, color: TOKENS.coral, fontWeight: 600, marginTop: 2 }}>↓ saiu</div>
        </div>

        {/* Selected day detail */}
        {selectedEntry && (
          <div
            style={{
              background: TOKENS.card,
              borderRadius: 16,
              padding: "14px 16px",
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: TOKENS.inkSoft }}>
                Dia {selected.day} · {selected.tipo === "receita" ? "entrada" : "saída"}
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: TOKENS.ink }}>
                {selectedEntry.label}
              </div>
            </div>
            <div
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 700,
                fontSize: 18,
                color: selected.tipo === "receita" ? TOKENS.sage : TOKENS[levelFor(selectedEntry.value)],
              }}
            >
              {selected.tipo === "receita" ? "+" : "-"}
              {currency(selectedEntry.value)}
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
          {[
            ["sage", "entrada / gasto leve"],
            ["amber", "gasto médio"],
            ["coral", "gasto alto"],
          ].map(([key, label]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: TOKENS[key] }} />
              <span style={{ fontSize: 11.5, color: TOKENS.inkSoft }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Add button */}
        <div style={{ position: "relative" }}>
          {addOpen && (
            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 10,
                justifyContent: "flex-end",
              }}
            >
              <button style={chipStyle(TOKENS)}>
                <Pencil size={14} /> Manual
              </button>
              <button style={chipStyle(TOKENS)}>
                <Camera size={14} /> Foto
              </button>
            </div>
          )}
          <button
            onClick={() => setAddOpen((v) => !v)}
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: "14px 0",
              borderRadius: 16,
              border: "none",
              background: TOKENS.ink,
              color: "#FBFAF6",
              fontFamily: "'Baloo 2', sans-serif",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            {addOpen ? <X size={16} /> : <Plus size={16} />}
            {addOpen ? "Fechar" : "Marcar lançamento"}
          </button>
        </div>
      </div>
    </div>
  );
}

function chipStyle(TOKENS) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "8px 14px",
    borderRadius: 999,
    border: `1px solid ${TOKENS.line}`,
    background: TOKENS.card,
    color: TOKENS.ink,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  };
}
