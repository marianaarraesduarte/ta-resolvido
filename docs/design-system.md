# TÁ RESOLVIDO — Sistema Completo de Design, Marca e Go-to-Market

**Projeto:** Tá Resolvido — app de organização financeira para quem não tem tempo
**Site:** taresolvido.app · **Instagram:** @ta_resolvido_app · **Contato:** contato@taresolvido.app
**Documento gerado em:** 06/09/2026
**Base:** extração direta do código do site em modo claro e escuro + análise do perfil do Instagram
**Idioma:** PT-BR, termos técnicos (tokens, props, componentes) em inglês

---

## Como este documento foi construído

Não é um sistema inventado do zero. Toda a paleta, tipografia, raio, espaçamento e tom de voz
aqui foram **extraídos do produto real** — variáveis CSS lidas direto do runtime do site nos dois
modos (noite e dia), estilos computados dos componentes, e o conteúdo do Instagram. A partir
dessa base factual, o material foi **sistematizado, auditado e expandido**.

Onde há divergência entre o que o site faz hoje e o que o sistema recomenda, isso está
**marcado explicitamente** como correção, com o motivo.

### Regra de deduplicação aplicada

Os 8 briefings pediam tarefas que se sobrepõem. Cada peça foi produzida **uma única vez**, no
lugar onde ela é canônica, e referenciada nas outras partes:

| Peça | Definida em | Referenciada em |
|---|---|---|
| Paleta e tokens de cor | Parte 1 | 2, 5, 8 |
| Valores de impressão (Pantone/CMYK) | Parte 2 | — |
| Escala tipográfica | Parte 1 | 2, 5, 8 |
| Biblioteca de componentes + estados | Parte 1 | 3, 5, 8 |
| Grid e breakpoints | Parte 1 | 5, 8 |
| Motion e microinterações | Parte 1 (curvas) | 3 (specs por tela), 8 (código) |
| Personas | Parte 3 | 4, 6, 7 |
| Copy de landing page | Parte 4 | 6 |
| Acessibilidade | Parte 1 (auditoria) | 3 (por tela), 6 (score), 8 (ARIA) |

---

## Índice

- **[Parte 0 — Base factual](#parte-0)** · o que existe hoje, medido
- **[Parte 1 — Design System "Régua"](#parte-1)** · cor 9 níveis, tipografia 9 níveis, 8px, grid 12, 41 componentes, tokens JSON, handoff
- **[Parte 2 — Identidade de marca](#parte-2)** · estratégia, arquétipos, 3 direções de logo, cor para impressão, brand book
- **[Parte 3 — UI do aplicativo](#parte-3)** · personas, 8 telas core, estados, gestos, WCAG, microinterações
- **[Parte 4 — Biblioteca de campanha](#parte-4)** · Google Ads, Meta/TikTok, e-mails, landing page, 10 posts, testes A/B
- **[Parte 5 — Figma Design Ops](#parte-5)** · frames, auto-layout, constraints, arquitetura de componentes, protótipo, anotações
- **[Parte 6 — Crítica de design](#parte-6)** · 10 heurísticas de Nielsen com nota, correções priorizadas, 2 direções alternativas
- **[Parte 7 — Tendências 2026](#parte-7)** · 5 macro-tendências, mapa 2x2, roadmap de 6 meses, mood board
- **[Parte 8 — Código de produção](#parte-8)** · componentes, ARIA, Tailwind, dark mode, responsivo, Storybook
- **[Anexo — Briefing de aplicação](#anexo)** · o que pedir para o Claude aplicar no projeto

---

<a name="parte-0"></a>
# PARTE 0 — BASE FACTUAL

## 0.1 O que o produto é (extraído do site)

**Promessa central:** "Seu mês cabe numa foto."
**Sublinha:** "Você não precisa de mais disciplina. Precisa de um jeito que funcione mesmo nos dias em que sobra zero tempo."

**Mecanismo:** o usuário manda print do extrato, áudio ou uma frase; o app identifica, categoriza
e lança. Entrada manual continua disponível, sem perda de função. **Não conecta ao banco.**

**Funcionalidades citadas:** régua do mês (timeline visual de entradas/saídas), categorização
automática, metas, limites com aviso antes de estourar, parcelas identificadas mesmo já em
andamento, salário e contas fixas recorrentes, resumo do mês com "um comentário sincero",
aprendizado com correções do usuário.

**Preço:** Grátis (R$0 — lançamento manual, régua do mês, gasto por categoria, 10 reconhecimentos
por IA no 1º mês e 3/mês depois) · Completo (R$24,90/mês, 1º mês R$14,90 — fotos/PDFs/áudios sem
limite, recorrências, metas e limites, resumo do mês, aprendizado).

**Garantias:** sem conectar no banco (imagem não fica guardada), 7 dias de garantia, cancela no app.

**Fundadora:** Mariana. Posicionamento pessoal explícito: "Eu criei o Tá Resolvido pra mim primeiro."

## 0.2 Design atual medido — modo NOITE

Variáveis CSS reais (`--color-brand-*`, formato "R G B" para uso com `rgb(var(--x) / alpha)`):

| Token no código | RGB | Hex | Papel |
|---|---|---|---|
| `--color-brand-bg` | 20 32 31 | `#14201F` | fundo da página |
| `--color-brand-card` | 29 43 41 | `#1D2B29` | superfície elevada |
| `--color-brand-ink` | 240 234 217 | `#F0EAD9` | texto principal |
| `--color-brand-ink-soft` | 155 175 169 | `#9BAFA9` | texto secundário |
| `--color-brand-line` | 44 59 57 | `#2C3B39` | bordas e divisórias |
| `--color-brand-amber` | 224 169 76 | `#E0A94C` | acento — atenção/meta |
| `--color-brand-coral` | 201 106 90 | `#C96A5A` | acento — saída/alerta |
| `--color-brand-sage` | 127 174 138 | `#7FAE8A` | acento — entrada/sucesso |
| `--color-brand-plum` | 176 140 174 | `#B08CAE` | acento — marca/CTA |
| `--color-brand-ink-solid` | 26 26 26 | `#1A1A1A` | texto sobre acento claro |

## 0.3 Design atual medido — modo DIA

O modo claro **não é o mesmo hex com fundo trocado**: os acentos aparecem em versões mais
escuras e menos saturadas. Valores computados:

| Papel | Hex (dia) | Hex (noite) |
|---|---|---|
| Fundo base | `#FFFFFF` | `#14201F` |
| Fundo alternado (seção creme) | `#F5EDE0` | `#1D2B29` |
| Destaque creme | `#FBF4D9` | — |
| Texto principal | `#1A1A1A` | `#F0EAD9` |
| Texto secundário | `#6B645A` | `#9BAFA9` |
| Linha/borda | `#E3D9C4` | `#2C3B39` |
| Plum | `#7A5C7E` | `#B08CAE` |
| Sage | `#3F6B4A` | `#7FAE8A` |
| Coral | `#B5482F` | `#C96A5A` |
| Amber | `#D9A441` (fundo) / `#8C6214` (texto) | `#E0A94C` |

**Leitura em OKLCH — a descoberta que estrutura o sistema inteiro:**

| Cor | L (noite) | L (dia) |
|---|---|---|
| plum | 0.685 | 0.518 |
| sage | 0.707 | 0.486 |
| coral | 0.631 | 0.544 |
| amber | 0.769 | 0.751 |

Os acentos mantêm **matiz e croma praticamente idênticos** entre os modos e mudam só a
**luminosidade**. Isso significa que a marca não tem "4 cores" — tem **4 matizes** que precisam de
rampas. É exatamente o que a Parte 1 formaliza. E revela o único ponto realmente quebrado:
o amber quase não escureceu no modo dia (0.769 → 0.751), por isso ele reprova contraste.

## 0.4 Tipografia atual medida (desktop, modo dia)

| Elemento | Família | Tamanho | Peso | Line-height |
|---|---|---|---|---|
| h1 | Baloo 2 | 44px | 800 | 46.64px (1.06) |
| h2 | Baloo 2 | 28px | 700 | 42px (1.50) |
| h3 | Baloo 2 | 15px | 700 | 22.5px (1.50) |
| corpo | Inter | 18px | 500 | 29.25px (1.625) |
| CTA | Baloo 2 | 15.5px | 600 | — |

Famílias declaradas: `--font-baloo` (Baloo 2), `--font-inter` (Inter), `--font-caveat` (Caveat).
CTA primário: `background #7A5C7E`, `color #FFFFFF`, `border-radius 16px`, `padding 16px 32px`.

## 0.5 Instagram @ta_resolvido_app — leitura

18 posts, 64 seguidores, 87 seguindo. Bio: *"App de controle financeiro pra quem não tem tempo de
organizar contas na mão. 👇Qual desses é você? teste..."* → `taresolvido.app/comece`

**Marca visual em uso:** círculo verde-escuro com check creme e um ponto âmbar no canto superior
direito do check. É a única expressão de logo existente hoje.

**Padrão do feed:** três fundos alternados — creme (`#F0EAD9`), plum dessaturado, verde-escuro
(`#14201F`) — com títulos em Baloo 2 bold centralizado. Formatos: carrossel com "arraste →",
reels com a fundadora falando à câmera, prints reais da interface, e frases-gancho de dor
("Você já tentou controlar seus gastos... E desistiu?", "3 coisas que eu parei de fazer depois
que arrumei minha rotina financeira", "10 coisas que deveriam ser mais fáceis em 2026").

**Diagnóstico rápido:** o tom de voz está certo e consistente com o site — primeira pessoa,
confissão, zero jargão financeiro. O que falta é sistema: os fundos alternam sem regra, os posts
não têm hierarquia tipográfica compartilhada com o produto, e não há um elemento gráfico
recorrente que faça a conta ser reconhecida no feed sem ler o @. A Parte 2 e a Parte 4 resolvem isso.

---

<a name="parte-1"></a>
# PARTE 1 — DESIGN SYSTEM "RÉGUA"

> **Nome do sistema: Régua.** Vem do componente central do produto ("régua do mês") e descreve
> o que um design system faz: dar uma medida única para tudo. Use `regua/` como prefixo de
> biblioteca no Figma e `@regua/*` como namespace de pacote no código.

## 1.1 Princípios de design

Seis princípios. Todos são **decidíveis** — cada um resolve uma discussão real de produto.

**1. O esforço é nosso, não do usuário.**
Toda tela deve responder: "o que a pessoa precisa fazer aqui, e dá pra fazer com menos?" Se um
fluxo exige mais de um gesto deliberado para registrar um gasto, ele está errado. O botão manual
existe, mas nunca é o caminho apresentado primeiro.

**2. Calma é a feature.**
O público já se sente mal com dinheiro. O sistema nunca usa vermelho de erro para saldo negativo,
nunca usa ícone de alerta para gasto alto, nunca soma exclamações. Coral é uma cor de *categoria*
(saída), não de julgamento. Alertas usam amber e frase curta, no passado ou no futuro — nunca
no imperativo culpado.

**3. Mostre o resultado, esconda o processo.**
O texto do próprio site já diz: "você não vê nada disso acontecer, só vê o resultado pronto".
Loading states não explicam a IA em etapas ("analisando imagem… extraindo valores…"). Mostram
uma coisa acontecendo e entregam.

**4. Reversível por padrão.**
Toda ação automática produz um objeto editável, com o que foi entendido visível antes de salvar.
"1 lançamento identificado — confere antes de salvar" é o padrão, não a exceção.

**5. Um número por tela.**
Cada tela tem um protagonista numérico. Régua do mês: o saldo. Categoria: o total da categoria.
Meta: o quanto falta. Tudo o mais é `display-*` menor ou texto. Se dois números competem pelo
mesmo peso, um deles está no lugar errado.

**6. Densidade de leitura, não de dado.**
O sistema prefere respiro a caber mais. Mínimo `space-16` entre blocos semânticos distintos,
mínimo `space-24` entre seções. Quando algo não couber, a resposta é hierarquia (esconder atrás
de um toque), não redução de espaçamento.

---

## 1.2 Cor — 6 famílias × 9 níveis

Rampas geradas em **OKLCH**, ancoradas nos matizes reais da marca (medidos na Parte 0), com
luminosidade perceptualmente uniforme e croma reduzido nos extremos para evitar o efeito
"neon nas pontas". Cada família mantém H e C do original e varia só L.

### Alvos de luminosidade (idênticos em todas as famílias)

| Nível | L (OKLCH) | Uso típico |
|---|---|---|
| 100 | 0.972 | fundo de destaque muito sutil, tinta de badge |
| 200 | 0.930 | fundo de chip, hover de superfície clara |
| 300 | 0.868 | borda decorativa, ilustração |
| 400 | 0.780 | **acento em fundo escuro** (texto/ícone) |
| 500 | 0.685 | cor de marca em fundo escuro, preenchimento de gráfico |
| 600 | 0.590 | estado hover de 500, preenchimento de barra |
| 700 | 0.487 | **acento em fundo claro** (texto/ícone/CTA) |
| 800 | 0.380 | hover de 700, texto sobre chip claro |
| 900 | 0.262 | fundo escuro tintado, ilustração de contraste |

### 1.2.1 Plum — cor primária de marca (H 328°)

| Token | Hex | vs `#FFFFFF` | vs `#14201F` |
|---|---|---|---|
| `plum-100` | `#FAF3FA` | 1.09 | 15.34 |
| `plum-200` | `#F0E3EF` | 1.24 | 13.49 |
| `plum-300` | `#E2CBE0` | 1.52 | 11.03 |
| `plum-400` | `#CAACC8` | 2.05 | 8.16 |
| `plum-500` | `#B08CAE` ← noite atual | 2.91 | **5.74 AA** |
| `plum-600` | `#937091` | 4.23 | 3.95 |
| `plum-700` | `#725470` ← dia (site usa `#7A5C7E`) | **6.53 AA+** | 2.56 |
| `plum-800` | `#513950` | 10.24 | 1.63 |
| `plum-900` | `#2E1E2E` | 15.66 | 1.07 |

### 1.2.2 Sage — entrada, sucesso, confirmação (H 151°)

| Token | Hex | vs `#FFFFFF` | vs `#14201F` |
|---|---|---|---|
| `sage-100` | `#F0F8F1` | 1.08 | 15.45 |
| `sage-200` | `#DDEDE0` | 1.22 | 13.74 |
| `sage-300` | `#C0DCC6` | 1.47 | 11.38 |
| `sage-400` | `#9DC3A5` | 1.95 | 8.58 |
| `sage-500` | `#78A783` ← noite (site usa `#7FAE8A`) | 2.74 | **6.09 AA** |
| `sage-600` | `#5C8A67` | 3.97 | 4.21 |
| `sage-700` | `#436A4D` ← dia (site usa `#3F6B4A`) | **6.16 AA+** | 2.71 |
| `sage-800` | `#2B4B33` | 9.74 | 1.72 |
| `sage-900` | `#142A1A` | 15.26 | 1.10 |

### 1.2.3 Amber — meta, aviso, limite (H 78°)

| Token | Hex | vs `#FFFFFF` | vs `#14201F` |
|---|---|---|---|
| `amber-100` | `#FFF4E5` | 1.09 | 15.38 |
| `amber-200` | `#F8E5C8` | 1.23 | 13.56 |
| `amber-300` | `#EFCE9D` | 1.50 | 11.13 |
| `amber-400` | `#DBAF6A` ← noite (site usa `#E0A94C`) | 2.03 | **8.24 AAA** |
| `amber-500` | `#C48F2D` | 2.87 | 5.82 |
| `amber-600` | `#A67200` | 4.18 | 4.00 |
| `amber-700` | `#825500` ← **dia (correção obrigatória)** | **6.46 AA+** | 2.59 |
| `amber-800` | `#5E3A00` | 10.09 | 1.66 |
| `amber-900` | `#371E00` | 15.58 | 1.07 |

> **Correção crítica.** O site usa `#D9A441` como amber no modo dia: contraste **2.25 sobre branco
> — reprova até para texto grande.** É o único token realmente quebrado do sistema. Amber em fundo
> claro deve ser `amber-700` para texto/ícone (o site já acerta em um lugar, com `#8C6214`) e
> `amber-200` como fundo de chip com texto `amber-800`. `amber-400/500` só como preenchimento
> decorativo (barra, ponto de gráfico) com rótulo textual ao lado.

### 1.2.4 Coral — saída, despesa, remoção (H 31°)

| Token | Hex | vs `#FFFFFF` | vs `#14201F` |
|---|---|---|---|
| `coral-100` | `#FFF1ED` | 1.10 | 15.17 |
| `coral-200` | `#FFDED7` | 1.26 | 13.28 |
| `coral-300` | `#FFC3B7` | 1.53 | 10.94 |
| `coral-400` | `#F0A091` | 2.07 | 8.07 |
| `coral-500` | `#DC7B6A` ← noite (site usa `#C96A5A`, 4.53 — no limite) | 2.96 | **5.64 AA** |
| `coral-600` | `#BB5E4E` | 4.35 | 3.84 |
| `coral-700` | `#944437` ← dia (site usa `#B5482F`) | **6.69 AA+** | 2.50 |
| `coral-800` | `#6C2B22` | 10.47 | 1.60 |
| `coral-900` | `#41140D` | 15.78 | 1.06 |

### 1.2.5 Teal — família neutra da marca (H 190°) · superfícies do modo noite

| Token | Hex | Papel |
|---|---|---|
| `teal-100` | `#EDF9F6` | fundo de seção fria no modo dia |
| `teal-200` | `#D8EDE9` | chip informativo |
| `teal-300` | `#B8DDD6` | borda decorativa |
| `teal-400` | `#91C3BB` | ilustração |
| `teal-500` | `#68A89E` | ilustração / gráfico secundário |
| `teal-600` | `#4B8B81` | — |
| `teal-700` | `#336B63` | — |
| `teal-800` | `#1D4B45` | superfície muito elevada (noite) |
| `teal-900` | `#092B26` | fundo mais profundo que o base |

**Ancoragem do modo noite:** os três cinzas-teal do site vivem entre `teal-800` e `teal-900` e
ficam como tokens dedicados, porque são superfícies e não uma rampa de acento:
`surface-base #14201F` (L 0.232) · `surface-raised #1D2B29` (L 0.276) · `surface-line #2C3B39` (L 0.338).

### 1.2.6 Sand — família neutra quente (H 86°) · superfícies e texto do modo dia

| Token | Hex | Papel |
|---|---|---|
| `sand-100` | `#F7F6F1` | fundo alternado sutil |
| `sand-200` | `#EBE8DE` | fundo de seção creme |
| `sand-300` | `#D9D3C3` | borda |
| `sand-400` | `#BFB7A2` | borda forte / divisória |
| `sand-500` | `#A3997F` | ícone desabilitado |
| `sand-600` | `#867D63` | texto terciário |
| `sand-700` | `#675F49` | **texto secundário no modo dia** (6.34 sobre branco) |
| `sand-800` | `#484231` | — |
| `sand-900` | `#292418` | — |

**Ancoragem do modo dia:** `cream #F5EDE0` (fundo alternado do site, L 0.949) e `cream-hi #FBF4D9`
(destaque) entram como tokens nomeados; `ink #1A1A1A` (L 0.218) e `ink-soft #6B645A` (L 0.507)
permanecem como estão — ambos passam AA confortavelmente.

---

## 1.3 Tokens semânticos

Regra de ouro: **nenhum componente referencia um token primitivo.** Componentes só usam tokens
semânticos. Só o arquivo de tema mapeia semântico → primitivo. É isso que torna o dark mode uma
troca de mapa e não uma reescrita.

### Camada 1 — primitivos
`plum-100..900`, `sage-100..900`, `amber-100..900`, `coral-100..900`, `teal-100..900`,
`sand-100..900`, `white`, `black`, `ink`, `cream`, `cream-hi`.

### Camada 2 — semânticos (o único que UI consome)

| Token semântico | Modo DIA | Modo NOITE | Uso |
|---|---|---|---|
| `bg/canvas` | `#FFFFFF` | `#14201F` | fundo da aplicação |
| `bg/subtle` | `#F5EDE0` (cream) | `#1D2B29` | seção alternada |
| `bg/raised` | `#FFFFFF` + shadow | `#1D2B29` | card, sheet, popover |
| `bg/sunken` | `#F7F6F1` (sand-100) | `#092B26` (teal-900) | campo de input, poço |
| `bg/inverse` | `#14201F` | `#F0EAD9` | seção de contraste |
| `fg/default` | `#1A1A1A` | `#F0EAD9` | texto principal |
| `fg/muted` | `#6B645A` | `#9BAFA9` | texto secundário |
| `fg/subtle` | `#867D63` (sand-600) | `#6E837E` | placeholder, timestamp |
| `fg/on-accent` | `#FFFFFF` | `#1A1A1A` | texto sobre preenchimento de acento |
| `fg/inverse` | `#F0EAD9` | `#1A1A1A` | texto sobre `bg/inverse` |
| `border/default` | `#E3D9C4` | `#2C3B39` | divisória, borda de card |
| `border/strong` | `#867D63` (sand-600) | `#5C7C76` | borda de input, tabela |
| `border/focus` | `#725470` (plum-700) | `#CAACC8` (plum-400) | anel de foco |
| `accent/default` | `#725470` (plum-700) | `#B08CAE` (plum-500) | marca, CTA primário |
| `accent/hover` | `#513950` (plum-800) | `#CAACC8` (plum-400) | — |
| `accent/subtle` | `#F0E3EF` (plum-200) | `#2E1E2E` (plum-900) | fundo de estado selecionado |
| `income/default` | `#436A4D` (sage-700) | `#78A783` (sage-500) | entrada, valor positivo |
| `income/subtle` | `#DDEDE0` (sage-200) | `#142A1A` (sage-900) | fundo de chip de entrada |
| `expense/default` | `#944437` (coral-700) | `#DC7B6A` (coral-500) | saída, valor negativo |
| `expense/subtle` | `#FFDED7` (coral-200) | `#41140D` (coral-900) | fundo de chip de saída |
| `warning/default` | `#825500` (amber-700) | `#DBAF6A` (amber-400) | limite, meta em risco |
| `warning/subtle` | `#F8E5C8` (amber-200) | `#371E00` (amber-900) | fundo de banner de aviso |
| `info/default` | `#336B63` (teal-700) | `#91C3BB` (teal-400) | dica, explicação |
| `success/default` | = `income/default` | = `income/default` | confirmação de salvamento |
| `danger/default` | `#6C2B22` (coral-800) | `#F0A091` (coral-400) | **só** destruição de dado |
| `overlay/scrim` | `rgba(26,26,26,.45)` | `rgba(9,43,38,.65)` | fundo de modal |

**Nota de linguagem — `expense` ≠ `danger`.** São dois tokens diferentes de propósito, mesmo
partindo do mesmo matiz. `expense` descreve uma categoria de dado (dinheiro que saiu, e sair
dinheiro é normal). `danger` só aparece quando o usuário está prestes a apagar algo. Nunca
troque um pelo outro: é o princípio 2 codificado em token.

### Camada 3 — tokens de componente (exemplos)
`button/primary/bg` → `accent/default` · `button/primary/bg-hover` → `accent/hover` ·
`card/bg` → `bg/raised` · `input/border` → `border/strong` · `ruler/income-dot` → `income/default`.

---

## 1.4 Auditoria de contraste do estado atual

Medições reais dos pares em uso hoje no site (WCAG 2.2, texto normal exige 4.5, grande 3.0):

| Par | Modo | Ratio | Resultado |
|---|---|---|---|
| `#F0EAD9` sobre `#14201F` | noite | 13.91 | AAA |
| `#F0EAD9` sobre `#1D2B29` | noite | 12.22 | AAA |
| `#9BAFA9` sobre `#14201F` | noite | 7.24 | AAA |
| `#9BAFA9` sobre `#1D2B29` | noite | 6.36 | AA |
| `#E0A94C` sobre `#14201F` | noite | 7.92 | AAA |
| `#7FAE8A` sobre `#14201F` | noite | 6.63 | AA |
| `#B08CAE` sobre `#14201F` | noite | 5.74 | AA |
| `#C96A5A` sobre `#14201F` | noite | 4.53 | AA (margem de 0.03) |
| `#1A1A1A` sobre `#B08CAE` (botão) | noite | 5.97 | AA |
| `#2C3B39` sobre `#14201F` (linha) | noite | 1.43 | não-texto ✓ (mas ver abaixo) |
| `#1A1A1A` sobre `#FFFFFF` | dia | 17.40 | AAA |
| `#1A1A1A` sobre `#F5EDE0` | dia | 14.98 | AAA |
| `#6B645A` sobre `#FFFFFF` | dia | 5.84 | AA |
| `#6B645A` sobre `#F5EDE0` | dia | 5.03 | AA |
| `#3F6B4A` sobre `#FFFFFF` | dia | 6.15 | AA |
| `#7A5C7E` sobre `#FFFFFF` | dia | 5.74 | AA |
| `#FFFFFF` sobre `#7A5C7E` (botão) | dia | 5.74 | AA |
| `#B5482F` sobre `#FFFFFF` | dia | 5.34 | AA |
| `#8C6214` sobre `#FFFFFF` | dia | 5.42 | AA |
| **`#D9A441` sobre `#FFFFFF`** | dia | **2.25** | **REPROVA** |
| `#E3D9C4` sobre `#FFFFFF` (linha) | dia | 1.40 | não-texto ✓ (mas ver abaixo) |

**Três ações, em ordem:**

1. **`#D9A441` como texto ou ícone em fundo claro é bug de acessibilidade.** Trocar por
   `amber-700 #825500`. Único item bloqueante.
2. **Coral noite em 4.53 não tem folga.** Qualquer ajuste futuro de fundo derruba abaixo de 4.5.
   Adotar `coral-500 #DC7B6A` (5.64) como o coral de texto no modo noite e reservar `#C96A5A`
   para preenchimento.
3. **Bordas em 1.40/1.43 são invisíveis para baixa visão.** WCAG 2.2 (critério 1.4.11) exige
   **3:1 para contorno de componente de interface**. Uma divisória decorativa pode ficar como
   está, mas a borda que define a área clicável de um input, checkbox ou botão secundário
   precisa de `border/strong`. Os valores foram escolhidos por cálculo, não por aparência:

   | Modo | `border/strong` | Sobre canvas | Sobre card | Resultado |
   |---|---|---|---|---|
   | dia | `sand-600 #867D63` | 4.10 (branco) | 3.52 (creme) | ✓ |
   | noite | `#5C7C76` | 3.66 (`#14201F`) | 3.22 (`#1D2B29`) | ✓ |

   *(Descartados por reprovarem: `sand-400 #BFB7A2` = 2.00 sobre branco; `#3E5350` = 2.04 sobre
   `#14201F`.)* Regra: **borda decorativa = `border/default`; borda que delimita controle =
   `border/strong`, sempre ≥ 3:1.**

---

## 1.5 Tipografia — escala de 9 níveis

**Três famílias, três funções, sem sobreposição:**

| Família | Função | Regra rígida |
|---|---|---|
| **Baloo 2** | display / títulos / rótulo de botão | Nunca abaixo de 15px. Nunca em parágrafo. Nunca em número de dinheiro. |
| **Inter** | corpo, UI, dados, números | Sempre com `font-variant-numeric: tabular-nums` quando exibe valor. |
| **Caveat** | voz da fundadora | Máximo **um** uso por tela. Nunca em elemento interativo. Nunca em dado. |

Baloo 2 é uma grotesca arredondada de alto x-height — é ela que dá a sensação de "acolhedor,
não corporativo". Inter é neutra e tem tabular figures reais. A tensão entre as duas é o
principal ativo tipográfico da marca: **título que abraça, número que não mente.**

### A escala

Escala modular de razão 1.25 truncada em valores redondos, ancorada nos 44px reais do h1 do site.

| # | Token | Família | Size (desk) | Size (mob) | Weight | Line-height | Tracking | Uso |
|---|---|---|---|---|---|---|---|---|
| 1 | `display-xl` | Baloo 2 | 56px | 36px | 800 | 1.02 | -0.02em | hero de campanha, capa de brand book |
| 2 | `display-l` | Baloo 2 | 44px | 30px | 800 | 1.06 | -0.015em | h1 de página (**valor atual do site**) |
| 3 | `heading-l` | Baloo 2 | 32px | 26px | 700 | 1.15 | -0.01em | título de seção |
| 4 | `heading-m` | Baloo 2 | 24px | 22px | 700 | 1.25 | 0 | título de card, cabeçalho de sheet |
| 5 | `heading-s` | Baloo 2 | 18px | 17px | 700 | 1.35 | 0 | subtítulo, rótulo de grupo, item de lista forte |
| 6 | `body-l` | Inter | 18px | 17px | 500 | 1.625 | 0 | lead de parágrafo (**valor atual do site**) |
| 7 | `body-m` | Inter | 16px | 16px | 400 | 1.55 | 0 | corpo padrão, texto de UI |
| 8 | `body-s` | Inter | 14px | 14px | 400 | 1.50 | 0 | apoio, descrição de campo, legenda |
| 9 | `label` | Inter | 12px | 12px | 600 | 1.35 | +0.08em | eyebrow, uppercase, rótulo de tag |

**Estilos de dinheiro (variantes, não níveis novos):**

| Token | Base | Ajuste |
|---|---|---|
| `money-hero` | `display-l` | Inter 700, `tabular-nums`, tracking -0.01em — o "um número por tela" |
| `money-m` | `body-l` | Inter 600, `tabular-nums` |
| `money-s` | `body-s` | Inter 600, `tabular-nums` |

Dinheiro **sempre em Inter**, mesmo quando é o maior elemento da tela. Baloo 2 arredonda os
algarismos e diminui a percepção de precisão — exatamente o oposto do que se quer no saldo.

**Estilo de voz:**

| Token | Família | Size | Uso |
|---|---|---|---|
| `voice` | Caveat | 24–28px | assinatura da Mariana, o "comentário sincero do seu mês", anotação em ilustração |

### Regras de composição

- **Medida de linha:** 60–75 caracteres em `body-*`. Em desktop, `max-width: 68ch`.
- **Empilhamento:** dois níveis adjacentes nunca se tocam sem espaço. `heading-*` seguido de
  `body-*` recebe `space-8`; entre blocos, `space-24`.
- **Não pule mais de dois níveis** para criar contraste em um mesmo bloco (`display-l` + `body-s`
  é ruído; `display-l` + `body-l` é hierarquia).
- **Nunca centralize** mais de 3 linhas de `body-*`. Títulos podem ser centralizados; parágrafos
  longos, não. (O feed do Instagram hoje centraliza blocos longos — ver Parte 4.)
- **`label` sempre em caixa alta** com tracking +0.08em, nunca em frase completa, máximo 4 palavras.

### Fallbacks e carga

```css
--font-display: "Baloo 2", "Trebuchet MS", "Segoe UI", system-ui, sans-serif;
--font-ui:      "Inter", -apple-system, "Segoe UI", Roboto, sans-serif;
--font-voice:   "Caveat", "Bradley Hand", cursive;
```

Carregar apenas os pesos usados: Baloo 2 700/800, Inter 400/500/600/700, Caveat 600.
`font-display: swap` + `preload` das duas primeiras. Caveat é decorativa: carregar com
`font-display: optional` para nunca bloquear render.

---

## 1.6 Espaçamento — sistema de 8px

Base **8px**, com um único meio-passo (4px) permitido para ajuste óptico dentro de componentes
pequenos. Nada de 5, 6, 10, 18, 22.

| Token | px | rem | Uso canônico |
|---|---|---|---|
| `space-0` | 0 | 0 | reset |
| `space-2` | 2 | 0.125 | **só** deslocamento óptico de ícone |
| `space-4` | 4 | 0.25 | gap ícone↔texto dentro de chip |
| `space-8` | 8 | 0.5 | gap entre rótulo e campo, padding de chip |
| `space-12` | 12 | 0.75 | padding interno de item de lista |
| `space-16` | 16 | 1 | padding de card, gap entre campos |
| `space-24` | 24 | 1.5 | padding de card grande, gap entre blocos |
| `space-32` | 32 | 2 | gap entre grupos de conteúdo |
| `space-40` | 40 | 2.5 | topo/base de sheet |
| `space-48` | 48 | 3 | separação de seção em mobile |
| `space-64` | 64 | 4 | separação de seção em tablet |
| `space-80` | 80 | 5 | separação de seção em desktop |
| `space-96` | 96 | 6 | respiro de hero |
| `space-128` | 128 | 8 | respiro máximo, só em landing |

**Regra de gutter interno:** o padding horizontal de um container nunca é menor que o gap
vertical entre seus filhos. Se o card tem `space-16` de padding, os filhos não podem ter
`space-24` de gap — o conteúdo pareceria colado nas laterais.

**Ritmo vertical de página:**
`space-96` (hero) → `space-80` (entre seções) → `space-32` (entre blocos) → `space-16` (dentro de bloco).
Em mobile, cada um desce um degrau: 64 → 48 → 24 → 16.

**Alvo de toque:** mínimo **44×44pt** (iOS) / **48×48dp** (Android) para qualquer elemento
interativo, mesmo que o visual seja menor. Use padding transparente, não aumente o ícone.

---

## 1.7 Grid de 12 colunas e breakpoints

| Breakpoint | Largura | Colunas | Gutter | Margem | Container máx. |
|---|---|---|---|---|---|
| `xs` | 320–479 | 4 | 16 | 16 | fluido |
| `sm` | 480–767 | 4 | 16 | 24 | fluido |
| `md` | 768–1023 | 8 | 24 | 32 | 720 |
| `lg` | 1024–1279 | 12 | 24 | 40 | 960 |
| `xl` | 1280–1535 | 12 | 32 | 64 | 1200 |
| `2xl` | 1536+ | 12 | 32 | 80 | 1320 |

**Layouts canônicos (em colunas de `lg`+):**

| Layout | Colunas | Onde |
|---|---|---|
| Hero de landing | texto 6 / visual 6 (sem gutter central extra) | página inicial |
| Prosa longa | 8 centralizadas (offset 2) | termos, privacidade, blog |
| Grid de 3 cards | 4 / 4 / 4 | "como funciona", planos |
| Grid de 2 cards | 6 / 6 | comparativo "é pra você / não é" |
| App shell (web) | nav 3 / conteúdo 9 | área logada em desktop |
| Split de preço | 5 / 2 vazio / 5 | seção de planos |

**Mobile é 4 colunas, não 12 comprimidas.** Todo componente precisa de uma definição em 4
colunas — normalmente "ocupa 4" (largura total) ou "2+2" (par de chips).

**Baseline grid:** 4px. Todo texto se alinha a múltiplos de 4 no eixo vertical. Isso vem de
graça se todos os `line-height` da escala produzirem valores múltiplos de 4 nos tamanhos usados.

---

## 1.8 Raio, elevação, borda e motion

### Raio

| Token | px | Uso |
|---|---|---|
| `radius-sm` | 8 | chip, tag, campo de busca compacto |
| `radius-md` | 12 | input, item de lista selecionável |
| `radius-lg` | 16 | **botão (valor atual do site)**, card pequeno |
| `radius-xl` | 24 | card, painel, sheet (topo) |
| `radius-2xl` | 32 | modal, card de destaque |
| `radius-full` | 9999 | avatar, badge numérico, toggle |

**Regra de raio aninhado:** raio interno = raio externo − padding. Card `radius-xl` (24) com
`space-16` de padding pede filho com `radius-sm` (8). Nunca use o mesmo raio em elemento aninhado.

### Elevação

O modo noite **não usa sombra para elevar** (sombra em fundo escuro é invisível). Ele usa
**superfície mais clara + borda**. O modo dia usa sombra. É o mesmo token semântico com dois mapas:

| Token | Modo DIA | Modo NOITE |
|---|---|---|
| `elev-0` | sem sombra, `bg/canvas` | `bg/canvas` |
| `elev-1` | `0 1px 2px rgba(26,26,26,.06)` | `bg/raised` + `1px border/default` |
| `elev-2` | `0 4px 12px rgba(26,26,26,.08)` | `bg/raised` + `1px border/default` + `teal-800` sutil |
| `elev-3` | `0 12px 32px rgba(26,26,26,.12)` | `#1D2B29` + `1px #5C7C76` |
| `elev-4` | `0 24px 64px rgba(26,26,26,.16)` | `teal-800 #1D4B45` + `1px #5C7C76` |

### Motion

| Token | Duração | Curva | Uso |
|---|---|---|---|
| `motion-instant` | 100ms | `linear` | mudança de cor em hover |
| `motion-fast` | 160ms | `cubic-bezier(.2,0,0,1)` | estado de botão, checkbox, chip |
| `motion-base` | 240ms | `cubic-bezier(.2,0,0,1)` | abertura de acordeão, tooltip |
| `motion-slow` | 380ms | `cubic-bezier(.32,.72,0,1)` | sheet subindo, transição de tela |
| `motion-spring` | 520ms | `cubic-bezier(.34,1.42,.64,1)` | confirmação de lançamento salvo |

**Princípios de motion:**
1. **Entrada acelera, saída desacelera.** Elementos que entram usam curva "emphasized decelerate";
   que saem, `cubic-bezier(.4,0,1,1)` em 120ms — sair é sempre mais rápido que entrar.
2. **Origem do movimento = origem do gesto.** Sheet aberto pelo botão inferior sobe de baixo.
   Popover aberto por um chip cresce a partir daquele chip (`transform-origin` no elemento).
3. **Nada acima de 520ms**, exceto a animação de sucesso do lançamento (única exceção autorizada).
4. **`prefers-reduced-motion: reduce`** substitui toda translação/escala por fade de 120ms,
   e desliga completamente a animação de sucesso e o shimmer de skeleton.

---

## 1.9 Biblioteca de componentes — 41 componentes com todos os estados

**Estados padrão do sistema.** Todo componente interativo implementa os 8 estados abaixo. Onde a
tabela diz "padrão", vale exatamente esta definição — só as exceções estão descritas.

| Estado | Definição padrão |
|---|---|
| `default` | repouso |
| `hover` | só em ponteiro fino; superfície escurece/clareia 1 degrau da rampa |
| `focus-visible` | anel `2px solid border/focus` + `offset 2px`. Nunca removido, nunca só cor |
| `active/pressed` | `scale(.98)` + superfície 2 degraus, `motion-instant` |
| `selected` | fundo `accent/subtle` + texto `accent/default` + peso 600 |
| `disabled` | `opacity .45`, `cursor not-allowed`, sem hover, permanece no DOM e legível |
| `loading` | conteúdo substituído por spinner, largura travada, `aria-busy="true"` |
| `error` | borda `expense/default`, mensagem em `body-s` abaixo, `aria-invalid="true"` |

---

### A. Ações (5)

**1. `Button`** — anatomia: `[ícone opc.] rótulo [ícone opc.]`, altura 48 (md) / 40 (sm) / 56 (lg),
`radius-lg`, `padding 16px 32px`, Baloo 2 600.

| Variante | Fundo | Texto | Borda | Quando |
|---|---|---|---|---|
| `primary` | `accent/default` | `fg/on-accent` | — | 1 por tela, a ação que o produto quer |
| `secondary` | transparente | `fg/default` | `1px border/strong` | ação alternativa |
| `tertiary` | transparente | `accent/default` | — | ação de baixa ênfase, em linha |
| `income` | `income/subtle` | `income/default` | — | "marcar entrada" |
| `expense` | `expense/subtle` | `expense/default` | — | "marcar saída" |
| `danger` | transparente | `danger/default` | `1px danger/default` | **só** excluir |

Estados: os 8 padrão. `loading` mantém a largura original (`min-width` travada no primeiro
render) para não pular layout. `full-width` disponível como prop, obrigatório em `xs`/`sm`.
A11y: `<button>` real, nunca `div`. Ícone decorativo `aria-hidden`. Se só ícone → `IconButton`.

**2. `IconButton`** — 44×44 mínimo, ícone 20–24, `radius-full` ou `radius-md`.
Variantes: `plain`, `filled`, `tonal`. Estados: 8 padrão. A11y: `aria-label` **obrigatório**,
descrevendo a ação e não o ícone ("Excluir lançamento", não "Lixeira").

**3. `Link`** — Inter 500, `accent/default`, sublinhado com `text-underline-offset: 3px`.
Estados: default, hover (sublinhado espessa para 2px), focus-visible (anel), visited (sem
diferença — evita ranking de leitura), pressed. A11y: nunca "clique aqui"; o texto do link
descreve o destino. Link externo ganha ícone + `aria-label` com "(abre em nova aba)".

**4. `SegmentedControl`** — trilho `bg/sunken` `radius-full`, indicador deslizante `bg/raised`.
Usado no topo de "Novo lançamento": `Manual | Foto | Chat`. 2–4 segmentos, nunca mais.
Estados: default, selected (indicador desliza em `motion-fast`), hover, focus-visible,
disabled-por-segmento. A11y: `role="tablist"` com setas ←/→, `aria-selected`.

**5. `FAB` (botão flutuante)** — 56×56, `radius-full`, `accent/default`, `elev-3`, canto inferior
direito com `space-16` de margem + safe-area. Estados: default, pressed (`scale .94`), scrolled
(encolhe para 48 e some o rótulo), hidden (desce 80px ao rolar para baixo).
A11y: `aria-label="Novo lançamento"`; não pode cobrir o último item da lista → lista tem
`padding-bottom: 88px`.

---

### B. Entrada de dados (13)

**6. `TextField`** — rótulo acima (nunca placeholder como rótulo), campo `radius-md` altura 48,
`bg/sunken`, `1px border/strong`, texto de apoio abaixo.
Estados: default, hover, focus (borda `border/focus` 2px), filled, error, disabled, read-only,
com-contador. A11y: `<label for>` real; erro em `aria-describedby`; `aria-invalid`.

**7. `MoneyInput`** — variante de TextField. Prefixo "R$" fixo, `money-m` (Inter 600 tabular),
teclado `inputmode="decimal"`, máscara aplicada no blur e não a cada tecla.
Estados: os de TextField + `sign-toggle` (entrada/saída como par de chips à esquerda, muda o
token de cor do valor). A11y: `aria-label="Valor em reais"`; leitor de tela ouve "1.234,56 reais".

**8. `TextArea`** — auto-grow de 3 a 8 linhas, `radius-md`. Estados: iguais a TextField + `resizing`.

**9. `Select`** — em mobile abre `BottomSheet` com lista; em desktop, popover.
Estados: default, open, selected, hover-item, focus-item, disabled, error, empty ("nenhuma opção").
A11y: `role="combobox"` + `aria-expanded`, navegação por teclado, digitar filtra.

**10. `DateField`** — chips rápidos "Hoje / Ontem / Escolher data" antes do calendário.
Estados: default, chip-selected, calendar-open, date-selected, out-of-range (disabled),
today (contorno), error. A11y: calendário é `role="grid"`, setas navegam, `aria-current="date"`.

**11. `Checkbox`** — 20×20 dentro de alvo 44×44, `radius-sm`.
Estados: unchecked, checked, indeterminate, hover, focus-visible, disabled, error, checked-disabled.
A11y: `<input type="checkbox">` nativo, marca desenhada em CSS/SVG.

**12. `Radio`** — 20×20 `radius-full`. Estados iguais ao Checkbox menos indeterminate.
A11y: agrupado em `<fieldset>` + `<legend>`; setas navegam dentro do grupo.

**13. `Switch`** — trilho 52×32 `radius-full`, botão 28. Off = `border/strong`; on = `accent/default`.
Estados: off, on, hover, focus-visible, pressed (botão alonga para 32×28), disabled-off,
disabled-on, loading (spinner dentro do botão, para toggles que fazem request).
A11y: `role="switch"` + `aria-checked`. **Estado nunca comunicado só por cor** — o botão muda de lado.

**14. `Slider`** — trilho 4px, botão 24, usado em "definir meta".
Estados: default, hover, dragging (botão 28 + tooltip de valor), focus-visible, disabled,
com-marcas. A11y: `<input type="range">`, `aria-valuetext="R$ 800 de R$ 2.000"`.

**15. `CategoryPicker`** — grade de chips com ícone + nome, cor por categoria vinda da rampa.
Estados: default, selected, hover, focus, recent (grupo separado no topo), search-empty, disabled.
A11y: `role="radiogroup"`; cada chip tem nome acessível completo ("Categoria: Mercado").

**16. `SearchField`** — `radius-full`, ícone à esquerda, botão limpar à direita quando preenchido.
Estados: default, focus, typing, results-loading (spinner substitui o ícone), no-results, disabled.
A11y: `role="searchbox"`, resultados em `aria-live="polite"` com contagem.

**17. `PhotoDrop`** — área tracejada `border/strong` `radius-xl` + botão "Tirar foto" / "Escolher da galeria".
Estados: idle, drag-over (fundo `accent/subtle`), uploading (barra de progresso), processing
(skeleton dos lançamentos detectados), success (preview + n lançamentos), error-formato,
error-tamanho, error-ilegível ("não consegui ler esse print — quer tentar outra foto ou lançar na mão?").
A11y: `<input type="file">` real por trás; drag-and-drop é atalho, nunca o único caminho.

**18. `AudioRecorder`** — botão de microfone `radius-full`, forma de onda ao vivo, timer `body-s` tabular.
Estados: idle, requesting-permission, permission-denied (com instrução de como reabilitar),
recording (onda animada + timer + botão parar), paused, processing, transcribed (mostra o texto
entendido, editável), error-curto-demais, error-sem-áudio.
A11y: estado anunciado em `aria-live`; **transcrição sempre visível e editável** — nunca salvar
áudio sem mostrar o que foi entendido.

---

### C. Exibição de dados (12)

**19. `Card`** — `bg/raised`, `radius-xl`, `space-24` (desk) / `space-16` (mob), `elev-1`.
Variantes: `static`, `interactive` (ganha hover/press/focus), `accent` (faixa lateral 3px na cor
do tipo de dado), `inverse` (fundo `bg/inverse`).
Estados (variante interativa): 8 padrão.

**20. `TransactionRow`** — ícone de categoria 40 · nome + data · valor `money-s`.
Estados: default, pressed, selected, editing (vira formulário inline), pending-AI (borda
tracejada + rótulo "confere antes de salvar"), just-saved (flash `income/subtle` por 600ms),
swiped-left (revela editar/excluir), deleting (colapso 200ms), error-sync (ícone de nuvem cortada).
A11y: linha inteira é um único `<button>`; ações de swipe também existem em menu `…` visível.

**21. `Avatar`** — 24/32/40/56, `radius-full`, fallback com iniciais em `accent/subtle`.
Estados: image, initials, icon, loading (skeleton), error→initials.

**22. `Badge`** — numérico `radius-full` 18px mín., ou pontinho 8px.
Variantes: `neutral`, `income`, `expense`, `warning`, `accent`. Estados: default, 99+, dot, hidden.
A11y: número incluído no nome acessível do pai ("Notificações, 3 novas").

**23. `Chip`** — `radius-full`, altura 32, `label`/`body-s`.
Variantes: `filter` (selecionável), `input` (removível com ×), `assist` (ação), `status` (estático).
Estados: default, selected, hover, focus, disabled, removing (fade+colapso).

**24. `ProgressBar`** — trilho 8px `radius-full` `bg/sunken`.
Estados: determinate, indeterminate (shimmer), success (`income`), warning (>80% do limite,
`warning`), over (>100%, `expense` + trilho estendido), disabled.
A11y: `role="progressbar"` com `aria-valuenow/min/max` e `aria-valuetext` em reais.

**25. `GoalMeter`** — anel ou barra com valor central `money-hero` e rótulo "faltam R$ X".
Estados: on-track, ahead, behind, achieved (animação `motion-spring` + confete discreto,
desligado com reduced-motion), not-set (vira `EmptyState` inline com CTA "definir meta"), paused.

**26. `RulerTimeline` — a régua do mês (componente-assinatura)**
Anatomia: eixo horizontal com os dias do mês; entradas acima (`income`), saídas abaixo
(`expense`), tamanho do ponto proporcional ao valor; hoje marcado com linha vertical `accent`.
Estados: loading (esqueleto do eixo), empty ("seu mês ainda está em branco"), populated,
day-selected (popover com os lançamentos do dia), month-transition (deslize horizontal),
dense (>60 lançamentos → agrupa por dia), future (dias à frente em 40% de opacidade),
projected (recorrências previstas em ponto vazado).
A11y: **é obrigatório existir uma tabela equivalente** acessível por "ver como lista" —
o gráfico tem `role="img"` com `aria-label` de resumo ("Novembro: entrou R$ 4.200, saiu R$ 2.877,
maior saída dia 14"). Ponto nunca é o único portador de significado: forma difere (cheio = entrada,
vazado = saída) além da cor.

**27. `CategoryDonut`** — rosca com legenda ao lado (nunca só dentro da fatia).
Estados: loading, empty, populated, slice-hover, slice-selected, other-expanded (agrupa cauda em
"Outros" acima de 6 fatias), single-category (vira barra).
A11y: mesma regra do 26 — legenda textual com valor e percentual sempre visível.

**28. `StatTile`** — rótulo `label` + número `money-hero`/`heading-l` + delta com seta.
Estados: default, positive-delta, negative-delta, neutral, loading, no-comparison ("primeiro mês").
Regra: delta **nunca colorido de vermelho para gasto** — usa `fg/muted` + seta; só metas usam cor.

**29. `EmptyState`** — ilustração ou ícone 64 · `heading-m` · `body-m` · 1 CTA primário + 1 link.
Variantes por causa: first-use, filtro-sem-resultado, erro-de-carregamento, offline, sem-permissão.
**Nunca** usa a palavra "vazio" ou "nenhum dado". Ver Parte 3 para os textos por tela.

**30. `Skeleton`** — blocos `radius-sm` em `bg/sunken` com shimmer `motion-slow` em loop.
Estados: text-line (largura variável 60–100%), block, circle, row (composto).
Regra: skeleton espelha o layout final; nunca um spinner genérico em tela cheia.

---

### D. Feedback (7)

**31. `Toast`** — sobe do rodapé acima da TabBar, `radius-lg`, `elev-3`, some em 4s (8s se tiver ação).
Variantes: `neutral`, `success`, `warning`, `error`, `undo`.
Estados: entering, visible, action-hover, exiting, stacked (máx. 3, os anteriores encolhem), persistent.
A11y: `role="status"` (`aria-live="polite"`); erro usa `role="alert"`. Toast com ação **não some
sozinho enquanto tiver foco**.

**32. `InlineAlert`** — banner dentro do conteúdo, `radius-lg`, faixa lateral 3px + ícone.
Variantes: info, warning ("você já usou 80% do limite de Mercado"), error, tip.
Estados: default, dismissible, dismissed (lembra por sessão), expanded, com-ação.

**33. `Tooltip`** — `body-s`, `radius-sm`, `elev-2`, delay de 400ms na entrada, 0 na saída.
Estados: hidden, showing, visible, hiding. Em touch, vira `Popover` acionado por toque.
A11y: nunca é o único lugar onde a informação existe; conteúdo em `aria-describedby`.

**34. `Dialog`** — modal centralizado em desktop, `radius-2xl`, `elev-4`, scrim `overlay/scrim`.
Estados: entering, open, confirming (botão em loading), exiting.
A11y: foco preso, `Esc` fecha, foco volta ao gatilho, `role="dialog"` + `aria-modal` + `aria-labelledby`.

**35. `BottomSheet`** — mobile-first, `radius-xl` só no topo, alça de 32×4px, 3 alturas
(peek 25% / half 55% / full 92%).
Estados: closed, peek, half, full, dragging, snapping, dismissing, keyboard-open (encolhe para
caber acima do teclado). A11y: mesmas regras do Dialog quando em full.

**36. `ConfirmSheet`** — variante de BottomSheet **exclusiva para ações destrutivas**: título em
`heading-m`, consequência em `body-m`, botão `danger` + botão `secondary` "Cancelar" (nunca só ×).
Estados: default, confirming, error. Regra: **o botão destrutivo nunca é o primeiro** na ordem
de foco.

---

### E. Navegação e estrutura (bônus, 5)

**37. `TabBar`** — 4 itens fixos: Régua · Categorias · **[+] central** · Metas · Perfil.
Estados por item: inactive, active (ícone preenchido + rótulo 600 + `accent`), pressed, com-badge.
A11y: `role="tablist"`, rótulo textual **sempre visível** (não confiar em ícone sozinho).

**38. `TopAppBar`** — título + `MonthSwitcher` central + ação à direita, 56 de altura.
Estados: default, scrolled (ganha `border/default` na base e encolhe o título de `heading-l`
para `heading-s`), com-voltar, seleção-múltipla (fundo `accent/subtle`, contador + ações).

**39. `MonthSwitcher`** — `‹ Novembro ›` clicável abrindo grade de meses.
Estados: default, open, current-month (destaque), sem-dados (mês em `fg/subtle`), futuro (disabled
além de +1 mês).

**40. `Accordion`** — usado no FAQ da landing. Estados: collapsed, expanding, expanded, collapsing,
focus-visible. A11y: `<button aria-expanded>` no cabeçalho; `+` gira 45° virando `×` em `motion-base`.

**41. `PricingCard`** — variante de Card com faixa "Mais popular", lista de benefícios com check
`income/default`, preço em `money-hero` e CTA `full-width`.
Estados: default, recommended (borda 2px `accent/default` + badge), current-plan (CTA vira
"Seu plano atual", disabled), hover.

---

## 1.10 Tokens em JSON

Formato W3C Design Tokens (DTCG), pronto para Style Dictionary, Tokens Studio (Figma) ou
`@tokens-studio/sd-transforms`. Três camadas: `primitive` → `semantic` (light/dark) → componente.
As 39 referências `{...}` deste arquivo foram validadas — nenhuma quebrada.

```json
{
  "$schema": "https://design-tokens.org/schema.json",
  "$description": "Tá Resolvido — Régua Design System. Tokens em 3 camadas: primitive, semantic, component.",
  "$version": "1.0.0",
  "primitive": {
    "color": {
      "plum": {
        "100": { "$type": "color", "$value": "#FAF3FA" },
        "200": { "$type": "color", "$value": "#F0E3EF" },
        "300": { "$type": "color", "$value": "#E2CBE0" },
        "400": { "$type": "color", "$value": "#CAACC8" },
        "500": { "$type": "color", "$value": "#B08CAE" },
        "600": { "$type": "color", "$value": "#937091" },
        "700": { "$type": "color", "$value": "#725470" },
        "800": { "$type": "color", "$value": "#513950" },
        "900": { "$type": "color", "$value": "#2E1E2E" }
      },
      "sage": {
        "100": { "$type": "color", "$value": "#F0F8F1" },
        "200": { "$type": "color", "$value": "#DDEDE0" },
        "300": { "$type": "color", "$value": "#C0DCC6" },
        "400": { "$type": "color", "$value": "#9DC3A5" },
        "500": { "$type": "color", "$value": "#78A783" },
        "600": { "$type": "color", "$value": "#5C8A67" },
        "700": { "$type": "color", "$value": "#436A4D" },
        "800": { "$type": "color", "$value": "#2B4B33" },
        "900": { "$type": "color", "$value": "#142A1A" }
      },
      "amber": {
        "100": { "$type": "color", "$value": "#FFF4E5" },
        "200": { "$type": "color", "$value": "#F8E5C8" },
        "300": { "$type": "color", "$value": "#EFCE9D" },
        "400": { "$type": "color", "$value": "#DBAF6A" },
        "500": { "$type": "color", "$value": "#C48F2D" },
        "600": { "$type": "color", "$value": "#A67200" },
        "700": { "$type": "color", "$value": "#825500" },
        "800": { "$type": "color", "$value": "#5E3A00" },
        "900": { "$type": "color", "$value": "#371E00" }
      },
      "coral": {
        "100": { "$type": "color", "$value": "#FFF1ED" },
        "200": { "$type": "color", "$value": "#FFDED7" },
        "300": { "$type": "color", "$value": "#FFC3B7" },
        "400": { "$type": "color", "$value": "#F0A091" },
        "500": { "$type": "color", "$value": "#DC7B6A" },
        "600": { "$type": "color", "$value": "#BB5E4E" },
        "700": { "$type": "color", "$value": "#944437" },
        "800": { "$type": "color", "$value": "#6C2B22" },
        "900": { "$type": "color", "$value": "#41140D" }
      },
      "teal": {
        "100": { "$type": "color", "$value": "#EDF9F6" },
        "200": { "$type": "color", "$value": "#D8EDE9" },
        "300": { "$type": "color", "$value": "#B8DDD6" },
        "400": { "$type": "color", "$value": "#91C3BB" },
        "500": { "$type": "color", "$value": "#68A89E" },
        "600": { "$type": "color", "$value": "#4B8B81" },
        "700": { "$type": "color", "$value": "#336B63" },
        "800": { "$type": "color", "$value": "#1D4B45" },
        "900": { "$type": "color", "$value": "#092B26" }
      },
      "sand": {
        "100": { "$type": "color", "$value": "#F7F6F1" },
        "200": { "$type": "color", "$value": "#EBE8DE" },
        "300": { "$type": "color", "$value": "#D9D3C3" },
        "400": { "$type": "color", "$value": "#BFB7A2" },
        "500": { "$type": "color", "$value": "#A3997F" },
        "600": { "$type": "color", "$value": "#867D63" },
        "700": { "$type": "color", "$value": "#675F49" },
        "800": { "$type": "color", "$value": "#484231" },
        "900": { "$type": "color", "$value": "#292418" }
      },
      "base": {
        "white":     { "$type": "color", "$value": "#FFFFFF" },
        "ink":       { "$type": "color", "$value": "#1A1A1A" },
        "ink-soft":  { "$type": "color", "$value": "#6B645A" },
        "cream":     { "$type": "color", "$value": "#F5EDE0" },
        "cream-hi":  { "$type": "color", "$value": "#FBF4D9" },
        "paper":     { "$type": "color", "$value": "#F0EAD9" },
        "paper-soft":{ "$type": "color", "$value": "#9BAFA9" },
        "night":     { "$type": "color", "$value": "#14201F" },
        "night-card":{ "$type": "color", "$value": "#1D2B29" },
        "night-line":{ "$type": "color", "$value": "#2C3B39" },
        "night-line-strong": { "$type": "color", "$value": "#5C7C76" },
        "night-fg-subtle":   { "$type": "color", "$value": "#6E837E" }
      }
    },
    "font": {
      "display": { "$type": "fontFamily", "$value": ["Baloo 2", "Trebuchet MS", "Segoe UI", "system-ui", "sans-serif"] },
      "ui":      { "$type": "fontFamily", "$value": ["Inter", "-apple-system", "Segoe UI", "Roboto", "sans-serif"] },
      "voice":   { "$type": "fontFamily", "$value": ["Caveat", "Bradley Hand", "cursive"] }
    },
    "size": {
      "0": { "$type": "dimension", "$value": "0px" },
      "2": { "$type": "dimension", "$value": "2px" },
      "4": { "$type": "dimension", "$value": "4px" },
      "8": { "$type": "dimension", "$value": "8px" },
      "12": { "$type": "dimension", "$value": "12px" },
      "16": { "$type": "dimension", "$value": "16px" },
      "24": { "$type": "dimension", "$value": "24px" },
      "32": { "$type": "dimension", "$value": "32px" },
      "40": { "$type": "dimension", "$value": "40px" },
      "48": { "$type": "dimension", "$value": "48px" },
      "64": { "$type": "dimension", "$value": "64px" },
      "80": { "$type": "dimension", "$value": "80px" },
      "96": { "$type": "dimension", "$value": "96px" },
      "128": { "$type": "dimension", "$value": "128px" }
    }
  },
  "semantic": {
    "light": {
      "bg": {
        "canvas":  { "$type": "color", "$value": "{primitive.color.base.white}" },
        "subtle":  { "$type": "color", "$value": "{primitive.color.base.cream}" },
        "raised":  { "$type": "color", "$value": "{primitive.color.base.white}" },
        "sunken":  { "$type": "color", "$value": "{primitive.color.sand.100}" },
        "inverse": { "$type": "color", "$value": "{primitive.color.base.night}" }
      },
      "fg": {
        "default":   { "$type": "color", "$value": "{primitive.color.base.ink}" },
        "muted":     { "$type": "color", "$value": "{primitive.color.base.ink-soft}" },
        "subtle":    { "$type": "color", "$value": "{primitive.color.sand.600}" },
        "on-accent": { "$type": "color", "$value": "{primitive.color.base.white}" },
        "inverse":   { "$type": "color", "$value": "{primitive.color.base.paper}" }
      },
      "border": {
        "default": { "$type": "color", "$value": "#E3D9C4" },
        "strong":  { "$type": "color", "$value": "{primitive.color.sand.600}" },
        "focus":   { "$type": "color", "$value": "{primitive.color.plum.700}" }
      },
      "accent":  { "default": { "$type": "color", "$value": "{primitive.color.plum.700}" },
                   "hover":   { "$type": "color", "$value": "{primitive.color.plum.800}" },
                   "subtle":  { "$type": "color", "$value": "{primitive.color.plum.200}" } },
      "income":  { "default": { "$type": "color", "$value": "{primitive.color.sage.700}" },
                   "subtle":  { "$type": "color", "$value": "{primitive.color.sage.200}" } },
      "expense": { "default": { "$type": "color", "$value": "{primitive.color.coral.700}" },
                   "subtle":  { "$type": "color", "$value": "{primitive.color.coral.200}" } },
      "warning": { "default": { "$type": "color", "$value": "{primitive.color.amber.700}" },
                   "subtle":  { "$type": "color", "$value": "{primitive.color.amber.200}" } },
      "info":    { "default": { "$type": "color", "$value": "{primitive.color.teal.700}" } },
      "danger":  { "default": { "$type": "color", "$value": "{primitive.color.coral.800}" } },
      "overlay": { "scrim":   { "$type": "color", "$value": "rgba(26,26,26,0.45)" } }
    },
    "dark": {
      "bg": {
        "canvas":  { "$type": "color", "$value": "{primitive.color.base.night}" },
        "subtle":  { "$type": "color", "$value": "{primitive.color.base.night-card}" },
        "raised":  { "$type": "color", "$value": "{primitive.color.base.night-card}" },
        "sunken":  { "$type": "color", "$value": "{primitive.color.teal.900}" },
        "inverse": { "$type": "color", "$value": "{primitive.color.base.paper}" }
      },
      "fg": {
        "default":   { "$type": "color", "$value": "{primitive.color.base.paper}" },
        "muted":     { "$type": "color", "$value": "{primitive.color.base.paper-soft}" },
        "subtle":    { "$type": "color", "$value": "{primitive.color.base.night-fg-subtle}" },
        "on-accent": { "$type": "color", "$value": "{primitive.color.base.ink}" },
        "inverse":   { "$type": "color", "$value": "{primitive.color.base.ink}" }
      },
      "border": {
        "default": { "$type": "color", "$value": "{primitive.color.base.night-line}" },
        "strong":  { "$type": "color", "$value": "{primitive.color.base.night-line-strong}" },
        "focus":   { "$type": "color", "$value": "{primitive.color.plum.400}" }
      },
      "accent":  { "default": { "$type": "color", "$value": "{primitive.color.plum.500}" },
                   "hover":   { "$type": "color", "$value": "{primitive.color.plum.400}" },
                   "subtle":  { "$type": "color", "$value": "{primitive.color.plum.900}" } },
      "income":  { "default": { "$type": "color", "$value": "{primitive.color.sage.500}" },
                   "subtle":  { "$type": "color", "$value": "{primitive.color.sage.900}" } },
      "expense": { "default": { "$type": "color", "$value": "{primitive.color.coral.500}" },
                   "subtle":  { "$type": "color", "$value": "{primitive.color.coral.900}" } },
      "warning": { "default": { "$type": "color", "$value": "{primitive.color.amber.400}" },
                   "subtle":  { "$type": "color", "$value": "{primitive.color.amber.900}" } },
      "info":    { "default": { "$type": "color", "$value": "{primitive.color.teal.400}" } },
      "danger":  { "default": { "$type": "color", "$value": "{primitive.color.coral.400}" } },
      "overlay": { "scrim":   { "$type": "color", "$value": "rgba(9,43,38,0.65)" } }
    }
  },
  "typography": {
    "display-xl": { "$type": "typography", "$value": { "fontFamily": "{primitive.font.display}", "fontSize": "56px", "fontWeight": 800, "lineHeight": 1.02, "letterSpacing": "-0.02em" } },
    "display-l":  { "$type": "typography", "$value": { "fontFamily": "{primitive.font.display}", "fontSize": "44px", "fontWeight": 800, "lineHeight": 1.06, "letterSpacing": "-0.015em" } },
    "heading-l":  { "$type": "typography", "$value": { "fontFamily": "{primitive.font.display}", "fontSize": "32px", "fontWeight": 700, "lineHeight": 1.15, "letterSpacing": "-0.01em" } },
    "heading-m":  { "$type": "typography", "$value": { "fontFamily": "{primitive.font.display}", "fontSize": "24px", "fontWeight": 700, "lineHeight": 1.25, "letterSpacing": "0" } },
    "heading-s":  { "$type": "typography", "$value": { "fontFamily": "{primitive.font.display}", "fontSize": "18px", "fontWeight": 700, "lineHeight": 1.35, "letterSpacing": "0" } },
    "body-l":     { "$type": "typography", "$value": { "fontFamily": "{primitive.font.ui}", "fontSize": "18px", "fontWeight": 500, "lineHeight": 1.625, "letterSpacing": "0" } },
    "body-m":     { "$type": "typography", "$value": { "fontFamily": "{primitive.font.ui}", "fontSize": "16px", "fontWeight": 400, "lineHeight": 1.55, "letterSpacing": "0" } },
    "body-s":     { "$type": "typography", "$value": { "fontFamily": "{primitive.font.ui}", "fontSize": "14px", "fontWeight": 400, "lineHeight": 1.50, "letterSpacing": "0" } },
    "label":      { "$type": "typography", "$value": { "fontFamily": "{primitive.font.ui}", "fontSize": "12px", "fontWeight": 600, "lineHeight": 1.35, "letterSpacing": "0.08em", "textTransform": "uppercase" } },
    "money-hero": { "$type": "typography", "$value": { "fontFamily": "{primitive.font.ui}", "fontSize": "44px", "fontWeight": 700, "lineHeight": 1.06, "letterSpacing": "-0.01em", "fontVariantNumeric": "tabular-nums" } },
    "money-m":    { "$type": "typography", "$value": { "fontFamily": "{primitive.font.ui}", "fontSize": "18px", "fontWeight": 600, "lineHeight": 1.4, "fontVariantNumeric": "tabular-nums" } },
    "money-s":    { "$type": "typography", "$value": { "fontFamily": "{primitive.font.ui}", "fontSize": "14px", "fontWeight": 600, "lineHeight": 1.4, "fontVariantNumeric": "tabular-nums" } },
    "voice":      { "$type": "typography", "$value": { "fontFamily": "{primitive.font.voice}", "fontSize": "26px", "fontWeight": 600, "lineHeight": 1.3 } }
  },
  "radius": {
    "sm":   { "$type": "dimension", "$value": "8px" },
    "md":   { "$type": "dimension", "$value": "12px" },
    "lg":   { "$type": "dimension", "$value": "16px" },
    "xl":   { "$type": "dimension", "$value": "24px" },
    "2xl":  { "$type": "dimension", "$value": "32px" },
    "full": { "$type": "dimension", "$value": "9999px" }
  },
  "elevation": {
    "light": {
      "1": { "$type": "shadow", "$value": { "offsetX": "0", "offsetY": "1px", "blur": "2px", "spread": "0", "color": "rgba(26,26,26,0.06)" } },
      "2": { "$type": "shadow", "$value": { "offsetX": "0", "offsetY": "4px", "blur": "12px", "spread": "0", "color": "rgba(26,26,26,0.08)" } },
      "3": { "$type": "shadow", "$value": { "offsetX": "0", "offsetY": "12px", "blur": "32px", "spread": "0", "color": "rgba(26,26,26,0.12)" } },
      "4": { "$type": "shadow", "$value": { "offsetX": "0", "offsetY": "24px", "blur": "64px", "spread": "0", "color": "rgba(26,26,26,0.16)" } }
    },
    "dark": {
      "$description": "No modo noite a elevação é superfície + borda, não sombra.",
      "1": { "$type": "strategy", "$value": "bg.raised + 1px border.default" },
      "2": { "$type": "strategy", "$value": "bg.raised + 1px border.default" },
      "3": { "$type": "strategy", "$value": "night-card + 1px night-line-strong" },
      "4": { "$type": "strategy", "$value": "teal.800 + 1px night-line-strong" }
    }
  },
  "motion": {
    "duration": {
      "instant": { "$type": "duration", "$value": "100ms" },
      "fast":    { "$type": "duration", "$value": "160ms" },
      "base":    { "$type": "duration", "$value": "240ms" },
      "slow":    { "$type": "duration", "$value": "380ms" },
      "spring":  { "$type": "duration", "$value": "520ms" }
    },
    "easing": {
      "standard":   { "$type": "cubicBezier", "$value": [0.2, 0, 0, 1] },
      "decelerate": { "$type": "cubicBezier", "$value": [0.32, 0.72, 0, 1] },
      "accelerate": { "$type": "cubicBezier", "$value": [0.4, 0, 1, 1] },
      "overshoot":  { "$type": "cubicBezier", "$value": [0.34, 1.42, 0.64, 1] }
    }
  },
  "grid": {
    "xs":  { "min": "320px",  "columns": 4,  "gutter": "16px", "margin": "16px", "max": "fluid" },
    "sm":  { "min": "480px",  "columns": 4,  "gutter": "16px", "margin": "24px", "max": "fluid" },
    "md":  { "min": "768px",  "columns": 8,  "gutter": "24px", "margin": "32px", "max": "720px" },
    "lg":  { "min": "1024px", "columns": 12, "gutter": "24px", "margin": "40px", "max": "960px" },
    "xl":  { "min": "1280px", "columns": 12, "gutter": "32px", "margin": "64px", "max": "1200px" },
    "2xl": { "min": "1536px", "columns": 12, "gutter": "32px", "margin": "80px", "max": "1320px" }
  }
}
```

### Pipeline de build sugerido

```
tokens/design-tokens.json
   │
   ├─ style-dictionary build
   │     ├─ css/variables.css      → :root e [data-theme="dark"]
   │     ├─ js/tokens.ts           → objeto tipado para Storybook e testes
   │     ├─ tailwind/theme.cjs     → theme.extend do Tailwind
   │     └─ ios/Tokens.swift · android/tokens.xml  (quando houver app nativo)
   │
   └─ Tokens Studio (plugin do Figma) → sincroniza a mesma fonte na biblioteca
```

Regra de governança: **o JSON é a fonte da verdade.** Figma e código consomem, nenhum dos dois
edita valor direto. PR que altera token exige revisão de quem mantém o design system.

---

## 1.11 Guia de handoff para desenvolvimento

### O que o desenvolvedor recebe

1. `design-tokens.json` (acima) — nunca hex solto em componente.
2. Link do arquivo Figma com a biblioteca `regua/` publicada (estrutura na Parte 5).
3. Este documento, seções 1.9 (estados) e 8 (implementação).

### Contrato de nomenclatura

| Camada | Padrão | Exemplo |
|---|---|---|
| Primitivo | `{família}-{nível}` | `plum-700` |
| Semântico | `{papel}/{variação}` | `income/subtle` |
| Componente | `{componente}/{parte}/{estado}` | `button/primary/bg-hover` |
| Componente React | PascalCase | `TransactionRow` |
| Prop booleana | `is`/`has` | `isLoading`, `hasError` |
| Prop de variante | string union | `variant="primary" \| "secondary"` |
| Classe utilitária | Tailwind com token | `bg-accent text-on-accent` |

### Checklist de aceite (definition of done por componente)

- [ ] Usa **apenas** tokens semânticos — `grep` por `#` no arquivo retorna vazio
- [ ] Os 8 estados implementados e visíveis no Storybook
- [ ] `focus-visible` presente e nunca suprimido por `outline: none` sem substituto
- [ ] Alvo de toque ≥ 44×44 verificado no inspetor
- [ ] Funciona nos dois temas — testado com `data-theme` alternado
- [ ] Contraste de texto ≥ 4.5:1 e de contorno de controle ≥ 3:1 (teste automatizado)
- [ ] Navegável só por teclado, ordem de foco igual à ordem visual
- [ ] Nome acessível correto no leitor de tela (VoiceOver ou TalkBack)
- [ ] `prefers-reduced-motion` respeitado
- [ ] Layout íntegro com o texto do sistema em 200% (`text-size-adjust`)
- [ ] Textos em PT-BR revisados contra o glossário de voz (Parte 2.3)
- [ ] Nenhum salto de layout (CLS) entre `loading` e `default`

### O que sempre entra na anotação da tela no Figma

Ordem de leitura numerada · variantes usadas com o nome exato do componente · comportamento
responsivo em `xs`/`md`/`lg` · estados não desenhados mas obrigatórios ("este card também tem
`error` — ver 1.9.19") · fonte do dado (qual campo da API) · texto de cada estado vazio e de erro ·
rótulo acessível de cada ícone · o que acontece offline.

### Erros mais comuns a evitar (observados no site atual)

| Erro | Correção |
|---|---|
| Amber claro como texto sobre branco | `amber-700`; ver 1.4 |
| Borda `#E3D9C4` delimitando controle | `border/strong` em qualquer coisa clicável |
| Botão implementado como `div` com `onClick` | `<button>` real |
| Um único hex para uma cor "de marca" | par claro/escuro; ver 1.3 |
| Line-height 1.5 em h2 de 28px | `heading-*` usa 1.15–1.35; 1.5 é para corpo |
| Número de dinheiro em Baloo 2 | `money-*` sempre Inter tabular |

---

<a name="parte-2"></a>
# PARTE 2 — IDENTIDADE DE MARCA

## 2.1 Estratégia de marca

### O problema que a marca resolve (não é o que parece)

O mercado de finanças pessoais vende **controle**. Todo concorrente promete que você vai
dominar seu dinheiro: dashboards, categorias, gráficos, metas, gamificação. Isso funciona para
quem já gosta de planilha — e é exatamente quem **não** é o público do Tá Resolvido.

Para o resto das pessoas, esses produtos não falham por serem ruins. Falham porque cobram uma
**dívida diária de atenção** de alguém que já está no limite. E, pior, transformam o abandono
em prova de fracasso pessoal: "eu não tenho disciplina".

O Tá Resolvido não vende controle. Vende **descarga mental**. O produto não é "você organiza
melhor" — é "isso sai da sua cabeça". A frase final da landing page já diz sozinha:
*"Tá na hora de tirar isso da sua cabeça."* Essa é a marca inteira em sete palavras.

### Declarações centrais

| Elemento | Formulação |
|---|---|
| **Propósito** | Tirar o dinheiro da lista de coisas que a pessoa precisa aguentar sozinha. |
| **Posicionamento** | Para quem já tentou e desistiu de apps e planilhas, o Tá Resolvido é o único jeito de organizar o mês inteiro sem rotina diária: você manda uma foto, um áudio ou uma frase — e acabou. |
| **Promessa** | O que você mandar, a gente organiza. |
| **Prova** | Foto do extrato inteiro lançada em segundos · áudio virando lançamento categorizado · zero conexão bancária · lançamento manual sem perda de função. |
| **Inimigo declarado** | A rotina diária de lançar gasto. E a culpa que sobra quando ela é abandonada. |
| **Recusa deliberada** | Não somos o mais barato, não temos gráfico de investimento, não integramos com banco, não temos controle categoria-a-categoria em tempo real. Isso está escrito na própria landing page — e é a coisa mais forte que a marca faz. |
| **Assinatura** | **Tá resolvido.** (frase, não slogan — cabe como resposta no fim de qualquer interação) |

### Arquitetura da promessa em três níveis

- **Funcional:** organiza o mês com uma foto, um áudio ou uma frase.
- **Emocional:** você para de carregar isso. Sem culpa por não ter dado conta antes.
- **Identitária:** você não é desorganizado. Você é uma pessoa ocupada que finalmente achou algo do seu tamanho.

### Público

**Núcleo:** mulheres de 28 a 45 anos, com renda própria, alta carga de tarefas invisíveis
(casa, filhos, trabalho), que já tentaram pelo menos dois apps ou planilhas e abandonaram.
Não são analfabetas financeiras — são pessoas sem folga de atenção.

**Fronteira (atender, não perseguir):** homens com o mesmo perfil de sobrecarga; autônomos que
misturam PF e PJ; casais que querem uma visão comum.

**Fora:** entusiastas de finanças, investidores, caçadores de preço.

### Território de marca em uma frase para cada canal

- **Site:** "Seu mês cabe numa foto."
- **App:** "Manda. A gente resolve."
- **Instagram:** "Coisas que ninguém devia ter que fazer na mão."
- **E-mail:** "Seu mês, sem você ter que abrir nada."

---

## 2.2 Arquétipos

**Arquétipo primário — O Cuidador (70%).**
A marca existe para tirar peso do outro. Ela assume o trabalho, não delega de volta. Isso
aparece na estrutura de cada frase do produto: o sujeito da ação é sempre "a gente"
("a gente organiza", "a gente lê só o que está ali", "a gente devolve tudo").
*Risco do arquétipo:* virar maternal, condescendente ou piegas. Antídoto: o Cuidador aqui não
consola — ele resolve. Nada de "está tudo bem, você consegue!".

**Arquétipo secundário — O Homem Comum / A Pessoa Como Você (20%).**
Nada de autoridade financeira. A fundadora se apresenta como igual, não como especialista:
"Sou mãe, trabalho fora, e não sobra tempo nem energia". A marca fala de dentro do problema,
nunca de cima dele. É isso que sustenta a honestidade das seções "não é pra você se…".
*Risco:* soar amadora. Antídoto: a execução do produto é impecável; a simplicidade é escolha,
não limitação.

**Tempero — O Fora-da-Lei (10%).**
A recusa é ativa. "Você não precisa de mais disciplina" é uma frase contra a indústria inteira
de finanças pessoais. A marca pode e deve nomear o inimigo: a planilha de 12 abas, o app que
exige login no banco, o coach que culpa quem desistiu.
*Risco:* virar cinismo. Antídoto: nunca ataca o usuário nem outra pessoa — só o método.

**O que a marca nunca é:** Sábio (não dá aula de finanças), Herói (não promete transformação
por esforço), Mago (não vende mágica de IA — o texto já diz "não é fórmula mágica").

### Régua de decisão

> Em qualquer dúvida de tom, layout ou funcionalidade, pergunte:
> **"isso tira peso da pessoa ou devolve peso para ela?"**
> Se devolve — mesmo que seja bonito, mesmo que os concorrentes façam — não entra.

---

## 2.3 Identidade verbal

### Princípios de escrita

1. **Frase curta. Ponto final.** Média de 12 palavras. Nunca duas orações subordinadas.
2. **Segunda pessoa para a dor, primeira do plural para a solução.** "Você já tentou" / "a gente organiza".
3. **Nomeie o comportamento, não o defeito.** "Você usou a planilha por uma semana" ✓ ·
   "você não tem disciplina" ✗.
4. **Verbo no lugar de substantivo abstrato.** "Manda o print" ✓ · "realize o envio do comprovante" ✗.
5. **Zero jargão financeiro.** Proibido: fluxo de caixa, orçamento base zero, patrimônio líquido,
   educação financeira, saúde financeira, jornada, mindset.
6. **Números escritos como se falam.** "R$ 24,90 por mês", "primeiro mês por R$ 14,90".
7. **A marca nunca usa exclamação em interface.** Só em post, no máximo uma por peça.
8. **Emoji:** no Instagram sim, com parcimônia; no produto, nunca; em e-mail, no máximo um, no assunto.

### Glossário — como chamamos as coisas

| Sempre | Nunca |
|---|---|
| lançamento | transação, movimentação |
| entrou / saiu | receita / despesa, crédito / débito |
| régua do mês | dashboard, timeline, painel |
| a gente organiza | nosso algoritmo processa |
| manda uma foto | faça upload do comprovante |
| comentário do seu mês | insight, análise, relatório |
| limite | budget, orçamento |
| conta fixa | recorrência, despesa recorrente |
| plano completo | plano premium, pro, plus |

### Tom por contexto

| Contexto | Tom | Exemplo |
|---|---|---|
| Aquisição | Reconhecimento + alívio | "Você já tentou. Mais de uma vez." |
| Onboarding | Direto, uma coisa por vez | "Manda o print de qualquer extrato. Eu leio." |
| Confirmação | Curto, sem festa | "Tá resolvido." |
| Aviso de limite | Fato + tempo, sem julgamento | "Você já usou 80% do que separou pra Mercado. Faltam 11 dias." |
| Erro | Culpa é nossa + saída | "Não consegui ler esse print. Manda outra foto ou lança na mão." |
| Cobrança/renovação | Transparência total | "Sua assinatura renova dia 12 por R$ 24,90. Dá pra cancelar aqui." |
| Cancelamento | Sem retenção agressiva | "Cancelado. Seus dados ficam aqui por 90 dias, caso mude de ideia." |

---

## 2.4 Três direções de logo

**Ativo existente:** hoje a marca usa um check creme dentro de um círculo verde-escuro, com um
ponto âmbar. É um símbolo genérico — "check dentro de círculo" é a marca mais repetida da
internet — mas o *conceito* está certo: o check é o "tá resolvido". As três direções abaixo
partem desse acerto conceitual e resolvem o problema de distintividade.

---

### Direção A — **"O Check da Régua"** (evolução, risco baixo)

**Conceito.** O check não é um ícone importado: ele *é* a régua do mês. O traço curto que desce
representa o que saiu; o traço longo que sobe, o que entrou. A marca vira um gráfico de duas
barras que, lido rápido, é um check.

**Construção.** Dois traços de terminação chanfrada (não arredondada) em ângulo de 38°/52°,
sobre grade de 24×24. Traço descendente com 40% do comprimento do ascendente. Espessura
constante de 3.5u em 24u. Um ponto de 2u no topo do traço ascendente, em amber — é o "hoje" da
régua, e é o único elemento que muda de cor entre versões.

**Racional.** Une símbolo e produto num só gesto: quem já usou o app reconhece a régua; quem
nunca usou vê um check. Escala perfeitamente até 16px (favicon) porque são dois traços.
Funciona em monocromia. Evolui o logo atual sem jogar fora o reconhecimento dos 18 posts existentes.

**Riscos.** Continua sendo um check — a distintividade depende inteiramente do chanfro e da
proporção assimétrica. Exige rigor: um designer que "arredonde para ficar mais fofo" mata a ideia.

**Onde brilha.** Ícone de app, favicon, avatar do Instagram, marca d'água em post.

---

### Direção B — **"Tá"** (letra, risco médio, maior distintividade)

**Conceito.** O símbolo abandona o check e vira o **acento agudo do "Tá"** — o til/acento
flutuando sozinho sobre o vazio. Uma marca tipográfica em que o elemento memorável é o
diacrítico, algo que praticamente nenhuma marca global pode usar. É inequivocamente brasileiro
e inequivocamente coloquial: "tá" é a palavra que a gente usa quando algo já está resolvido.

**Construção.** Wordmark "tá resolvido" em Baloo 2 800, caixa baixa, tracking -0.02em, com o
acento do "á" desenhado em escala 1.6× e na cor de acento. O símbolo isolado é esse acento:
um traço inclinado a 62°, terminação chanfrada, proporção 1:2.4.

**Racional.** Distintividade altíssima ao custo quase zero — o ativo já está no nome. Resolve o
problema de o logotipo atual não ter wordmark nenhum. O acento sozinho funciona como "pingo"
recorrente em todo material gráfico (topo de card, fim de frase, ponto de destaque na régua),
criando um sistema, não só um logo.

**Riscos.** Um acento isolado pode não ser lido como marca fora de contexto até haver
reconhecimento. Exige uso disciplinado do par símbolo+wordmark por pelo menos 12 meses antes de
soltar o símbolo sozinho. Problemas em mercados sem acentuação (irrelevante hoje: o produto é BR).

**Onde brilha.** Wordmark de site, cabeçalho de e-mail, assinatura de vídeo, papelaria, camiseta.

---

### Direção C — **"O Print"** (conceitual, risco alto, maior potência de campanha)

**Conceito.** A marca é o **retângulo com canto dobrado** — a forma universal de "um print,
um comprovante, um papel" — com o interior resolvido: em vez de linhas de texto, uma única
linha de régua atravessa. Ou seja: o caos de um extrato virou uma linha só.

**Construção.** Retângulo `radius-sm` proporção 3:4, canto superior direito dobrado a 45° (a
dobra é vazada, deixando ver o fundo). Dentro, uma linha horizontal com três pontos de tamanhos
diferentes. Grade 24×24, espessura 2u.

**Racional.** É a única das três que conta a **transformação**, não o resultado. É a marca com
mais gordura para campanha: a dobra pode animar (o papel se dobrando vira o logo), o retângulo
pode enquadrar fotos reais de extrato nos anúncios, o interior pode receber conteúdo real
(um print, um valor, um rosto) virando um sistema de moldura de marca inteiro.

**Riscos.** Mais complexa: perde legibilidade abaixo de 24px, o que compromete favicon e ícone
de app — exigiria uma redução própria (só a dobra + a linha). Menos "amigável" que um check,
mais próxima de fintech genérica se mal executada. E abandona 100% do reconhecimento acumulado.

**Onde brilha.** Campanha, key visual, moldura de conteúdo, motion, embalagem de material impresso.

---

### Recomendação

**B como wordmark + A como símbolo.** As duas se combinam sem conflito: "tá resolvido" com o
acento em destaque resolve a ausência de logotipo, e o check-régua continua sendo o ícone de app
e o avatar — preservando os 18 posts e o reconhecimento existente. C fica guardada como
**sistema de moldura de campanha** (Parte 4), onde ela é forte, sem virar a marca.

### Especificações válidas para as três

| Item | Regra |
|---|---|
| Área de proteção | igual à altura do símbolo (1×), em todos os lados |
| Tamanho mínimo | símbolo 16px digital / 8mm impresso · lockup horizontal 96px / 24mm |
| Lockups | horizontal (símbolo + wordmark), vertical (empilhado), símbolo isolado, wordmark isolado |
| Versões de cor | acento sobre fundo escuro · acento sobre fundo claro · monocromático `paper` · monocromático `ink` · vazado (contorno) |
| Fundo permitido | `night`, `white`, `cream`, `paper`, `teal-800`, foto com scrim mínimo de 40% |
| Proibido | rotacionar, aplicar gradiente, sombra, contorno duplo, distorcer proporção, recolorir para fora da paleta, colocar dentro de outra forma, usar sobre foto sem scrim, animar entrada com bounce |

---

## 2.5 Sistema de cor para todos os meios

Valores digitais em 1.2/1.3. Abaixo, os equivalentes para impressão. **CMYK calculado por
conversão direta; Pantone é aproximação a validar em guia físico antes de qualquer tiragem** —
tons plum e sage têm variação forte entre coated e uncoated.

| Cor | Papel na marca | HEX | RGB | CMYK (C/M/Y/K) | Pantone aprox. (a confirmar) |
|---|---|---|---|---|---|
| **Night** | fundo primário, cor "dona" da marca | `#14201F` | 20/32/31 | 38/0/3/87 | 5535 C · Black 3 C (uncoated) |
| **Paper** | tinta clara sobre escuro | `#F0EAD9` | 240/234/217 | 0/3/10/6 | 9226 C · Warm Gray 1 C (25%) |
| **Cream** | fundo alternado claro | `#F5EDE0` | 245/237/224 | 0/3/9/4 | 9163 C |
| **Ink** | texto sobre claro | `#1A1A1A` | 26/26/26 | 0/0/0/90 | Black 6 C |
| **Plum 500** | acento de marca (escuro) | `#B08CAE` | 176/140/174 | 0/20/1/31 | 5215 C |
| **Plum 700** | acento de marca (claro), CTA | `#725470` | 114/84/112 | 0/26/2/55 | 5195 C |
| **Sage 500** | entrou / sucesso (escuro) | `#78A783` | 120/167/131 | 28/0/22/35 | 5635 C · 557 C |
| **Sage 700** | entrou / sucesso (claro) | `#436A4D` | 67/106/77 | 37/0/27/58 | 5535 C · 561 C |
| **Amber 400** | meta / atenção (escuro) | `#DBAF6A` | 219/175/106 | 0/20/52/14 | 728 C |
| **Amber 700** | meta / atenção (claro) | `#825500` | 130/85/0 | 0/35/100/49 | 154 C · 1405 C |
| **Coral 500** | saiu (escuro) | `#DC7B6A` | 220/123/106 | 0/44/52/14 | 486 C |
| **Coral 700** | saiu (claro) | `#944437` | 148/68/55 | 0/54/63/42 | 1685 C |
| **Teal 800** | superfície muito elevada | `#1D4B45` | 29/75/69 | 61/0/8/71 | 3308 C · 5473 C |

**Proporção de uso (regra 60-30-10-1):**
60% superfície (`night` ou `white`/`cream`) · 30% tinta (`paper` ou `ink`) ·
10% acento de marca (`plum`) · 1% acentos de dado (`sage`/`coral`/`amber`, e **só onde há dado**).

Os acentos de dado nunca decoram. Se sage aparece numa peça, é porque ali há dinheiro que entrou.

**Impressão:** em fundo `night` chapado, especificar Pantone sólido em vez de CMYK — a soma de
tinta em 128% cria rachadura em dobra. Papel recomendado: offset natural 120g (miolo) e
cartão reciclado 300g (capa), ambos não revestidos, que puxam o creme da paleta.

---

## 2.6 Pareamento tipográfico

| Papel | Fonte | Por quê |
|---|---|---|
| **Display** | **Baloo 2** (700/800) | Grotesca arredondada, x-height alto, terminações macias. É o "Cuidador" em forma de letra. Tem suporte completo a latim estendido (essencial: "tá", "mês", "você"). Variável, Open Font License. |
| **Texto e dados** | **Inter** (400/500/600/700) | Neutra, altíssima legibilidade em corpo pequeno, e — decisivo — **tabular figures reais**, o que Baloo 2 não tem. Todo número de dinheiro depende disso. |
| **Voz** | **Caveat** (600) | Manuscrita de baixa afetação, sem laçarote. Usada só para a voz da Mariana. |

**A tensão é o ativo.** Título arredondado + número tabular é a tradução tipográfica exata do
posicionamento: acolhedor com você, rigoroso com seu dinheiro. Nenhum concorrente do segmento
faz isso — eles usam a mesma sans para tudo.

**Regras de pareamento:**

- Baloo 2 e Inter **nunca no mesmo tamanho**, na mesma linha. Se estiverem juntas, no mínimo
  dois níveis de diferença na escala.
- Caveat **nunca ao lado de número**. Nunca em botão, campo, rótulo ou aviso.
- Um bloco de texto tem **uma** fonte. Ênfase dentro de parágrafo é peso (600), nunca troca de família.
- Em peça impressa sem acesso a webfont: Baloo 2 → Quicksand Bold; Inter → Source Sans 3.

**Alternativas licenciadas para vídeo/motion**, quando o render não embute a fonte:
Baloo 2 → Baloo Bhaijaan 2 (mesma família) · Inter → Inter Tight (mesma métrica).

---

## 2.7 Guia de estilo visual

### Fotografia

**Sim:** casa real, mesa de cozinha com coisas em cima, luz de janela, celular na mão de quem
está em pé, criança fora de foco no fundo, roupa comum, a Mariana falando à câmera sem
maquiagem de estúdio, extrato de papel amassado, o print real na tela.

**Não:** escritório com vidro, aperto de mão, laptop em mármore, mulher rindo sozinha com
salada, gráfico subindo, moeda empilhada, cofrinho de porquinho, família branca sorrindo em
sofá bege, ninguém usando terno.

**Tratamento:** temperatura levemente quente (+150K), sombras abertas, contraste médio,
zero saturação artificial. Grão sutil permitido. Nunca preto e branco.

### Ilustração e ícone

Ícones de traço 2px, terminação arredondada, grade 24, canto `radius-sm`. Biblioteca base:
Lucide (mesma métrica, licença MIT), com um conjunto próprio para as categorias de gasto.
Ilustração: linha única sobre superfície chapada, no máximo duas cores + tinta, com um detalhe
manuscrito em Caveat. Nunca 3D, nunca isométrico, nunca personagens sem rosto tipo corporate.

### Layout e formas

O sistema tem **um formato-assinatura**: o *card de raio grande com faixa de acento à esquerda*
(`radius-xl` + 3px de cor à esquerda). Ele aparece no produto (lançamento), no site (benefício)
e no post (destaque) — é o que faz as três coisas parecerem a mesma marca.

Segundo elemento recorrente: **a linha da régua** — uma horizontal com pontos de tamanhos
diferentes. Pode aparecer como divisória de seção, rodapé de post, marca d'água de vídeo.

### Movimento

Nada quica. Nada gira. Transições deslizam e param. A única animação "feliz" autorizada é o
salvamento de um lançamento (`motion-spring`), e ela dura meio segundo.

### Do / Don't

| ✓ Faça | ✗ Não faça |
|---|---|
| Uma cor de acento por peça | Arco-íris de categorias na mesma tela |
| Número grande, contexto pequeno | Três números do mesmo tamanho |
| Foto real, imperfeita | Banco de imagem genérico |
| Frase da pessoa, entre aspas | Depoimento inventado ou sem nome |
| Espaço vazio como escolha | Preencher porque "sobrou espaço" |
| Coral como categoria | Coral como punição |
| Caveat uma vez por tela | Caveat como fonte de apoio |
| Escrever "tá resolvido" em caixa baixa | "TÁ RESOLVIDO" em caixa alta no corpo |

---

## 2.8 Estrutura do brand book — 20 páginas

Formato 210×210mm (quadrado), miolo offset natural 120g, capa cartão reciclado 300g,
lombada canoa. Versão digital em PDF com links internos.

| Pg. | Conteúdo | Observação de produção |
|---|---|---|
| 1 | **Capa** — símbolo em `paper` sobre `night` chapado, sem texto além do wordmark | Pantone sólido, não CMYK |
| 2 | **Sumário** + como usar este manual (a quem se aplica, quem aprova exceções) | — |
| 3 | **Por que existimos** — o propósito em 60 palavras, sobre página quase vazia | Muito respiro; é a página de tom |
| 4 | **Quem atendemos** — as 3 personas da Parte 3, uma frase cada, foto real | — |
| 5 | **Posicionamento** — a declaração completa + o inimigo + as recusas | Recusas em destaque; é o diferencial |
| 6 | **Arquétipos** — Cuidador / Pessoa Como Você / Fora-da-Lei, com o que cada um autoriza | Inclui a régua de decisão |
| 7 | **A marca em uma frase** — "Tá resolvido." e como usar a assinatura | — |
| 8 | **O símbolo** — construção em grade, conceito, versão final | Grade visível, cotas em unidades |
| 9 | **Wordmark e lockups** — 4 travamentos, área de proteção, tamanhos mínimos | Escala real impressa |
| 10 | **Versões de cor do logo** — 5 aplicações + fundos permitidos | — |
| 11 | **Usos proibidos** — 8 exemplos com X vermelho | Sempre a página mais consultada |
| 12 | **Paleta** — as 13 cores da tabela 2.5 em chapado, com HEX/RGB/CMYK/Pantone | Chapados grandes; verificar prova |
| 13 | **Proporção de cor** — a regra 60-30-10-1 mostrada em 3 layouts | — |
| 14 | **Tipografia** — as 3 famílias, espécime completo, a escala de 9 níveis | Espécime em tamanho real |
| 15 | **Tipografia aplicada** — 3 composições certas e 3 erradas | — |
| 16 | **Voz** — princípios, glossário "sempre/nunca", tom por contexto | Tabelas da 2.3 |
| 17 | **Fotografia** — grade de 9 imagens sim / 9 não | — |
| 18 | **Ícones, ilustração e formas-assinatura** — card com faixa, linha da régua | — |
| 19 | **Aplicações** — ícone de app, post, anúncio, e-mail, camiseta, papelaria | Mockups reais, não genéricos |
| 20 | **Contato e governança** — quem mantém, onde ficam os arquivos, como pedir exceção | Link para o Figma e para o repositório de tokens |

---

<a name="parte-3"></a>
# PARTE 3 — UI DO APLICATIVO

Toda a UI abaixo consome os componentes da seção 1.9 e os tokens da 1.3. Nada é redefinido aqui.

## 3.1 Personas

Derivadas diretamente do texto da landing page (a seção "é pra você se / não é pra você se" é,
na prática, um documento de persona já escrito) e do conteúdo do Instagram.

---

### P1 — Mariana, 36 · a Sobrecarregada Competente *(persona primária, ~65%)*

Analista, dois filhos, marido também trabalha fora. Ganha bem o suficiente para não estar em
apuros e mal o suficiente para o mês acabar antes. Já baixou três apps de finanças e fez uma
planilha bonita que durou uma semana.

- **Objetivo real:** parar de sentir que está deixando algo passar. Não quer relatório, quer sossego.
- **Momento de uso:** 22h40, no sofá, celular na mão, 4 minutos antes de dormir. Uma vez a cada 5 ou 10 dias.
- **Gatilho:** susto no extrato, ou fatura maior que o esperado.
- **Barreira nº 1:** rotina diária. Qualquer coisa que peça constância diária perde essa pessoa.
- **Barreira nº 2:** vergonha. Não quer que o app faça ela se sentir mal.
- **Não vai fazer:** conectar o banco, configurar 14 categorias, ler onboarding de 5 telas.
- **Frase dela:** *"Eu sei que gasto demais, só não sei exatamente onde."*
- **Implicação de design:** a tela inicial precisa entregar entendimento **sem nenhuma ação prévia**,
  e o caminho para lançar tem que caber num toque.

---

### P2 — Camila, 29 · a Autônoma que Mistura Tudo *(persona secundária, ~25%)*

Freela de design/social media. Recebe por Pix, em valores irregulares, e paga contas pessoais e
de trabalho da mesma conta. Comprovante espalhado por WhatsApp.

- **Objetivo real:** saber quanto realmente sobrou no mês e separar o que foi trabalho.
- **Momento de uso:** em rajada — junta 3 semanas de comprovante e resolve tudo num domingo.
- **Gatilho:** fim do mês, ou nota fiscal para emitir.
- **Barreira:** volume. Se lançar 40 itens exigir 40 interações, ela desiste no décimo.
- **Frase dela:** *"Eu tenho os comprovantes todos, só não tenho paciência de digitar."*
- **Implicação de design:** processamento em lote é requisito, não conveniência. A tela de
  revisão de vários lançamentos (tela 4) é a tela mais importante do app para ela.

---

### P3 — Rita, 52 · a Cética Cuidadosa *(persona de fronteira, ~10%)*

Trabalha em administração, filhos crescidos, ajuda a mãe idosa. Desconfia profundamente de
qualquer coisa que peça acesso a banco. Prefere caderno.

- **Objetivo real:** ter o controle que já tem, sem o caderno.
- **Barreira:** confiança e legibilidade. Texto pequeno é barreira física.
- **Frase dela:** *"Eu não vou dar minha senha do banco pra aplicativo nenhum."*
- **Implicação de design:** a promessa "sem conectar no banco" precisa estar visível dentro do
  produto e não só na landing; o caminho manual precisa ser tão bom quanto o automático (o site
  já promete isso: "também dá — sem perder nenhuma função"); e o app precisa aguentar texto em 200%.

---

## 3.2 Arquitetura de informação

```
TabBar (4 + ação central)
├── Régua            → tela 2 · home
│   └── Dia          → popover · lançamentos daquele dia
├── Categorias       → tela 6
│   └── Categoria    → lista filtrada + limite
├── [ + ]            → tela 3 · novo lançamento (sheet, não tela)
│      ├── Manual
│      ├── Foto/PDF  → tela 4 · revisão
│      └── Chat/Áudio→ tela 4 · revisão
├── Metas            → tela 7
└── Perfil           → tela 9 · assinatura, privacidade, exportar, sair
                       └── Resumo do mês → tela 8 (também entra por card na Régua)
```

Profundidade máxima: **3 níveis**. Nenhuma função essencial está atrás de mais de dois toques a
partir da home.

---

## 3.3 As 8 telas core

Wireframes em baixa fidelidade, mobile-first (390×844). Cotas em tokens de espaçamento.

---

### Tela 1 — Boas-vindas e primeiro lançamento

```
┌──────────────────────────────────────┐
│                                      │ space-48
│         ╲                            │
│          ╲                           │  símbolo (check-régua), 64
│       ╲    ●                         │
│                                      │ space-32
│   Oi. Vamos resolver seu mês.        │  heading-l
│                                      │ space-12
│   Não precisa configurar nada.       │  body-m · fg/muted
│   Manda uma coisa só, pra começar.   │
│                                      │ space-40
│  ┌────────────────────────────────┐  │
│  │  📷  Foto de um extrato        │  │  Card interactive · radius-xl
│  │      ou comprovante            │  │  space-24
│  └────────────────────────────────┘  │ space-12
│  ┌────────────────────────────────┐  │
│  │  🎙️  Falar um gasto            │  │
│  └────────────────────────────────┘  │ space-12
│  ┌────────────────────────────────┐  │
│  │  ✎   Escrever numa frase       │  │
│  └────────────────────────────────┘  │ space-24
│                                      │
│         Prefiro lançar na mão        │  Link tertiary
│                                      │ space-16
│  🔒 A gente não conecta no seu banco │  body-s · fg/muted · ícone info
│                                      │
└──────────────────────────────────────┘
```

**Decisões.** Zero campo de configuração. Nenhuma pergunta sobre renda, meta ou categoria — isso
é aprendido pelo uso. A promessa de privacidade aparece **na primeira tela**, por causa da P3.
As três opções são cards iguais em peso: o produto não decide por você qual jeito é "o certo".
Permissões (câmera, microfone) só são pedidas **depois** que a pessoa escolhe o caminho, com uma
frase explicando o porquê antes do diálogo do sistema.

**Estados:** default · permission-pending · permission-denied (mostra como reabilitar, oferece
o caminho manual) · returning-user (pula esta tela) · offline (esconde foto/áudio, mantém manual).

---

### Tela 2 — Régua do mês *(home)*

```
┌──────────────────────────────────────┐
│  ‹  Novembro  ›            [•••]     │  TopAppBar + MonthSwitcher
├──────────────────────────────────────┤
│                                      │ space-24
│   Sobrou R$ 1.323                    │  money-hero
│   Você gastou 12% menos que outubro  │  body-s · fg/muted
│                                      │ space-24
│  ┌────────────────────────────────┐  │
│  │ ↑ entrou                       │  │  RulerTimeline · Card
│  │   ●     ●        ●             │  │  ponto cheio = entrada (sage)
│  │ ──┼──┼──┼──┼──┼──╂──┼──┼──┼──  │  │  ╂ = hoje (accent)
│  │    ○  ○     ○  ○ │ ○   ○  ○    │  │  ponto vazado = saída (coral)
│  │ ↓ saiu           │             │  │
│  │  3  6  9  14  18 23  27        │  │  label
│  ├────────────────────────────────┤  │
│  │ Entrou R$ 4.200 · Saiu R$ 2.877│  │  money-s
│  │              ver como lista →  │  │  ← acessibilidade obrigatória
│  └────────────────────────────────┘  │ space-24
│                                      │
│   ONDE FOI                           │  label
│  ┌────────────────────────────────┐  │
│  │ 🛒 Mercado          R$ 842 ▓▓▓▓│  │  barra proporcional
│  │ 🚗 Transporte       R$ 410 ▓▓  │  │
│  │ 🏠 Casa             R$ 390 ▓▓  │  │
│  │                    ver tudo →  │  │
│  └────────────────────────────────┘  │ space-24
│  ┌────────────────────────────────┐  │
│  │ ⚠ Mercado: 80% do seu limite   │  │  InlineAlert warning
│  │   Faltam 11 dias.              │  │
│  └────────────────────────────────┘  │ space-24
│  ┌────────────────────────────────┐  │
│  │  "Mês mais leve que o passado, │  │  Card inverse · voice (Caveat)
│  │   e a diferença veio quase     │  │
│  │   toda do mercado."            │  │
│  │                 ver o mês →    │  │
│  └────────────────────────────────┘  │
│                              ┌────┐  │
├──────────────────────────────│ +  │──┤  FAB
│  Régua  Categorias  Metas  Perfil    │  TabBar
└──────────────────────────────────────┘
```

**Decisões.** "Sobrou R$ 1.323" é o único número em `money-hero` — princípio 5. A comparação com
o mês anterior aparece em texto, não em seta colorida, para não virar julgamento. O card de voz
(Caveat) é o "comentário sincero" prometido na landing, e é o **único** uso de Caveat da tela.
O alerta de limite usa amber e nomeia o tempo restante — informação, não bronca.

**Estados:** loading (skeleton do eixo + 3 linhas) · empty-first-month · empty-month
("nada lançado em novembro ainda — quer trazer de outubro as contas fixas?") · populated ·
dense (>60 lançamentos, agrupa por dia) · future-month (só recorrências previstas, em vazado) ·
offline (banner "mostrando o que já estava aqui") · sem-plano (o card de voz vira convite ao Completo).

---

### Tela 3 — Novo lançamento *(BottomSheet, altura full)*

```
┌──────────────────────────────────────┐
│              ▬▬▬                     │  alça
│  ‹                        Novo       │
│  ┌────────────────────────────────┐  │
│  │  Manual  │  Foto  │  ▸Chat◂    │  │  SegmentedControl
│  └────────────────────────────────┘  │ space-24
│                                      │
│                   ┌────────────────┐ │
│                   │ Farmácia 48    │ │  bolha do usuário · accent/subtle
│                   └────────────────┘ │ space-16
│  1 lançamento identificado —         │  body-s · fg/muted
│  confere antes de salvar             │
│  ┌────────────────────────────────┐  │
│  │ ⊙ Farmácia          − 48,00  🗑│  │  TransactionRow pending-AI
│  │   30/08/2026                   │  │  borda tracejada
│  │   [ Saúde            ▾ ]       │  │  Select inline
│  └────────────────────────────────┘  │ space-16
│  ┌────────────────────────────────┐  │
│  │        ✓  Salvar               │  │  Button primary income
│  └────────────────────────────────┘  │ space-24
│  ┌──────────────────────────────┬─┐  │
│  │ Escreve aqui...              │🎙│  │  TextField + AudioRecorder
│  └──────────────────────────────┴─┘  │
└──────────────────────────────────────┘
```

**Decisões.** É um sheet, não uma tela: a régua continua atrás, o gesto de fechar é o mesmo de
sempre, e o contexto nunca se perde. O resultado da IA aparece **como objeto editável antes de
salvar** — princípio 4. O botão de salvar usa a cor de entrada/sucesso, não a de marca, porque
aqui a ação é confirmar, não navegar. O campo de texto fica na base, onde o polegar está, e o
microfone divide o mesmo campo (padrão de mensageiro, já conhecido).

**Estados:** empty · typing · sending · processing (skeleton de linha) · identified (1 item) ·
identified-multi (→ tela 4) · not-understood ("não entendi esse. Quer escrever de outro jeito?") ·
duplicate-warning ("parece que isso já foi lançado dia 30 — lançar mesmo assim?") ·
quota-reached (grátis: "você usou seus 3 reconhecimentos do mês") · saving · saved · error-rede.

---

### Tela 4 — Revisão em lote *(depois de foto/PDF)*

```
┌──────────────────────────────────────┐
│  ‹   Confere aí        14 encontrados│
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │ [miniatura do print]  Extrato  │  │  Card · preview colapsável
│  │                    ver print ▾ │  │
│  └────────────────────────────────┘  │ space-16
│  ☑ Selecionar todos (14)     [Editar]│  Checkbox + ação em massa
│  ─────────────────────────────────── │
│  ☑ 🛒 Mercado Extra    −189,90  3/11 │  TransactionRow selecionável
│     Mercado ▾                        │
│  ☑ ⚡ Enel             −142,30  5/11 │
│     Casa ▾                           │
│  ☑ 💊 Drogasil          −48,00  8/11 │
│     Saúde ▾                          │
│  ☐ ❓ TRSF 4471         −350,00  9/11│  não categorizado · amber
│     [ escolher categoria ▾ ]         │
│  ☑ 📱 Claro parc. 3/12  −89,90 10/11 │  parcela detectada
│     Casa ▾ · 9 parcelas restantes    │  chip informativo
│  ...                                 │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │  barra fixa
│  │  Salvar 13 lançamentos         │  │  Button primary full-width
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Decisões.** É a tela da P2, e a métrica dela é **tempo até salvar 14 itens**. Tudo vem
pré-selecionado e pré-categorizado — a pessoa desmarca o que estiver errado, não confirma o que
está certo. Itens que a IA não entendeu sobem para o topo com marcação amber e ficam
**desmarcados**, porque exigem decisão. A detecção de parcela em andamento (diferencial citado
na landing: "até parcela que já tava andando") ganha chip próprio com o número restante.

**Estados:** processing · ready · nenhum-encontrado · parcialmente-legível ("li 9 de um print de
14 linhas — quer mandar de novo mais de perto?") · duplicados-detectados (agrupa e sugere pular) ·
salvando (progresso x/14) · salvo · erro-parcial ("11 salvos, 3 falharam — tentar de novo").

---

### Tela 5 — Detalhe e edição de lançamento

```
┌──────────────────────────────────────┐
│  ‹                        Excluir 🗑  │
├──────────────────────────────────────┤
│         − R$ 189,90                  │  money-hero · expense
│         Mercado Extra                │  heading-m
│                                      │ space-32
│  Categoria    [ 🛒 Mercado      ▾ ]  │  fila de campos
│  Data         [ 3 de novembro   ▾ ]  │
│  Tipo         [ Saiu ] [ Entrou ]    │  SegmentedControl
│  Conta fixa   [ ○───  ] não          │  Switch
│  Parcela      [ ○───  ] não          │  Switch
│  Observação   [ ................. ]  │  TextArea
│                                      │ space-24
│  ┌────────────────────────────────┐  │
│  │ ℹ Veio de um print de 08/11    │  │  InlineAlert info
│  │   ver print original           │  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│  [ Cancelar ]   [   Salvar   ]       │
└──────────────────────────────────────┘
```

**Decisões.** Toda correção aqui é sinal de treino ("aprende com suas correções"). Ao trocar a
categoria de um estabelecimento recorrente, o app pergunta uma única vez: *"Quer que 'Extra' vá
sempre para Mercado?"* — e nunca mais pergunta. Excluir usa `ConfirmSheet` (1.9.36), com o botão
destrutivo **fora** da posição de polegar padrão.

**Estados:** view · editing · dirty (botão salvar habilita) · saving · saved · deleting ·
conflito (editado em outro dispositivo) · read-only (lançamento de mês fechado).

---

### Tela 6 — Categorias

```
┌──────────────────────────────────────┐
│  ‹  Novembro  ›                      │
├──────────────────────────────────────┤
│         ╭─────────╮                  │
│        ╱           ╲    R$ 2.877     │  CategoryDonut + money-hero central
│       │      ●      │   saiu no mês  │
│        ╲           ╱                 │
│         ╰─────────╯                  │
│  ● Mercado 29% · ● Transporte 14% …  │  legenda textual sempre visível
│                                      │ space-24
│  ┌────────────────────────────────┐  │
│  │ 🛒 Mercado           R$ 842    │  │  ListItem + ProgressBar
│  │    ▓▓▓▓▓▓▓▓░░  80% de R$ 1.050 │  │  warning (passou de 80%)
│  ├────────────────────────────────┤  │
│  │ 🚗 Transporte        R$ 410    │  │
│  │    ▓▓▓▓░░░░░░  41% de R$ 1.000 │  │
│  ├────────────────────────────────┤  │
│  │ 🏠 Casa              R$ 390    │  │
│  │    sem limite  · definir →     │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Estados:** loading · empty · populated · sem-limites (todas as barras viram link "definir") ·
categoria-estourada (barra `expense`, texto "passou R$ 120") · comparação-mês-anterior (toggle).

**Nota de acessibilidade:** a rosca nunca carrega informação sozinha — legenda com nome, valor e
percentual sempre visível, e a lista abaixo é a fonte real. Ver 3.6.

---

### Tela 7 — Metas e limites

```
┌──────────────────────────────────────┐
│  Metas                          [+]  │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │        ╭───────╮               │  │  GoalMeter
│  │       │  68%   │  Viagem       │  │
│  │        ╰───────╯  faltam R$ 960│  │  money-m
│  │  ▓▓▓▓▓▓▓░░░  no ritmo certo    │  │  income
│  └────────────────────────────────┘  │ space-16
│  ┌────────────────────────────────┐  │
│  │  LIMITES DO MÊS                │  │  label
│  │  🛒 Mercado    R$ 842/1.050 ⚠  │  │
│  │  🚗 Transporte R$ 410/1.000    │  │
│  │  🍔 Delivery   R$ 380/300  ✗   │  │  expense · passou
│  │                                │  │
│  │  + adicionar limite            │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Decisões.** Meta (juntar) e limite (não passar) são objetos diferentes e ficam separados
visualmente — misturar os dois é o erro clássico da categoria. Limite estourado é `expense` com
o valor real, e o texto é factual: *"passou R$ 80 do que você separou"*. Nunca "você estourou!".

**Estados:** sem-metas (EmptyState com 3 sugestões prontas: reserva, viagem, dívida) ·
criando · ativa-no-ritmo · ativa-atrasada · concluída (celebração `motion-spring`) ·
pausada · limite-em-risco · limite-estourado.

---

### Tela 8 — Resumo do mês *(o "comentário sincero")*

```
┌──────────────────────────────────────┐
│  ‹  Seu novembro                     │
├──────────────────────────────────────┤
│                                      │  fundo bg/inverse (night)
│   Sobrou R$ 1.323.                   │  display-l
│   Mês mais leve que outubro.         │
│                                      │ space-32
│   "A diferença quase toda veio do    │  voice · Caveat 26
│    mercado — foram três compras      │
│    grandes a menos. Transporte       │
│    subiu um pouco, mas nada que      │
│    mude o mês."                      │
│                                      │ space-32
│   ┌──────────┐ ┌──────────┐          │  StatTile ×2
│   │ Entrou   │ │ Saiu     │          │
│   │ R$ 4.200 │ │ R$ 2.877 │          │
│   │ = outubro│ │ ↓ 12%    │          │
│   └──────────┘ └──────────┘          │ space-24
│   Maior saída · Aluguel R$ 1.400     │  body-m
│   Dia mais caro · 14/11, R$ 512      │
│   Categoria que mais caiu · Mercado  │
│                                      │ space-32
│  ┌────────────────────────────────┐  │
│  │   Compartilhar meu mês         │  │  Button secondary
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Decisões.** Única tela do app com fundo invertido — ela é um "momento", não uma ferramenta.
O comentário em Caveat é a voz da Mariana e precisa soar como pessoa: observa um fato, não dá
conselho. **Regra de conteúdo:** o comentário nunca usa imperativo, nunca compara com outras
pessoas, nunca sugere corte de gasto não solicitado. Compartilhar gera imagem **sem valores
absolutos** por padrão (só percentuais), com opção de incluir.

**Estados:** gerando · pronto · mês-incompleto (aparece só a partir do dia 25) ·
dados-insuficientes ("com menos de 5 lançamentos ainda não dá pra dizer nada honesto") ·
plano-grátis (mostra prévia borrada + CTA) · compartilhando.

---

### Tela 9 — Perfil, plano e privacidade *(complementar)*

Blocos: assinatura atual + data de renovação + valor exato + "cancelar" como **link visível**
(não escondido em 3 níveis) · privacidade ("a gente não conecta no seu banco / a imagem não fica
guardada depois") · exportar tudo em CSV · aparência (Automático / Claro / Escuro) ·
tamanho de texto · ajuda · sair.

**Decisão:** cancelamento em um toque a partir do perfil. A landing promete "cancela quando
quiser, direto no app, sem precisar ligar pra ninguém" — se a UI dificultar, a marca mente.

---

## 3.4 Estados de vazio, erro e carregamento

### Regra de três para todo estado

Todo estado vazio ou de erro tem exatamente: **(1)** o que aconteceu, em uma frase sem jargão;
**(2)** o que dá pra fazer agora, como botão; **(3)** uma saída alternativa, como link.

### Textos canônicos

| Situação | Título | Apoio | Ação |
|---|---|---|---|
| Primeiro mês | Seu mês ainda está em branco. | Manda uma foto, um áudio ou uma frase. Eu organizo. | Começar · *Lançar na mão* |
| Mês sem lançamento | Nada em novembro ainda. | Quer trazer as contas fixas de outubro? | Trazer contas fixas · *Deixa em branco* |
| Filtro sem resultado | Nada em "Mercado" nesse período. | Talvez esteja em outra categoria. | Ver o mês todo · *Limpar filtro* |
| Sem metas | Você ainda não separou nada. | Dá pra começar pequeno: uma reserva de R$ 100 por mês já conta. | Criar meta |
| Print ilegível | Não consegui ler esse print. | Costuma funcionar melhor com o extrato inteiro, sem cortar. | Mandar outra foto · *Lançar na mão* |
| Áudio curto | Não deu pra ouvir. | Fala o valor e o que foi, tipo "45 no mercado hoje". | Gravar de novo · *Escrever* |
| Sem internet | Você está sem internet. | O que já está aqui continua visível. O que você lançar agora vai quando voltar. | *(sem ação)* |
| Erro de servidor | Deu erro aqui do nosso lado. | Não foi nada que você fez. Já estamos vendo. | Tentar de novo · *Falar com a gente* |
| Cota da IA acabada | Você usou seus 3 reconhecimentos do mês. | No plano completo, foto, áudio e frase são sem limite. | Ver o plano · *Lançar na mão* |
| Sessão expirada | Precisamos que você entre de novo. | Seus lançamentos estão salvos. | Entrar |
| Permissão negada | Sem acesso à câmera. | Dá pra liberar nos ajustes do celular, ou lançar na mão agora. | Abrir ajustes · *Lançar na mão* |

**Proibido em qualquer estado:** "Ops!", "Oops", "Algo deu errado" sozinho, "Erro 500",
"Nenhum dado encontrado", "Lista vazia", ilustração de caixa vazia, cara triste.

### Carregamento

| Duração esperada | Padrão |
|---|---|
| < 300ms | nada. Não mostre spinner para algo que já chegou |
| 300ms – 2s | `Skeleton` com o formato do conteúdo final |
| 2s – 10s | Skeleton + uma linha de status honesta ("lendo seu print…") |
| > 10s | permitir sair da tela e avisar quando terminar (notificação local) |
| indeterminado | nunca barra de progresso falsa |

O processamento de foto/áudio **não narra as etapas da IA** (princípio 3): uma frase só,
do início ao fim.

---

## 3.5 Gestos

| Gesto | Onde | Resultado | Alternativa acessível obrigatória |
|---|---|---|---|
| Toque | tudo | ação primária | — |
| Toque longo (500ms) | `TransactionRow` | menu de contexto | botão `…` visível na linha |
| Deslizar ← | `TransactionRow` | revela Editar / Excluir | menu `…` |
| Deslizar → | `TransactionRow` | alterna entrou/saiu | campo Tipo na tela 5 |
| Deslizar ← / → | Régua, Categorias | mês anterior / próximo | setas do `MonthSwitcher` |
| Puxar para baixo | Régua | sincronizar | botão em `…` do TopAppBar |
| Arrastar alça ↑↓ | BottomSheet | peek / half / full | botão de fechar |
| Deslizar ↓ no sheet | sheet | fechar | botão × |
| Pinçar | RulerTimeline | semana ↔ mês ↔ trimestre | `SegmentedControl` de período |
| Deslizar da borda ← | qualquer tela | voltar (iOS) | botão voltar sempre presente |
| Toque duplo | — | **não usado** | — |
| Balançar | — | **não usado** | — |

**Regras.** Nenhum gesto é o único caminho para uma função — todos têm equivalente visível
(WCAG 2.5.1). Zona de alcance do polegar: ações primárias no terço inferior; ações destrutivas
**nunca** ali. Deslizar exige 40% da largura ou velocidade mínima, para não disparar com toque
torto. Toda ação destrutiva por gesto tem `Toast` de desfazer por 8 segundos.

---

## 3.6 Acessibilidade — WCAG 2.2 nível AA

| Critério | Como este produto cumpre |
|---|---|
| 1.1.1 Conteúdo não textual | Todo ícone com `aria-label` de ação; gráficos com resumo textual |
| 1.3.1 Informação e relações | Cabeçalhos reais, listas reais, `<fieldset>` em grupos de campos |
| 1.4.1 Uso de cor | Entrada/saída diferem em **forma** (ponto cheio × vazado) e em sinal (+/−), não só cor |
| 1.4.3 Contraste (mín.) | Auditoria da 1.4 · pendência única: amber claro (corrigir para `amber-700`) |
| 1.4.4 Redimensionar texto | Layout íntegro em 200%; nenhuma altura fixa em container de texto |
| 1.4.10 Reflow | 320px sem rolagem horizontal em nenhuma tela |
| 1.4.11 Contraste não textual | Borda de controle ≥ 3:1 → usar `border/strong`, ver 1.4 |
| 1.4.12 Espaçamento de texto | Suporta line-height 1.5×, espaço entre parágrafos 2× sem corte |
| 2.1.1 / 2.1.2 Teclado | Tudo alcançável e nada aprisiona foco (exceto modal, que devolve) |
| 2.4.3 Ordem de foco | Igual à ordem visual; sheet recebe foco no título ao abrir |
| 2.4.7 Foco visível | Anel `2px` + `offset 2px`, nunca suprimido |
| 2.4.11 Foco não obscurecido | FAB e TabBar não podem cobrir o elemento focado — `scroll-padding-bottom` |
| 2.5.1 Gestos | Todo gesto tem equivalente de toque único (tabela 3.5) |
| 2.5.5 Tamanho do alvo | Mínimo 44×44 |
| 2.5.7 Movimentos de arrastar | Reordenar metas também via menu "mover para cima/baixo" |
| 2.5.8 Tamanho mínimo do alvo | ≥ 24×24 mesmo em elementos densos |
| 3.2.2 Ao inserir dados | Nada é salvo automaticamente sem confirmação visível |
| 3.3.1 / 3.3.3 Erros | Erro descrito em texto, com sugestão de correção |
| 3.3.7 Entrada redundante | Categoria aprendida não é perguntada duas vezes |
| 4.1.2 Nome, papel, valor | Componentes nativos; `role`/`aria-*` só onde não há nativo |
| 4.1.3 Mensagens de status | `aria-live="polite"` em toast, `assertive` só em erro de salvamento |

**Além do AA:** teste real com VoiceOver e TalkBack em cada release · suporte a Dynamic Type do
iOS (a P3 depende disso) · modo de alto contraste força `border/strong` em tudo · nenhuma
informação transmitida só por som.

---

## 3.7 Microinterações — especificação

| # | Interação | Gatilho | Feedback | Duração / curva |
|---|---|---|---|---|
| 1 | **Lançamento salvo** | toque em Salvar | linha desliza para a régua, ponto surge no dia correspondente com escala 0→1.15→1 | 520ms `overshoot` · háptico `success` |
| 2 | **Régua ao mudar de mês** | swipe ou seta | pontos saem em cascata (stagger 12ms) e entram na nova ordem | 380ms `decelerate` |
| 3 | **Dia selecionado** | toque em um dia | linha vertical cresce de baixo para cima, popover cresce a partir do ponto | 240ms `standard` |
| 4 | **Print sendo lido** | envio de foto | miniatura encolhe para o topo enquanto linhas de skeleton aparecem de cima para baixo | 160ms por linha |
| 5 | **Áudio gravando** | segurar microfone | onda reage à amplitude real (nunca falsa), timer tabular | contínuo |
| 6 | **Transcrição aparecendo** | fim do áudio | texto entra por fade, sem efeito de digitação | 240ms `standard` |
| 7 | **Categoria alterada** | selecionar categoria | ícone faz cross-fade e a cor da linha transiciona | 160ms `fast` |
| 8 | **Limite passando de 80%** | atualização de valor | barra avança e o trecho excedente pisca uma vez em `warning` | 380ms + 1 pulso |
| 9 | **Meta atingida** | valor alcança 100% | anel completa, número conta até o total, brilho suave | 520ms `overshoot` · háptico |
| 10 | **Swipe revelando ações** | arrastar linha | ações aparecem com resistência elástica; solta antes de 40% → volta | acompanha o dedo |
| 11 | **Excluir** | confirmar exclusão | linha colapsa a altura 0 e as de baixo sobem | 200ms `accelerate` |
| 12 | **Desfazer** | toque em Desfazer | linha reexpande na posição original | 240ms `decelerate` |
| 13 | **Sheet abrindo** | toque no FAB | sheet sobe do ponto do FAB, scrim entra em fade | 380ms `decelerate` |
| 14 | **Pull to refresh** | puxar | logo (check-régua) desenha seus dois traços enquanto sincroniza | acompanha o dedo + loop |
| 15 | **TabBar troca** | toque em aba | ícone faz cross-fade contorno→preenchido, rótulo engrossa | 160ms `fast` |
| 16 | **Erro em campo** | blur inválido | borda transiciona para `expense`, mensagem desce com fade — **sem shake** | 160ms |
| 17 | **Botão em loading** | submit | rótulo faz fade-out, spinner faz fade-in, largura travada | 160ms |
| 18 | **Resumo do mês abrindo** | toque no card | fundo escurece para `bg/inverse` em fade, texto entra em stagger | 380ms + 40ms/linha |

**Regra de háptico (iOS/Android):** `success` só em salvar e meta atingida · `warning` em limite
estourado · `selection` em troca de segmento e categoria · **nunca** em rolagem, abertura de tela
ou erro de digitação.

**`prefers-reduced-motion`:** 1, 2, 9, 14 e 18 viram fade de 120ms; 10 continua (é direto do
dedo); o resto perde translação e escala, mantendo só a mudança de cor.

---

<a name="parte-4"></a>
# PARTE 4 — BIBLIOTECA DE CAMPANHA

Toda a copy abaixo segue a identidade verbal da 2.3 e fala com as personas da 3.1.

## 4.1 Estratégia de campanha

**Insight central:** o público não está procurando "app de finanças" — já procurou, já baixou,
já desistiu. Está procurando **permissão para parar de tentar do jeito difícil**. Então a
campanha não compete por "melhor app de controle financeiro"; ela intercepta o momento de
desistência e o de susto.

**Três momentos de entrada:**

| Momento | Estado mental | Canal principal | Mensagem |
|---|---|---|---|
| **Susto** | acabou de ver a fatura | Google (busca de intenção) | "Descobre pra onde foi o mês, sem planilha" |
| **Desistência** | abandonou a planilha/app | Meta/TikTok (interrupção) | "Não é falta de disciplina" |
| **Virada de ano/mês** | "agora vai" | ambos + e-mail | "Começa pequeno: uma foto" |

**Funil e métricas-alvo:**

```
Anúncio → LP (/comece) → cadastro grátis → 1º lançamento → 5º lançamento → assinatura
  CTR         conversão     ativação D0     ativação D1     hábito D7      conversão D14
  1,8%+         12%+           70%+            45%+           25%+            8%+
```

**A métrica que importa não é instalação, é o 1º lançamento em menos de 3 minutos.**
Toda peça deve ser julgada por quanto ela empurra para essa ação, não por curtida.

**Verba sugerida de teste (90 dias):** 45% Meta · 25% Google Search · 20% TikTok/Reels ·
10% e-mail e retenção. Reavaliar em 30 dias por CAC por canal, não por CPM.

---

## 4.2 Google Ads — 5 variações

Estrutura: 5 grupos, cada um com um Responsive Search Ad. Headlines em até 30 caracteres,
descrições em até 90. Marcados `[H]` e `[D]`.

---

### Variação 1 — Intenção direta *(grupo: "app controle financeiro")*

Palavras-chave: `app de controle financeiro`, `aplicativo para controlar gastos`,
`app organizar gastos mensais`, `controle de gastos simples`

- [H] Controle de gastos sem app chato
- [H] Organize o mês em 1 foto
- [H] Sem conectar seu banco
- [H] App de gastos pra quem não tem tempo
- [H] Manda o print. A gente lança.
- [H] Grátis pra começar
- [H] Cancela quando quiser
- [D] Manda a foto do extrato, um áudio ou uma frase. A gente organiza o mês inteiro pra você.
- [D] Sem planilha, sem lançar gasto todo dia, sem conectar no banco. Comece de graça.
- [D] Foto, áudio ou uma frase — e acabou. Seu mês organizado em segundos. Sem cartão.
- [D] Categoriza sozinho, avisa antes de estourar o limite e entende até parcela em andamento.

Extensões: sitelink "Como funciona" · "Preço" · "Privacidade" · "Começar grátis" ·
Frases de destaque: "Sem cartão de crédito" · "7 dias de garantia" · "Sem conectar no banco".

---

### Variação 2 — Contra-planilha *(grupo: "planilha de gastos")*

Palavras-chave: `planilha de controle financeiro`, `planilha de gastos mensais grátis`,
`modelo de planilha financeira`, `planilha excel gastos`

- [H] Chega de planilha de 12 abas
- [H] A planilha que você abandonou
- [H] Troque a planilha por uma foto
- [H] Organize sem abrir o Excel
- [H] Planilha some. Isso fica.
- [H] Sem fórmula, sem aba, sem culpa
- [D] Você fez uma planilha linda e usou por uma semana. Aqui você manda uma foto e pronto.
- [D] Nada de fórmula. Manda o print do extrato e o mês inteiro se organiza sozinho.
- [D] O trabalho é nosso: você manda uma foto, um áudio ou uma frase. Grátis pra começar.

---

### Variação 3 — Objeção de privacidade *(grupo: "sem conectar banco")*

Palavras-chave: `app de gastos sem conectar banco`, `controle financeiro sem open finance`,
`app financeiro seguro sem senha do banco`, `alternativa ao mobills sem banco`

- [H] Sem senha do banco. Nunca.
- [H] Seus dados bancários ficam com você
- [H] Controle sem Open Finance
- [H] A gente não conecta no seu banco
- [H] Você manda só o que quiser
- [D] Nada de login no banco. Você manda o print quando quiser e a imagem não fica guardada.
- [D] Controle financeiro sem entregar sua senha. Você decide o que mostrar, e quando.

---

### Variação 4 — Perfil e momento *(grupo: "sem tempo / mãe / rotina")*

Palavras-chave: `como organizar as contas sem tempo`,
`app financeiro fácil para quem não entende de finanças`, `organizar gastos rápido`

- [H] Pra quem não tem 10 min por dia
- [H] Feito por uma mãe que trabalha fora
- [H] Não precisa entender de finanças
- [H] Organiza o mês em 2 minutos
- [H] Do jeito que você já manda mensagem
- [D] Criado por quem também não tem tempo. Manda um áudio no caminho do trabalho e pronto.
- [D] Não é fórmula mágica. É o que funciona pra quem não tem tempo sobrando. Comece grátis.

---

### Variação 5 — Marca e concorrência *(grupo: "marca + alternativas")*

Palavras-chave: `tá resolvido app`, `taresolvido`, `alternativa a app de finanças`,
`app de finanças simples 2026`

- [H] Tá Resolvido — site oficial
- [H] O app que organiza por você
- [H] Simples por fora, completo por dentro
- [H] Comece grátis, evolua depois
- [D] O app oficial Tá Resolvido. Foto, áudio ou frase — seu mês organizado. Sem cartão.
- [D] Simples por fora, completo por dentro: metas, limites, parcelas e resumo do mês.

**Negativas globais:** grátis para sempre, crackeado, apk, curso, investimento, ações, cripto,
empréstimo, negativado, dívida, score, planilha de obra, controle de estoque.

---

## 4.3 Meta e TikTok — formatos

### Especificações

| Plataforma | Formato | Proporção | Duração | Zona segura |
|---|---|---|---|---|
| Reels / TikTok | vídeo | 9:16 (1080×1920) | 7–22s | 250px topo, 420px base |
| Stories | vídeo/imagem | 9:16 | 5–15s | 250/250 |
| Feed | imagem/carrossel | 4:5 (1080×1350) | — | — |
| Carrossel | 4–8 cards | 4:5 | — | — |
| Coleção/estático | imagem | 1:1 | — | — |

**Regra transversal:** a promessa aparece nos **3 primeiros segundos** e legenda queimada
sempre — 85% assiste sem som. Fonte da legenda: Inter 600, contorno `night` de 3px, nunca
o gerador automático do app.

---

### Criativo 1 — "O print" *(Reels/TikTok, 12s · demonstração)*

| t | Vídeo | Áudio / legenda |
|---|---|---|
| 0–2s | mão fotografando um extrato de papel em cima da mesa da cozinha | "Isso aqui é o meu mês." |
| 2–5s | tela do app, print sendo lido, linhas aparecendo | "Eu só mandei a foto." |
| 5–9s | régua do mês preenchida, dedo rolando | "14 lançamentos. Não digitei nenhum." |
| 9–12s | logo + "taresolvido.app" | "Tá resolvido." |

CTA: **Começar grátis**. Público: interesses "finanças pessoais" + "organização" + lookalike de visitantes.

---

### Criativo 2 — "Não é falta de disciplina" *(Reels, 18s · fundadora falando)*

Mariana à câmera, luz de janela, sem edição chamativa.
> "Eu já fiz planilha, já baixei três apps. Usei uma semana cada. E aí eu descobri que o problema
> não era eu — era que todos eles pediam dez minutos por dia que eu não tenho. Então eu fiz um
> que pede dez segundos."

Corte para tela: áudio virando lançamento. Fim: "Tá Resolvido. Grátis pra começar."

---

### Criativo 3 — "Qual desses é você?" *(carrossel 6 cards, Feed)*

1. "Você já tentou. Mais de uma vez." *(fundo night)*
2. "Baixou um app. Ou dois. Ou três." *(cream)*
3. "Fez uma planilha linda. Usou uma semana." *(plum)*
4. "Sabe que gasta demais. Não sabe onde." *(cream)*
5. "Não é falta de força de vontade." *(night, destaque)*
6. "É que ninguém tinha feito um jeito do seu tamanho. → arrasta pro link" *(plum + logo)*

---

### Criativo 4 — "Áudio no carro" *(TikTok, 9s · nativo)*

Gravação vertical, pessoa no trânsito: "gastei 32 de Uber indo pro trabalho" → corte para a tela
mostrando `Transporte · R$ 32,00 · na régua do mês ✓`. Legenda: "3 segundos. Enquanto eu dirigia."

---

### Criativo 5 — "Sem senha do banco" *(Stories, 8s · objeção)*

Card 1: "Você conectaria seu banco num app?" → enquete "Nunca / Já conectei".
Card 2: "A gente também não. Por isso não pedimos." + CTA arrasta pra cima.

---

### Criativo 6 — "Antes e depois" *(Feed 1:1, estático)*

Split: à esquerda, foto real de planilha com 12 abas, desaturada. À direita, a régua do mês
limpa. Legenda no rodapé: "Mesmo mês. Um deles você precisa alimentar todo dia."

---

### Criativo 7 — "As 3 formas" *(Reels, 15s · produto)*

Três blocos de 5s, um por entrada (foto / áudio / frase), cada um terminando com o mesmo som e o
mesmo card "tá resolvido". Repetição é o ponto: a marca é o gesto que se repete.

---

### Criativo 8 — Retargeting *(Stories, 6s)*

"Você chegou até o cadastro e parou." / "Sem cartão. Sem conectar no banco. Dá pra sair quando
quiser." / CTA "Terminar em 1 minuto".

---

## 4.4 Sequência de e-mail — 5 mensagens

Disparo a partir do cadastro grátis. Remetente: **Mariana, do Tá Resolvido**
(`mariana@taresolvido.app`) — pessoa, não marca. Texto simples, sem template de coluna dupla,
sem imagem obrigatória, um CTA por e-mail.

---

**E-mail 1 — imediato · "O primeiro"**
*Assunto:* Manda uma coisa só
*Pré-cabeçalho:* Uma foto, um áudio ou uma frase. Só isso.

> Oi, [nome].
>
> Eu fiz o Tá Resolvido porque também não tenho tempo de lançar gasto todo dia.
>
> Então não vou te pedir pra configurar nada. Faz uma coisa só: manda uma foto de qualquer
> extrato, ou fala uma frase tipo "gastei 45 no mercado hoje".
>
> Eu organizo o resto.
>
> **[ Mandar minha primeira coisa ]**
>
> — Mariana
>
> P.S.: a gente não conecta no seu banco. Nunca vai pedir sua senha.

---

**E-mail 2 — D+2 (se não lançou) · "A objeção"**
*Assunto:* Você não precisa de mais disciplina

> Se você chegou aqui e não mandou nada ainda, eu sei o que provavelmente aconteceu: você pensou
> "depois eu organizo isso direito".
>
> É exatamente esse "direito" que faz a gente desistir.
>
> Não precisa começar pelo mês inteiro. Manda um gasto. Um só. O de ontem.
>
> **[ Lançar um gasto ]**

*(Variante para quem já lançou → E-mail 2b: "Você já tem 3 lançamentos. Quer que eu leia um
extrato inteiro de uma vez?")*

---

**E-mail 3 — D+5 · "A prova"**
*Assunto:* 14 lançamentos, nenhum digitado

> Uma coisa que quase ninguém descobre no começo: dá pra mandar a **foto do extrato inteiro**.
>
> Uma foto. Todos os lançamentos do mês. Categorizados. Inclusive parcela que já estava andando —
> ela entra no lugar certo, sem recomeçar do zero.
>
> É a parte que mais me economiza tempo, e é a que as pessoas menos usam.
>
> **[ Mandar um extrato inteiro ]**

---

**E-mail 4 — D+9 · "O momento"**
*Assunto:* O que eu vi no seu mês

> Você já tem [n] lançamentos aqui. Isso já é suficiente pra ver uma coisa: [maior categoria].
>
> Não é uma crítica — é só um fato que costuma surpreender.
>
> No plano completo, todo fim de mês eu te mando um comentário assim, honesto, do seu mês inteiro.
> Junto com metas, limites que avisam **antes** de estourar, e foto/áudio sem limite.
>
> Primeiro mês por R$ 14,90. Depois R$ 24,90. Cancela quando quiser, direto no app.
>
> **[ Ver o plano completo ]**

---

**E-mail 5 — D+14 · "A porta aberta"**
*Assunto:* Sem pressa

> Se o Tá Resolvido não for pra você, tudo bem — eu prefiro te falar isso do que insistir.
>
> Ele não é pra quem ama planilha, nem pra quem quer integração automática com banco, nem pra
> quem quer análise de investimento.
>
> Ele é pra quem só quer que o mês pare de pesar na cabeça.
>
> Se for o seu caso, seus lançamentos continuam aqui. E se um dia quiser tudo sem limite,
> tem 7 dias de garantia — se não gostar, a gente devolve, sem perguntas.
>
> **[ Voltar pro meu mês ]**

**Cadência pós-sequência:** 1 e-mail por mês, no dia 1º, com o resumo do mês anterior.
Nada mais. Descadastro em um clique, visível, no topo e no rodapé.

---

## 4.5 Copy da landing page

Estrutura já validada no site atual — abaixo, a versão sistematizada com os pontos de teste
marcados. O que está em **negrito** é mudança recomendada em relação ao texto atual.

| Seção | Copy |
|---|---|
| **Eyebrow** | PRA QUEM JÁ TENTOU DE TUDO — E CANSOU DE TENTAR |
| **H1** | Seu mês cabe numa foto. |
| **Sub** | Você não precisa de mais disciplina. Precisa de um jeito que funcione mesmo nos dias em que sobra zero tempo. |
| **Apoio** | Manda o print do extrato, grava um áudio ou escreve numa frase — a gente organiza tudo. E se preferir o jeito tradicional, lançar na mão também dá. |
| **CTA primário** | Quero começar, de graça |
| **Micro sob CTA** | Sem cartão de crédito. Sem conectar no banco. |
| **Prova imediata** | "gastei 45 no mercado hoje" → categorizado sozinho · Foto do extrato inteiro, lançado em segundos |
| **Seção 2 (dor)** | *Você já tentou. Mais de uma vez.* — 6 marcadores em primeira pessoa, fechando com "Não é falta de força de vontade. É que ninguém fez um método que coubesse na sua vida de verdade — até agora." |
| **Seção 3 (como funciona)** | *Você manda. A gente organiza.* — 3 cards (foto / frase / áudio) com **tela real** do app, e a linha "Prefere fazer na mão? Também dá — sem perder nenhuma função." |
| **Seção 4 (profundidade)** | *Simples por fora. Completo por dentro.* — meta atualizada, limite avisado antes de estourar, parcela no lugar certo, comentário sincero do mês |
| **Seção 5 (fundadora)** | Depoimento da Mariana, **com foto real e nome completo** |
| **Seção 6 (qualificação)** | *Isso é pra você — ou não é.* — duas colunas, 4 itens cada |
| **Seção 7 (preço)** | *Comece de graça. Evolua quando fizer sentido.* — dois planos, "Mais popular" no Completo |
| **Seção 8 (garantias)** | Sem conectar no banco · 7 dias de garantia · Cancela quando quiser |
| **Seção 9 (FAQ)** | 6 perguntas, acordeão |
| **Fechamento** | Tá na hora de tirar isso da sua cabeça. → **Quero organizar meu mês** |

**Recomendações de copy (ver justificativa na Parte 6):**

1. **Adicionar prova social real** — hoje não existe nenhuma. Mesmo com base pequena: "1.200
   lançamentos organizados esta semana" ou 3 depoimentos com nome e foto. Sem inventar nada.
2. **Nomear o que a IA faz de errado** — uma linha de honestidade ("às vezes ela erra; você
   corrige uma vez e ela não erra de novo") aumenta confiança mais do que promessa de precisão.
3. **Mover a garantia de privacidade para logo abaixo do H1** — é a objeção nº 1 da P3 e hoje
   ela só aparece depois do preço.
4. **CTA final diferente do topo**, como já está ("Quero organizar meu mês" ≠ "Quero começar, de
   graça") — mantém, é acerto.

---

## 4.6 Dez posts para redes sociais

Formato indicado entre parênteses. Nenhum post repete o gancho de outro.

**1. (Carrossel 6) "As 4 coisas que eu parei de fazer"**
Abre: "Depois que arrumei minha rotina financeira, eu parei de:" → abrir planilha aos domingos ·
guardar comprovante no bolso · adivinhar quanto sobrou · me sentir mal por não ter dado conta.

**2. (Reel 15s) "Fala e pronto"**
Áudio real: "gastei 32 de Uber indo pro trabalho" → tela categorizando. Sem narração.
Legenda: "Foi isso. Esse é o app inteiro."

**3. (Estático 4:5) Frase-cartaz**
"Você já tentou controlar seus gastos... e desistiu?" em Baloo 2 sobre `cream`.
Legenda longa contando a história da desistência em primeira pessoa.

**4. (Carrossel 5) "O que a régua do mês mostra"**
Print real da tela, um card por elemento: o que entrou, o que saiu, o dia mais caro, o hoje,
a projeção. Educacional sobre o produto, não sobre finanças.

**5. (Reel 20s) "Print do extrato inteiro"**
Demonstração crua, uma tomada só, sem corte: foto → 14 lançamentos → salvar. O tempo real é o
argumento.

**6. (Estático 1:1) "Não é pra todo mundo"**
Duas colunas, direto da landing: "é pra você se / não é pra você se". Post que qualifica e
espanta o público errado — e por isso performa em comentário.

**7. (Reel 25s) Bastidor da fundadora**
"Por que eu não conecto no banco" — Mariana explicando a decisão de produto. Constrói confiança
com a P3 e diferencia de todo o mercado.

**8. (Carrossel 4) "Parcela que já tava andando"**
O problema específico que ninguém resolve: você começa a usar um app no meio do ano e todas as
parcelas antigas ficam perdidas. Mostra a detecção funcionando.

**9. (Estático 4:5) Número do mês**
Um dado agregado e anônimo da base ("nesta semana, X lançamentos entraram por áudio"), em
`money-hero` sobre `night`. Só publicar com número real.

**10. (Reel 12s) "Tá resolvido"**
Sequência de 4 situações cotidianas (mercado, farmácia, Uber, boleto), cada uma terminando com o
mesmo card e a mesma frase. Constrói a assinatura verbal por repetição.

**Ritmo sugerido:** 3 posts/semana — 1 dor/identificação, 1 produto/demonstração, 1 bastidor/pessoa.
**Correção de execução:** hoje o feed centraliza blocos longos de texto (ver 2.6) e alterna
fundos sem regra. Adotar: fundo `night` = frase de dor · `cream` = produto/demonstração ·
`plum` = bastidor/pessoa. Em três semanas o feed vira um padrão reconhecível.

---

## 4.7 Recomendações de teste A/B

Regra: **um teste por vez, por superfície.** Mínimo de 400 conversões por braço ou 14 dias,
o que vier depois. Sem parar teste no meio por "parecer que está ganhando".

| # | Onde | A (controle) | B (desafiante) | Hipótese | Métrica primária |
|---|---|---|---|---|---|
| 1 | LP · H1 | Seu mês cabe numa foto. | Você não precisa de mais disciplina. | O benefício emocional converte mais que o funcional neste público | conversão para cadastro |
| 2 | LP · CTA | Quero começar, de graça | Mandar minha primeira foto | CTA que descreve a ação real reduz atrito percebido | clique → cadastro |
| 3 | LP · posição da privacidade | após o preço | logo abaixo do H1 | privacidade é objeção de entrada, não de fechamento | conversão (P3) |
| 4 | LP · prova social | ausente | 3 depoimentos reais com foto | prova reduz a dúvida "isso funciona mesmo?" | conversão |
| 5 | Onboarding | 3 opções (foto/áudio/frase) | 1 opção recomendada + "outros jeitos" | escolha reduz ação; o padrão sozinho acelera | 1º lançamento em <3min |
| 6 | Onboarding | pede permissão de câmera na abertura | pede só depois da escolha | permissão contextual tem aceite maior | taxa de aceite |
| 7 | Paywall | R$24,90 com "1º mês R$14,90" | R$24,90 com 7 dias grátis | trial supera desconto quando a dúvida é "vou usar?" | assinatura D14 e retenção D30 |
| 8 | Paywall · gatilho | no 3º reconhecimento (cota) | após o 1º resumo do mês | o valor percebido é maior depois do "aha", não no limite | conversão paga |
| 9 | E-mail 2 · assunto | Você não precisa de mais disciplina | Ainda dá tempo de organizar novembro | urgência de calendário × alívio emocional | taxa de abertura e clique |
| 10 | Meta Ads · criativo | fundadora falando (nº 2) | demonstração do print (nº 1) | demonstração vence no frio; rosto vence no retargeting | CPA |
| 11 | Meta Ads · público | interesse "finanças pessoais" | lookalike 1% de quem lançou 5× | evento de ativação é sinal melhor que interesse | CAC |
| 12 | Notificação | "Você não lança nada há 8 dias" | "Seu novembro está pela metade — quer fechar?" | lembrete que culpa gera desinstalação | abertura + churn |
| 13 | Resumo do mês | valores absolutos ao compartilhar | só percentuais | vergonha de expor valor limita compartilhamento | taxa de compartilhamento |
| 14 | Régua | gráfico primeiro | número "sobrou" primeiro | um número entendido bate um gráfico bonito | tempo até segunda ação |

**Nunca testar:** promessa de privacidade, textos de erro (corrija, não teste), preço para
usuário já ativo, e qualquer coisa que crie culpa "porque converte".

---

<a name="parte-5"></a>
# PARTE 5 — FIGMA DESIGN OPS

Especificação para montar no Figma exatamente o que está nas Partes 1 e 3. Nenhum valor novo é
inventado aqui: tokens vêm da 1.10, componentes da 1.9, telas da 3.3.

## 5.1 Estrutura de arquivos

Três arquivos, não um. Separar impede que uma exploração quebre produção.

```
📁 Tá Resolvido
├── 📄 Régua · Foundations      [BIBLIOTECA PUBLICADA]
│      cor, tipografia, espaçamento, grid, ícones, efeitos
├── 📄 Régua · Components       [BIBLIOTECA PUBLICADA]
│      os 41 componentes da 1.9, com variants e properties
├── 📄 Produto · App            [consome as duas]
│      telas, fluxos, protótipo, anotações de handoff
├── 📄 Produto · Marketing      [consome as duas]
│      landing, anúncios, posts, e-mail
└── 📄 🚧 Rascunho              [nunca publicado, nunca linkado em ticket]
```

## 5.2 Páginas dentro de `Produto · App`

| Página | Conteúdo | Regra |
|---|---|---|
| `📌 Cover` | capa com status, dono, data | thumbnail do arquivo |
| `📖 Leia-me` | como usar, quem aprova, links | primeira página, sempre |
| `🚦 Fluxos` | mapa dos fluxos em FigJam-style | fonte da navegação |
| `✅ Pronto pra dev` | só telas aprovadas e anotadas | **única página que dev abre** |
| `🎨 Em desenho` | trabalho em andamento | — |
| `🧪 Explorações` | alternativas descartadas com data | histórico, nunca apagar |
| `🗄 Arquivo` | versões antigas | — |

Nomeação de frame de tela: `[área] Nome · estado · breakpoint` →
`[Régua] Home · populated · 390` · `[Régua] Home · empty · 390` · `[Régua] Home · populated · 1280`.

## 5.3 Estrutura de frame e grid

**Tamanhos-base de frame:**

| Nome | Tamanho | Uso |
|---|---|---|
| `390 × 844` | iPhone 14/15 | frame canônico de mobile — **desenhar aqui primeiro** |
| `430 × 932` | iPhone Pro Max | verificação de folga |
| `360 × 800` | Android médio | verificação de aperto |
| `320 × 720` | mínimo suportado | teste de reflow (WCAG 1.4.10) |
| `768 × 1024` | tablet | md |
| `1280 × 900` | desktop | lg/xl |
| `1440 × 1024` | desktop grande | apresentação |

**Layout grids (salvos como estilos, nunca configurados na mão):**

| Estilo de grid | Definição |
|---|---|
| `grid/xs-4` | Columns · 4 · stretch · margin 16 · gutter 16 |
| `grid/sm-4` | Columns · 4 · stretch · margin 24 · gutter 16 |
| `grid/md-8` | Columns · 8 · stretch · margin 32 · gutter 24 |
| `grid/lg-12` | Columns · 12 · center · width 960 · gutter 24 |
| `grid/xl-12` | Columns · 12 · center · width 1200 · gutter 32 |
| `grid/baseline-4` | Rows · 4px · aplicado sobre os outros ao revisar |

**Áreas fixas de mobile:** `status bar 47` (top safe area) · `TopAppBar 56` ·
`TabBar 56 + 34 home indicator` = 90 de safe area inferior · conteúdo rolável entre elas.
Todo frame de tela tem essas três áreas como componentes, nunca redesenhadas.

## 5.4 Regras de auto-layout

**Regra zero: nada é posicionado em coordenada absoluta.** Se um elemento está solto, ele vai
quebrar. As únicas exceções autorizadas: FAB, badge sobre ícone, e decoração de fundo — todas
com `absolute position` explícita dentro de um frame com auto-layout.

| Nível | Direção | Spacing | Padding | Alinhamento | Resize |
|---|---|---|---|---|---|
| Frame de tela | vertical | 0 | 0 | top-center | Fixed × Fixed |
| Área rolável | vertical | `space-24` | `16 / 16` | top-stretch | Fill × Hug |
| Seção | vertical | `space-16` | 0 | top-stretch | Fill × Hug |
| Card | vertical | `space-16` | `space-24` (`space-16` em mob) | top-stretch | Fill × Hug |
| Linha de lista | horizontal | `space-12` | `12 / 16` | center-space-between | Fill × Hug |
| Grupo ícone+texto | horizontal | `space-8` | 0 | center | Hug × Hug |
| Botão | horizontal | `space-8` | `16 / 32` | center | Hug × Fixed(48) |
| Chip | horizontal | `space-4` | `8 / 12` | center | Hug × Fixed(32) |
| Barra de ação fixa | vertical | `space-8` | `16` + safe area | stretch | Fill × Hug |

**Padrões obrigatórios:**

- Texto sempre `Fill × Hug` — nunca largura fixa, ou quebra em pt-BR (palavras longas: "lançamentos", "reconhecimentos").
- Espaçamento **sempre** por `spacing` do auto-layout, **nunca** por frame vazio ou quebra de linha.
- Use `Space between` só quando houver exatamente 2 filhos; com 3+, prefira `Fill` no do meio.
- `Clip content` ligado em todo frame de tela e de card com raio.
- Valores negativos de spacing são proibidos, exceto em pilha de avatares.
- Todo componente interativo tem padding suficiente para 44×44, mesmo com visual menor —
  use um frame transparente de toque, não aumente o ícone.

## 5.5 Constraints (para o que não usa auto-layout)

| Elemento | Horizontal | Vertical |
|---|---|---|
| TopAppBar | Left & Right | Top |
| TabBar | Left & Right | Bottom |
| FAB | Right | Bottom |
| Scrim de modal | Left & Right | Top & Bottom |
| Fundo decorativo | Scale | Scale |
| Alça do BottomSheet | Center | Top |
| Badge sobre ícone | Right | Top |

## 5.6 Arquitetura de componentes

**Um componente por conceito, variants para estado, properties para conteúdo.** Nunca crie
`Button/Primary/Large/Loading` como componente separado — isso é 1 componente com 4 propriedades.

### Exemplo canônico — `Button`

```
Component Set: Button
├── Variant · variant : primary | secondary | tertiary | income | expense | danger
├── Variant · size    : sm | md | lg
├── Variant · state   : default | hover | pressed | focus | disabled | loading
├── Boolean · iconLeft
├── Boolean · iconRight
├── Instance swap · icon  (preferred: regua/icons)
└── Text     · label = "Rótulo"
```

6 × 3 × 6 = 108 combinações — mas apenas **6 × 6 = 36 frames desenhados** (size resolvido por
auto-layout com padding variável em cada size, não por variant duplicado). Essa é a diferença
entre uma biblioteca que se mantém e uma que apodrece.

### Convenção de nomes

| Tipo | Padrão | Exemplo |
|---|---|---|
| Componente | `Categoria/Nome` | `Actions/Button`, `Data/TransactionRow` |
| Variant property | camelCase | `variant`, `size`, `state`, `isSelected` |
| Valor de variant | kebab minúsculo | `primary`, `focus-visible` |
| Ícone | `icons/nome-kebab` | `icons/receipt`, `icons/mic` |
| Estilo de cor | caminho semântico | `semantic/income/default` |
| Estilo de texto | nome do token | `display-l`, `money-hero` |
| Variável de modo | coleção `theme` | modos `light` e `dark` |

### Hierarquia de composição (do menor ao maior)

```
icons/*  ·  primitives (Text, Divider, Surface)
   ↓
Actions/*  Forms/*  Data/*  Feedback/*        ← 41 componentes da 1.9
   ↓
Patterns/*  (RowGroup, SectionHeader, StatRow, SheetHeader)
   ↓
Screens/*  (as 8 telas da 3.3)
   ↓
Flows  (protótipo)
```

Nunca pule níveis: uma tela não desenha um input do zero; ela instancia `Forms/TextField`.

### Variáveis (Figma Variables) — mapeamento direto do JSON da 1.10

```
Collection "primitives"   → modo único       → plum-100…900, sage-*, amber-*, coral-*, teal-*, sand-*
Collection "theme"        → modos light|dark → bg/*, fg/*, border/*, accent/*, income/*, expense/*, warning/*
Collection "dimension"    → modo único       → space-*, radius-*
Collection "typography"   → modo único       → os 9 níveis + money-* + voice
```

Componentes **só** referenciam `theme` e `dimension`. Trocar o modo do frame de `light` para
`dark` deve produzir a tela do modo noite sem nenhum ajuste manual — se algo não trocar, há um
hex solto. Use isso como teste de conformidade antes de publicar.

## 5.7 Fluxos de protótipo

Cinco fluxos, cada um começando em um frame marcado com `Flow starting point`.

| Fluxo | Caminho | Interações-chave |
|---|---|---|
| **F1 · Primeiro uso** | Boas-vindas → escolha → permissão → captura → revisão → régua com 1 item | `On tap` → `Smart animate` 380ms `decelerate` |
| **F2 · Lançar por foto** | Régua → FAB → sheet(Foto) → câmera → processando → revisão em lote → salvo → régua | `Open overlay` bottom, `Swipe down` para fechar |
| **F3 · Lançar por áudio** | Régua → FAB → sheet(Chat) → gravando → transcrição → editar categoria → salvar | `While pressing` no microfone |
| **F4 · Explorar o mês** | Régua → tocar dia → popover → tocar lançamento → detalhe → editar → voltar | `Smart animate` do ponto para o popover |
| **F5 · Meta e limite** | Metas → criar → slider → salvar → régua com alerta de limite | `Drag` no slider |

**Configuração padrão de interação:**

| Ação | Interação | Animação |
|---|---|---|
| Navegar adiante | `On tap` → `Navigate to` | `Smart animate` · 380ms · `decelerate` |
| Voltar | `On tap` / `Swipe right` → `Back` | `Move out` · 240ms |
| Abrir sheet | `On tap` → `Open overlay` (bottom, centered) | `Move in` · 380ms |
| Fechar sheet | `Swipe down` / `On tap` no scrim → `Close overlay` | `Move out` · 240ms `accelerate` |
| Mudar de mês | `On drag` → `Navigate to` | `Smart animate` · 380ms |
| Hover de componente | `While hovering` → variant `hover` | `Instant` |
| Estado de loading | `After delay` 1200ms → variant/frame seguinte | `Dissolve` · 160ms |

**Regra:** o protótipo do Figma **não** é a especificação de motion. Ele demonstra o fluxo; a
spec real é a tabela 3.7. Anote isso no `📖 Leia-me` para evitar que dev copie durações do protótipo.

## 5.8 Anotações de handoff

Use `Dev Mode` com `Annotations` nativas + um componente `Annotation/Note` para o que não cabe.

**Toda tela em `✅ Pronto pra dev` carrega, sem exceção:**

1. **Badge de status** — `Pronto` / `Em revisão` / `Bloqueado` com data e responsável.
2. **Ordem de leitura numerada** (1, 2, 3…) sobre os elementos — é também a ordem de foco.
3. **Nome exato do componente** em cada instância não óbvia: `Data/TransactionRow · state=pending-AI`.
4. **Comportamento responsivo:** o que muda em `md` e `lg` (uma linha por breakpoint).
5. **Estados não desenhados**, listados: "esta tela também tem `error-rede` e `offline` — spec em 3.4".
6. **Origem do dado:** campo da API por elemento (`saldo = GET /month/:id → net_amount`).
7. **Texto de cada estado vazio/erro**, copiado da tabela 3.4 (nunca reescrito no Figma).
8. **Rótulo acessível** de cada ícone e botão só-ícone.
9. **Comportamento de teclado:** o que Tab, Enter e Esc fazem.
10. **O que acontece offline.**

**Componente `Annotation/Note`** — variants: `info` · `warning` · `a11y` · `motion` · `api`.
Cor vinda de `semantic/*`, sempre fora do frame da tela (à direita, em coluna de 240px), com
linha de conexão. Nunca sobre o desenho.

## 5.9 Governança

| Item | Regra |
|---|---|
| Publicar biblioteca | descrição obrigatória no publish, com o que mudou e se quebra algo |
| Breaking change | anunciar 1 semana antes; manter o componente antigo marcado `⚠️ deprecated` por 30 dias |
| Componente novo | só entra na biblioteca depois de aparecer em 2 telas reais |
| Cor fora da paleta | proibida. Plugin de lint (`Design Lint`) rodado antes de todo publish |
| Detach | proibido em `✅ Pronto pra dev`. Se precisou destacar, falta um componente ou uma property |
| Branch | toda alteração de biblioteca vai por branch + review |
| Nome de layer | `Frame 427` é bug. Layer sem nome não passa em review |
| Versão | tag semântica no publish (`v1.2.0`) espelhando a versão do `design-tokens.json` |

---

<a name="parte-6"></a>
# PARTE 6 — CRÍTICA DE DESIGN

**Objeto avaliado:** a landing page taresolvido.app (modo claro e escuro) e o perfil
@ta_resolvido_app, no estado observado em 06/09/2026. Avaliação feita sobre o que existe, não
sobre o que está planejado nas partes anteriores.

**Resumo em uma frase:** é uma landing page de posicionamento excepcional com execução visual
acima da média do segmento, cuja principal fraqueza não é estética — é a **ausência total de
prova** e a **falta de sistema**, com um único defeito técnico bloqueante (contraste do amber).

---

## 6.1 Heurísticas de Nielsen — nota de 1 a 5

*(1 = crítico · 2 = ruim · 3 = aceitável · 4 = bom · 5 = exemplar)*

### 1. Visibilidade do estado do sistema — **3/5**
A landing mostra bem o que o produto faz, com telas reais rotuladas ("TELA REAL DO APP") —
honestidade rara e bem executada. Perde ponto porque a página não comunica progresso em nenhum
momento: não há indicação de quantas seções faltam, o acordeão do FAQ é o único elemento com
estado, e o CTA não muda de estado ao ser acionado. Na jornada, o salto do "Quero começar" para
o cadastro é uma caixa-preta.
*Correção:* estado de loading no CTA; indicador sutil de progresso de leitura; confirmação
imediata pós-clique.

### 2. Correspondência com o mundo real — **5/5**
O ponto mais forte do produto. "Régua do mês", "entrou/saiu", "manda o print", "lançar na mão",
"tá resolvido" — não há uma única palavra de jargão financeiro na página inteira. O exemplo
"gastei 45 no mercado hoje" é linguagem literal do usuário, não uma paráfrase de marketing.
Isso é melhor do que qualquer concorrente do segmento faz.

### 3. Controle e liberdade do usuário — **4/5**
A promessa de reversibilidade é explícita e repetida: cancela no app, 7 dias de garantia, sem
letra miúda, lançar na mão sem perder função. A seção "não é pra você se" é uma forma de dar
saída ao usuário — decisão de design corajosa e correta.
Perde ponto porque a página só tem um caminho: não há como ver preço, privacidade ou FAQ sem
percorrer tudo (não existe navegação).
*Correção:* barra superior com âncoras (Como funciona · Preço · Privacidade) a partir do scroll.

### 4. Consistência e padrões — **3/5**
Dentro da página, a consistência é boa. Fora dela, quebra: o Instagram alterna três fundos sem
regra, usa hierarquia tipográfica diferente da do site e não repete nenhum elemento gráfico
recorrente. Site e perfil parecem duas marcas próximas, não a mesma.
Internamente, dois desvios: `h2` com `line-height` 1.5 (valor de corpo, não de título — deixa
títulos de duas linhas frouxos) e o mesmo hex de acento reaproveitado com papéis diferentes.
*Correção:* Partes 1.5 e 2.7; regra de fundo por tipo de post na 4.6.

### 5. Prevenção de erros — **4/5**
A página antecipa e desarma objeções antes que virem erro de expectativa: "sem cartão de
crédito", "sem conectar no banco", "a imagem não fica guardada depois". O bloco "não é pra você
se" previne o pior erro possível — a assinatura errada.
Perde ponto porque não previne a frustração mais provável: **o que acontece quando a IA erra.**
A página promete "a gente identifica tudo" sem nenhuma linha sobre falha.
*Correção:* uma frase honesta ("às vezes ela erra — você corrige uma vez e ela não erra de novo").
Isso aumenta confiança, não reduz.

### 6. Reconhecer em vez de lembrar — **4/5**
Os três modos de entrada aparecem com exemplo visual concreto de cada um, e o preço mostra o que
cada plano inclui em linguagem de benefício. Bom uso de reconhecimento.
Perde ponto no FAQ: 6 perguntas fechadas, todas exigindo clique, sem nenhuma resposta visível —
o usuário precisa lembrar qual dúvida tinha para saber onde clicar.
*Correção:* abrir por padrão as duas perguntas mais críticas (dados bancários e cancelamento).

### 7. Flexibilidade e eficiência — **3/5**
Para o visitante decidido, o caminho é longo: o segundo CTA só aparece depois de sete seções.
Não há CTA fixo, não há atalho, e no mobile a página inteira precisa ser percorrida.
*Correção:* CTA fixo (sticky) no rodapé a partir de 40% de rolagem, com o mesmo texto do topo.

### 8. Estética e design minimalista — **4/5**
A paleta é sofisticada e incomum no segmento (nenhum azul-fintech, nenhum verde-dinheiro
saturado), o espaçamento é generoso, e a decisão de escurecer os acentos no modo dia em vez de
reaproveitar o mesmo hex mostra maturidade técnica.
Perde ponto por dois excessos: a seção "o que ninguém vê" acumula cinco elementos sem hierarquia
clara entre eles, e a densidade de bullets na seção de dor (6 itens seguidos) cansa antes de
converter.
*Correção:* reduzir para 4 itens de dor, os mais específicos; hierarquizar a seção 4 com um
elemento dominante.

### 9. Reconhecer, diagnosticar e recuperar erros — **2/5**
A avaliação aqui é sobre o que **não existe**: a página não tem nenhum estado de erro visível
(formulário, falha de rede, link quebrado), e o único ponto de entrada de dado é um botão que
leva para fora. Não é possível avaliar recuperação porque não há tratamento algum na superfície
avaliada.
*Correção:* especificar os estados da 3.4 também para a landing (falha ao criar conta, e-mail
já cadastrado, sem conexão).

### 10. Ajuda e documentação — **4/5**
FAQ bem escolhido (6 perguntas que são exatamente as objeções reais), e-mail de contato visível,
termos e privacidade no rodapé. Melhor que a média.
Perde ponto por não haver nenhuma ajuda contextual nos pontos de dúvida — a explicação sobre
privacidade fica a 6 seções de distância da primeira menção a "manda o print".

### Placar

| # | Heurística | Nota |
|---|---|---|
| 1 | Visibilidade do estado | 3 |
| 2 | Correspondência com o mundo real | **5** |
| 3 | Controle e liberdade | 4 |
| 4 | Consistência e padrões | 3 |
| 5 | Prevenção de erros | 4 |
| 6 | Reconhecer em vez de lembrar | 4 |
| 7 | Flexibilidade e eficiência | 3 |
| 8 | Estética e minimalismo | 4 |
| 9 | Recuperação de erros | 2 |
| 10 | Ajuda e documentação | 4 |
| | **Média** | **3,6 / 5** |

---

## 6.2 Hierarquia visual — **3,5/5**

**Funciona:** o percurso de rolagem é uma narrativa correta — dor, mecanismo, profundidade,
pessoa, qualificação, preço, garantia. A ordem está certa, e isso é mais difícil que estética.
O par eyebrow + H1 cria entrada limpa, e o mockup do celular à direita ancora o hero sem
competir com o texto.

**Não funciona:**

1. **Não existe um segundo nível claro.** A página salta de `h1 44px` para `h2 28px` para corpo
   de 18px — três degraus para uma página de nove seções. Faltam níveis intermediários, e o
   resultado é que todas as seções têm exatamente o mesmo peso visual. Nenhuma domina, então
   nenhuma é lembrada.
2. **`h2` com line-height 1.5.** Em 28px isso dá 42px de altura de linha: títulos de duas linhas
   flutuam separados, perdendo a leitura como bloco único.
3. **A seção de preço não tem hierarquia entre os planos** além do selo "Mais popular". Os dois
   cards têm o mesmo peso, e o olho não sabe onde parar.
4. **O depoimento da fundadora — o ativo mais forte da página — não tem foto.** É o único
   elemento de humanidade e está tipograficamente igual a tudo mais.

**Correção:** aplicar a escala de 9 níveis da 1.5, corrigir line-height de título para 1.15–1.35,
dar peso visual ao card recomendado (borda 2px `accent` + escala 1.02) e colocar rosto real na
seção da fundadora.

---

## 6.3 Tipografia — **4/5**

**Acertos:** Baloo 2 é uma escolha corajosa e correta — arredondada sem ser infantil, com
suporte impecável a acentuação portuguesa (crítico para "tá", "mês", "você"). O pareamento com
Inter no corpo funciona. Corpo de 18px/1.625 é confortável e acima da média.

**Problemas:**

1. **Números de dinheiro em Baloo 2** (na simulação da régua: "R$ 4.200", "R$ 2.877"). Baloo 2
   não tem tabular figures — os algarismos dançam e a percepção de precisão cai. Todo número
   deveria ser Inter (regra `money-*`, 1.5).
2. **Line-height de título** (ver 6.2).
3. **Caveat não aparece na página**, embora esteja carregada. Ou é usada com propósito (a voz da
   fundadora) ou é removida do bundle — hoje é peso morto no carregamento.
4. **`h3` em 15px** é menor que o corpo de 18px. Um título menor que o texto que ele encabeça é
   inversão de hierarquia; deveria ser `heading-s` (18px, peso 700).

---

## 6.4 Cor — **4/5** *(com um bloqueante)*

**Acertos:** a paleta é o maior ativo visual da marca. Verde-petróleo profundo com creme quente é
uma combinação praticamente ausente do segmento — nenhum concorrente parece com isso, e isso vale
mais que qualquer refinamento. A decisão de escurecer os acentos no modo claro (plum 0.685 →
0.518 de luminosidade) em vez de reutilizar o mesmo hex é tecnicamente sofisticada. Coral, sage
e amber têm papel semântico coerente.

**Problemas:**

1. 🔴 **Bloqueante: amber `#D9A441` sobre branco = 2.25:1.** Reprova WCAG AA até para texto
   grande. É o único defeito técnico real do produto. Correção: `amber-700 #825500` (6.46:1).
2. 🟡 **Coral noite em 4.53:1** — passa por 0.03. Sem folga para qualquer ajuste futuro.
   Adotar `coral-500 #DC7B6A` (5.64:1) para texto.
3. 🟡 **Bordas em 1.40:1 e 1.43:1** delimitando elementos. Aceitável para divisória decorativa,
   insuficiente (WCAG 1.4.11 exige 3:1) para contorno de controle.
4. 🟢 **Falta de rampa.** Cada acento existe como um hex por modo. Sem níveis intermediários, não
   há como construir estado hover, chip de fundo, barra de progresso ou gráfico sem inventar cor
   na hora — e é assim que sistemas se degradam. Resolvido na 1.2.

---

## 6.5 Usabilidade — **3,5/5**

| Ponto | Avaliação |
|---|---|
| Clareza da proposta em 5s | **Excelente.** "Seu mês cabe numa foto" + subtítulo entrega tudo |
| Fricção até o CTA | **Boa** no topo, **ruim** depois — sem CTA fixo |
| Legibilidade mobile | Boa; verificar reflow em 320px e Dynamic Type |
| Alvos de toque | FAQ e links do rodapé provavelmente abaixo de 44px — medir |
| Navegação | Inexistente. Aceitável em LP curta, custosa em LP de 9 seções |
| Formulário | Fora da página avaliada |
| Velocidade percebida | Boa; três webfonts é o principal risco — auditar com `font-display` |
| Prova social | **Ausente.** Zero depoimento, zero número, zero logo, zero avaliação |

**A maior oportunidade de conversão da página inteira não é estética: é prova.** A estrutura
argumentativa é excelente e termina sem nenhuma evidência externa de que funciona. Com base
pequena, ainda assim é possível: 3 depoimentos reais com nome e foto, ou um número agregado
honesto ("X lançamentos organizados nesta semana"). Nada inventado.

---

## 6.6 Acessibilidade — **3/5**

Auditoria completa na 1.4 e 3.6. Resumo:

| Item | Situação |
|---|---|
| Contraste de texto | 20 de 21 pares passam; 1 reprova (amber claro) 🔴 |
| Contraste de contorno | Bordas abaixo de 3:1 🟡 |
| Foco visível | A verificar — nenhum estilo de foco custom detectado |
| Hierarquia semântica | h1/h2/h3 presentes, mas h3 < corpo confunde leitor de tela e SEO |
| Acordeão do FAQ | Verificar `aria-expanded` e operação por teclado |
| Reduced motion | A verificar |
| Texto em 200% | A verificar |
| Idioma | Confirmar `lang="pt-BR"` |

---

## 6.7 Alinhamento estratégico — **4,5/5**

A página faz a coisa mais difícil do marketing: **ela recusa gente.** A seção "não é pra você se"
elimina quatro perfis explicitamente, inclusive quem quer o menor preço. Isso é alinhamento
estratégico de nível raro — a maioria das empresas não tem coragem, e é exatamente o que faz uma
marca ser lembrada por quem sobra.

O posicionamento contra o inimigo certo ("você não precisa de mais disciplina") ataca a premissa
de toda a categoria, não um concorrente específico. É defensável e duradouro.

**Onde perde meio ponto:** o produto promete "a gente organiza tudo" mas o modelo de preço
limita o mecanismo central a 3 usos/mês no grátis. Isso cria um descompasso entre a promessa da
marca (descarga mental) e a experiência gratuita (cota). Não é errado cobrar — mas o plano
grátis, do jeito que está, entrega a versão do produto que a marca diz que não funciona
(lançamento manual). Vale testar o trial de 7 dias com tudo liberado (teste A/B nº 7), que deixa
a pessoa sentir a promessa antes de decidir.

---

## 6.8 Correções priorizadas

### P0 — bloqueante (esta semana)

| # | Correção | Esforço | Impacto |
|---|---|---|---|
| 1 | Amber `#D9A441` → `#825500` em todo texto/ícone sobre fundo claro | 15 min | acessibilidade legal + legibilidade |
| 2 | Verificar e garantir `:focus-visible` visível em todo elemento interativo | 1 h | acessibilidade |
| 3 | Confirmar `lang="pt-BR"` e hierarquia de heading (h3 ≥ corpo) | 30 min | leitor de tela + SEO |

### P1 — alto impacto (2 semanas)

| # | Correção | Esforço | Impacto |
|---|---|---|---|
| 4 | Adicionar prova social real (3 depoimentos com foto ou 1 número agregado) | 1 dia | **maior ganho de conversão da lista** |
| 5 | CTA fixo no rodapé a partir de 40% de rolagem | 2 h | conversão |
| 6 | Corrigir line-height dos títulos (1.15–1.35) e `h3` para 18px | 1 h | hierarquia |
| 7 | Números de dinheiro em Inter tabular | 1 h | credibilidade |
| 8 | Foto real na seção da fundadora | 2 h | confiança |
| 9 | Bordas de controle para `border/strong` (≥3:1) | 2 h | acessibilidade |

### P2 — sistema (1 mês)

| # | Correção | Esforço | Impacto |
|---|---|---|---|
| 10 | Implementar as rampas de 9 níveis e os tokens semânticos (1.2/1.3) | 2 dias | escala e manutenção |
| 11 | Aplicar a escala tipográfica de 9 níveis (1.5) | 1 dia | hierarquia |
| 12 | Padronizar o Instagram com a regra de fundo por tipo (4.6) | 1 dia | reconhecimento de marca |
| 13 | Abrir por padrão as 2 perguntas críticas do FAQ | 30 min | objeção |
| 14 | Frase de honestidade sobre erro da IA | 30 min | confiança |
| 15 | Reduzir a lista de dor de 6 para 4 itens | 30 min | ritmo |

### P3 — exploratório

Nav com âncoras · barra de progresso de leitura · versão da LP para tráfego de "planilha" ·
teste do trial de 7 dias · página `/comece` dedicada por criativo.

---

## 6.9 Duas direções alternativas

### Direção Alt-1 — **"A Régua"** *(evolução do que existe · risco baixo · 2–3 semanas)*

**Tese:** o produto já tem um ativo visual único — a régua do mês — e ele está escondido dentro
de um mockup de celular. A direção promove a régua de componente a **linguagem visual da marca**.

**O que muda:**
- O hero deixa de ser "texto à esquerda, celular à direita" e passa a ser a régua em tamanho
  gigante, atravessando a tela, com o H1 escrito **sobre** ela.
- A linha da régua vira divisória entre todas as seções, com os pontos marcando o número da seção.
- Cada benefício ganha um ponto na régua — a página inteira vira um mês percorrido de cima a baixo.
- No Instagram, a régua vira a assinatura de rodapé de todo post.
- Paleta e tipografia permanecem; muda a composição.

**Ganho:** reconhecimento instantâneo, sistema visual próprio, custo baixo, zero risco de marca.
**Perda:** não resolve a ausência de prova social; é uma melhoria de forma, não de argumento.
**Quando escolher:** se a prioridade dos próximos 90 dias for consistência e crescimento
orgânico no Instagram.

---

### Direção Alt-2 — **"O Depoimento é a Página"** *(reposicionamento de execução · risco médio · 4–6 semanas)*

**Tese:** a página argumenta bem e prova nada. Esta direção inverte: **as pessoas passam a ser a
estrutura da página**, não uma seção dela.

**O que muda:**
- O hero vira um vídeo de 20s da Mariana falando a frase-título, com o texto sobreposto.
- Cada seção de benefício é ancorada em uma pessoa real com nome, foto e uma frase própria —
  a funcionalidade é explicada *pela* pessoa, não ao lado dela.
- A seção "não é pra você se" ganha um depoimento de alguém que **cancelou** e explica por quê.
  É o movimento mais arriscado e o mais poderoso: nenhum concorrente faria isso, e é
  perfeitamente coerente com "pra ser sincera com você".
- Os planos deixam de ser tabela de features e viram "o que a [nome] usa" / "o que a [nome] usa".
- O feed do Instagram vira majoritariamente rosto e voz, não card de texto.

**Ganho:** resolve a fraqueza nº 1 (prova) usando a força nº 1 (honestidade). Cria uma barreira
que concorrente com verba maior não copia, porque exige base real e disposição a mostrar o
cancelamento.
**Perda:** depende de conseguir usuários dispostos a aparecer, e de produção de vídeo recorrente.
Escala mais devagar e é mais caro de manter.
**Quando escolher:** se houver pelo menos 5 usuários satisfeitos dispostos a gravar. Sem isso,
não comece — depoimento fabricado destrói exatamente o ativo que a marca tem.

**Recomendação:** Alt-1 agora (baixo custo, ganho imediato de sistema) e Alt-2 como meta de 6
meses, alimentada pelo crescimento da base. As duas são compatíveis: a régua como linguagem
visual e as pessoas como estrutura de argumento não competem.

---

<a name="parte-7"></a>
# PARTE 7 — TENDÊNCIAS 2026 · FINANÇAS PESSOAIS

## 7.1 Cinco macro-tendências

---

### T1 — A interface conversacional deixou de ser recurso e virou o formulário

Durante quinze anos, registrar um gasto significou preencher campos: valor, categoria, data,
conta. Em 2026 isso está sendo substituído por **entrada em linguagem natural com confirmação
visual** — a pessoa fala ou escreve como falaria com alguém, e o sistema devolve um objeto
estruturado para revisar. O formulário não sumiu: virou a tela de conferência.

**Onde já se vê:** assistentes de voz que criam eventos a partir de uma frase; apps de nota que
transformam áudio em lista de tarefas estruturada; bots de finanças no WhatsApp que se
multiplicaram no Brasil justamente por dispensarem cadastro de campo.

**O que muda para o design:** o trabalho de UI migra de "desenhar campos" para **desenhar
confirmação**. A tela mais importante do produto passa a ser a de revisão do que foi entendido —
exatamente a tela 4 da Parte 3. Quem desenha bem a confirmação ganha; quem esconde o que a IA
entendeu perde confiança na primeira falha.

**Implicação para o Tá Resolvido:** o produto já nasceu nessa tendência. A vantagem não é ter
IA — em 2026 todo mundo tem. É ter desenhado a **revisão** melhor que os outros.

---

### T2 — Privacidade como recurso de produto, não como página de rodapé

O Open Finance normalizou a conexão bancária e, ao normalizar, criou o contra-público: uma
parcela significativa de usuários que **não conecta e não vai conectar**. Esse grupo era tratado
como perdido; em 2026 ele é um segmento endereçável, e "não pedimos sua senha do banco" virou
argumento de aquisição, não nota de rodapé.

**Onde já se vê:** apps de mensagem e navegadores vendendo privacidade como diferencial de
primeira linha; rótulos de privacidade obrigatórios nas lojas; a LGPD amadurecendo a expectativa
de que dado sensível pode ser recusado, não só protegido.

**O que muda para o design:** a promessa de privacidade sobe para o topo da hierarquia visual e
precisa ser **verificável dentro do produto**, não só afirmada no site. Padrões emergentes:
mostrar o que foi lido de um documento e o que foi descartado; declarar retenção em linguagem
simples no momento do upload; oferecer exportação e apagamento em um toque.

**Implicação:** "a imagem não fica guardada depois" é hoje uma frase na landing. Deveria ser um
**componente visível no produto**, no momento em que a pessoa manda a foto.

---

### T3 — Do painel para a narrativa: o resumo escrito supera o gráfico

Dashboards perderam prestígio. A percepção dominante é que gráfico exige que o usuário faça a
análise — e a maioria não quer. O que cresce é o **resumo em linguagem natural**: uma ou duas
frases que dizem o que aconteceu, escritas como uma pessoa diria.

**Onde já se vê:** retrospectivas anuais que viraram fenômeno cultural em música e apps de
saúde; relatórios de fim de período em ferramentas de trabalho que abrem com um parágrafo
escrito e só depois mostram números; apps de fitness que substituíram gráficos por frases.

**O que muda para o design:** tipografia e voz passam a ser componentes de dados. Um resumo mal
escrito é um bug. E surge um risco novo: o texto gerado que soa como coach. O padrão vencedor é
observação factual sem conselho.

**Implicação:** "um comentário sincero do seu mês" é literalmente esta tendência, e é o
diferencial mais difícil de copiar do produto — porque depende de voz, não de tecnologia.
A tela 8 deve ser tratada como um produto próprio, não como uma tela secundária.

---

### T4 — Design "expressivo" contra a era do cinza

Depois de quase uma década de minimalismo cinza e sem-serifa neutra, as duas grandes plataformas
mudaram de direção quase ao mesmo tempo — Apple com o **Liquid Glass** (iOS 26) e Google com o
**Material 3 Expressive** (Android 16), que trazem, respectivamente, camadas translúcidas com
refração e um sistema explicitamente mais colorido, mais tipográfico e mais animado. A mensagem
comum: interface pode ter personalidade de novo.

**O que muda para o design:** cor com papel semântico, tipografia com contraste real de peso e
tamanho, movimento com física. E, na direção oposta, um risco: apps que adotam o efeito visual
da plataforma sem ter identidade própria ficam **indistinguíveis** — todo mundo vira vidro.

**Implicação:** o Tá Resolvido já está bem posicionado, porque a personalidade dele vem de
paleta e tipografia próprias, não de efeito de sistema. A recomendação é **adotar os padrões de
interação** das plataformas (materiais, tipos de sheet, hápticos) e **não adotar** a estética —
manter Baloo 2, o verde-petróleo e o creme. Um efeito de vidro sobre o `night` é aceitável em
barras; um app inteiro translúcido apaga a marca.

---

### T5 — Cuidado como categoria: de "controle financeiro" para "carga mental"

A conversa pública sobre dinheiro está migrando de performance (investir mais, gastar menos,
otimizar) para **carga mental** (parar de carregar isso sozinho). Isso conecta finanças pessoais
a um movimento maior — trabalho invisível, sobrecarga doméstica, esgotamento — e abre espaço
para uma marca que se posiciona pelo alívio em vez do desempenho.

**Onde já se vê:** produtos de organização doméstica vendendo "divisão de carga mental"; apps de
saúde mental com linguagem de aceitação em vez de meta; a rejeição crescente à gamificação com
sequência diária (streak) e à culpa como mecânica de retenção.

**O que muda para o design:** notificação de culpa vira desinstalação. Streak vira passivo.
Métricas de vaidade ("você abriu o app 12 dias seguidos") saem. Entra a métrica de tempo
economizado e de tarefa que deixou de existir.

**Implicação:** é o território exato do Tá Resolvido, e é preciso defendê-lo por escrito — está
na régua de decisão da 2.2. Toda pressão de crescimento vai empurrar para notificação de
lembrete diário. Isso é a coisa que mais rápido destrói a marca.

---

## 7.2 Mapa de concorrentes 2×2

**Eixos escolhidos** — são os dois que o público realmente usa para decidir:

- **X — Esforço diário exigido:** quanto o produto pede da pessoa, todo dia, para continuar valendo.
- **Y — Profundidade do que entrega:** de "só registra" a "entende o mês inteiro, com recorrência, parcela e projeção".

```
                        PROFUNDIDADE ALTA
                              ▲
   Planilha própria           │        Apps completos de gestão
   (Excel, Sheets)            │        (Mobills, Organizze, YNAB)
   ● máxima flexibilidade     │        ● categorias, metas, relatórios
     custo diário brutal      │          exigem rotina de lançamento
                              │        ○ Open Finance = objeção da P3
                              │
                              │              ╔══════════════════╗
                              │              ║  ESPAÇO VAZIO    ║
                              │              ║  ● TÁ RESOLVIDO  ║
   ESFORÇO ALTO ──────────────┼──────────────║  profundidade    ║── ESFORÇO BAIXO
                              │              ║  sem rotina      ║
                              │              ╚══════════════════╝
                              │
   Caderno / anotação solta   │        App do próprio banco
   ● zero custo de adoção     │        ● automático, zero esforço
     zero visão do mês        │          só vê a conta daquele banco
                              │        Bots de WhatsApp
   Apps de gasto avulso       │        ● entrada fácil por conversa
   ● registram, não organizam │          raso: sem parcela, meta, recorrência
                              ▼
                        PROFUNDIDADE BAIXA
```

**Leitura do mapa.** O quadrante inferior-direito (esforço baixo) está ficando lotado — bots de
conversa e apps de banco entregam facilidade com rasura. O quadrante superior-esquerdo
(profundidade alta, esforço alto) é o mercado histórico, e é de lá que vem o público que
desistiu. **O canto superior-direito — profundidade alta com esforço baixo — é onde o Tá
Resolvido se coloca, e é estruturalmente difícil de ocupar**, porque exige três coisas ao mesmo
tempo: extração confiável (foto/áudio), modelo de dados sério (parcela, recorrência, limite) e
disciplina de recusa (não virar dashboard).

**O que vai atacar esse espaço nos próximos 12 meses:**

1. **Bots de WhatsApp subindo em profundidade.** Já têm a entrada fácil; falta modelo de dados.
   É o concorrente mais provável. Defesa: parcela em andamento, recorrência e resumo do mês —
   as três coisas que exigem produto, não prompt.
2. **Apps grandes descendo em esforço**, adicionando entrada por foto/áudio. Têm verba, mas
   carregam Open Finance e complexidade acumulada. Defesa: privacidade e simplicidade radical.
3. **Bancos incorporando categorização com IA.** Cobrem só a própria conta — e o público do Tá
   Resolvido usa mais de um banco. Defesa: ser o lugar onde tudo se junta sem conectar nada.

---

## 7.3 Mudanças de expectativa do usuário

| De (até ~2024) | Para (2026) | Consequência de produto |
|---|---|---|
| "Preciso aprender a usar" | "Isso tem que funcionar na primeira frase" | Onboarding morre; a primeira tela **é** a primeira ação |
| "IA é um diferencial" | "IA é o piso; o que importa é quando ela erra" | Correção precisa ser rápida, visível e memorizada |
| "Conectar o banco é conveniência" | "Conectar o banco é uma decisão que eu quero recusar" | Não conectar vira feature, não limitação |
| "Quero ver meus gráficos" | "Me diz o que aconteceu" | Texto antes de gráfico; gráfico como detalhe |
| "Notificação me ajuda a lembrar" | "Notificação que me cobra me faz desinstalar" | Frequência baixa; nunca culpa; nunca streak |
| "Assino e vejo depois" | "Quero saber o preço e como cancelar antes" | Preço e cancelamento visíveis, sem fricção |
| "Meus dados estão seguros?" | "Meus dados estão sendo usados pra treinar o quê?" | Declarar uso e retenção no momento do upload |
| "Um app por assunto" | "Que resolva junto com quem divide a casa" | Visão compartilhada vira expectativa (roadmap M5–M6) |

---

## 7.4 Evolução das plataformas

### iOS — Liquid Glass (iOS 26)

A linguagem visual da Apple passou a usar camadas translúcidas com refração, com barras e
controles flutuando sobre o conteúdo. Ícones de app e componentes de sistema foram redesenhados
para essa lógica.

**O que adotar:** materiais de sistema nas barras (o conteúdo passando por baixo dá profundidade
sem custo), o novo tratamento de ícone de app, sheets nativos com detents, hápticos do sistema,
Dynamic Type.
**O que não adotar:** translucidez no conteúdo do produto. Um card de lançamento translúcido
sobre `night` reduz contraste e coloca em risco os 4.5:1 conquistados. **Regra: vidro nas
bordas, tinta chapada no conteúdo.**
**Ação prática:** desenhar o ícone do app na especificação de camadas do iOS 26 — a Direção A de
logo (check-régua) é a que melhor sobrevive a isso, por ser feita de dois traços.

### Android — Material 3 Expressive (Android 16)

Google foi na direção oposta à do minimalismo: mais cor, mais contraste tipográfico, formas mais
variadas e movimento com física. Componentes ganharam variantes mais expressivas e a animação
passou a ser parte do sistema, não enfeite.

**O que adotar:** as curvas de movimento com física (compatíveis com a tabela 1.8), formas
variadas por hierarquia, `Material You` respeitando a cor do sistema **apenas** em superfícies
neutras.
**O que não adotar:** deixar a cor dinâmica do papel de parede substituir a cor da marca. Sage,
coral e amber são semânticos — não podem ser recolorizados pelo tema do usuário.

### Web

Consolidação de recursos que tornam o design system desta parte implementável sem hack:
`color-mix()` e cores em OKLCH (as rampas da 1.2 podem ser geradas em CSS), container queries
(componentes respondem ao container, não à viewport), `:has()`, view transitions para navegação,
`prefers-reduced-motion` amplamente suportado, e `light-dark()` simplificando o mapa de temas.
**Ação:** o Tailwind da Parte 8 já assume essa base.

---

## 7.5 Roadmap de design — 6 meses

| Mês | Foco | Entregas | Como saber que deu certo |
|---|---|---|---|
| **M1** | Corrigir e fundar | P0 e P1 da 6.8 · tokens da 1.10 publicados · biblioteca Figma `Foundations` | contraste 100% AA · zero hex solto no código |
| **M2** | Sistema de componentes | 41 componentes da 1.9 no Figma e no Storybook · dark mode por troca de modo · lint de design ativo | tela do modo noite sem ajuste manual |
| **M3** | A tela que converte | Redesenho das telas 3 e 4 (lançar e revisar em lote) · microinterações 1, 4, 10 | 1º lançamento em <3 min para 70% dos novos |
| **M4** | A tela que retém | Tela 8 (resumo do mês) tratada como produto · voz revisada · compartilhamento sem valores | 25% dos ativos abrindo o resumo · taxa de compartilhamento |
| **M5** | Identidade | Logo (direção B+A) aplicado · ícone iOS 26 · Instagram padronizado (4.6) · brand book 20pg | reconhecimento do feed sem ler o @ |
| **M6** | Confiança e prova | Componente de privacidade no upload · prova social na LP (Alt-2 parcial) · acessibilidade auditada com usuário real | conversão da LP · aprovação em teste com leitor de tela |

**Fora do roadmap, de propósito:** gamificação, streak, lembrete diário, gráfico de investimento,
integração bancária. Cada um desses aparecerá como pedido; cada um contraria a régua da 2.2.

---

## 7.6 Direção de mood board

Cinco painéis. O mood board não é coleção de referências bonitas — é um argumento visual.

**Painel 1 — "A mesa da cozinha, 22h40"**
Fotografia doméstica real, luz quente de luminária, celular na mão, papel amassado, criança fora
de foco. Nada de escritório. É o contexto de uso da P1, e ele precisa estar visível o tempo todo
para o time não desenhar para um usuário que não existe.

**Painel 2 — "Papel, não vidro"**
Texturas: papel offset não revestido, recibo térmico, caderno de anotação, tinta que borra
levemente. É o antídoto ao Liquid Glass: a marca é **tátil e opaca** enquanto todo mundo fica
translúcido. Serve de referência para superfícies, granulação sutil e escolha de papel impresso.

**Painel 3 — "Uma linha resolve"**
Cartografia, régua de arquiteto, linha do tempo de exposição, notação musical, marcação em
madeira. Tudo que transforma quantidade em posição numa linha. É a fonte visual da régua do mês
e do elemento gráfico recorrente da marca.

**Painel 4 — "Verde profundo, creme quente"**
Referências cromáticas fora do universo de finanças: encadernação antiga, esmalte de panela
esverdeado, papel de parede desbotado, cerâmica vitrificada, folhagem em sombra. O objetivo é
manter a paleta longe da referência "fintech" — a inspiração vem de objetos domésticos, não de
apps.

**Painel 5 — "Alívio, não vitória"**
Expressões e gestos: ombro que baixa, suspiro, ler algo e sorrir de canto de boca, fechar o
laptop. **Não entra:** punho fechado, pulo, confete, high-five. A emoção-alvo da marca é alívio,
e as duas se parecem em briefing mas são opostas em imagem.

**Como usar:** o painel 5 é o filtro final. Antes de aprovar qualquer peça — anúncio, tela,
post — pergunte: isso é alívio ou é vitória? Se for vitória, está fora da marca.

**Fontes consultadas para 7.4:**
[Liquid Glass — Wikipedia](https://en.wikipedia.org/wiki/Liquid_Glass) ·
[iOS 26 Explained: Apple's Biggest Update for Developers](https://www.index.dev/blog/ios-26-developer-guide) ·
[Google launches Material 3 Expressive redesign for Android](https://blog.google/products-and-platforms/platforms/android/material-3-expressive-android-wearos-launch/) ·
[Material 3 Expressive deep dive — Android Authority](https://www.androidauthority.com/google-material-3-expressive-features-changes-availability-supported-devices-3556392/)

---

<a name="parte-8"></a>
# PARTE 8 — CÓDIGO DE PRODUÇÃO

Stack assumida: **React 19 + TypeScript + Tailwind CSS + Vite** (compatível com Next.js App
Router). O site atual já usa Tailwind com variáveis `--color-brand-*`, então a migração abaixo é
incremental, não uma reescrita.

## 8.1 Estrutura de pastas

```
src/
├── styles/
│   ├── tokens.css              ← gerado por style-dictionary a partir do design-tokens.json
│   └── globals.css             ← reset, fontes, base
├── lib/
│   ├── cn.ts                   ← clsx + tailwind-merge
│   ├── format.ts               ← formatação de moeda e data pt-BR
│   └── theme.tsx               ← ThemeProvider (light | dark | system)
├── components/
│   ├── primitives/             ← Text, Surface, Divider, VisuallyHidden
│   ├── actions/                ← Button, IconButton, Link, SegmentedControl, Fab
│   ├── forms/                  ← TextField, MoneyInput, Select, Checkbox, Switch, …
│   ├── data/                   ← Card, TransactionRow, StatTile, RulerTimeline, GoalMeter
│   ├── feedback/               ← Toast, InlineAlert, Dialog, BottomSheet, Skeleton
│   └── navigation/             ← TabBar, TopAppBar, MonthSwitcher
├── features/
│   ├── ruler/                  ← tela 2
│   ├── entry/                  ← telas 3, 4, 5
│   ├── categories/             ← tela 6
│   ├── goals/                  ← tela 7
│   └── summary/                ← tela 8
└── app/
```

**Regra de dependência:** `features/` importa de `components/`; `components/` **nunca** importa de
`features/`. `primitives/` não importa de ninguém.

---

## 8.2 Tokens em CSS

`tokens.css` — saída do build, nunca editado à mão:

```css
:root {
  /* ─── primitivos ─────────────────────────────────────────── */
  --plum-100:#FAF3FA; --plum-200:#F0E3EF; --plum-300:#E2CBE0; --plum-400:#CAACC8;
  --plum-500:#B08CAE; --plum-600:#937091; --plum-700:#725470; --plum-800:#513950; --plum-900:#2E1E2E;
  --sage-100:#F0F8F1; --sage-200:#DDEDE0; --sage-300:#C0DCC6; --sage-400:#9DC3A5;
  --sage-500:#78A783; --sage-600:#5C8A67; --sage-700:#436A4D; --sage-800:#2B4B33; --sage-900:#142A1A;
  --amber-100:#FFF4E5; --amber-200:#F8E5C8; --amber-300:#EFCE9D; --amber-400:#DBAF6A;
  --amber-500:#C48F2D; --amber-600:#A67200; --amber-700:#825500; --amber-800:#5E3A00; --amber-900:#371E00;
  --coral-100:#FFF1ED; --coral-200:#FFDED7; --coral-300:#FFC3B7; --coral-400:#F0A091;
  --coral-500:#DC7B6A; --coral-600:#BB5E4E; --coral-700:#944437; --coral-800:#6C2B22; --coral-900:#41140D;
  --teal-100:#EDF9F6; --teal-400:#91C3BB; --teal-700:#336B63; --teal-800:#1D4B45; --teal-900:#092B26;
  --sand-100:#F7F6F1; --sand-300:#D9D3C3; --sand-400:#BFB7A2; --sand-600:#867D63; --sand-700:#675F49;
  --white:#FFFFFF; --ink:#1A1A1A; --ink-soft:#6B645A;
  --cream:#F5EDE0; --cream-hi:#FBF4D9; --paper:#F0EAD9; --paper-soft:#9BAFA9;
  --night:#14201F; --night-card:#1D2B29; --night-line:#2C3B39;
  --night-line-strong:#5C7C76; --night-fg-subtle:#6E837E;

  /* ─── semânticos · modo dia (padrão) ─────────────────────── */
  --bg-canvas:var(--white);      --bg-subtle:var(--cream);
  --bg-raised:var(--white);      --bg-sunken:var(--sand-100);   --bg-inverse:var(--night);
  --fg-default:var(--ink);       --fg-muted:var(--ink-soft);    --fg-subtle:var(--sand-600);
  --fg-on-accent:var(--white);   --fg-inverse:var(--paper);
  --border-default:#E3D9C4;      --border-strong:var(--sand-600); --border-focus:var(--plum-700);
  --accent:var(--plum-700);      --accent-hover:var(--plum-800); --accent-subtle:var(--plum-200);
  --income:var(--sage-700);      --income-subtle:var(--sage-200);
  --expense:var(--coral-700);    --expense-subtle:var(--coral-200);
  --warning:var(--amber-700);    --warning-subtle:var(--amber-200);
  --info:var(--teal-700);        --danger:var(--coral-800);
  --scrim:rgb(26 26 26 / .45);
  --shadow-1:0 1px 2px rgb(26 26 26 / .06);
  --shadow-2:0 4px 12px rgb(26 26 26 / .08);
  --shadow-3:0 12px 32px rgb(26 26 26 / .12);
  --shadow-4:0 24px 64px rgb(26 26 26 / .16);
  color-scheme: light;
}

[data-theme="dark"] {
  --bg-canvas:var(--night);       --bg-subtle:var(--night-card);
  --bg-raised:var(--night-card);  --bg-sunken:var(--teal-900);   --bg-inverse:var(--paper);
  --fg-default:var(--paper);      --fg-muted:var(--paper-soft);  --fg-subtle:var(--night-fg-subtle);
  --fg-on-accent:var(--ink);      --fg-inverse:var(--ink);
  --border-default:var(--night-line); --border-strong:var(--night-line-strong);
  --border-focus:var(--plum-400);
  --accent:var(--plum-500);       --accent-hover:var(--plum-400); --accent-subtle:var(--plum-900);
  --income:var(--sage-500);       --income-subtle:var(--sage-900);
  --expense:var(--coral-500);     --expense-subtle:var(--coral-900);
  --warning:var(--amber-400);     --warning-subtle:var(--amber-900);
  --info:var(--teal-400);         --danger:var(--coral-400);
  --scrim:rgb(9 43 38 / .65);
  /* elevação no escuro = superfície + borda, não sombra */
  --shadow-1:none; --shadow-2:none; --shadow-3:none; --shadow-4:none;
  color-scheme: dark;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* mesmas declarações de [data-theme="dark"] */ }
}
```

> **Por que `[data-theme]` e não só a media query:** a tela 9 oferece "Automático / Claro /
> Escuro". `data-theme` no `<html>` permite a escolha explícita vencer a preferência do sistema
> nos dois sentidos.

---

## 8.3 Tailwind com os tokens

`tailwind.config.ts` — o Tailwind consome **só** os semânticos. Nenhuma classe de cor crua
(`bg-purple-500`) é permitida; o `safelist` vazio + lint garantem isso.

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        canvas:'var(--bg-canvas)', subtle:'var(--bg-subtle)',
        raised:'var(--bg-raised)', sunken:'var(--bg-sunken)', inverse:'var(--bg-inverse)',
        fg:        { DEFAULT:'var(--fg-default)', muted:'var(--fg-muted)',
                     subtle:'var(--fg-subtle)', 'on-accent':'var(--fg-on-accent)',
                     inverse:'var(--fg-inverse)' },
        line:      { DEFAULT:'var(--border-default)', strong:'var(--border-strong)',
                     focus:'var(--border-focus)' },
        accent:    { DEFAULT:'var(--accent)', hover:'var(--accent-hover)',
                     subtle:'var(--accent-subtle)' },
        income:    { DEFAULT:'var(--income)',  subtle:'var(--income-subtle)' },
        expense:   { DEFAULT:'var(--expense)', subtle:'var(--expense-subtle)' },
        warning:   { DEFAULT:'var(--warning)', subtle:'var(--warning-subtle)' },
        info:'var(--info)', danger:'var(--danger)',
      },
      fontFamily: {
        display:['"Baloo 2"','"Trebuchet MS"','system-ui','sans-serif'],
        ui:['Inter','-apple-system','Segoe UI','Roboto','sans-serif'],
        voice:['Caveat','cursive'],
      },
      fontSize: {
        'display-xl':['3.5rem',{ lineHeight:'1.02', letterSpacing:'-0.02em',  fontWeight:'800' }],
        'display-l' :['2.75rem',{lineHeight:'1.06', letterSpacing:'-0.015em', fontWeight:'800' }],
        'heading-l' :['2rem',   {lineHeight:'1.15', letterSpacing:'-0.01em',  fontWeight:'700' }],
        'heading-m' :['1.5rem', {lineHeight:'1.25', fontWeight:'700' }],
        'heading-s' :['1.125rem',{lineHeight:'1.35',fontWeight:'700' }],
        'body-l'    :['1.125rem',{lineHeight:'1.625',fontWeight:'500' }],
        'body-m'    :['1rem',   {lineHeight:'1.55' }],
        'body-s'    :['0.875rem',{lineHeight:'1.5' }],
        'label'     :['0.75rem',{lineHeight:'1.35', letterSpacing:'0.08em', fontWeight:'600' }],
      },
      spacing: { '2':'2px','4':'4px','8':'8px','12':'12px','16':'16px','24':'24px',
                 '32':'32px','40':'40px','48':'48px','64':'64px','80':'80px','96':'96px','128':'128px' },
      borderRadius: { sm:'8px', md:'12px', lg:'16px', xl:'24px', '2xl':'32px', full:'9999px' },
      boxShadow: { 1:'var(--shadow-1)', 2:'var(--shadow-2)', 3:'var(--shadow-3)', 4:'var(--shadow-4)' },
      screens: { sm:'480px', md:'768px', lg:'1024px', xl:'1280px', '2xl':'1536px' },
      transitionTimingFunction: {
        standard:'cubic-bezier(.2,0,0,1)', decelerate:'cubic-bezier(.32,.72,0,1)',
        accelerate:'cubic-bezier(.4,0,1,1)', overshoot:'cubic-bezier(.34,1.42,.64,1)',
      },
      transitionDuration: { instant:'100ms', fast:'160ms', base:'240ms', slow:'380ms', spring:'520ms' },
      keyframes: {
        'sheet-in':  { from:{ transform:'translateY(100%)' }, to:{ transform:'translateY(0)' } },
        'save-pop':  { '0%':{ transform:'scale(0)', opacity:'0' },
                       '60%':{ transform:'scale(1.15)', opacity:'1' },
                       '100%':{ transform:'scale(1)' } },
        shimmer:     { '100%':{ transform:'translateX(100%)' } },
      },
      animation: {
        'sheet-in':'sheet-in 380ms cubic-bezier(.32,.72,0,1)',
        'save-pop':'save-pop 520ms cubic-bezier(.34,1.42,.64,1)',
        shimmer:'shimmer 1.4s infinite',
      },
    },
  },
} satisfies Config
```

**Regra de acessibilidade global** (em `globals.css`):

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .12s !important;
    scroll-behavior: auto !important;
  }
}
:focus-visible { outline: 2px solid var(--border-focus); outline-offset: 2px; border-radius: 4px; }
body { background: var(--bg-canvas); color: var(--fg-default); font-family: Inter, sans-serif;
       -webkit-font-smoothing: antialiased; }
.tabular { font-variant-numeric: tabular-nums; }
```

---

## 8.4 Tema — provider e persistência

```tsx
// lib/theme.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Mode = 'light' | 'dark' | 'system'
const ThemeCtx = createContext<{ mode: Mode; setMode: (m: Mode) => void }>(null!)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(
    () => (localStorage.getItem('theme') as Mode) ?? 'system'
  )

  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const resolved = mode === 'system' ? (mq.matches ? 'dark' : 'light') : mode
      root.setAttribute('data-theme', resolved)
    }
    apply()
    localStorage.setItem('theme', mode)
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [mode])

  return <ThemeCtx.Provider value={{ mode, setMode }}>{children}</ThemeCtx.Provider>
}
export const useTheme = () => useContext(ThemeCtx)
```

**Anti-flash (script inline no `<head>`, antes de qualquer CSS):**

```html
<script>
  (function () {
    var t = localStorage.getItem('theme') || 'system'
    var d = t === 'dark' || (t === 'system' &&
            matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.setAttribute('data-theme', d ? 'dark' : 'light')
  })()
</script>
```

---

## 8.5 Componente de referência — `Button`

Implementa os 8 estados da 1.9 e serve de molde para todos os outros.

```tsx
// components/actions/Button.tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'tertiary' | 'income' | 'expense' | 'danger'
type Size = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
  fullWidth?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  /** Obrigatório quando o botão só tem ícone. */
  'aria-label'?: string
}

const base =
  'inline-flex items-center justify-center gap-8 rounded-lg font-display font-semibold ' +
  'transition-colors duration-fast ease-standard select-none ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus ' +
  'active:scale-[.98] motion-reduce:active:scale-100 ' +
  'disabled:opacity-45 disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary:   'bg-accent text-fg-on-accent hover:bg-accent-hover',
  secondary: 'bg-transparent text-fg border border-line-strong hover:bg-sunken',
  tertiary:  'bg-transparent text-accent hover:bg-accent-subtle',
  income:    'bg-income-subtle text-income hover:brightness-[.97]',
  expense:   'bg-expense-subtle text-expense hover:brightness-[.97]',
  danger:    'bg-transparent text-danger border border-danger hover:bg-expense-subtle',
}

const sizes: Record<Size, string> = {
  sm: 'h-40 px-16 text-[0.875rem]',
  md: 'h-48 px-32 text-[0.96875rem]',
  lg: 'h-56 px-32 text-[1.0625rem]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', isLoading = false, fullWidth = false,
    iconLeft, iconRight, children, className, disabled, ...rest }, ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      {...rest}
    >
      {isLoading ? (
        <>
          <Spinner aria-hidden />
          <span className="sr-only">Carregando</span>
          {/* mantém a largura para não haver salto de layout */}
          <span className="invisible absolute">{children}</span>
        </>
      ) : (
        <>
          {iconLeft && <span aria-hidden className="shrink-0">{iconLeft}</span>}
          {children}
          {iconRight && <span aria-hidden className="shrink-0">{iconRight}</span>}
        </>
      )}
    </button>
  )
})
```

**Decisões que valem para toda a biblioteca:** `forwardRef` sempre (composição com Radix,
tooltip, foco programático) · `disabled` derivado também de `isLoading` · ícone decorativo com
`aria-hidden` · nenhuma cor literal · `active:scale` desligado em `motion-reduce` · texto
alternativo para leitor de tela via `.sr-only`.

---

## 8.6 Componente com dado — `TransactionRow`

```tsx
// components/data/TransactionRow.tsx
import { cn } from '@/lib/cn'
import { formatBRL, formatShortDate } from '@/lib/format'

export type TxState = 'default' | 'pending-ai' | 'saving' | 'just-saved' | 'error-sync'

export interface TransactionRowProps {
  id: string
  description: string
  amountCents: number          // negativo = saiu
  date: string                 // ISO
  category: { id: string; label: string; icon: React.ReactNode }
  state?: TxState
  installment?: { current: number; total: number }
  onOpen: (id: string) => void
}

export function TransactionRow({
  id, description, amountCents, date, category,
  state = 'default', installment, onOpen,
}: TransactionRowProps) {
  const isIncome = amountCents >= 0
  const money = formatBRL(amountCents)

  return (
    <button
      type="button"
      onClick={() => onOpen(id)}
      aria-label={`${description}, ${isIncome ? 'entrou' : 'saiu'} ${money}, ${formatShortDate(date)}, categoria ${category.label}`}
      className={cn(
        'group flex w-full items-center gap-12 rounded-md px-16 py-12 text-left',
        'transition-colors duration-fast ease-standard',
        'hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-line-focus',
        state === 'pending-ai' && 'border border-dashed border-warning bg-warning-subtle',
        state === 'just-saved' && 'animate-[save-pop_520ms_cubic-bezier(.34,1.42,.64,1)]',
        state === 'saving' && 'opacity-60 pointer-events-none',
      )}
    >
      <span aria-hidden className="grid size-40 shrink-0 place-items-center rounded-full bg-sunken">
        {category.icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate font-ui text-body-m text-fg">{description}</span>
        <span className="block text-body-s text-fg-muted">
          {formatShortDate(date)}
          {installment && ` · parcela ${installment.current}/${installment.total}`}
        </span>
      </span>

      <span
        className={cn('tabular font-ui font-semibold text-body-m',
          isIncome ? 'text-income' : 'text-expense')}
      >
        {/* o sinal é redundante com a cor — WCAG 1.4.1 */}
        {isIncome ? '+' : '−'} {money}
      </span>
    </button>
  )
}
```

**Pontos de acessibilidade:** a linha inteira é **um** `<button>` (não uma `div` com vários
alvos), o nome acessível é a frase completa em português, e o **sinal +/− duplica a informação
de cor**, atendendo 1.4.1.

---

## 8.7 Gerenciamento de estado

| Tipo de estado | Onde vive | Ferramenta |
|---|---|---|
| Servidor (lançamentos, metas, plano) | cache de query | **TanStack Query** com `staleTime` de 30s |
| Sessão/auth | contexto | `AuthProvider` + cookie httpOnly |
| Tema | contexto + `localStorage` | `ThemeProvider` (8.4) |
| Mês selecionado | **URL** (`?mes=2026-11`) | `useSearchParams` — compartilhável e volta com o botão voltar |
| Formulário | local | `react-hook-form` + `zod` |
| Sheet/modal aberto | local do feature | `useState` |
| Toast | store global leve | `zustand` (fila com máx. 3) |
| Rascunho não enviado | `localStorage` com TTL | recuperado ao reabrir |

**Padrão de mutação otimista** — é o que faz o lançamento parecer instantâneo:

```ts
const save = useMutation({
  mutationFn: createEntry,
  onMutate: async (draft) => {
    await qc.cancelQueries({ queryKey: ['month', monthId] })
    const prev = qc.getQueryData(['month', monthId])
    qc.setQueryData(['month', monthId], (old) => addOptimistic(old, draft))
    return { prev }
  },
  onError: (_e, _v, ctx) => {
    qc.setQueryData(['month', monthId], ctx!.prev)
    toast.error('Não deu pra salvar agora. Tentar de novo?', { action: retry })
  },
  onSettled: () => qc.invalidateQueries({ queryKey: ['month', monthId] }),
})
```

**Regra:** toda ação destrutiva é otimista **com desfazer de 8 segundos** (1.9.31), e a chamada
real ao servidor só dispara quando o toast expira.

---

## 8.8 Responsividade

Mobile-first sempre — a classe sem prefixo é a de 320px.

```tsx
<main className="mx-auto w-full max-w-[1320px] px-16 sm:px-24 md:px-32 lg:px-40 xl:px-64">
  <section className="grid grid-cols-4 gap-16 md:grid-cols-8 md:gap-24 lg:grid-cols-12">
    <div className="col-span-4 md:col-span-8 lg:col-span-7">…</div>
    <aside className="col-span-4 md:col-span-8 lg:col-span-5">…</aside>
  </section>
</main>
```

**Container queries** para componentes que aparecem em larguras diferentes (o mesmo `Card` no
feed e na sidebar):

```tsx
<div className="@container">
  <article className="flex flex-col gap-12 @md:flex-row @md:items-center @md:gap-24">…</article>
</div>
```

**Safe areas (PWA / app):**

```css
.tabbar { padding-bottom: max(8px, env(safe-area-inset-bottom)); }
.sheet  { padding-bottom: max(24px, env(safe-area-inset-bottom)); }
```

**Checklist responsivo por tela:** 320px sem rolagem horizontal · texto do sistema em 200% sem
corte · teclado aberto não cobre o campo em foco (`scroll-margin-bottom: 96px` nos inputs) ·
landscape em telefone não quebra o sheet.

---

## 8.9 Otimização de assets

**Fontes** — o item de maior impacto, já que são três famílias:

```html
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="font" type="font/woff2" crossorigin
      href="/fonts/inter-var-latin.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin
      href="/fonts/baloo2-var-latin.woff2">
```

```css
@font-face { font-family:'Inter'; src:url('/fonts/inter-var-latin.woff2') format('woff2');
  font-weight:400 700; font-display:swap;
  unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02C6,U+2000-206F,U+20AC; }
@font-face { font-family:'Baloo 2'; src:url('/fonts/baloo2-var-latin.woff2') format('woff2');
  font-weight:700 800; font-display:swap; }
@font-face { font-family:'Caveat'; src:url('/fonts/caveat-latin.woff2') format('woff2');
  font-weight:600; font-display:optional; }  /* decorativa: nunca bloqueia render */
```

Auto-hospedar (não carregar do Google Fonts), subsetar para latim + latim estendido (o pt-BR
precisa de `ã õ ç á é í ó ú â ê ô à`), usar versões variáveis. **Meta: < 120 KB de fonte no total.**

**Imagens:** AVIF com fallback WebP · `<img>` sempre com `width`/`height` (zero CLS) ·
`loading="lazy"` fora da primeira dobra e `fetchpriority="high"` na imagem do hero ·
`srcset` em 1×/2× · print enviado pelo usuário redimensionado **no cliente** para no máximo
1600px na maior dimensão antes do upload (economiza banda e acelera o processamento).

**Ícones:** sprite SVG único com `<use>`, ou componentes tree-shakeable. Nunca uma fonte de ícones.

**JS:** rotas com `React.lazy` + `Suspense` · gráfico da régua carregado sob demanda ·
`@tanstack/query` com `persistQueryClient` para abertura offline.

**Orçamento de performance (a falhar o build se estourar):**
LCP < 2.0s em 4G · CLS < 0.05 · INP < 200ms · JS inicial < 180 KB gzip · CSS < 40 KB gzip.

---

## 8.10 Storybook

`.storybook/preview.ts` com o alternador de tema e o teste de acessibilidade sempre ligados:

```ts
import '../src/styles/tokens.css'
import '../src/styles/globals.css'

export const globalTypes = {
  theme: { defaultValue: 'light',
    toolbar: { title: 'Tema', icon: 'circlehollow', items: ['light', 'dark', 'side-by-side'] } },
}

export const decorators = [
  (Story, ctx) => {
    const t = ctx.globals.theme
    if (t === 'side-by-side')
      return (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr' }}>
          <div data-theme="light" style={{ background:'var(--bg-canvas)', padding:24 }}><Story/></div>
          <div data-theme="dark"  style={{ background:'var(--bg-canvas)', padding:24 }}><Story/></div>
        </div>
      )
    document.documentElement.setAttribute('data-theme', t)
    return <Story />
  },
]

export const parameters = {
  a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } },
  viewport: { viewports: {
    xs:{ name:'320', styles:{ width:'320px', height:'720px' } },
    mobile:{ name:'390', styles:{ width:'390px', height:'844px' } },
    tablet:{ name:'768', styles:{ width:'768px', height:'1024px' } },
    desktop:{ name:'1280', styles:{ width:'1280px', height:'900px' } },
  }},
}
```

**Story de referência:**

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Actions/Button',
  component: Button,
  parameters: { docs: { description: { component:
    'Botão. Um `primary` por tela. Ver seção 1.9.1 do design system.' } } },
  argTypes: {
    variant: { control:'select',
      options:['primary','secondary','tertiary','income','expense','danger'] },
    size: { control:'inline-radio', options:['sm','md','lg'] },
  },
}
export default meta
type S = StoryObj<typeof Button>

export const Primary: S = { args: { children:'Quero começar, de graça' } }
export const AllVariants: S = { render: () => (
  <div className="flex flex-wrap gap-16">
    {(['primary','secondary','tertiary','income','expense','danger'] as const)
      .map(v => <Button key={v} variant={v}>{v}</Button>)}
  </div>
)}
export const AllStates: S = { render: () => (
  <div className="flex flex-wrap gap-16">
    <Button>default</Button>
    <Button className="bg-accent-hover">hover</Button>
    <Button autoFocus>focus</Button>
    <Button disabled>disabled</Button>
    <Button isLoading>salvando</Button>
  </div>
)}
export const OnDark: S = {
  args: { children:'No modo noite' },
  globals: { theme: 'dark' },
}
```

**Obrigatório em toda story:** as 6 variantes, os 8 estados, uma story no modo noite,
uma em 320px, e o addon `a11y` sem violações. **Componente sem story completa não entra na
biblioteca.**

---

## 8.11 Qualidade automatizada

| Verificação | Ferramenta | Quando |
|---|---|---|
| Nenhum hex fora de `tokens.css` | ESLint custom + `stylelint-no-hex` | pre-commit |
| Nenhuma classe de cor crua do Tailwind | regex no CI | PR |
| Contraste dos pares semânticos | script de contraste (o mesmo da 1.4) | CI |
| Acessibilidade por componente | `@storybook/addon-a11y` + `axe-playwright` | CI |
| Regressão visual nos dois temas | Chromatic ou Playwright screenshots | PR |
| Orçamento de bundle | `size-limit` | CI (falha o build) |
| Tipos | `tsc --noEmit` | pre-commit |
| Textos de UI | dicionário PT-BR + lista de palavras proibidas (glossário 2.3) | CI (aviso) |

---

<a name="anexo"></a>
# ANEXO — BRIEFING DE APLICAÇÃO

Este anexo existe para ser colado na conta do Claude da Mariana. Ele transforma o documento em
instruções acionáveis.

## A.1 Mensagem para abrir a conversa no Claude dela

> Anexei um documento chamado **"Tá Resolvido — Sistema Completo de Design, Marca e
> Go-to-Market"**. Ele contém o design system, a identidade de marca, a UI do app, a campanha,
> as specs de Figma, a crítica do site atual, as tendências e o código de produção do meu
> projeto (taresolvido.app).
>
> Leia o documento inteiro antes de responder. Depois, trate-o como a **fonte da verdade** para
> tudo que envolver design, marca ou copy do Tá Resolvido: sempre que eu pedir alguma coisa,
> confira antes se o documento já define o padrão, e siga o que está lá em vez de inventar.
>
> Regras que valem para toda a nossa conversa daqui em diante:
> 1. Cor: só os tokens da seção 1.3. Nunca um hex novo.
> 2. Tipografia: só os 9 níveis da seção 1.5. Dinheiro sempre em Inter tabular.
> 3. Espaçamento: só a escala de 8px da 1.6.
> 4. Componentes: só os 41 da seção 1.9. Se precisar de um novo, me avise antes de criar.
> 5. Texto: o glossário e o tom da seção 2.3. Nada de jargão financeiro, nada de culpa.
> 6. Antes de aprovar qualquer peça, aplique o filtro da 7.6: "isso é alívio ou é vitória?"
>
> Comece me dizendo, em uma lista curta, quais são os itens P0 da seção 6.8 e o que você
> precisa de mim para executá-los.

## A.2 Ordem sugerida de execução

| Ordem | O que pedir ao Claude | Seções de referência |
|---|---|---|
| 1 | Corrigir o amber `#D9A441` para `#825500` em todo o site | 1.2.3 · 6.8 P0 |
| 2 | Gerar o `tokens.css` e o `tailwind.config.ts` completos e substituir os `--color-brand-*` atuais | 8.2 · 8.3 |
| 3 | Aplicar a escala tipográfica (corrigir line-height dos títulos e o `h3` menor que o corpo) | 1.5 · 6.3 |
| 4 | Trocar todos os números de dinheiro para Inter tabular | 1.5 · 8.6 |
| 5 | Adicionar CTA fixo no rodapé a partir de 40% de rolagem | 6.8 P1 |
| 6 | Escrever os textos de todos os estados vazios e de erro do app | 3.4 |
| 7 | Implementar os componentes na ordem: Button → TextField → Card → TransactionRow → Toast | 1.9 · 8.5 · 8.6 |
| 8 | Montar o Storybook com o alternador de tema e o teste de acessibilidade | 8.10 |
| 9 | Redesenhar as telas 3 e 4 (lançar e revisar em lote) | 3.3 |
| 10 | Padronizar o Instagram: fundo por tipo de post + os 10 posts | 4.6 |
| 11 | Montar as campanhas de Google e Meta com a copy pronta | 4.2 · 4.3 |
| 12 | Programar a sequência de 5 e-mails | 4.4 |
| 13 | Rodar os testes A/B na ordem 1 → 3 → 4 → 7 | 4.7 |
| 14 | Desenhar o logo nas direções B + A e o ícone para iOS 26 | 2.4 · 7.4 |
| 15 | Montar o brand book de 20 páginas | 2.8 |

## A.3 Perguntas que ficaram em aberto

Coisas que o documento **assume** e que ela precisa confirmar ou decidir:

1. **Prova social existe?** A recomendação nº 4 da 6.8 (maior ganho de conversão) depende de ter
   usuários dispostos a dar depoimento. Se não houver ainda, usar número agregado real — nunca
   depoimento inventado.
2. **"Mariana" é o nome real da fundadora na comunicação?** O documento usa o nome como aparece
   na landing.
3. **O app já existe em produção ou está em desenvolvimento?** As telas da Parte 3 foram
   desenhadas a partir dos prints do site e do Instagram; se a implementação já divergir, a
   Parte 3 é proposta, não descrição.
4. **Há orçamento de mídia?** A Parte 4 assume teste pago. Sem verba, priorizar 4.6 (orgânico) e
   4.4 (e-mail).
5. **Quem mantém o design system?** A governança da 5.9 precisa de um dono nomeado.
6. **Pantone:** os valores da 2.5 são aproximações calculadas. Antes de qualquer impressão,
   validar em guia físico.

## A.4 O que este documento **não** cobre

Para evitar suposição: não há aqui arquitetura de backend, modelagem de banco, política de
privacidade jurídica, estratégia de precificação com margem, plano de mídia com verba, SEO
técnico, nem os arquivos vetoriais do logo (as direções da 2.4 são especificações para desenho,
não os arquivos prontos).

---

## Checklist final de conformidade

Antes de dar qualquer peça por pronta, verifique:

- [ ] Nenhuma cor fora dos tokens da 1.3
- [ ] Nenhum tamanho de texto fora dos 9 níveis da 1.5
- [ ] Nenhum espaçamento fora da escala de 8px
- [ ] Contraste de texto ≥ 4.5:1 e de contorno de controle ≥ 3:1
- [ ] Funciona nos dois temas sem ajuste manual
- [ ] Alvos de toque ≥ 44×44
- [ ] Todo gesto tem alternativa visível
- [ ] Nenhuma palavra do glossário proibido (2.3)
- [ ] Nenhum texto que culpe o usuário
- [ ] Dinheiro em Inter tabular
- [ ] Caveat usada no máximo uma vez por tela
- [ ] `prefers-reduced-motion` respeitado
- [ ] Passa no filtro "alívio, não vitória"

---

*Documento produzido a partir da extração direta do código de taresolvido.app nos modos claro e
escuro e da análise do perfil @ta_resolvido_app, em 06/09/2026. As rampas de cor foram geradas
em OKLCH a partir dos matizes reais da marca, e todos os contrastes citados foram calculados,
não estimados.*
