import type { Metadata } from "next";
import { LegalShell, LegalSection, LegalList } from "../legal-shell";

export const metadata: Metadata = {
  title: "Política de Privacidade — Tá Resolvido",
  description: "Que dados o Tá Resolvido guarda, por quê, e o que você pode pedir.",
};

export default function PrivacidadePage() {
  return (
    <LegalShell title="Política de Privacidade" updatedAt="2 de setembro de 2026">
      <LegalSection heading="Em resumo">
        <p>
          O Tá Resolvido não se conecta ao seu banco e não pede senha de banco nenhuma. Os dados
          que ele tem são os que você digitou ou enviou. Os prints e PDFs que você manda são lidos
          e não ficam guardados. Você pode pedir cópia ou exclusão dos seus dados a qualquer
          momento. Abaixo, o detalhe de tudo isso.
        </p>
      </LegalSection>

      <LegalSection heading="1. Quem cuida dos seus dados">
        <p>
          O controlador dos dados é Mariana Arraes Duarte Magalhães, responsável pelo Tá
          Resolvido. Para qualquer assunto relacionado a dados pessoais, incluindo o exercício
          dos seus direitos, o contato é{" "}
          <a href="mailto:contato@taresolvido.app" className="underline underline-offset-2">
            contato@taresolvido.app
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection heading="2. Que dados coletamos">
        <LegalList
          items={[
            <>
              <b className="font-semibold text-brand-ink">Dados de conta:</b> seu e-mail e sua
              senha (guardada de forma criptografada, ninguém consegue lê-la, nem nós).
            </>,
            <>
              <b className="font-semibold text-brand-ink">Seus lançamentos:</b> descrição, valor,
              data, categoria, forma de pagamento e, se você usar, cartão, fatura e parcelas.
            </>,
            <>
              <b className="font-semibold text-brand-ink">Suas configurações:</b> saldo inicial,
              metas, reservas, limites por categoria, cor de destaque e frequência de lembrete.
            </>,
            <>
              <b className="font-semibold text-brand-ink">Arquivos que você envia:</b> fotos, PDFs
              e áudios mandados para leitura automática (veja o item 4).
            </>,
            <>
              <b className="font-semibold text-brand-ink">Registro de uso da IA:</b> a data e hora
              de cada leitura feita, sem o conteúdo, usada só para contar o limite mensal do plano
              grátis.
            </>,
          ]}
        />
        <p>
          Não usamos cookies de publicidade nem ferramentas de rastreamento. Os únicos cookies são
          os que mantêm você logada.
        </p>
      </LegalSection>

      <LegalSection heading="3. Para que usamos, e com que base legal">
        <p>
          Usamos seus dados para operar o app: guardar seus lançamentos, calcular seu mês, ler os
          arquivos que você envia, mandar os lembretes que você configurou e controlar seu plano.
          A base legal é a <b className="font-semibold text-brand-ink">execução do contrato</b>{" "}
          entre nós (art. 7º, V, da LGPD).
        </p>
        <p>
          Também usamos dados mínimos para segurança e prevenção a abusos, com base no{" "}
          <b className="font-semibold text-brand-ink">legítimo interesse</b>, e cumprimos
          obrigações legais quando aplicável.
        </p>
        <p>Não vendemos seus dados, e não os usamos para publicidade.</p>
      </LegalSection>

      <LegalSection heading="4. Sobre os prints, PDFs e áudios que você envia">
        <p>
          Quando você manda um arquivo, ele é enviado ao serviço de inteligência artificial do
          Google (Gemini) só para extrair os lançamentos. Usamos o plano pago desse serviço, no
          qual o Google não utiliza o conteúdo enviado para treinar os modelos dele.
        </p>
        <p>
          O arquivo não é armazenado por nós. A única exceção é quando você usa o
          &quot;Compartilhar&quot; do celular para mandar uma imagem: nesse caso ela fica guardada
          por pouco tempo, até a tela de lançamento buscá-la, e é apagada em seguida. Se você
          desistir no meio do caminho, ela é apagada automaticamente em até 24 horas.
        </p>
      </LegalSection>

      <LegalSection heading="5. Com quem compartilhamos">
        <p>
          Não vendemos nem cedemos seus dados. Compartilhamos apenas com os serviços necessários
          para o app funcionar, cada um no seu papel:
        </p>
        <LegalList
          items={[
            <>
              <b className="font-semibold text-brand-ink">Supabase</b> — banco de dados e
              autenticação: é onde seus lançamentos ficam guardados.
            </>,
            <>
              <b className="font-semibold text-brand-ink">Vercel</b> — hospedagem do app.
            </>,
            <>
              <b className="font-semibold text-brand-ink">Google (Gemini)</b> — leitura automática
              dos arquivos e textos que você envia.
            </>,
            <>
              <b className="font-semibold text-brand-ink">Hotmart</b> — processamento do
              pagamento da assinatura. Seus dados de cartão ficam com ela, não conosco.
            </>,
            <>
              <b className="font-semibold text-brand-ink">Resend</b> — envio dos e-mails do app,
              como lembretes e recuperação de senha.
            </>,
          ]}
        />
        <p>
          Alguns desses serviços processam dados fora do Brasil. A transferência acontece com base
          nas hipóteses previstas na LGPD para transferência internacional.
        </p>
      </LegalSection>

      <LegalSection heading="6. Alertas de gasto fora do padrão">
        <p>
          Quando uma fatura de cartão fica muito acima da sua média, o app registra um alerta para
          te avisar. Esse registro guarda a descrição e o valor do lançamento e pode ser visto
          pela responsável pelo app, junto do e-mail da conta, para acompanhar se o aviso está
          funcionando direito.
        </p>
        <p>
          Estamos dizendo isso abertamente porque é a única situação em que uma pessoa da nossa
          parte enxerga um lançamento específico seu. Fora daí, ninguém fica olhando seus dados.
        </p>
      </LegalSection>

      <LegalSection heading="7. Por quanto tempo guardamos">
        <p>
          Seus dados ficam guardados enquanto sua conta existir. Se você pedir a exclusão, apagamos
          seus lançamentos e sua conta, mantendo apenas o que a lei exigir que seja mantido — por
          exemplo, registros fiscais das cobranças, que ficam com a Hotmart.
        </p>
      </LegalSection>

      <LegalSection heading="8. Seus direitos">
        <p>A LGPD te dá uma série de direitos, e você pode exercer todos eles:</p>
        <LegalList
          items={[
            "saber se tratamos dados seus e acessar esses dados;",
            "corrigir dados incompletos ou desatualizados;",
            "pedir a exclusão dos seus dados;",
            "pedir uma cópia dos seus dados em formato legível;",
            "saber com quem compartilhamos;",
            "revogar seu consentimento e encerrar a conta.",
          ]}
        />
        <p>
          Para exercer qualquer um deles, escreva pra{" "}
          <a href="mailto:contato@taresolvido.app" className="underline underline-offset-2">
            contato@taresolvido.app
          </a>
          . Respondemos em até 15 dias.
        </p>
      </LegalSection>

      <LegalSection heading="9. Como excluir sua conta">
        <p>
          Hoje a exclusão é feita pelo e-mail de contato: você pede, e apagamos sua conta e seus
          lançamentos. Se você tiver assinatura ativa, cancele antes no app, em &quot;Seu
          plano&quot;, para que as cobranças parem.
        </p>
      </LegalSection>

      <LegalSection heading="10. Segurança">
        <p>
          Seus dados trafegam criptografados e ficam num banco onde cada conta só enxerga as
          próprias informações — a separação é imposta pelo próprio banco de dados, não só pelo
          app. Senhas são guardadas de forma irreversível.
        </p>
        <p>
          Nenhum sistema é 100% imune. Se acontecer um incidente que possa te trazer risco, vamos
          avisar você e a Autoridade Nacional de Proteção de Dados, como manda a lei.
        </p>
      </LegalSection>

      <LegalSection heading="11. Crianças e adolescentes">
        <p>
          O app é destinado a maiores de 18 anos e não coletamos intencionalmente dados de menores
          de idade.
        </p>
      </LegalSection>

      <LegalSection heading="12. Mudanças nesta política">
        <p>
          Se esta política mudar, a data no topo muda junto, e mudanças relevantes serão
          comunicadas pelo app ou por e-mail.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
