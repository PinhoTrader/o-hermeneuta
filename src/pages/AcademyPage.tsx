import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  Play, 
  Lock,
  Star,
  Award,
  Sparkles,
  ArrowLeft,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ACADEMY_CONTENT, getAcademyProgress, updateLessonCompletion } from '../services/academyService';
import { AcademyProgress, Lesson, AcademyModule } from '../types';
import { Button } from '../components/ui/Button';
import Markdown from 'react-markdown';

export default function AcademyPage() {
  const { profile, user } = useAuth();
  const [progress, setProgress] = useState<AcademyProgress | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [quizState, setQuizState] = useState<{
    currentQuestionIndex: number;
    answers: number[];
    isFinished: boolean;
    score: number | null;
    showFeedback: boolean;
    selectedOption: number | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isApproved = profile?.isApproved || profile?.role === 'admin' || profile?.email === 'escoladetradersead@gmail.com';
    
    if (profile?.uid && isApproved) {
      getAcademyProgress(profile.uid).then(p => {
        setProgress(p);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [profile]);

  const isLessonCompleted = (lessonId: string) => {
    return progress?.completedLessons.includes(lessonId) || false;
  };

  const handleStartLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setQuizState(null);
    window.scrollTo(0, 0);
  };

  const handleStartQuiz = () => {
    if (!selectedLesson?.quiz) return;
    setQuizState({
      currentQuestionIndex: 0,
      answers: [],
      isFinished: false,
      score: null,
      showFeedback: false,
      selectedOption: null
    });
  };

  const handleAnswer = (optionIndex: number) => {
    if (!quizState || !selectedLesson?.quiz || quizState.showFeedback) return;
    setQuizState({
      ...quizState,
      selectedOption: optionIndex,
      showFeedback: true
    });
  };

  const handleNextQuestion = () => {
    if (!quizState || !selectedLesson?.quiz || quizState.selectedOption === null) return;

    const newAnswers = [...quizState.answers, quizState.selectedOption];
    
    if (quizState.currentQuestionIndex < selectedLesson.quiz.length - 1) {
      setQuizState({
        ...quizState,
        currentQuestionIndex: quizState.currentQuestionIndex + 1,
        answers: newAnswers,
        showFeedback: false,
        selectedOption: null
      });
    } else {
      // Calculate score
      let correctCount = 0;
      selectedLesson.quiz.forEach((q, idx) => {
        if (newAnswers[idx] === q.correctOptionIndex) correctCount++;
      });
      const score = Math.round((correctCount / selectedLesson.quiz.length) * 100);
      
      setQuizState({
        ...quizState,
        answers: newAnswers,
        isFinished: true,
        score,
        showFeedback: false
      });

      if (profile?.uid) {
        updateLessonCompletion(profile.uid, selectedLesson.id, score).then(() => {
          getAcademyProgress(profile.uid!).then(setProgress);
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin text-brand-primary">◌</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <AnimatePresence mode="wait">
        {!selectedLesson ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles size={14} />
                Academia do Método
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-serif text-slate-900 italic">Trilha O Hermeneuta</h1>
              <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
                Domine as ferramentas da hermenêutica bíblica através de um guia passo a passo, exercícios práticos e mentorias com IA.
              </p>
            </div>

            {/* Modules List */}
            <div className="space-y-8">
              {ACADEMY_CONTENT.map((module, mIdx) => (
                <div key={module.id} className="relative">
                  {mIdx < ACADEMY_CONTENT.length - 1 && (
                    <div className="absolute left-[27px] top-16 bottom-0 w-0.5 bg-slate-100 hidden md:block" />
                  )}
                  
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Module Marker */}
                    <div className="hidden md:flex flex-col items-center shrink-0">
                      <div className="w-14 h-14 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-lg shadow-brand-primary/20">
                        <span className="text-lg font-bold">{module.order}</span>
                      </div>
                    </div>

                    <div className="flex-1 space-y-6">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold font-serif text-slate-900">{module.title}</h2>
                        <p className="text-slate-500 text-sm">{module.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {module.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => handleStartLesson(lesson)}
                            className={`group p-6 rounded-2xl text-left transition-all border ${
                              isLessonCompleted(lesson.id)
                                ? 'bg-green-50 border-green-100 hover:border-green-200'
                                : 'bg-white border-slate-100 hover:border-brand-primary/30 hover:shadow-xl hover:shadow-slate-200/50'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className={`p-2 rounded-xl ${
                                isLessonCompleted(lesson.id) ? 'bg-green-100 text-green-600' : 'bg-slate-50 text-slate-400 group-hover:bg-brand-primary group-hover:text-white'
                              } transition-colors`}>
                                <BookOpen size={20} />
                              </div>
                              {isLessonCompleted(lesson.id) && (
                                <div className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                  Concluída
                                </div>
                              )}
                            </div>
                            <h3 className="font-bold text-slate-800 mb-1 group-hover:text-brand-primary transition-colors">{lesson.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                               <span>Lição {lesson.order}</span>
                               <span className="w-1 h-1 rounded-full bg-slate-300" />
                               <span>~10 min</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Final Certificate Concept */}
            <div className="p-12 rounded-[40px] bg-slate-900 text-white text-center space-y-6 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-10 blur-2xl">
                < Award size={200} />
              </div>
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto text-amber-400">
                  <Award size={32} />
                </div>
                <h2 className="text-3xl font-bold font-serif italic text-white">Pronto para o Certificado?</h2>
                <p className="text-slate-400 max-w-lg mx-auto">
                  Complete todas as trilhas e exercícios para desbloquear sua Certificação em Homilética e Hermenêutica Aplicada.
                </p>
                <div className="pt-4">
                  <div className="h-2 w-48 mx-auto bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-primary transition-all duration-1000"
                      style={{ width: `${(progress?.completedLessons.length || 0) / 10 * 100}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {progress?.completedLessons.length || 0} de 10 lições totais
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="lesson"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            {/* Lesson Header */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setSelectedLesson(null)}
                className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-colors"
              >
                <ArrowLeft size={16} />
                Voltar à Trilha
              </button>
              <div className="flex items-center gap-3">
                 <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Próxima Lição</p>
                   <p className="text-xs font-bold text-slate-600">Contexto Histórico</p>
                 </div>
                 <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-colors">
                   <ChevronRight size={20} />
                 </button>
              </div>
            </div>

            {/* Lesson Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 md:p-12 rounded-[40px] border border-slate-100 shadow-sm prose prose-slate max-w-none">
                  <div className="markdown-body">
                    <Markdown>{selectedLesson.content}</Markdown>
                  </div>
                </div>

                {!quizState && selectedLesson.quiz && (
                  <div className="p-12 rounded-[40px] bg-brand-primary text-white text-center space-y-6">
                    <h3 className="text-3xl font-bold font-serif italic">Hora do Desafio!</h3>
                    <p className="text-brand-secondary opacity-90 max-w-md mx-auto">
                      Vamos testar seus conhecimentos sobre esta lição antes de prosseguirmos.
                    </p>
                    <Button 
                      className="bg-white text-brand-primary hover:bg-brand-secondary border-0 px-8 py-6 h-auto text-lg rounded-2xl group shadow-2xl"
                      onClick={handleStartQuiz}
                    >
                      Começar Exercício
                      <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                )}

                {quizState && !quizState.isFinished && selectedLesson.quiz && (
                  <div className="bg-white p-8 md:p-12 rounded-[32px] border border-slate-100 shadow-xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                        Questão {quizState.currentQuestionIndex + 1} de {selectedLesson.quiz.length}
                      </p>
                      <div className="w-24 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-brand-primary transition-all"
                          style={{ width: `${(quizState.currentQuestionIndex + 1) / selectedLesson.quiz.length * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold font-serif text-slate-900 leading-tight">
                      {selectedLesson.quiz[quizState.currentQuestionIndex].text}
                    </h3>

                    <div className="space-y-4">
                      {selectedLesson.quiz[quizState.currentQuestionIndex].options.map((option, idx) => {
                        const isSelected = quizState.selectedOption === idx;
                        const isCorrect = selectedLesson.quiz![quizState.currentQuestionIndex].correctOptionIndex === idx;
                        const showCorrect = quizState.showFeedback && isCorrect;
                        const showWrong = quizState.showFeedback && isSelected && !isCorrect;

                        return (
                          <button
                            key={idx}
                            disabled={quizState.showFeedback}
                            onClick={() => handleAnswer(idx)}
                            className={`w-full text-left p-6 rounded-2xl border transition-all group flex items-center justify-between ${
                              showCorrect 
                                ? 'bg-green-50 border-green-200 ring-2 ring-green-100' 
                                : showWrong 
                                  ? 'bg-red-50 border-red-200 ring-2 ring-red-100'
                                  : isSelected
                                    ? 'bg-brand-primary/5 border-brand-primary'
                                    : 'bg-white border-slate-100 hover:border-brand-primary hover:bg-brand-primary/5'
                            }`}
                          >
                            <span className={`font-medium ${
                              showCorrect ? 'text-green-700' : showWrong ? 'text-red-700' : 'text-slate-700'
                            }`}>
                              {option}
                            </span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              showCorrect ? 'border-green-500 bg-green-500 text-white' : showWrong ? 'border-red-500 bg-red-500 text-white' : 'border-slate-200'
                            }`}>
                              {showCorrect && <CheckCircle2 size={14} />}
                              {showWrong && <X size={14} />}
                              {!quizState.showFeedback && isSelected && <div className="w-3 h-3 bg-brand-primary rounded-full" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {quizState.showFeedback && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            quizState.selectedOption === selectedLesson.quiz[quizState.currentQuestionIndex].correctOptionIndex
                              ? 'bg-green-100 text-green-600'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            <Sparkles size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Explicação Didática</p>
                            <p className="text-sm text-slate-700 leading-relaxed">
                              {selectedLesson.quiz[quizState.currentQuestionIndex].explanation}
                            </p>
                          </div>
                        </div>
                        <Button className="w-full" onClick={handleNextQuestion}>
                          Próxima Questão
                        </Button>
                      </motion.div>
                    )}
                  </div>
                )}

                {quizState?.isFinished && (
                  <div className="bg-white p-12 rounded-[40px] border border-slate-100 shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={64} />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-3xl font-bold font-serif text-slate-900">Excelente Trabalho!</h3>
                       <p className="text-slate-500">Lição concluída com sucesso. Você está um passo mais próximo da maestria bíblica.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Pontuação</p>
                         <p className="text-2xl font-bold text-slate-900">{quizState.score}%</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                         <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>
                         <p className="text-sm font-bold text-green-600 uppercase">Aprovado</p>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button variant="outline" className="flex-1" onClick={() => setSelectedLesson(null)}>
                        Sair da Aula
                      </Button>
                      <Button className="flex-1" onClick={() => setSelectedLesson(null)}>
                        Próxima Lição
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar: Mentor / Instructions */}
              <div className="space-y-6">
                <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100 space-y-6 sticky top-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                      <Sparkles size={24} />
                    </div>
                    <div>
                       <h4 className="font-bold text-amber-900">Mentor IA</h4>
                       <span className="text-[10px] font-black text-amber-600 uppercase">Para esta lição</span>
                    </div>
                  </div>
                  <p className="text-sm text-amber-800 leading-relaxed italic">
                    "Essa lição é crucial para entender como 'Cavar' o texto. Se você tiver alguma dúvida sobre como preparar seu coração para o estudo, fale comigo agora!"
                  </p>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white border-0 shadow-lg shadow-amber-200">
                    Conversar com Mentor
                  </Button>
                </div>

                <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 space-y-4">
                   <h4 className="font-bold text-slate-900">Recursos Extras</h4>
                   <div className="space-y-2">
                     <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white transition-colors group">
                       <span className="text-xs text-slate-600 group-hover:text-brand-primary transition-colors">PDF da Apostila (Cap. 1)</span>
                       <ChevronRight size={14} className="text-slate-400" />
                     </button>
                     <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white transition-colors group">
                       <span className="text-xs text-slate-600 group-hover:text-brand-primary transition-colors">Infográfico do Método</span>
                       <ChevronRight size={14} className="text-slate-400" />
                     </button>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
