import { useState } from "react";
import { Plus, Camera, Pencil, X } from "lucide-react";

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

function Chip({ icon, label }) {
  return (
    <button
      style={{
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
      }}
    >
      {icon}
      {label}
    </button>
  );
}

export default function ReguaVazia() {
  useState(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  const [addOpen, setAddOpen] = useState(false);

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

        {/* Friendly empty message, in place of the summary card */}
        <div
          style={{
            background: TOKENS.card,
            borderRadius: 20,
            padding: "20px 20px",
            marginBottom: 22,
          }}
        >
          <div
            style={{
              fontSize: 15.5,
              color: TOKENS.ink,
              lineHeight: 1.5,
              fontWeight: 500,
            }}
          >
            Mês novinho em folha.
          </div>
          <div
            style={{
              fontSize: 13.5,
              color: TOKENS.inkSoft,
              lineHeight: 1.55,
              marginTop: 6,
            }}
          >
            Marque o primeiro gasto quando aparecer.
          </div>
        </div>

        {/* Ruler (empty) */}
        <div
          style={{
            marginBottom: 6,
            fontSize: 13,
            fontWeight: 600,
            color: TOKENS.ink,
          }}
        >
          Régua do mês
        </div>
        <div
          style={{
            background: TOKENS.card,
            borderRadius: 20,
            padding: "18px 14px 14px",
            marginBottom: 28,
            overflowX: "auto",
          }}
        >
          <div
            style={{
              position: "relative",
              minWidth: DAYS_IN_MONTH * DAY_WIDTH,
              height: 76,
            }}
          >
            {/* baseline */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 26,
                height: 2,
                background: TOKENS.line,
              }}
            />
            {Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1).map((day) => {
              const isToday = day === TODAY;
              return (
                <div
                  key={day}
                  style={{
                    position: "absolute",
                    left: (day - 1) * DAY_WIDTH,
                    top: 0,
                    width: DAY_WIDTH,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div style={{ height: 24 }} />
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
                  {isToday && (
                    <div
                      style={{
                        fontSize: 8.5,
                        color: TOKENS.amber,
                        fontWeight: 700,
                        marginTop: 1,
                        whiteSpace: "nowrap",
                      }}
                    >
                      HOJE
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Add button, framed as an invitation rather than a task */}
        <div>
          {addOpen && (
            <div style={{ display: "flex", gap: 10, marginBottom: 10, justifyContent: "flex-end" }}>
              <Chip icon={<Pencil size={14} />} label="Manual" />
              <Chip icon={<Camera size={14} />} label="Foto" />
            </div>
          )}
          <button
            onClick={() => setAddOpen((v) => !v)}
            style={{
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
            {addOpen ? "Fechar" : "Marcar gasto"}
          </button>
        </div>
      </div>
    </div>
  );
}
