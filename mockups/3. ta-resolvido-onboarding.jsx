import { useState } from "react";
import { Ruler, PenLine, Camera, ArrowRight } from "lucide-react";

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

const SLIDES = [
  {
    icon: <Ruler size={40} color={TOKENS.ink} />,
    accent: TOKENS.amber,
    title: "Tá Resolvido",
    text: "O jeito simples de acompanhar o seu mês, sem planilha e sem complicação.",
    isIntro: true,
  },
  {
    icon: <Ruler size={40} color={TOKENS.ink} />,
    accent: TOKENS.sage,
    title: "Sua régua do mês",
    text: "Cada gasto vira uma marca na linha do mês. Olhe quando quiser — não precisa lançar todo dia.",
  },
  {
    icon: (
      <div style={{ display: "flex", gap: 10 }}>
        <PenLine size={34} color={TOKENS.ink} />
        <Camera size={34} color={TOKENS.ink} />
      </div>
    ),
    accent: TOKENS.coral,
    title: "Do seu jeito",
    text: "Digite o gasto na mão ou só tire uma foto do comprovante. A gente lê pra você.",
  },
];

function RulerPreview() {
  const dots = [
    { day: 4, color: TOKENS.sage },
    { day: 10, color: TOKENS.amber },
    { day: 16, color: TOKENS.coral },
    { day: 23, color: TOKENS.sage },
  ];
  return (
    <div style={{ position: "relative", width: 220, height: 34, margin: "0 auto" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 16,
          height: 2,
          background: TOKENS.line,
        }}
      />
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${(d.day / 30) * 100}%`,
            top: 10,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: d.color,
            transform: "translateX(-50%)",
          }}
        />
      ))}
    </div>
  );
}

export default function Onboarding() {
  useState(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: TOKENS.bg,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "28px 12px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: TOKENS.card,
          borderRadius: 28,
          padding: "40px 28px 28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          minHeight: 480,
        }}
      >
        {!slide.isIntro && (
          <button
            onClick={() => setStep(SLIDES.length - 1)}
            style={{
              alignSelf: "flex-end",
              border: "none",
              background: "none",
              color: TOKENS.inkSoft,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              marginBottom: -8,
            }}
          >
            Pular
          </button>
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 24,
              background: TOKENS.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
            }}
          >
            {slide.icon}
          </div>

          <div>
            <div
              style={{
                fontFamily: "'Baloo 2', sans-serif",
                fontWeight: 700,
                fontSize: 26,
                color: TOKENS.ink,
                marginBottom: 10,
              }}
            >
              {slide.title}
            </div>
            <div
              style={{
                fontSize: 14.5,
                color: TOKENS.inkSoft,
                lineHeight: 1.55,
                maxWidth: 260,
                margin: "0 auto",
              }}
            >
              {slide.text}
            </div>
          </div>

          {step === 1 && <RulerPreview />}
        </div>

        {/* Dots */}
        <div style={{ display: "flex", gap: 6, marginBottom: 22, marginTop: 18 }}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? 18 : 6,
                height: 6,
                borderRadius: 999,
                background: i === step ? TOKENS.ink : TOKENS.line,
                transition: "all 0.2s ease",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => (isLast ? null : setStep(step + 1))}
          style={{
            width: "100%",
            padding: "15px 0",
            borderRadius: 16,
            border: "none",
            background: TOKENS.ink,
            color: TOKENS.card,
            fontFamily: "'Baloo 2', sans-serif",
            fontWeight: 600,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
          }}
        >
          {isLast ? "Começar" : "Próximo"}
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
