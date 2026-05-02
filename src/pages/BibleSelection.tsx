import React, { useState } from 'react';
import { useStudy } from '../context/StudyContext';
import { Button } from '../components/ui/Button';
import { Search, Check, ChevronRight } from 'lucide-react';

import { fetchBibleText } from '../services/bibleService';

const BOOKS = [
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio",
  "Josué", "Juízes", "Rute", "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas",
  "Esdras", "Neemias", "Ester", "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cantares",
  "Isaías", "Jeremias", "Lamentações", "Ezequiel", "Daniel", "Oseias", "Joel", "Amós",
  "Obadias", "Jonas", "Miqueias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias",
  "Mateus", "Marcos", "Lucas", "João", "Atos", "Romanos", "1 Coríntios", "2 Coríntios", "Gálatas", "Efésios",
  "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses", "1 Timóteo", "2 Timóteo", "Tito",
  "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro", "1 João", "2 João", "3 João", "Judas", "Apocalipse"
];

export default function BibleSelection({ onNext }: { onNext: () => void }) {
  const { currentStudy, updateCurrentStudy } = useStudy();
  const [selection, setSelection] = useState({
    book: '',
    chapter: 1,
    verseStart: 1,
    verseEnd: 1,
    translation: 'ARA',
    text: ''
  });
  const [loading, setLoading] = useState(false);

  const TRANSLATIONS = ["ARA", "NVI", "NVT", "ARC", "NAA"];

  const handleConfirm = async () => {
    if (!selection.book) return;
    setLoading(true);
    
    try {
      const bibleText = await fetchBibleText(
        selection.book, 
        selection.chapter, 
        selection.verseStart, 
        selection.verseEnd, 
        selection.translation
      );

      await updateCurrentStudy({
        bibleSelection: {
          ...selection,
          text: bibleText
        }
      });
      onNext();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold font-serif">Escolha o Texto Bíblico</h2>
        <p className="text-slate-500">Selecione o trecho que você deseja cavar e descobrir.</p>
      </div>

      <div className="glass-card p-8 rounded-3xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Livro</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary outline-none transition-all"
              value={selection.book}
              onChange={(e) => setSelection({...selection, book: e.target.value})}
            >
              <option value="">Selecione...</option>
              {BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Capítulo</label>
            <input 
              type="number" 
              min="1"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary outline-none"
              value={selection.chapter}
              onChange={(e) => setSelection({...selection, chapter: parseInt(e.target.value)})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Versículo Inicial</label>
            <input 
              type="number" 
              min="1"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary outline-none"
              value={selection.verseStart}
              onChange={(e) => setSelection({...selection, verseStart: parseInt(e.target.value)})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Versículo Final</label>
            <input 
              type="number" 
              min="1"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary outline-none"
              value={selection.verseEnd}
              onChange={(e) => setSelection({...selection, verseEnd: parseInt(e.target.value)})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tradução</label>
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-brand-primary outline-none"
              value={selection.translation}
              onChange={(e) => setSelection({...selection, translation: e.target.value})}
            >
              {TRANSLATIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            className="w-full h-14 text-lg" 
            disabled={!selection.book} 
            loading={loading}
            onClick={handleConfirm}
          >
            Confirmar Seleção e Iniciar
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
      
      <div className="p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
        <p className="text-xs text-brand-primary/80 italic text-center">
          "A erva seca, e a flor cai, mas a palavra do nosso Deus permanece para sempre." — Isaías 40:8
        </p>
      </div>
    </div>
  );
}
