import { useState } from "react";
import { ChevronLeft, Bell, Check } from "lucide-react";

const TOKENS = {
  bg: "#EDE9DE",
  card: "#FBFAF6",
  ink: "#1F3A3D",
  inkSoft: "#5B6E6C",
  amber: "#D9A441",
  sage: "#6F8F6A",
  line: "#D9D3C4",
};

const OPCOES = [
  { key: 1, label: "1x por mês", desc: "Um lembrete no fim do mês" },
  { key: 2, label: "2x por mês", desc: "A cada 15 dias, aproximadamente" },
  { key: 4, label: "4x por mês", desc: "Toda semana" },
  { key: 0, label: "Não quero lembretes", desc: "Eu mando o print quando lembrar" },
];

export default function ConfigLembrete() {
  useState(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  const [selected, setSelected] = useState(2);

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
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
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
            Lembrete do print
          </div>
        </div>

        <div
          style={{
            fontSize: 13.5,
            color: TOKENS.inkSoft,
            lineHeight: 1.55,
            marginBottom: 20,
          }}
        >
          Com que frequência você quer que a gente te lembre de mandar o print do extrato?
        </div>

        {/* Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 26 }}>
          {OPCOES.map((op) => {
            const isSelected = selected === op.key;
            return (
              <button
                key={op.key}
                onClick={() => setSelected(op.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 18px",
                  borderRadius: 18,
                  border: `1.5px solid ${isSelected ? TOKENS.ink : "transparent"}`,
                  background: TOKENS.card,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: TOKENS.ink }}>
                    {op.label}
                  </div>
                  <div style={{ fontSize: 12, color: TOKENS.inkSoft, marginTop: 2 }}>
                    {op.desc}
                  </div>
                </div>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: isSelected ? TOKENS.sage : TOKENS.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {isSelected && <Check size={14} color="#fff" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Preview of the reminder */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: TOKENS.ink,
            marginBottom: 8,
          }}
        >
          Assim vai chegar o lembrete
        </div>
        <div
          style={{
            background: TOKENS.card,
            borderRadius: 18,
            padding: "16px 18px",
            display: "flex",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: TOKENS.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Bell size={18} color={TOKENS.amber} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: TOKENS.ink }}>
              Tá Resolvido
            </div>
            <div style={{ fontSize: 13, color: TOKENS.inkSoft, marginTop: 2, lineHeight: 1.45 }}>
              Já faz um tempo desde o último print (dia 15). Seu último gasto marcado foi
              "Farmácia, R$ 68" — continua a partir dali quando puder.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
