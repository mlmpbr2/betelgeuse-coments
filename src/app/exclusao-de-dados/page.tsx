import Link from "next/link";

export const metadata = {
  title: "Exclusão de Dados — Betelgeuse Coments",
};

export default function DataDeletionPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p className="text-xs uppercase tracking-widest text-slate-400">
        Betelgeuse T.I.
      </p>
      <h1 className="text-3xl font-bold">Exclusão de Dados</h1>
      <p className="mt-1 text-sm text-slate-400">
        Betelgeuse Coments — Última atualização: 23 de setembro de 2026
      </p>

      <p className="mt-6 text-slate-600">
        Você pode solicitar a exclusão completa dos seus dados do Betelgeuse
        Coments a qualquer momento, por qualquer um dos três caminhos abaixo.{" "}
        <strong>Todos têm o mesmo efeito:</strong> remoção integral dos dados
        em até 30 dias, sem necessidade de justificativa.
      </p>

      <h2 className="mt-6 text-xl font-semibold">
        Opção 1 — Dentro do aplicativo
      </h2>
      <div className="my-3 rounded-lg border p-5">
        <h3 className="font-semibold">Desconectar a conta</h3>
        <ol className="mt-2 list-decimal pl-5 text-slate-600">
          <li>
            Acesse o painel do Betelgeuse Coments com sua conta conectada;
          </li>
          <li>
            Clique em{" "}
            <strong>Configurações → Desconectar conta do Instagram</strong>;
          </li>
          <li>
            Confirme. A conexão é encerrada imediatamente e a exclusão dos
            dados é iniciada.
          </li>
        </ol>
      </div>

      <h2 className="mt-6 text-xl font-semibold">
        Opção 2 — Pelas configurações do Instagram
      </h2>
      <div className="my-3 rounded-lg border p-5">
        <h3 className="font-semibold">Revogar o acesso na origem</h3>
        <ol className="mt-2 list-decimal pl-5 text-slate-600">
          <li>
            Abra o Instagram → <strong>Configurações e privacidade</strong>;
          </li>
          <li>
            Toque em <strong>Site e aplicativos → Ativos</strong>;
          </li>
          <li>
            Localize o <strong>Betelgeuse Coments</strong> e toque em{" "}
            <strong>Remover</strong>.
          </li>
        </ol>
        <p className="mt-2 text-slate-600">
          Ao revogar, nosso acesso é invalidado na hora. Para remover também os
          dados já armazenados, utilize a Opção 3 abaixo (ou ela ocorrerá
          automaticamente no ciclo de retenção de 30 dias).
        </p>
      </div>

      <h2 className="mt-6 text-xl font-semibold">Opção 3 — Por e-mail</h2>
      <div className="my-3 rounded-lg border p-5">
        <h3 className="font-semibold">
          Solicitação direta{" "}
          <span className="ml-2 rounded-full border px-2 py-0.5 align-middle text-xs">
            resposta em até 7 dias
          </span>
        </h3>
        <p className="mt-2 text-slate-600">
          Envie um e-mail para <strong>[falecom@mariomello.com.br]</strong> com
          o assunto{" "}
          <strong>&quot;Exclusão de dados — Betelgeuse Coments&quot;</strong>,
          informando o seu nome de usuário do Instagram (@). Confirmaremos o
          recebimento e concluiremos a exclusão em até 30 dias.
        </p>
      </div>

      <h2 className="mt-6 text-xl font-semibold">O que é excluído</h2>
      <ul className="mt-2 list-disc pl-5 text-slate-600">
        <li>Token de acesso e credenciais de conexão com o Instagram;</li>
        <li>Histórico de publicações e comentários sincronizados;</li>
        <li>
          Resultados de análises de sentimento e registros de ações de
          moderação;
        </li>
        <li>Quaisquer outros dados associados à sua conta.</li>
      </ul>
      <p className="mt-2 text-slate-600">
        <strong>O que pode ser mantido:</strong> apenas registros exigidos por
        obrigação legal (ex.: logs fiscais/de segurança), pelo prazo mínimo
        exigido em lei, após o qual são eliminados.
      </p>

      <h2 className="mt-6 text-xl font-semibold">Dúvidas</h2>
      <p className="mt-2 text-slate-600">
        Consulte nossa{" "}
        <Link href="/privacy" className="underline">
          Política de Privacidade
        </Link>{" "}
        ou escreva para <strong>[contato@betelgeuseti.com.br]</strong>.
      </p>

      <footer className="mt-10 border-t pt-4 text-sm text-slate-400">
        © 2026 Betelgeuse T.I.
      </footer>
    </main>
  );
}
