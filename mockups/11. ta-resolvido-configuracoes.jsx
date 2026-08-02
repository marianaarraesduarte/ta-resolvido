import { useState } from "react";
import { ChevronLeft, Check } from "lucide-react";

const TOKENS_BASE = {
  bg: "#EDE9DE",
  card: "#FBFAF6",
  ink: "#1F3A3D",
  inkSoft: "#5B6E6C",
  line: "#D9D3C4",
};

const CORES = [
  { key: "amber", label: "Âmbar", hex: "#D9A441" },
  { key: "sage", label: "Verde-oliva", hex: "#6F8F6A" },
  { key: "coral", label: "Terracota", hex: "#C1553D" },
  { key: "azul", label: "Azul-petróleo", hex: "#3E6E8E" },
  { key: "roxo", label: "Ameixa", hex: "#7A5C7E" },
];

function Toggle({ on, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 44, height: 26, borderRadius: 999, border: "none", cursor: "pointer",
        background: on ? TOKENS_BASE.ink : TOKENS_BASE.line, position: "relative", flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 20, height: 20, borderRadius: "50%", background: "#fff",
          position: "absolute", top: 3, left: on ? 21 : 3, transition: "left 0.15s ease",
        }}
      />
    </button>
  );
}

export default function Configuracoes() {
  useState(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  const [separarContas, setSepararContas] = useState(false);
  const [corSelecionada, setCorSelecionada] = useState("amber");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: TOKENS_BASE.bg,
        display: "flex",
        justifyContent: "center",
        padding: "28px 12px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 12, background: TOKENS_BASE.card,
              display: "flex", alignItems: "center", justifyContent: "center", color: TOKENS_BASE.ink,
            }}
          >
            <ChevronLeft size={18} />
          </div>
          <div style={{ fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 20, color: TOKENS_BASE.ink }}>
            Configurações
          </div>
        </div>

        {/* Separar por conta */}
        <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS_BASE.ink, marginBottom: 8 }}>
          Contas e bancos
        </div>
        <div
          style={{
            background: TOKENS_BASE.card, borderRadius: 18, padding: "16px 18px",
            display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8,
          }}
        >
          <div style={{ paddingRight: 16 }}>
            <div style={{ fontSize: 14.5, fontWeight: 500, color: TOKENS_BASE.ink }}>
              Separar gastos por conta
            </div>
            <div style={{ fontSize: 12, color: TOKENS_BASE.inkSoft, marginTop: 3, lineHeight: 1.45 }}>
              {separarContas
                ? "Cada gasto vai pedir qual conta/banco é a origem."
                : "Tudo fica unificado numa régua só, sem distinguir banco."}
            </div>
          </div>
          <Toggle on={separarContas} onClick={() => setSepararContas((v) => !v)} />
        </div>

        {separarContas && (
          <div
            style={{
              background: TOKENS_BASE.card, borderRadius: 18, padding: "14px 16px", marginBottom: 24,
              fontSize: 12.5, color: TOKENS_BASE.inkSoft,
            }}
          >
            Suas contas: <b style={{ color: TOKENS_BASE.ink }}>Nubank, Itaú</b> — toque pra
            adicionar outra
          </div>
        )}
        {!separarContas && <div style={{ marginBottom: 24 }} />}

        {/* Cor de destaque */}
        <div style={{ fontSize: 13, fontWeight: 600, color: TOKENS_BASE.ink, marginBottom: 8 }}>
          Cor de destaque
        </div>
        <div style={{ fontSize: 12, color: TOKENS_BASE.inkSoft, marginBottom: 14, lineHeight: 1.5 }}>
          Muda a cor de "hoje" na régua e dos detalhes do app. O resto do visual continua
          igual, pra manter tudo fácil de ler.
        </div>
        <div style={{ background: TOKENS_BASE.card, borderRadius: 18, padding: "16px 18px" }}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {CORES.map((c) => {
              const isSelected = corSelecionada === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setCorSelecionada(c.key)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    border: "none", background: "none", cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 40, height: 40, borderRadius: "50%", background: c.hex,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: isSelected ? `2.5px solid ${TOKENS_BASE.ink}` : "2.5px solid transparent",
                      boxShadow: isSelected ? "none" : "0 0 0 1px rgba(0,0,0,0.05)",
                    }}
                  >
                    {isSelected && <Check size={16} color="#fff" />}
                  </div>
                  <span style={{ fontSize: 10.5, color: TOKENS_BASE.inkSoft }}>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
