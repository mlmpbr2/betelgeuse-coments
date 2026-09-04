export const metadata = {
  title: "Política de Privacidade — Betelgeuse Coments",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
      <p className="text-sm text-muted-foreground mb-8">Última atualização: 4 de setembro de 2026</p>

      <section className="space-y-6 text-foreground/90 leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold mb-2">1. Dados que coletamos</h2>
          <p>
            O Betelgeuse Coments acessa publicamente os comentários e publicações da sua conta do Instagram 
            conectada, exclusivamente para fins de análise de sentimento e moderação de conteúdo. 
            Não coletamos dados pessoais sensíveis, mensagens privadas ou informações de seguidores.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">2. Finalidade do uso</h2>
          <p>
            Os dados acessados são utilizados apenas para:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Exibir seus posts e comentários no dashboard;</li>
            <li>Classificar o sentimento (positivo, neutro, negativo) dos comentários;</li>
            <li>Permitir que você oculte ou responda comentários diretamente pelo app.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">3. Compartilhamento com terceiros</h2>
          <p>
            Não vendemos, alugamos ou compartilhamos seus dados com terceiros. 
            As informações do Instagram são processadas exclusivamente nos servidores da Vercel e do Supabase, 
            sob sua conta vinculada.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">4. Retenção e exclusão</h2>
          <p>
            Os dados são mantidos enquanto sua conta estiver vinculada ao app. 
            Você pode solicitar a exclusão completa dos seus dados a qualquer momento 
            entrando em contato pelo e-mail: contato@betelgeuse.com.br
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">5. Conformidade</h2>
          <p>
            Este app opera em conformidade com as políticas de plataforma do Meta 
            (Facebook e Instagram) e com a LGPD (Lei Geral de Proteção de Dados).
          </p>
        </div>
      </section>
    </main>
  );
}
