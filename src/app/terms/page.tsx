import Link from "next/link";
import { CompanyInfo } from "@/components/CompanyInfo";

export const metadata = {
  title: "Termos de Uso — Betelgeuse Coments",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-xs uppercase tracking-widest text-slate-400">
        Betelgeuse T.I.
      </p>
      <h1 className="text-3xl font-bold">Termos de Uso</h1>
      <p className="mt-1 text-sm text-slate-400">
        Betelgeuse Coments — Última atualização: 23 de setembro de 2026
      </p>

      <h2 className="mt-6 text-xl font-semibold">1. O serviço</h2>
      <p className="mt-2 text-slate-300">
        O <strong>Betelgeuse Coments</strong>, operado pela{" "}
        <strong>Betelgeuse T.I.</strong>, é uma ferramenta que, mediante
        autorização do titular, conecta-se à conta profissional do Instagram do
        usuário para: (a) listar publicações e comentários; (b) classificar
        automaticamente o sentimento dos comentários; e (c) executar ações de
        moderação (ocultar e responder) exclusivamente sob comando do usuário.
      </p>

      <h2 className="mt-6 text-xl font-semibold">2. Elegibilidade e conta</h2>
      <ul className="mt-2 list-disc pl-5 text-slate-300">
        <li>
          O serviço destina-se a contas profissionais (Business ou Creator) do
          Instagram;
        </li>
        <li>
          O acesso é feito pelo fluxo oficial de autorização da Meta; nunca
          solicitamos sua senha;
        </li>
        <li>
          Você é responsável por manter a segurança da sua conta e por todas as
          ações executadas a partir do seu painel.
        </li>
      </ul>

      <h2 className="mt-6 text-xl font-semibold">3. Créditos e uso</h2>
      <p className="mt-2 text-slate-300">
        Determinadas funcionalidades (como análises de sentimento) podem
        consumir créditos disponibilizados no painel. Créditos não utilizados
        não são reembolsáveis, salvo disposição em contrário no ato da
        contratação.
      </p>

      <h2 className="mt-6 text-xl font-semibold">4. Uso aceitável</h2>
      <ul className="mt-2 list-disc pl-5 text-slate-300">
        <li>
          Utilizar o serviço somente em contas das quais você é titular ou está
          legalmente autorizado a gerenciar;
        </li>
        <li>
          Não tentar acessar dados de terceiros, contornar limites da
          plataforma ou realizar engenharia reversa;
        </li>
        <li>
          Não utilizar o serviço para spam, assédio, moderação discriminatória
          ou qualquer finalidade que viole os termos da Meta ou a legislação
          vigente.
        </li>
      </ul>

      <h2 className="mt-6 text-xl font-semibold">
        5. Sobre a análise de sentimentos
      </h2>
      <p className="mt-2 text-slate-300">
        A classificação (positivo, neutro, negativo) é gerada automaticamente e
        tem caráter <strong>auxiliar e estatístico</strong>. Ela não constitui
        verdade absoluta sobre a intenção do comentarista. Decisões de
        moderação são sempre do usuário.
      </p>

      <h2 className="mt-6 text-xl font-semibold">
        6. Dependência da plataforma Meta
      </h2>
      <p className="mt-2 text-slate-300">
        O serviço depende da API do Instagram, fornecida pela Meta. Alterações,
        instabilidades ou restrições impostas pela Meta podem afetar
        funcionalidades, sem que isso configure falha da Betelgeuse T.I. O uso
        do Instagram permanece sujeito aos termos e políticas da própria Meta.
      </p>

      <h2 className="mt-6 text-xl font-semibold">7. Propriedade intelectual</h2>
      <p className="mt-2 text-slate-300">
        O aplicativo, sua marca e seu código são propriedade da Betelgeuse T.I.
        Os dados e conteúdos da sua conta do Instagram permanecem seus;
        concede-se a nós apenas a licença estritamente necessária para operar
        as funcionalidades contratadas.
      </p>

      <h2 className="mt-6 text-xl font-semibold">
        8. Limitação de responsabilidade
      </h2>
      <p className="mt-2 text-slate-300">
        O serviço é fornecido &quot;como está&quot;. Na máxima extensão
        permitida em lei, não respondemos por danos indiretos, lucros cessantes
        ou decisões tomadas com base nas classificações automáticas de
        sentimento.
      </p>

      <h2 className="mt-6 text-xl font-semibold">9. Rescisão</h2>
      <p className="mt-2 text-slate-300">
        Você pode encerrar o uso a qualquer momento desconectando a conta (ver{" "}
        <Link href="/exclusao-de-dados" className="underline">
          Exclusão de Dados
        </Link>
        ). Podemos suspender contas que violem estes Termos, mediante aviso.
      </p>

      <h2 className="mt-6 text-xl font-semibold">10. Legislação e foro</h2>
      <p className="mt-2 text-slate-300">
        Estes Termos são regidos pelas leis da República Federativa do Brasil.
        Fica eleito o foro da comarca de{" "}
        <strong>[cidade/UF da sede]</strong> para dirimir controvérsias, salvo
        competência legal diversa.
      </p>

      <h2 className="mt-6 text-xl font-semibold">11. Contato</h2>
      <p className="mt-2 text-slate-300">
        Betelgeuse T.I. — E-mail:{" "}
        <strong>[contato@betelgeuseti.com.br]</strong>
      </p>

      <CompanyInfo />

      <footer className="mt-10 border-t pt-4 text-sm text-slate-400">
        © 2026 Betelgeuse T.I.
      </footer>
    </main>
  );
}
