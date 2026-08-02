import { useState } from "react";
import { Pencil, Camera, ChevronLeft, Check, ImagePlus, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

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

const CATEGORIAS_DESPESA = [
  { key: "mercado", label: "Mercado" },
  { key: "contas", label: "Contas" },
  { key: "lazer", label: "Lazer" },
  { key: "transporte", label: "Transporte" },
  { key: "saude", label: "Saúde" },
  { key: "outros", label: "Outros" },
];

function Tab({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "12px 0",
        borderRadius: 14,
        border: "none",
        background: active ? TOKENS.ink : "transparent",
        color: active ? TOKENS.card : TOKENS.inkSoft,
        fontFamily: "'Baloo 2', sans-serif",
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12.5, color: TOKENS.inkSoft, marginBottom: 6, fontWeight: 500 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: 14,
  border: `1px solid ${TOKENS.line}`,
  background: "#fff",
  color: TOKENS.ink,
  fontSize: 15,
  fontFamily: "'Inter', sans-serif",
  boxSizing: "border-box",
  outline: "none",
};

export default function NovoLancamento() {
  useState(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700&family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);

  const [tipo, setTipo] = useState("despesa"); // despesa | receita
  const [mode, setMode] = useState("manual");
  const [value, setValue] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("mercado");
  const [tipoReceita, setTipoReceita] = useState("salario");
  const [photoAdded, setPhotoAdded] = useState(false);
  const [salarioMarcado, setSalarioMarcado] = useState(null);

  const itensExtrato = [
    { label: "Salário", value: 4500, tipo: "receita" },
    { label: "Mercado São João", value: 89.9, tipo: "despesa" },
    { label: "Uber", value: 24.5, tipo: "despesa" },
    { label: "Farmácia", value: 42.0, tipo: "despesa" },
  ];

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
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
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
            Novo lançamento
          </div>
        </div>

        {/* Manual / Foto */}
        <div
          style={{
            display: "flex",
            gap: 6,
            background: TOKENS.card,
            borderRadius: 16,
            padding: 6,
            marginBottom: 14,
          }}
        >
          <Tab
            active={mode === "manual"}
            onClick={() => setMode("manual")}
            icon={<Pencil size={15} />}
            label="Manual"
          />
          <Tab
            active={mode === "foto"}
            onClick={() => setMode("foto")}
            icon={<Camera size={15} />}
            label="Foto"
          />
        </div>

        {mode === "manual" && (
          <div
            style={{
              display: "flex",
              gap: 6,
              background: TOKENS.card,
              borderRadius: 16,
              padding: 6,
              marginBottom: 20,
            }}
          >
            <Tab
              active={tipo === "despesa"}
              onClick={() => setTipo("despesa")}
              icon={<ArrowDownCircle size={15} />}
              label="Saiu (despesa)"
            />
            <Tab
              active={tipo === "receita"}
              onClick={() => setTipo("receita")}
              icon={<ArrowUpCircle size={15} />}
              label="Entrou (receita)"
            />
          </div>
        )}

        {mode === "manual" ? (
          <div style={{ background: TOKENS.card, borderRadius: 20, padding: 18 }}>
            <Field label="Valor">
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: TOKENS.inkSoft,
                    fontSize: 15,
                  }}
                >
                  R$
                </span>
                <input
                  value={value}
                  onChange={(e) => setValue(e.target.value.replace(/[^0-9.,]/g, ""))}
                  placeholder="0,00"
                  inputMode="decimal"
                  style={{ ...inputStyle, paddingLeft: 38 }}
                />
              </div>
            </Field>

            <Field label="Descrição">
              <input
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={tipo === "receita" ? "Ex.: Salário de julho" : "Ex.: Mercado do mês"}
                style={inputStyle}
              />
            </Field>

            {tipo === "despesa" ? (
              <Field label="Categoria">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {CATEGORIAS_DESPESA.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setCategory(c.key)}
                      style={{
                        padding: "8px 13px",
                        borderRadius: 999,
                        border: `1px solid ${category === c.key ? TOKENS.ink : TOKENS.line}`,
                        background: category === c.key ? TOKENS.ink : "#fff",
                        color: category === c.key ? TOKENS.card : TOKENS.inkSoft,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </Field>
            ) : (
              <Field label="Tipo de renda">
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { key: "salario", label: "Salário" },
                    { key: "outra", label: "Outra renda" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTipoReceita(t.key)}
                      style={{
                        flex: 1,
                        padding: "10px 0",
                        borderRadius: 999,
                        border: `1px solid ${tipoReceita === t.key ? TOKENS.ink : TOKENS.line}`,
                        background: tipoReceita === t.key ? TOKENS.ink : "#fff",
                        color: tipoReceita === t.key ? TOKENS.card : TOKENS.inkSoft,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, marginTop: 8, lineHeight: 1.45 }}>
                  Usado pra calcular suas metas de investimento com base só no salário, se
                  você preferir isso lá nas configurações.
                </div>
              </Field>
            )}

            <Field label="Data">
              <input type="date" defaultValue="2026-07-28" style={inputStyle} />
            </Field>
          </div>
        ) : (
          <div style={{ background: TOKENS.card, borderRadius: 20, padding: 18 }}>
            <div
              style={{
                fontSize: 13,
                color: TOKENS.inkSoft,
                marginBottom: 14,
                lineHeight: 1.5,
              }}
            >
              Tire uma foto do comprovante ou print do extrato inteiro — a gente separa
              cada gasto e cada entrada de dinheiro pra você.
            </div>

            {!photoAdded ? (
              <button
                onClick={() => setPhotoAdded(true)}
                style={{
                  width: "100%",
                  padding: "34px 0",
                  borderRadius: 16,
                  border: `2px dashed ${TOKENS.line}`,
                  background: "#fff",
                  color: TOKENS.inkSoft,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                }}
              >
                <ImagePlus size={26} color={TOKENS.ink} />
                <span style={{ fontSize: 13.5, fontWeight: 500 }}>
                  Toque para tirar foto ou escolher da galeria
                </span>
              </button>
            ) : (
              <div>
                <div
                  style={{
                    width: "100%",
                    height: 110,
                    borderRadius: 14,
                    background: "#fff",
                    border: `1px solid ${TOKENS.line}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: TOKENS.inkSoft,
                    fontSize: 12.5,
                    marginBottom: 14,
                  }}
                >
                  (pré-visualização da imagem)
                </div>
                <div style={{ fontSize: 12, color: TOKENS.inkSoft, marginBottom: 8 }}>
                  4 itens identificados nesse print — separamos entradas e saídas sozinhos
                </div>
                {itensExtrato.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 4px",
                      borderTop: `1px solid ${TOKENS.line}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {item.tipo === "receita" ? (
                        <ArrowUpCircle size={14} color={TOKENS.sage} />
                      ) : (
                        <ArrowDownCircle size={14} color={TOKENS.coral} />
                      )}
                      <div>
                        <div style={{ fontSize: 13.5, color: TOKENS.ink, fontWeight: 500 }}>
                          {item.label}
                        </div>
                        {item.tipo === "receita" && (
                          <button
                            onClick={() =>
                              setSalarioMarcado(salarioMarcado === i ? null : i)
                            }
                            style={{
                              border: "none",
                              background: "none",
                              padding: 0,
                              marginTop: 2,
                              fontSize: 11,
                              fontWeight: 600,
                              color: salarioMarcado === i ? TOKENS.sage : TOKENS.inkSoft,
                              cursor: "pointer",
                            }}
                          >
                            {salarioMarcado === i ? "✓ marcado como salário" : "marcar como salário"}
                          </button>
                        )}
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: "'Baloo 2', sans-serif",
                        fontWeight: 700,
                        fontSize: 15,
                        color: item.tipo === "receita" ? TOKENS.sage : TOKENS.ink,
                      }}
                    >
                      {item.tipo === "receita" ? "+" : "-"}
                      {item.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                ))}
                {salarioMarcado !== null && (
                  <div style={{ fontSize: 11, color: TOKENS.sage, marginTop: 8, lineHeight: 1.45 }}>
                    Combinado — vamos reconhecer esse padrão como salário nos próximos
                    extratos automaticamente.
                  </div>
                )}
                <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, marginTop: 8 }}>
                  Confira se está tudo certo antes de salvar
                </div>
              </div>
            )}
          </div>
        )}

        {/* Save */}
        <button
          style={{
            width: "100%",
            padding: "15px 0",
            borderRadius: 16,
            border: "none",
            marginTop: 20,
            background: TOKENS.sage,
            color: "#fff",
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
          <Check size={17} />
          Salvar
        </button>
      </div>
    </div>
  );
}
