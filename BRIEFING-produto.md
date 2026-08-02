# Tá Resolvido — Briefing do Produto

## O que é
App web de controle financeiro pessoal, mensal, simples e visual. Público-alvo:
todas as idades — nada de jargão financeiro ou telas complexas.

**Nome:** Tá Resolvido
**Tagline:** Seu mês sob controle. Sem planilha.
**Domínio:** taresolvido.app
**Instagram:** @taresolvidoapp

## Proposta central
A maioria dos apps financeiros exige lançar gastos todo dia, e as pessoas abandonam
depois de 1-2 semanas. O diferencial do Tá Resolvido é permitir que a pessoa "resolva
em lote" — não precisa lançar todo dia, pode acumular e resolver de uma vez, inclusive
enviando um print do extrato do banco inteiro.

## Gancho visual principal: "Régua do mês"
A tela principal mostra o mês como uma linha do tempo horizontal (1 ao 30/31).
A linha central separa dois tipos de marca:
- **Acima da linha**: receitas/entradas de dinheiro (marca em sage/verde).
- **Abaixo da linha**: despesas/saídas, coloridas conforme a intensidade do gasto
  (verde = leve, âmbar = médio, coral = alto).
O dia de hoje tem um marcador mais alto/destacado ("HOJE").
Tocar numa marca mostra o detalhe (descrição e valor) daquele lançamento.
No topo da tela, dois cards resumem "Entrou" (total de receitas do mês até hoje) e
"Saiu" (total de despesas do mês até hoje).

Estado vazio (sem lançamentos ainda no mês): mensagem leve e calorosa, ex:
"Mês novinho em folha." / "Marque o primeiro gasto quando aparecer."
(Tom: humor leve mas NUNCA sarcástico — precisa soar bem pra todas as idades.)

## Fluxo de onboarding
3 telas curtas explicando: 1) o que é o app, 2) a régua do mês, 3) as duas formas de
lançar gasto (manual e foto). Depois do onboarding, vai direto pra régua vazia — sem
forçar cadastro do primeiro gasto na hora.

## Entrada de lançamentos (tela "Novo lançamento")
Duas abas principais: **Manual** e **Foto**.

**Manual**: a pessoa escolhe primeiro se é "Saiu" (despesa) ou "Entrou" (receita).
- Despesa: valor, descrição, categoria (chips), data.
- Receita: valor, descrição, tipo de renda ("Salário" ou "Outra renda"), data. Esse
  tipo é usado depois no cálculo das metas de investimento.

**Foto**: a pessoa tira foto de um comprovante OU de um print do extrato do banco
inteiro. Aqui **não existe escolha manual de despesa/receita** — o OCR deve
identificar sozinho, a partir do sinal (+/-), cor ou rótulo ("crédito"/"débito") que
já aparece no extrato, se cada item é entrada ou saída. O OCR também deve
identificar **múltiplos lançamentos de uma vez** quando for um extrato (não só 1 por
foto). Sempre mostrar os itens identificados pra confirmação antes de salvar — nunca
salvar automaticamente sem revisão.

Na lista de itens identificados, cada receita tem a opção "marcar como salário". Uma
vez marcada, o app deve guardar esse padrão (por descrição/valor parecido) e
reconhecer automaticamente a mesma origem como salário nos extratos dos meses
seguintes, sem precisar a pessoa marcar de novo.

**Importante:** não hospedar em Open Finance / conexão bancária direta por enquanto
(custo e complexidade altos demais pra essa fase). Não é possível ler notificações
do banco no celular via web app (isso exigiria um app nativo Android, e não
funcionaria em iOS de jeito nenhum) — ficou fora do escopo atual.

## Lembrete de envio do print
Configurável pela pessoa: 1x, 2x, 4x por mês, ou nenhum lembrete. O lembrete deve
mostrar a data do último print enviado e o último gasto identificado (ex: "Farmácia,
R$ 68"), pra pessoa achar fácil o ponto de continuação no extrato do banco.

## Tela de resumo/histórico do mês
Lista simples e direta: ícone da categoria, descrição, dia, valor (cor conforme
intensidade). Total do mês e contador de gastos marcados no topo. Sem gráficos
complexos.

## Tela de categorias ("Onde foi")
Lista ordenada por valor (maior pro menor), cada categoria com barra de progresso
proporcional e percentual do mês. Cores neutras aqui (sem o código verde/âmbar/
vermelho) — o objetivo é comparar categorias entre si, não julgar cada uma.

## Limite por categoria + alerta
A pessoa define um limite mensal por categoria (ex: R$2.000 em Mercado). Quando
atingir/ultrapassar, o app mostra um alerta/banner. Isso funciona com os dados já
existentes (manual + foto), sem depender de nenhuma integração bancária.

## Metas e reservas (tela nova, pode ser ocultada)
Duas seções na mesma tela:

**Metas de investimento**: a pessoa define livremente o % da receita que quer
destinar a cada uma de três metas fixas — "Liberdade financeira", "Longo prazo" e
"Curto prazo". Os % **não precisam somar 100%** — a pessoa pode investir qualquer
fração da renda, o resto simplesmente não é alocado a nenhuma meta. Pra cada meta, o
app calcula e mostra o valor em R$ correspondente, com base na receita do mês.
Embaixo, uma linha informativa (não um aviso/erro) mostra o total: "você está
investindo X% da sua receita (R$ Y/mês)".

A receita usada nesse cálculo tem uma configuração própria: **"Toda renda lançada"**
ou **"Só salário"** (usando a marcação de salário feita na tela de lançamento/foto).
A pessoa escolhe qual prefere.

**Reservas planejadas**: lista de metas de guardar dinheiro pra gastos futuros
específicos e previsíveis (ex: "IPVA 2027", "Viagem dezembro") — cada uma com valor
alvo e quanto já foi guardado (barra de progresso). A pessoa pode adicionar quantas
quiser, com nome livre.

A tela inteira (metas + reservas) pode ser ocultada nas configurações, pra quem não
investe ou não quer usar essa parte.

## Configurações
- **Separar por conta/banco**: toggle. Desligado (padrão) = tudo unificado numa régua
  só. Ligado = cada lançamento pede a conta/banco de origem, permitindo separar
  visualmente depois.
- **Cor de destaque**: a pessoa escolhe entre ~5 cores pré-definidas e testadas
  (não um seletor de cor livre, pra não quebrar legibilidade). Essa cor substitui o
  âmbar em elementos de destaque (marcador de "hoje", botões principais etc.) — fundo
  e texto continuam fixos.
- **Lembrete de envio do print**: 1x, 2x, 4x por mês, ou nenhum. O lembrete mostra a
  data do último print enviado e o último gasto identificado (ex: "Farmácia, R$ 68"),
  pra pessoa achar fácil o ponto de continuação no extrato do banco.

## Fora de escopo por enquanto (decisões conscientes, não esquecidas)
- Conexão bancária / Open Finance
- Leitura de notificações do banco (app nativo Android)
- Registro de gasto por áudio via Telegram/WhatsApp
- Segundo produto/app (só depois que este estiver validado e rodando)

## Identidade visual
**Paleta:**
- Fundo: `#EDE9DE`
- Cards: `#FBFAF6`
- Tinta/texto principal: `#1F3A3D`
- Texto secundário: `#5B6E6C`
- Âmbar (destaque/hoje/gasto médio): `#D9A441`
- Coral (gasto alto/alerta): `#C1553D`
- Sage (gasto leve/positivo): `#6F8F6A`
- Linhas/bordas: `#D9D3C4`

**Tipografia:** títulos/números em fonte arredondada e amigável (ex: Baloo 2), texto
corrido em fonte neutra (ex: Inter). Evitar qualquer fonte que pareça corporativa ou
"startup".

**Logo:**
- Ícone do app de finanças: cifrão com um selo de check âmbar no canto (arquivo:
  icone-g1.svg)
- Logo da marca guarda-chuva: check com ponto âmbar (arquivo: icone-c3.svg)

## Formato técnico
Web app (não app nativo de loja), para reduzir custo inicial. Precisa funcionar bem
em navegador mobile, já que a maior parte do uso será pelo celular.

## Telas já desenhadas (mockups em React, servem de referência visual e de fluxo)
- ta-resolvido-regua.jsx — régua do mês com receitas (acima) e despesas (abaixo)
- ta-resolvido-regua-vazia.jsx — estado vazio
- ta-resolvido-adicionar-gasto.jsx — novo lançamento: despesa/receita (manual) +
  foto/print com classificação automática e marcação de salário
- ta-resolvido-resumo.jsx — histórico do mês
- ta-resolvido-categorias.jsx — onde foi o dinheiro
- ta-resolvido-limites-categoria.jsx — limites por categoria + alerta
- ta-resolvido-metas-reservas.jsx — metas de investimento (%) + reservas planejadas
- ta-resolvido-configuracoes.jsx — separar por conta/banco + cor de destaque
- ta-resolvido-config-lembrete.jsx — configuração de frequência de lembrete
- ta-resolvido-onboarding.jsx — onboarding de 3 passos
- ta-resolvido-app-completo.jsx — telas principais com navegação, pra ver o fluxo
  junto (ainda não inclui metas/reservas e configurações nessa versão consolidada)

Esses arquivos são protótipos visuais (sem dados reais nem persistência) — servem
de referência de layout, cores e textos, não de código de produção.
