import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudy } from '../context/StudyContext';
import { Button } from '../components/ui/Button';
import BibleSelection from './BibleSelection';
import StudyStep from './StudyStep';
import FinalReview from './FinalReview';
import { 
  Eye, 
  HelpCircle, 
  ScrollText, 
  Map, 
  Lightbulb, 
  Target,
  ListTree,
  FileText,
  Search,
  CheckCircle2
} from 'lucide-react';

const STEPS = [
  { id: 'bible', label: 'Seleção', icon: Search },
  { id: 'observation', label: 'Observação', icon: Eye, field: 'observations', 
    desc: 'O que o texto diz? Note repetições, contrastes e conectivos.',
    placeholder: 'Ex: Repetição da palavra "Verbo" (v.1, 14)...',
    methodTip: 'Mantenha-se na LINHA. Liste fatos objetivos que seus olhos vêem (repetições, contrastes, verbos). Não tente interpretar ou aplicar ainda.' },
  { id: 'questions', label: 'Perguntas', icon: HelpCircle, field: 'questions_text', 
    desc: 'O que você quer perguntar ao texto? O que não está claro?',
    placeholder: 'Ex: Por que João chama Jesus de "O Verbo"?',
    methodTip: 'Vá além das perguntas básicas (o quê, onde). Faça perguntas VIGOROSAS (por que, como) que buscam a racionalidade e o intento do autor.' },
  { id: 'genre', label: 'Gênero & Estilo', icon: ScrollText, field: 'genre',
    desc: 'Identifique o gênero literário e como o autor organiza as ideias.',
    placeholder: 'Gênero: Narrativa/Poesia/Epístola...\nEstrutura: Introdução (v.1-5)...',
    methodTip: 'Use a analogia das frutas: cada gênero se aborda de forma diferente. Identifique o TOM (atitude do autor) e o HUMOR (estado de espírito pretendido no leitor).' },
  { id: 'context', label: 'Contexto', icon: Map, field: 'context_text', 
    desc: 'Explore o pano de fundo histórico, cultural e literário.',
    placeholder: 'Contexto Histórico: Escrito por volta de...',
    methodTip: 'NÃO pegue o atalho da aplicação imediata. Entenda a situação do público original, o autor e as conexões literárias (o que vem antes e depois).' },
  { id: 'main_idea', label: 'Ideia Principal', icon: Lightbulb, field: 'mainIdea',
    desc: 'Sintetize a mensagem central do texto em uma frase concisa.',
    placeholder: 'A ideia principal deste texto é...',
    methodTip: 'Síntese fiel: O que o autor diz + o TOM dele. Escreva uma frase concisa e completa que reflita a mensagem central.' },
  { id: 'intent', label: 'Intento', icon: Target, field: 'transformingIntent',
    desc: 'Qual é o propósito prático e transformador para os ouvintes?',
    placeholder: 'Este texto visa transformar a vida do crente ao...',
    methodTip: 'Identifique a Intenção Transformadora: Por que o autor diz isso? Qual a mudança que Deus busca no coração do ouvinte?' },
  { id: 'outline', label: 'Esboço', icon: ListTree, field: 'sermonOutline',
    desc: 'Organize os pontos principais do sermão.',
    placeholder: 'I. Introdução\nII. Ponto 1...',
    methodTip: 'A estrutura do sermão dever fluir da estrutura do texto. Use a analogia da PONTE: conecte as unidades de pensamento rumo ao propósito central.' },
  { id: 'sermon', label: 'Sermão', icon: FileText, field: 'detailedSermon',
    desc: 'Elabore o conteúdo completo, ilustrações e aplicações.',
    placeholder: 'Texto final do sermão...',
    methodTip: 'O TEXTO É REI. Aplique o texto às estruturas do seu público, pastoreando-os com aplicações precisas que fluem da nova aliança em Jesus.' },
  { id: 'review', label: 'Finalização', icon: CheckCircle2 }
];

export default function StudyController() {
  const { studyId } = useParams();
  const { currentStudy, loadStudy, updateCurrentStudy, loading } = useStudy();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (studyId) {
      loadStudy(studyId);
    }
  }, [studyId]);

  useEffect(() => {
    // If study is already initialized, skip bible selection
    if (currentStudy?.bibleSelection && currentStepIndex === 0) {
      setCurrentStepIndex(1);
    }
  }, [currentStudy]);

  if (loading || !currentStudy) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin text-brand-primary text-2xl">◌</div>
      </div>
    );
  }

  const currentStep = STEPS[currentStepIndex];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
           <h1 className="text-xl font-bold text-slate-900">{currentStudy.title}</h1>
           <p className="text-xs text-slate-500 font-medium">Progresso: {Math.round((currentStepIndex / (STEPS.length - 1)) * 100)}%</p>
        </div>
        <div className="hidden md:flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
           {STEPS.map((step, idx) => {
             const Icon = step.icon;
             const isCompleted = idx < currentStepIndex;
             const isActive = idx === currentStepIndex;
             return (
               <button
                 key={step.id}
                 onClick={() => setCurrentStepIndex(idx)}
                 className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-xl transition-all min-w-[80px] ${
                   isActive ? 'bg-brand-primary text-white shadow-md scale-105' : 
                   isCompleted ? 'text-brand-primary bg-brand-primary/10' : 'text-slate-400 hover:bg-slate-100'
                 }`}
               >
                 <Icon size={idx === currentStepIndex ? 18 : 16} />
                 <span className="text-[9px] font-bold uppercase tracking-tight">{step.label}</span>
               </button>
             );
           })}
        </div>
      </div>

      {/* Step Render */}
      <div className="min-h-[70vh]">
         {currentStep.id === 'bible' && (
           <BibleSelection onNext={() => setCurrentStepIndex(1)} />
         )}

          {currentStep.id !== 'bible' && currentStep.id !== 'review' && (
            <StudyStep
              key={currentStep.id}
              title={currentStep.label}
              field={currentStep.field!}
              description={currentStep.desc!}
              placeholder={currentStep.placeholder!}
              methodTip={(currentStep as any).methodTip}
              onNext={() => setCurrentStepIndex(prev => Math.min(STEPS.length - 1, prev + 1))}
              onBack={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
            />
          )}

         {currentStep.id === 'review' && !isFinished && (
           <FinalReview 
              onBack={() => setCurrentStepIndex(prev => prev - 1)}
              onComplete={async () => {
                await updateCurrentStudy({ status: 'completed' });
                setIsFinished(true);
              }}
           />
         )}

         {currentStep.id === 'review' && isFinished && (
           <div className="max-w-2xl mx-auto glass-card p-12 rounded-[40px] text-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-bold font-serif text-slate-800">Estudo Concluído!</h2>
              <p className="text-slate-500">
                Você percorreu todo o caminho da exegese profunda ao sermão preparado. 
                Que este trabalho frutifique para a glória de Deus.
              </p>
              <div className="pt-6">
                <Button className="h-14 px-8 text-lg" onClick={() => navigate('/dashboard')}>
                   Voltar ao Dashboard
                </Button>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
