import { Check, Lightbulb, Minus, PiggyBank, Sparkles, ShoppingBag, TrendingDown, TrendingUp } from "lucide-react";
import { currency, TOKENS } from "@/lib/tokens";
import type { MonthlyInsightSections } from "@/lib/monthly-insight";

function Msg({
  icon,
  color,
  eyebrow,
  children,
  warm,
}: {
  icon: React.ReactNode;
  color: string;
  eyebrow: string;
  children: React.ReactNode;
  warm?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div
        className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-white"
        style={{ background: color }}
      >
        {icon}
      </div>
      <div
        className="min-w-0 flex-1 rounded-tl-[4px] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl p-3.5"
        style={{ background: warm ? `color-mix(in srgb, ${color} 18%, ${TOKENS.card})` : TOKENS.card }}
      >
        <div
          className="mb-1 text-[10.5px] font-bold uppercase tracking-wide"
          style={{ color }}
        >
          {eyebrow}
        </div>
        {children}
      </div>
    </div>
  );
}

function Chip({ label, tone }: { label: string; tone: "coral" | "sage" | "amber" }) {
  const bg =
    tone === "coral"
      ? `color-mix(in srgb, ${TOKENS.coral} 16%, ${TOKENS.card})`
      : tone === "sage"
        ? `color-mix(in srgb, ${TOKENS.sage} 16%, ${TOKENS.card})`
        : `color-mix(in srgb, ${TOKENS.amber} 26%, ${TOKENS.card})`;
  const color = tone === "coral" ? TOKENS.coral : tone === "sage" ? TOKENS.sage : TOKENS.ink;
  return (
    <span
      className="mr-1.5 mb-1.5 inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}

const CATEGORY_TONES: ("coral" | "sage" | "amber")[] = ["coral", "sage", "amber"];

export function InsightThread({ sections }: { sections: MonthlyInsightSections }) {
  const { resumo, categorias, metas, comparacao, sugestao } = sections;

  return (
    <div className="flex flex-col gap-3">
      <Msg icon={<Sparkles size={14} />} color={TOKENS.ink} eyebrow="Como foi o mês">
        <p className="text-[14px] leading-relaxed text-brand-ink">{resumo.text}</p>
        <div
          className="mt-2.5 inline-flex items-baseline gap-1 rounded-full px-3.5 py-1 font-display text-[16px] font-bold text-white"
          style={{ background: resumo.sobrou >= 0 ? TOKENS.sage : TOKENS.coral }}
        >
          <span className="font-sans text-[11px] font-medium opacity-90">
            {resumo.sobrou >= 0 ? "sobrou" : "faltou"}
          </span>
          {currency(Math.abs(resumo.sobrou))}
        </div>
      </Msg>

      <Msg icon={<ShoppingBag size={14} />} color={TOKENS.amber} eyebrow="Onde foi o dinheiro">
        <p className="mb-2.5 text-[14px] leading-relaxed text-brand-ink">{categorias.text}</p>
        {categorias.top.length > 0 && (
          <div>
            {categorias.top.map((c, i) => (
              <Chip
                key={c.nome}
                label={`${c.nome} · ${currency(c.valor)}`}
                tone={CATEGORY_TONES[i % CATEGORY_TONES.length]}
              />
            ))}
          </div>
        )}
      </Msg>

      {metas && (
        <Msg icon={<PiggyBank size={14} />} color={TOKENS.sage} eyebrow="Guardando dinheiro">
          {metas.items.length > 0 && (
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {metas.items.map((m) => (
                <span
                  key={m.nome}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                  style={{
                    background: m.done
                      ? `color-mix(in srgb, ${TOKENS.sage} 16%, ${TOKENS.card})`
                      : TOKENS.bg,
                    color: m.done ? TOKENS.sage : TOKENS.inkSoft,
                  }}
                >
                  <span
                    className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-white"
                    style={{ background: m.done ? TOKENS.sage : TOKENS.card, border: m.done ? "none" : `1.5px dashed ${TOKENS.line}` }}
                  >
                    {m.done ? <Check size={9} /> : <Minus size={7} color={TOKENS.inkSoft} />}
                  </span>
                  {m.nome}
                </span>
              ))}
            </div>
          )}
          <p className="text-[14px] leading-relaxed text-brand-ink">{metas.text}</p>
        </Msg>
      )}

      {comparacao && (
        <Msg
          icon={comparacao.direction === "up" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          color={
            comparacao.direction === "up"
              ? TOKENS.coral
              : comparacao.direction === "down"
                ? TOKENS.sage
                : TOKENS.inkSoft
          }
          eyebrow="Comparado ao mês passado"
        >
          {comparacao.direction !== "flat" && (
            <div
              className="mb-2 inline-flex items-center rounded-full px-3 py-1 font-display text-[15px] font-bold text-white"
              style={{ background: comparacao.direction === "up" ? TOKENS.coral : TOKENS.sage }}
            >
              {comparacao.direction === "up" ? "▲" : "▼"} {comparacao.pct}%
            </div>
          )}
          <p className="text-[14px] leading-relaxed text-brand-ink">{comparacao.text}</p>
        </Msg>
      )}

      <Msg icon={<Lightbulb size={14} />} color={TOKENS.plum} eyebrow="Uma ideia" warm>
        <p className="text-[14px] leading-relaxed text-brand-ink">{sugestao.text}</p>
      </Msg>
    </div>
  );
}
