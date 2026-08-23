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

export default function TermsOfUse() {
  return (
    <div className="max-w-3xl mx-auto py-6 md:py-10">
      <Card className="p-6 md:p-10 space-y-8">
        <header className="space-y-1 border-b border-slate-100 pb-6">
          <h1 className="text-2xl md:text-3xl font-black font-serif text-slate-900">Termos de Uso</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Última atualização: 21 de agosto de 2026
          </p>
        </header>

        <Section title="1. Quem oferece este serviço">
          <p>
            O Hermeneuta é oferecido por Álvaro Pinho, pessoa física, CPF 049.***.**4-97, para fins
            educacionais e devocionais. Dúvidas, solicitações ou reclamações sobre este Termo podem
            ser enviadas para <span className="font-semibold text-slate-800">sdpinho29@gmail.com</span>.
          </p>
          <p>
            Ao criar uma conta (com Google) ou usar o modo convidado, você concorda com este Termo de
            Uso e com a nossa{' '}
            <a href="/privacidade" className="text-brand-primary font-semibold hover:underline">
              Política de Privacidade
            </a>. Se você não concordar, não utilize o serviço.
          </p>
        </Section>

        <Section title="2. O que é o serviço">
          <p>
            O Hermeneuta é uma ferramenta de estudo bíblico que guia o usuário pelo método "Cavar &
            Descobrir" em 8 etapas (Seleção, Observação, Perguntas, Gênero &amp; Estilo, Contexto,
            Ideia Principal, Intento Transformador, Esboço &amp; Sermão), com apoio de um "Instrutor de
            IA" que atua como mentor socrático em cada etapa.
          </p>
        </Section>

        <Section title="3. Contas e modo convidado">
          <p>
            Você pode usar o serviço de duas formas:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="font-semibold text-slate-800">Convidado</span> — sem login, seus
              estudos ficam salvos apenas no armazenamento local do seu navegador (localStorage).
              Se você limpar os dados do navegador, trocar de dispositivo ou desinstalar o navegador,
              esses estudos são perdidos permanentemente e não podemos recuperá-los.
            </li>
            <li>
              <span className="font-semibold text-slate-800">Conta Google</span> — seus estudos e
              seu perfil são salvos em nuvem (Firebase/Firestore) e ficam disponíveis em qualquer
              dispositivo em que você entrar.
            </li>
          </ul>
          <p>
            Alguns recursos (Academia, Salas Virtuais/comunidade) exigem que sua conta seja aprovada
            por um administrador ou professor, conforme o papel (aluno, professor, monitor,
            colaborador ou administrador) atribuído a você dentro da plataforma.
          </p>
        </Section>

        <Section title="4. O Instrutor de IA">
          <p>
            O Instrutor de IA é gerado por um modelo de inteligência artificial (Google Gemini) a
            partir do texto bíblico selecionado e das respostas que você escreve em cada etapa do seu
            estudo. Ele foi desenhado para dar feedback pedagógico e perguntas de aprofundamento,{' '}
            <span className="font-semibold text-slate-800">
              não para ser uma autoridade doutrinária, aconselhamento pastoral ou substituto de
              orientação teológica qualificada.
            </span>{' '}
            Como qualquer sistema de IA, ele pode cometer erros ou gerar interpretações
            imprecisas — use seu discernimento e, quando o assunto exigir, busque orientação de um
            líder espiritual ou teólogo de sua confiança.
          </p>
          <p>
            O uso do Instrutor de IA tem limites diários de consulta (variam conforme o tipo de
            conta), que existem para manter o serviço sustentável e podem mudar sem aviso prévio.
          </p>
        </Section>

        <Section title="5. Conteúdo que você produz">
          <p>
            Os estudos, anotações e esboços que você escreve na plataforma são seus. Você concede a
            nós apenas a licença necessária para armazenar, processar e exibir esse conteúdo de volta
            para você (e, quando aplicável, para o Instrutor de IA gerar seu feedback) — não usamos
            seu conteúdo para treinar modelos de IA nem o publicamos sem sua ação (por exemplo, ao
            compartilhá-lo voluntariamente em uma Sala Virtual/grupo).
          </p>
          <p>
            Textos bíblicos exibidos no app vêm de traduções de domínio público ou de APIs públicas
            de terceiros — não reivindicamos propriedade sobre eles.
          </p>
        </Section>

        <Section title="6. Salas Virtuais e comunidade">
          <p>
            Ao participar de um grupo/sala virtual, mensagens que você envia ficam visíveis para o
            professor e demais membros daquele grupo. Não toleramos conteúdo ofensivo, discurso de
            ódio, assédio ou uso da ferramenta para fins fora do propósito educacional/devocional do
            app. Contas podem ser suspensas ou removidas de grupos em caso de abuso.
          </p>
        </Section>

        <Section title="7. Uso aceitável">
          <p>Você concorda em não:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Usar o serviço para fins ilegais ou que violem direitos de terceiros;</li>
            <li>Tentar acessar dados de outros usuários ou contornar as regras de permissão da plataforma;</li>
            <li>Sobrecarregar deliberadamente o Instrutor de IA ou a infraestrutura do serviço;</li>
            <li>Se passar por outra pessoa ou fornecer dados de cadastro falsos.</li>
          </ul>
        </Section>

        <Section title="8. Suspensão e encerramento">
          <p>
            Você pode encerrar sua conta a qualquer momento solicitando a exclusão pelos meios de
            contato indicados neste documento. Podemos suspender ou encerrar contas que violem este
            Termo, sem aviso prévio quando houver risco a outros usuários ou à integridade do serviço.
          </p>
        </Section>

        <Section title="9. Isenções e limitação de responsabilidade">
          <p>
            O serviço é fornecido "como está", sem garantia de disponibilidade contínua ou ausência de
            falhas. Somos um projeto de desenvolvedor único, mantido com melhor esforço — não nos
            responsabilizamos por perda de dados no modo convidado, indisponibilidade temporária, ou
            decisões tomadas com base no conteúdo gerado pelo Instrutor de IA.
          </p>
        </Section>

        <Section title="10. Alterações a este Termo">
          <p>
            Podemos atualizar este Termo de tempos em tempos. Mudanças relevantes serão sinalizadas
            na própria plataforma. O uso continuado do serviço após uma atualização representa
            aceitação do novo Termo.
          </p>
        </Section>

        <Section title="11. Lei aplicável e foro">
          <p>
            Este Termo é regido pelas leis brasileiras. Fica eleito o foro da comarca de Goiana/PE
            para dirimir eventuais controvérsias, com renúncia a qualquer outro, por mais privilegiado
            que seja.
          </p>
        </Section>

        <Section title="12. Contato">
          <p>
            Dúvidas sobre este Termo: <span className="font-semibold text-slate-800">sdpinho29@gmail.com</span>.
          </p>
        </Section>
      </Card>
    </div>
  );
}
