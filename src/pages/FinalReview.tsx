import React from 'react';
import { useStudy } from '../context/StudyContext';
import { Button } from '../components/ui/Button';
import { CheckCircle2, ChevronLeft, ArrowRight } from 'lucide-react';

export default function FinalReview({ onBack, onComplete }: { onBack: () => void, onComplete: () => void }) {
  const { currentStudy } = useStudy();

  const sections = [
    { title: 'Observações', content: currentStudy?.observations },
    { title: 'Gênero & Estrutura', content: currentStudy?.genre },
    { title: 'Ideia Principal', content: currentStudy?.mainIdea },
    { title: 'Intento Transformador', content: currentStudy?.transformingIntent },
    { title: 'Esboço do Sermão', content: currentStudy?.sermonOutline },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold font-serif">Revisão Final</h2>
        <p className="text-slate-500 text-sm">Confira seu trabalho antes de concluir o estudo.</p>
      </div>

      <div className="space-y-6">
        {sections.map((s, i) => (
          <div key={i} className="glass-card p-8 rounded-3xl space-y-4">
            <h3 className="text-lg font-bold font-serif text-brand-primary flex items-center gap-2">
               <span className="w-6 h-6 rounded-full bg-brand-primary/10 text-[10px] flex items-center justify-center">0{i+1}</span>
               {s.title}
            </h3>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap italic">
              {s.content || <span className="text-slate-300">Não preenchido</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-6 flex gap-4 justify-center pt-8">
        <Button variant="outline" size="lg" onClick={onBack}>
          <ChevronLeft size={20} />
          Voltar e Editar
        </Button>
        <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={onComplete}>
          <CheckCircle2 size={20} />
          Finalizar Estudo
          <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
}
