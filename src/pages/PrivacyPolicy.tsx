import React from 'react';
import { Card } from '../components/ui/Card';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold font-serif text-slate-900">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-6 md:py-10">
      <Card className="p-6 md:p-10 space-y-8">
        <header className="space-y-1 border-b border-slate-100 pb-6">
          <h1 className="text-2xl md:text-3xl font-black font-serif text-slate-900">Política de Privacidade</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Última atualização: 21 de agosto de 2026
          </p>
        </header>

        <Section title="1. Quem é o controlador dos seus dados">
          <p>
            Para os fins da Lei Geral de Proteção de Dados (Lei 13.709/2018 — LGPD), o controlador
            dos dados tratados pelo O Hermeneuta é Álvaro Pinho, pessoa física, CPF 049.***.***.**4-97. Para
            exercer seus direitos ou tirar dúvidas sobre esta política, escreva para{' '}
            <span className="font-semibold text-slate-800">sdpinho29@gmail.com</span>.
          </p>
        </Section>

        <Section title="2. Modo convidado: nada sai do seu navegador">
          <p>
            Se você usa o app como convidado (sem entrar com uma conta), seus estudos ficam salvos
            apenas no armazenamento local (localStorage) do seu próprio navegador. Não coletamos nem
            recebemos esse conteúdo em nossos servidores.
          </p>
        </Section>

        <Section title="3. Dados que coletamos quando você entra com uma conta">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-semibold text-slate-800">Dados de login (Google):</span> e-mail,
              nome e foto de perfil, fornecidos pelo Google no momento da autenticação.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Dados de perfil que você opcionalmente informa:</span>{' '}
              telefone, idade e denominação/tradição religiosa.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Conteúdo dos seus estudos bíblicos:</span>{' '}
              observações, perguntas, análise de contexto, ideia principal, intento transformador e
              esboços de sermão que você escreve em cada etapa do método.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Dados de grupos/Salas Virtuais:</span> nome
              do grupo, sua participação como membro ou professor, e mensagens trocadas dentro de um
              grupo.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Uso do Instrutor de IA:</span> contagem de
              consultas feitas por estudo, para aplicar limites diários de uso.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Progresso na Academia:</span> lições
              concluídas e notas de quiz.
            </li>
          </ul>
        </Section>

        <Section title="4. Sobre dados sensíveis (convicção religiosa)">
          <p>
            Como o app é uma ferramenta de estudo bíblico, o conteúdo que você escreve (denominação
            informada no perfil, observações e reflexões sobre o texto) pode revelar sua convicção
            religiosa, que a LGPD classifica como dado pessoal sensível (art. 5º, II). Tratamos esse
            dado com base no seu consentimento, dado ao criar uma conta e usar essas funcionalidades
            voluntariamente, e apenas para as finalidades descritas nesta política.
          </p>
        </Section>

        <Section title="5. Para que usamos seus dados">
          <ul className="list-disc pl-5 space-y-1">
            <li>Salvar e sincronizar seus estudos entre dispositivos;</li>
            <li>Gerar o feedback do Instrutor de IA a partir do seu estudo em andamento;</li>
            <li>Viabilizar grupos, mensagens e progresso na Academia;</li>
            <li>Aprovar acesso e aplicar o papel (aluno, professor, monitor, colaborador, administrador) correto na plataforma;</li>
            <li>Aplicar limites de uso e prevenir abuso do serviço.</li>
          </ul>
          <p>A base legal é o seu consentimento (art. 7º, I, e art. 11 para dado sensível) e, quando aplicável, a execução do serviço que você solicitou (art. 7º, V).</p>
        </Section>

        <Section title="6. Com quem compartilhamos seus dados">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-semibold text-slate-800">Google Firebase</span> (Autenticação e
              Firestore) — infraestrutura do Google Cloud usada para autenticar seu login e armazenar
              seus dados e estudos.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Google Gemini (IA)</span> — ao usar o
              Instrutor de IA, o texto bíblico selecionado e suas respostas na etapa atual do estudo
              são enviados à API do Gemini para gerar o feedback pedagógico. Não enviamos seus dados
              de perfil (e-mail, telefone) nessa chamada.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Vercel</span> — hospeda a aplicação e
              coleta métricas agregadas de performance (Vercel Speed Insights), sem finalidade de
              identificação pessoal.
            </li>
            <li>
              <span className="font-semibold text-slate-800">APIs públicas de texto bíblico</span> —
              quando uma passagem não está disponível localmente, sua seleção (livro, capítulo e
              versículos) pode ser enviada a serviços públicos de terceiros para buscar o texto.
            </li>
          </ul>
          <p>Não vendemos seus dados a terceiros.</p>
        </Section>

        <Section title="7. Por quanto tempo guardamos seus dados">
          <p>
            Mantemos seus dados enquanto sua conta existir. Você pode solicitar a exclusão da sua
            conta e dos dados associados a qualquer momento pelos meios de contato indicados nesta
            política; atenderemos a solicitação em prazo razoável, salvo obrigação legal de retenção.
          </p>
        </Section>

        <Section title="8. Segurança">
          <p>
            O acesso aos seus dados no Firestore é controlado por regras de segurança que aplicam o
            princípio de "negar por padrão": cada usuário só acessa os próprios dados, exceto quando
            seu papel (professor, administrador) explicitamente permite acesso a dados de um grupo do
            qual participa.
          </p>
        </Section>

        <Section title="9. Seus direitos como titular de dados">
          <p>Nos termos da LGPD, você pode solicitar a qualquer momento:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Confirmação de que tratamos seus dados e acesso a eles;</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
            <li>Exclusão dos seus dados e da sua conta;</li>
            <li>Portabilidade dos seus dados a outro serviço;</li>
            <li>Revogação do seu consentimento, a qualquer momento.</li>
          </ul>
          <p>
            Para exercer qualquer um desses direitos, escreva para{' '}
            <span className="font-semibold text-slate-800">sdpinho29@gmail.com</span>.
          </p>
        </Section>

        <Section title="10. Menores de idade">
          <p>
            Hoje o app não exige verificação de idade mínima. Se você é responsável por um menor que
            usa o serviço, recomendamos supervisionar o uso, especialmente do Instrutor de IA e das
            Salas Virtuais/comunidade.
          </p>
        </Section>

        <Section title="11. Alterações a esta política">
          <p>
            Podemos atualizar esta Política de Privacidade de tempos em tempos. Mudanças relevantes
            serão sinalizadas na própria plataforma, com a data de atualização revisada no topo deste
            documento.
          </p>
        </Section>

        <Section title="12. Contato">
          <p>
            Para questões sobre privacidade e proteção de dados: <span className="font-semibold text-slate-800">sdpinho29@gmail.com</span>.
          </p>
        </Section>
      </Card>
    </div>
  );
}
