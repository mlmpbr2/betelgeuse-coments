export const metadata = {
  title: "Termos de Serviço — Betelgeuse Coments",
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Termos de Serviço</h1>
      <p className="text-sm text-muted-foreground mb-8">Última atualização: 4 de setembro de 2026</p>

      <section className="space-y-6 text-foreground/90 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold mb-2">1. Aceitação dos termos</h2>
          <p>
            Ao acessar e usar o Betelgeuse Coments, você concorda com estes Termos de Serviço. 
            Se não concordar, não utilize o aplicativo.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">2. Descrição do serviço</h2>
          <p>
            O Betelgeuse Coments é uma ferramenta de análise de sentimento e moderação de comentários 
            do Instagram. O app permite que usuários autenticados visualizem, classifiquem e gerenciem 
            comentários em suas publicações, mediante créditos de uso.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">3. Uso permitido</h2>
          <p>
            Você se compromete a usar o app apenas para gerenciar conteúdo de contas do Instagram 
            de sua propriedade ou sob sua autorização expressa. O uso para spam, assédio ou 
            violação das diretrizes do Meta é estritamente proibido.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">4. Créditos e pagamento</h2>
          <p>
            Cada análise de comentário consome 1 (um) crédito. Os créditos são gerenciados pelo próprio 
            usuário dentro do dashboard. Não realizamos reembolsos de créditos já consumidos.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">5. Limitação de responsabilidade</h2>
          <p>
            O Betelgeuse Coments é fornecido &quot;como está&quot;. Não garantimos que a análise de sentimento 
            seja 100% precisa. Não nos responsabilizamos por decisões tomadas com base nos resultados 
            da ferramenta, incluindo ocultação ou resposta de comentários.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">6. Conformidade com o Meta</h2>
          <p>
            O app opera em estrita conformidade com as políticas de plataforma do Meta 
            (Facebook e Instagram), incluindo as diretrizes de uso da API do Instagram e 
            as regras de privacidade e proteção de dados.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">7. Alterações nos termos</h2>
          <p>
            Reservamo-nos o direito de modificar estes termos a qualquer momento. 
            Alterações significativas serão notificadas por e-mail ou no dashboard do app.
          </p>
        </div>
      </section>
    </main>
  );
}
