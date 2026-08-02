import { useState } from "react";
import { ChevronLeft, Plus, EyeOff, Car, Plane, Minus } from "lucide-react";

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

const RECEITAS_LANCADAS = [
  { label: "Salário", value: 4500, tipo: "salario" },
  { label: "Freela", value: 800, tipo: "outra" },
];

const RESERVAS = [
  { key: "ipva", label: "IPVA 2027", icon: Car, guardado: 850, meta: 1800 },
  { key: "viagem", label: "Viagem dezembro", icon: Plane, guardado: 1200, meta: 4000 },
];

function currency(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function MetasReservas() {
  useState(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  const [baseCalculo, setBaseCalculo] = useState("toda"); // toda | salario
  const receita = RECEITAS_LANCADAS
    .filter((r) => baseCalculo === "toda" || r.tipo === "salario")
    .reduce((s, r) => s + r.value, 0);

  const [metas, setMetas] = useState([
    { key: "liberdade", label: "Liberdade financeira", pct: 50, cor: TOKENS.sage },
    { key: "longo", label: "Longo prazo", pct: 30, cor: TOKENS.amber },
    { key: "curto", label: "Curto prazo", pct: 20, cor: TOKENS.coral },
  ]);

  const totalPct = metas.reduce((s, m) => s + m.pct, 0);

  function ajustarPct(key, delta) {
    setMetas((prev) =>
      prev.map((m) => (m.key === key ? { ...m, pct: Math.max(0, Math.min(100, m.pct + delta)) } : m))
    );
  }

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36, height: 36, borderRadius: 12, background: TOKENS.card,
                display: "flex", alignItems: "center", justifyContent: "center", color: TOKENS.ink,
              }}
            >
              <ChevronLeft size={18} />
            </div>
            <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 20, color: TOKENS.ink }}>
              Metas e reservas
            </div>
          </div>
          <button
            style={{
              display: "flex", alignItems: "center", gap: 5, border: "none", background: "none",
              color: TOKENS.inkSoft, fontSize: 12, cursor: "pointer",
            }}
          >
            <EyeOff size={13} /> ocultar tela
          </button>
        </div>

        {/* Receita do mês */}
        <div style={{ background: TOKENS.card, borderRadius: 18, padding: "14px 18px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, color: TOKENS.inkSoft }}>
            Receita do mês
            <div style={{ fontSize: 11, color: TOKENS.inkSoft, opacity: 0.8 }}>
              {baseCalculo === "toda" ? "toda renda lançada" : "só salário"}
            </div>
          </div>
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 18, color: TOKENS.ink }}>
            {currency(receita)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[
            { key: "toda", label: "Toda renda" },
            { key: "salario", label: "Só salário" },
          ].map((b) => (
            <button
              key={b.key}
              onClick={() => setBaseCalculo(b.key)}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 999,
                border: `1px solid ${baseCalculo === b.key ? TOKENS.ink : TOKENS.line}`,
                background: baseCalculo === b.key ? TOKENS.ink : TOKENS.card,
                color: baseCalculo === b.key ? TOKENS.card : TOKENS.inkSoft,
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Metas de investimento */}
        <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink, marginBottom: 8 }}>
          Metas de investimento
        </div>
        <div style={{ background: TOKENS.card, borderRadius: 20, padding: "18px 18px", marginBottom: 8 }}>
          {metas.map((m, i) => (
            <div key={m.key} style={{ marginBottom: i === metas.length - 1 ? 0 : 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: TOKENS.ink }}>{m.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => ajustarPct(m.key, -5)} style={pctBtnStyle}>
                    <Minus size={12} />
                  </button>
                  <span style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 15, color: TOKENS.ink, width: 34, textAlign: "center" }}>
                    {m.pct}%
                  </span>
                  <button onClick={() => ajustarPct(m.key, 5)} style={pctBtnStyle}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>
              <div style={{ height: 8, borderRadius: 999, background: TOKENS.bg, overflow: "hidden", marginBottom: 5 }}>
                <div style={{ height: "100%", width: `${m.pct}%`, borderRadius: 999, background: m.cor }} />
              </div>
              <div style={{ fontSize: 12, color: TOKENS.inkSoft, textAlign: "right" }}>
                = {currency((receita * m.pct) / 100)} / mês
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11.5, textAlign: "center", marginBottom: 24, color: TOKENS.inkSoft }}>
          No total, você está investindo <b style={{ color: TOKENS.ink }}>{totalPct}%</b> da
          sua receita ({currency((receita * totalPct) / 100)}/mês)
        </div>

        {/* Reservas planejadas */}
        <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink, marginBottom: 8 }}>
          Reservas planejadas
        </div>
        <div style={{ fontSize: 12, color: TOKENS.inkSoft, marginBottom: 12, lineHeight: 1.5 }}>
          Dinheiro guardado aos poucos pra um gasto grande que já sabe que vai ter — tipo
          IPVA, seguro ou uma viagem.
        </div>

        <div style={{ background: TOKENS.card, borderRadius: 20, overflow: "hidden", marginBottom: 14 }}>
          {RESERVAS.map((r, i) => {
            const Icon = r.icon;
            const pct = Math.round((r.guardado / r.meta) * 100);
            return (
              <div key={r.key} style={{ padding: "14px 16px", borderTop: i === 0 ? "none" : `1px solid ${TOKENS.bg}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: 10, background: TOKENS.bg,
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}
                  >
                    <Icon size={14} color={TOKENS.ink} />
                  </div>
                  <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: TOKENS.ink }}>{r.label}</div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS.ink }}>
                      {currency(r.guardado)} <span style={{ color: TOKENS.inkSoft, fontWeight: 400 }}>de {currency(r.meta)}</span>
                    </div>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: TOKENS.bg, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: TOKENS.sage }} />
                </div>
              </div>
            );
          })}
        </div>

        <button
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%",
            padding: "13px 0", borderRadius: 16, border: `1.5px dashed ${TOKENS.line}`, background: "none",
            color: TOKENS.inkSoft, fontFamily: "'Baloo 2', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}
        >
          <Plus size={15} /> Nova reserva
        </button>
      </div>
    </div>
  );
}

const pctBtnStyle = {
  width: 22, height: 22, borderRadius: "50%", border: `1px solid ${TOKENS.line}`,
  background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: TOKENS.ink, padding: 0,
};
