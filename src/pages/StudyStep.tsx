import React, { useState, useEffect } from 'react';
import { useStudy } from '../context/StudyContext';
import { Button } from '../components/ui/Button';
import { Sparkles, Save, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { getStageFeedback } from '../services/geminiService';
import { fetchBibleText } from '../services/bibleService';
import { motion, AnimatePresence } from 'framer-motion';

import Markdown from 'react-markdown';

interface StudyStepProps {
  title: string;
  field: string;
  description: string;
  placeholder: string;
  methodTip?: string;
  onNext: () => void;
  onBack: () => void;
}

export default function StudyStep({ title, field, description, placeholder, methodTip, onNext, onBack }: StudyStepProps) {
  const { currentStudy, updateCurrentStudy } = useStudy();
  const [content, setSelection] = useState<string>((currentStudy as any)?.[field] || '');
  const [lastSavedContent, setLastSavedContent] = useState<string>((currentStudy as any)?.[field] || '');
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingBible, setLoadingBible] = useState(false);
  const [translation, setTranslation] = useState(currentStudy?.bibleSelection?.translation || 'NVI');

  useEffect(() => {
     const dbContent = (currentStudy as any)?.[field] || '';
     setSelection(dbContent);
     setLastSavedContent(dbContent);
     setAiFeedback(null);
     if (currentStudy?.bibleSelection?.translation) {
       setTranslation(currentStudy.bibleSelection.translation);
     }
  }, [field, currentStudy?.id]); // Only reset on field change or study change

  // Smart Autosave Logic
  useEffect(() => {
    // 1. Skip if content hasn't changed from last saved version
    if (content === lastSavedContent) return;

    // 2. Debounce of 3 seconds
    const timer = setTimeout(async () => {
      if (content !== lastSavedContent) {
        try {
          setSaving(true);
          await updateCurrentStudy({ [field]: content });
          setLastSavedContent(content);
          console.info(`[Autosave] Saved field: ${field}`);
        } catch (err) {
          console.error('[Autosave] Error:', err);
        } finally {
          setSaving(false);
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [content, field]);

  useEffect(() => {
    const updateText = async () => {
      if (currentStudy?.bibleSelection && translation !== currentStudy.bibleSelection.translation) {
        setLoadingBible(true);
        try {
          const bibleText = await fetchBibleText(
            currentStudy.bibleSelection.book,
            currentStudy.bibleSelection.chapter,
            currentStudy.bibleSelection.verseStart,
            currentStudy.bibleSelection.verseEnd,
            translation
          );
          await updateCurrentStudy({
            bibleSelection: {
              ...currentStudy.bibleSelection,
              translation,
              text: bibleText
            }
          });
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingBible(false);
        }
      }
    };
    updateText();
  }, [translation]);

  const handleSave = async () => {
    if (content === lastSavedContent) return;
    setSaving(true);
    try {
      await updateCurrentStudy({ [field]: content });
      setLastSavedContent(content);
    } catch (err) {
      console.error('Manual save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAiReview = async () => {
    if (!currentStudy) return;
    setLoadingAi(true);
    setAiFeedback(null);
    try {
      const feedback = await getStageFeedback(title, { ...currentStudy, [field]: content } as any);
      setAiFeedback(feedback);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Left Column: Text & Instructions */}
      <div className="lg:col-span-2 space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-serif text-slate-900">{title}</h2>
          <p className="text-slate-500 text-sm">{description}</p>
        </div>

        {/* Bible Text Reference */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3 relative overflow-hidden">
          {loadingBible && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20">
              <div className="animate-spin text-brand-primary">◌</div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-widest text-brand-primary/60">Texto de Referência</h4>
            <div className="relative">
              <select 
                value={translation} 
                onChange={(e) => setTranslation(e.target.value)}
                className="text-xs font-bold pl-3 pr-8 py-1 rounded-full bg-brand-primary/10 text-brand-primary border border-brand-primary/20 outline-none cursor-pointer hover:bg-brand-primary/20 transition-all shadow-sm focus:ring-2 focus:ring-brand-primary/30 appearance-none"
              >
                <option value="NVI">NVI</option>
                <option value="NAA">NAA</option>
                <option value="ARA">ARA</option>
                <option value="ARC">ARC</option>
                <option value="NVT">NVT</option>
                <option value="NTLH">NTLH</option>
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-brand-primary/60">
                <ChevronRight size={10} className="rotate-90" />
              </div>
            </div>
          </div>
          <p className="text-lg font-serif leading-relaxed italic text-slate-700">
             "{currentStudy?.bibleSelection?.text}" 
             <span className="ml-2 font-sans font-bold not-italic text-brand-primary">
               — {currentStudy?.bibleSelection?.book} {currentStudy?.bibleSelection?.chapter}:{currentStudy?.bibleSelection?.verseStart}-{currentStudy?.bibleSelection?.verseEnd}
             </span>
          </p>
        </div>

        {/* Input Area */}
        <div className="space-y-4">
          <textarea
            className="w-full min-h-[300px] p-6 glass-card rounded-2xl focus:ring-2 focus:ring-brand-primary outline-none text-slate-800 leading-relaxed font-sans placeholder:italic"
            placeholder={placeholder}
            value={content}
            onChange={(e) => setSelection(e.target.value)}
          />
          
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleSave} loading={saving}>
              <Save size={16} />
              {saving ? 'Salvando...' : 'Salvar rascunho'}
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onBack}>
                <ChevronLeft size={18} />
                Voltar
              </Button>
              <Button onClick={async () => {
                await handleSave();
                onNext();
              }}>
                Próximo Passo
                <ChevronRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: AI Instructor */}
      <div className="space-y-6">
        <div className="sticky top-24 space-y-6">
          <div className="glass-card p-6 rounded-2xl border-brand-primary/20 bg-brand-primary/[0.02]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Instrutor de IA</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">O Hermeneuta</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {aiFeedback ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="text-sm text-slate-600 leading-relaxed prose prose-sm prose-slate prose-p:mb-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                     <Markdown>{aiFeedback}</Markdown>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setAiFeedback(null)}>
                     Entendi, obrigado!
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   className="space-y-4"
                >
                  <p className="text-sm text-slate-500 leading-relaxed italic">
                    Precisa de ajuda para aprofundar sua análise nesta etapa? Peça uma revisão pedagógica baseada no seu texto.
                  </p>
                  <Button 
                    className="w-full bg-slate-900" 
                    onClick={handleAiReview}
                    loading={loadingAi}
                  >
                    <Sparkles size={16} />
                    {loadingAi ? 'Analisando...' : 'Revisar com IA'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {methodTip && (
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                 <HelpCircle size={48} className="text-amber-600" />
               </div>
               <div className="relative z-10">
                 <div className="flex items-center gap-2 mb-2 text-amber-700">
                   <Sparkles size={16} />
                   <span className="text-[10px] uppercase font-black tracking-widest">Dica de Ouro do Método</span>
                 </div>
                 <p className="text-sm text-amber-900 font-medium leading-relaxed">
                   {methodTip}
                 </p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
