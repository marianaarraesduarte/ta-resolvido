import type { Metadata } from "next";
import { LegalShell, LegalSection, LegalList } from "../legal-shell";

export const metadata: Metadata = {
  title: "Termos de Uso — Tá Resolvido",
  description: "As regras de uso do Tá Resolvido, em português claro.",
};

export default function TermosPage() {
  return (
    <LegalShell title="Termos de Uso" updatedAt="2 de setembro de 2026">
      <LegalSection heading="Em resumo">
        <p>
          O Tá Resolvido é uma ferramenta pra você organizar seu dinheiro do mês. Ele não se
          conecta ao seu banco, não movimenta dinheiro nenhum e não dá conselho de investimento.
          Você pode cancelar quando quiser, direto no app. Abaixo estão as regras completas, em
          português normal.
        </p>
      </LegalSection>

      <LegalSection heading="1. Quem oferece o serviço">
        <p>
          O Tá Resolvido é oferecido por Mariana Arraes Duarte Magalhães, que pode ser contatada
          pelo e-mail{" "}
          <a href="mailto:contato@taresolvido.app" className="underline underline-offset-2">
            contato@taresolvido.app
          </a>
          . Ao criar uma conta e usar o app, você concorda com estes termos.
        </p>
      </LegalSection>

      <LegalSection heading="2. Quem pode usar">
        <p>
          O app é destinado a maiores de 18 anos. Ao criar uma conta, você declara ter essa idade
          e que as informações de cadastro são suas e verdadeiras.
        </p>
      </LegalSection>

      <LegalSection heading="3. Sua conta">
        <p>
          O acesso é feito por e-mail e senha. Você é responsável por manter sua senha em
          segredo e por tudo que acontecer na sua conta. Se desconfiar que alguém acessou sua
          conta, troque a senha e nos avise.
        </p>
      </LegalSection>

      <LegalSection heading="4. Plano grátis e Plano Completo">
        <p>
          Existe um plano grátis, com um limite mensal de leituras por inteligência artificial, e
          um Plano Completo, pago, com esse limite liberado e recursos adicionais. O que cada
          plano inclui está descrito na tela &quot;Seu plano&quot; dentro do app.
        </p>
        <p>
          O valor do Plano Completo é o exibido na página de contratação no momento da sua
          assinatura. A cobrança é mensal e recorrente, processada pela Hotmart — é ela quem
          trata os seus dados de pagamento, sob a política de privacidade dela. Nós não temos
          acesso ao número do seu cartão.
        </p>
        <p>
          Se o preço mudar, a alteração vale apenas para novas assinaturas ou é comunicada com
          antecedência antes de valer para a sua, e você pode cancelar antes que a mudança tenha
          efeito.
        </p>
      </LegalSection>

      <LegalSection heading="5. Cancelamento e arrependimento">
        <p>
          Você cancela quando quiser, direto no app, em &quot;Seu plano&quot;, sem precisar
          justificar nada e sem multa. O cancelamento interrompe as cobranças seguintes.
        </p>
        <p>
          Nos primeiros 7 dias depois da contratação, você tem direito de arrependimento e à
          devolução integral do valor pago, conforme o artigo 49 do Código de Defesa do
          Consumidor. É só pedir pelo e-mail de contato.
        </p>
      </LegalSection>

      <LegalSection heading="6. O que o Tá Resolvido não é">
        <p>Pra evitar mal-entendido, deixamos explícito:</p>
        <LegalList
          items={[
            "não é consultoria financeira, contábil ou de investimentos — nada no app deve ser lido como recomendação de investir, gastar ou deixar de gastar;",
            "não se conecta ao seu banco e não tem acesso às suas contas: tudo que aparece ali foi você que lançou ou enviou;",
            "não movimenta, guarda nem transfere dinheiro;",
            "não substitui os extratos e documentos oficiais do seu banco.",
          ]}
        />
      </LegalSection>

      <LegalSection heading="7. Sobre a leitura automática por inteligência artificial">
        <p>
          Quando você manda uma foto, um PDF, um áudio ou uma frase, o app usa inteligência
          artificial pra identificar os lançamentos. Essa leitura pode errar: trocar um valor,
          uma data, uma categoria, ou deixar algo de fora.
        </p>
        <p>
          Por isso o app sempre mostra o que foi identificado pra você conferir antes de salvar,
          e nunca salva nada sozinho. A conferência é sua, e não nos responsabilizamos por
          decisões tomadas a partir de dados que não foram conferidos.
        </p>
      </LegalSection>

      <LegalSection heading="8. Disponibilidade do serviço">
        <p>
          Fazemos o possível pra manter o app no ar e funcionando, mas ele depende de serviços de
          terceiros (hospedagem, banco de dados e o serviço de inteligência artificial). Podem
          acontecer interrupções, manutenções ou instabilidades desses serviços, e não garantimos
          funcionamento ininterrupto ou livre de falhas.
        </p>
      </LegalSection>

      <LegalSection heading="9. Uso adequado">
        <p>Ao usar o app, você concorda em não:</p>
        <LegalList
          items={[
            "tentar acessar dados de outras pessoas ou partes do sistema que não são suas;",
            "tentar burlar limites de plano, cobranças ou mecanismos de segurança;",
            "usar o app para qualquer finalidade ilegal;",
            "sobrecarregar o serviço com acessos automatizados.",
          ]}
        />
        <p>
          Se isso acontecer, podemos suspender ou encerrar a conta, sem prejuízo das medidas
          cabíveis.
        </p>
      </LegalSection>

      <LegalSection heading="10. Encerramento">
        <p>
          Você pode encerrar sua conta quando quiser, pelo e-mail de contato. Podemos encerrar ou
          suspender contas em caso de descumprimento destes termos, avisando você quando for
          possível.
        </p>
      </LegalSection>

      <LegalSection heading="11. Mudanças nestes termos">
        <p>
          Estes termos podem mudar com o tempo. Quando a mudança for relevante, avisaremos pelo
          app ou por e-mail antes de ela passar a valer. A data da última atualização está sempre
          no topo desta página.
        </p>
      </LegalSection>

      <LegalSection heading="12. Lei aplicável">
        <p>
          Estes termos são regidos pelas leis brasileiras. Eventuais conflitos serão resolvidos no
          foro do seu domicílio, conforme o Código de Defesa do Consumidor.
        </p>
      </LegalSection>

      <LegalSection heading="13. Contato">
        <p>
          Qualquer dúvida sobre estes termos, escreva pra{" "}
          <a href="mailto:contato@taresolvido.app" className="underline underline-offset-2">
            contato@taresolvido.app
          </a>
          . A gente responde.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
