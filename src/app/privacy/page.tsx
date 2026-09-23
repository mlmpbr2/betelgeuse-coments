import Link from "next/link";
import { CompanyInfo } from "@/components/CompanyInfo";

export const metadata = {
  title: "Política de Privacidade — Betelgeuse Coments",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-xs uppercase tracking-widest text-slate-400">
        Betelgeuse T.I.
      </p>
      <h1 className="text-3xl font-bold">Política de Privacidade</h1>
      <p className="mt-1 text-sm text-slate-400">
        Betelgeuse Coments — Última atualização: 23 de setembro de 2026
      </p>

      <h2 className="mt-6 text-xl font-semibold">1. Quem somos</h2>
      <p className="mt-2 text-slate-300">
        O <strong>Betelgeuse Coments</strong> é um aplicativo desenvolvido e
        operado pela <strong>Betelgeuse T.I.</strong> CNPJ:51.770.124/0001-97,
        que permite a contas profissionais do Instagram analisar o sentimento
        dos comentários recebidos em suas publicações e realizar ações de
        moderação (ocultar comentários e responder), sempre mediante
        autorização expressa do titular da conta.
      </p>
      <p className="mt-2 text-slate-300">
        Contato do controlador de dados:{" "}
        <strong>falecom@mariomello.com.br</strong>
      </p>

      <h2 className="mt-6 text-xl font-semibold">2. Quais dados coletamos</h2>
      <p className="mt-2 text-slate-300">
        Coletamos exclusivamente os dados da{" "}
        <strong>sua própria conta do Instagram</strong>, por meio da API oficial
        da Meta (Instagram API with Instagram Login), e somente após você
        autorizar o acesso na tela de permissões da Meta:
      </p>
      <ul className="mt-2 list-disc pl-5 text-slate-300">
        <li>
          <strong>Identificação da conta:</strong> ID de usuário e nome de
          usuário (@) do Instagram;
        </li>
        <li>
          <strong>Publicações:</strong> lista das suas mídias (ID, legenda,
          data, contagem de curtidas e de comentários);
        </li>
        <li>
          <strong>Comentários:</strong> ID, texto e data/hora dos comentários
          feitos nas suas publicações;
        </li>
        <li>
          <strong>Credenciais de acesso:</strong> o token de acesso gerado pela
          Meta, armazenado de forma segura e usado apenas para as
          funcionalidades que você autorizou.
        </li>
      </ul>
      <div className="my-4 rounded-md border border-l-4 border-border border-l-primary bg-secondary p-4 text-slate-300">
        <strong>Não coletamos:</strong> senhas, mensagens diretas (DMs), dados
        de seguidores, dados de terceiros que não sejam os comentários públicos
        nas suas próprias publicações, nem qualquer dado de outras contas do
        Instagram.
      </div>

      <h2 className="mt-6 text-xl font-semibold">3. Como usamos os dados</h2>
      <ul className="mt-2 list-disc pl-5 text-slate-300">
        <li>
          <strong>Análise de sentimentos:</strong> o texto dos comentários é
          classificado automaticamente como positivo, neutro ou negativo, e
          exibido no seu painel;
        </li>
        <li>
          <strong>Moderação sob seu comando:</strong> ocultar um comentário ou
          responder a ele{" "}
          <strong>
            somente ocorre quando você clica na ação correspondente
          </strong>{" "}
          dentro do aplicativo. Nenhuma ação é executada automaticamente no seu
          nome;
        </li>
        <li>
          <strong>Funcionamento do serviço:</strong> exibição de publicações,
          contagens e histórico de análises no seu painel.
        </li>
      </ul>

      <h2 className="mt-6 text-xl font-semibold">
        4. O que NÃO fazemos com seus dados
      </h2>
      <ul className="mt-2 list-disc pl-5 text-slate-300">
        <li>
          Não vendemos, alugamos ou compartilhamos seus dados com terceiros
          para fins de marketing;
        </li>
        <li>
          Não publicamos, curtimos, seguimos ou comentamos sem uma ação
          explícita sua;
        </li>
        <li>
          Não usamos seus dados para treinar modelos de terceiros nem para
          finalidades incompatíveis com esta política.
        </li>
      </ul>

      <h2 className="mt-6 text-xl font-semibold">5. Compartilhamento</h2>
      <p className="mt-2 text-slate-300">
        Seus dados trafegam apenas entre: (a) você; (b) a infraestrutura de
        hospedagem do aplicativo; e (c) a plataforma Meta/Instagram, que é a
        origem dos dados. Não há repasse a quaisquer outros terceiros, salvo
        obrigação legal.
      </p>

      <h2 className="mt-6 text-xl font-semibold">
        6. Armazenamento e segurança
      </h2>
      <p className="mt-2 text-slate-300">
        Os dados são armazenados em ambiente com acesso restrito e criptografia
        em trânsito (HTTPS). O token de acesso é mantido apenas enquanto sua
        conta estiver conectada ao aplicativo. Comentários ocultados e análises
        ficam registrados apenas no seu histórico de uso.
      </p>

      <h2 className="mt-6 text-xl font-semibold">7. Retenção e exclusão</h2>
      <p className="mt-2 text-slate-300">
        Mantemos seus dados somente enquanto a conta estiver conectada. Você
        pode solicitar a exclusão completa a qualquer momento pelos caminhos
        descritos em nossa página de{" "}
        <Link href="/exclusao-de-dados" className="underline">
          Exclusão de Dados
        </Link>
        , ou revogando o acesso diretamente nas configurações do Instagram
        (Configurações → Site e aplicativos → remover o Betelgeuse Coments).
        Após a solicitação, os dados são removidos em até 30 dias.
      </p>

      <h2 className="mt-6 text-xl font-semibold">
        8. Seus direitos (LGPD — Lei nº 13.709/2018)
      </h2>
      <ul className="mt-2 list-disc pl-5 text-slate-300">
        <li>
          Confirmação da existência de tratamento e acesso aos seus dados;
        </li>
        <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
        <li>Eliminação dos dados tratados com seu consentimento;</li>
        <li>Revogação do consentimento e portabilidade, quando aplicável;</li>
        <li>Informação sobre compartilhamentos realizados.</li>
      </ul>
      <p className="mt-2 text-slate-300">
        Para exercer qualquer direito, escreva para{" "}
        <strong>falecom@mariomello.com.br</strong>.
      </p>

      <h2 className="mt-6 text-xl font-semibold">9. Cookies</h2>
      <p className="mt-2 text-slate-300">
        O aplicativo utiliza apenas cookies estritamente necessários à
        autenticação da sessão. Não utilizamos cookies de rastreamento ou
        publicidade.
      </p>

      <h2 className="mt-6 text-xl font-semibold">
        10. Alterações desta política
      </h2>
      <p className="mt-2 text-slate-300">
        Eventuais alterações serão publicadas nesta página com a data de
        atualização revisada. O uso continuado do aplicativo após a publicação
        implica ciência das alterações.
      </p>

      <h2 className="mt-6 text-xl font-semibold">11. Contato</h2>
      <p className="mt-2 text-slate-300">
        Betelgeuse T.I. — E-mail: <strong>falecom@mariomello.com.br</strong>
        <br />
        Encarregado de dados (DPO): <strong>Mario Mello</strong>
      </p>

      <CompanyInfo />

      <footer className="mt-10 border-t pt-4 text-sm text-slate-400">
        © 2026 Betelgeuse T.I.
      </footer>
    </main>
  );
}
