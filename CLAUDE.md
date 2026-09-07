# Tá Resolvido — regras de projeto

App de organização financeira para quem não tem tempo. A pessoa manda uma foto do extrato, um
áudio ou uma frase, e o mês se organiza sozinho. Não conecta ao banco.
Site: taresolvido.app · Instagram: @ta_resolvido_app

## Onde está a especificação completa

`docs/design-system.md` — 8 partes: design system, identidade de marca, UI do app, campanha,
specs de Figma, crítica do site atual, tendências 2026 e código de produção.
`docs/design-tokens.json` — os tokens em formato W3C DTCG. **É a fonte da verdade das cores.**

**Não leia o `.md` inteiro por padrão** — são ~4.000 linhas. As regras que valem sempre estão
abaixo. Vá ao arquivo só quando precisar do detalhe, e leia apenas a seção citada (ele tem
índice com âncoras: `#parte-1`, `#parte-2`, …).

---

## Regras que não se negociam

### Cor
Nenhum hex literal em componente. Só tokens semânticos. Quem mapeia semântico → primitivo é o
arquivo de tema, e só ele.

| Token | Dia | Noite |
|---|---|---|
| `bg/canvas` | `#FFFFFF` | `#14201F` |
| `bg/raised` | `#FFFFFF` | `#1D2B29` |
| `bg/sunken` | `#F7F6F1` | `#092B26` |
| `fg/default` | `#1A1A1A` | `#F0EAD9` |
| `fg/muted` | `#6B645A` | `#9BAFA9` |
| `border/default` | `#E3D9C4` | `#2C3B39` |
| `border/strong` | `#867D63` | `#5C7C76` |
| `accent/default` | `#725470` | `#B08CAE` |
| `income/default` | `#436A4D` | `#78A783` |
| `expense/default` | `#944437` | `#DC7B6A` |
| `warning/default` | `#825500` | `#DBAF6A` |
| `danger/default` | `#6C2B22` | `#F0A091` |

- `expense` ≠ `danger`. `expense` é categoria de dado (sair dinheiro é normal); `danger` só
  aparece quando a pessoa vai apagar algo. Nunca troque um pelo outro.
- Regra da rampa: **acento no modo noite é o nível 400/500; no modo dia é o 700.**
- 🔴 **Bug conhecido, corrigir antes de qualquer outra coisa:** o site usa `#D9A441` como amber
  em fundo claro. Contraste 2.25:1 — reprova WCAG até para texto grande. Trocar por `#825500`.

### Tipografia
- **Baloo 2** → títulos e rótulo de botão. Nunca abaixo de 15px, nunca em parágrafo, **nunca em
  número de dinheiro**.
- **Inter** → corpo, UI e todos os números. Dinheiro sempre com `font-variant-numeric: tabular-nums`.
- **Caveat** → só a voz da fundadora. No máximo uma vez por tela. Nunca em botão, campo ou dado.
- Escala de 9 níveis: `display-xl 56 · display-l 44 · heading-l 32 · heading-m 24 · heading-s 18 ·
  body-l 18 · body-m 16 · body-s 14 · label 12`. Título usa line-height 1.06–1.35; corpo, 1.5–1.625.
- Nunca um `h3` menor que o corpo (erro atual do site).

### Medida
- Espaçamento base 8px: `2 4 8 12 16 24 32 40 48 64 80 96 128`. Nada de 5, 6, 10, 18, 22.
- Raio: `sm 8 · md 12 · lg 16 (botão) · xl 24 (card) · 2xl 32 · full 9999`.
  Raio interno = raio externo − padding. Nunca o mesmo raio em elemento aninhado.
- Breakpoints: `xs 320 · sm 480 · md 768 · lg 1024 · xl 1280 · 2xl 1536`. Grid 4 / 4 / 8 / 12 / 12 / 12.
- Alvo de toque mínimo 44×44, mesmo com visual menor (use padding transparente).

### Acessibilidade — condição de aceite, não item de backlog
- Texto ≥ 4.5:1. Contorno de controle ≥ 3:1 (por isso `border/strong` existe).
- `:focus-visible` sempre presente: anel 2px + offset 2px. Nunca `outline: none` sem substituto.
- Cor nunca é o único portador de significado — entrada/saída também diferem por sinal (+/−) e
  por forma (ponto cheio × vazado).
- Todo gesto tem alternativa visível de toque único.
- `prefers-reduced-motion` respeitado.
- Layout íntegro com texto do sistema em 200% e em 320px de largura.

### Voz — vale para UI, site, e-mail e redes
- Frase curta, média de 12 palavras. Segunda pessoa para a dor, "a gente" para a solução.
- **Nunca culpe a pessoa.** "Você usou a planilha por uma semana" ✓ · "você não tem disciplina" ✗.
- Erro: a culpa é nossa + uma saída. "Não consegui ler esse print. Manda outra foto ou lança na mão."
- Proibido: "Ops!", "Algo deu errado" sozinho, "Nenhum dado encontrado", "Lista vazia".
- Proibido o jargão: fluxo de caixa, orçamento, patrimônio, educação financeira, saúde
  financeira, jornada, mindset, transação, receita/despesa, dashboard, insight, budget, premium.
- Usamos: lançamento · entrou/saiu · régua do mês · manda uma foto · comentário do seu mês ·
  limite · conta fixa · plano completo.
- Sem emoji no produto. Sem exclamação em interface.

### Filtros de decisão
1. **"Isso tira peso da pessoa ou devolve peso para ela?"** Se devolve, não entra — mesmo que
   seja bonito, mesmo que os concorrentes façam.
2. **"Isso é alívio ou é vitória?"** A marca é alívio. Se a peça comemora, está fora.

### Fora do roadmap, de propósito
Gamificação, streak, lembrete diário, notificação que cobra, gráfico de investimento, integração
bancária. Todos vão ser pedidos em algum momento; todos contrariam o posicionamento.

---

## Ordem de trabalho sugerida

1. Corrigir o amber (`#D9A441` → `#825500`) em todo texto/ícone sobre fundo claro
2. Garantir `:focus-visible` visível; confirmar `lang="pt-BR"` e a hierarquia de headings
3. Gerar `tokens.css` e `tailwind.config.ts` a partir do `design-tokens.json` e substituir os
   `--color-brand-*` atuais (§8.2 e §8.3 da spec)
4. Aplicar a escala tipográfica; corrigir line-height dos títulos e o `h3`
5. Trocar todo número de dinheiro para Inter tabular
6. CTA fixo no rodapé da landing a partir de 40% de rolagem
7. Prova social na landing (maior ganho de conversão — mas **nunca inventar depoimento**)
8. Componentes na ordem: Button → TextField → Card → TransactionRow → Toast (§1.9, §8.5, §8.6)
9. Storybook com alternador de tema e addon de acessibilidade (§8.10)

## Definition of done por componente
Só tokens semânticos (`grep` por `#` no arquivo volta vazio) · os 8 estados no Storybook ·
`focus-visible` · alvo ≥ 44×44 · funciona nos dois temas trocando `data-theme`, sem ajuste manual ·
contraste testado · navegável só por teclado · nome acessível correto · reduced-motion ·
textos conferidos contra o glossário acima.

## Como trabalhar neste repositório
- Trabalhe em branch, nunca direto na main.
- Antes de criar um componente novo, confira se ele já existe entre os 41 da §1.9.
- Se precisar de uma cor que não está na paleta, **pare e pergunte** — provavelmente é o token
  errado, não uma cor faltando.
