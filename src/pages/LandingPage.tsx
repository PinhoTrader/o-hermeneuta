import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, ShieldCheck, Search, ChevronRight } from 'lucide-react';
import heroMentorship from '../assets/hero-mentorship.png';

export default function LandingPage() {
  const { signInWithGoogle, signInAsGuest, user, loading, authError, authAction, clearAuthError } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [loading, user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch {
      // AuthContext exposes a friendly error.
    }
  };

  const handleGuestLogin = async () => {
    try {
      await signInAsGuest();
    } catch {
      // AuthContext exposes a friendly error.
    }
  };

  const features = [
    {
      title: 'Método Estruturado',
      desc: 'Um guia passo a passo da observação à aplicação prática do texto bíblico.',
      icon: Search
    },
    {
      title: 'Instrutor de IA',
      desc: 'Feedback imediato e pedagógico para aprofundar suas análises hermenêuticas.',
      icon: Sparkles
    },
    {
      title: 'Fidelidade Textual',
      desc: 'Foco total na mensagem original e intenção do autor bíblico.',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 overflow-hidden relative">
      <div 
        className="absolute inset-0 z-0 opacity-95 scale-105"
        style={{ 
          backgroundImage: `url(${heroMentorship})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/20 to-slate-950/75 z-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/25 via-slate-950/10 to-slate-950/30 z-0" />
      <div className="absolute inset-x-0 top-20 mx-auto h-[520px] max-w-5xl bg-slate-950/35 blur-3xl z-0" />
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      <header className="p-6 md:px-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white flex items-center justify-center rounded-xl shadow-lg">
            <BookOpen className="text-brand-primary" size={24} />
          </div>
          <h1 className="font-serif text-xl font-bold tracking-tight text-white">O Hermeneuta</h1>
        </div>
        <Button
          variant="ghost"
          onClick={handleGoogleLogin}
          loading={authAction === 'google'}
          className="text-slate-300 hover:bg-white/10 hover:text-white"
        >
          Entrar
        </Button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 max-w-6xl mx-auto pt-12 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-brand-primary text-xs font-bold tracking-widest uppercase backdrop-blur-md border border-white/10">
            <Sparkles size={14} />
            Um método que transforma sua pregação
          </div>
          
          <h2 className="text-5xl md:text-8xl font-black font-serif leading-[0.95] text-white tracking-tighter">
            Trabalhe o Texto.<br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-amber-300 drop-shadow-md">Pregue com Vida.</span>
          </h2>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
            O ambiente de treinamento prático que guia você através da observação, exegese e aplicação bíblica profunda.
          </p>

          <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-left shadow-2xl backdrop-blur-md">
            <div className="flex items-start gap-3">
              <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.8)]" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Entre com Google para salvar na nuvem.</p>
                <p className="text-xs leading-relaxed text-slate-300">
                  Como convidado, seus estudos ficam apenas neste navegador até você entrar com uma conta.
                </p>
              </div>
            </div>

            {authError && (
              <div className="mt-4 rounded-xl border border-red-300/20 bg-red-500/15 px-4 py-3 text-sm text-red-100">
                <div className="flex items-start justify-between gap-3">
                  <span>{authError}</span>
                  <button className="text-xs font-bold uppercase text-red-100/70 hover:text-white" onClick={clearAuthError}>
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Button 
              size="lg" 
              className="text-lg px-12 h-16 rounded-2xl shadow-2xl shadow-brand-primary/20 hover:scale-105 transition-transform"
              onClick={handleGuestLogin}
              loading={authAction === 'guest'}
              disabled={loading || authAction !== null}
            >
              Começar Estudo Grátis
            </Button>
            <button 
              className="text-slate-300 hover:text-white font-semibold transition-colors flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleGoogleLogin}
              disabled={loading || authAction !== null}
            >
              {authAction === 'google' ? 'Abrindo Google...' : 'Salvar com Google'}
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 text-left"
        >
          {features.map((feature) => (
            <div key={feature.title} className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-primary/40 transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-brand-primary mb-8 group-hover:scale-110 transition-transform">
                <feature.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold font-serif mb-4 text-white uppercase tracking-tight">{feature.title}</h3>
              <p className="text-slate-400 text-base leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      <footer className="p-8 text-center text-slate-500 text-xs border-t border-white/5 bg-black/40 backdrop-blur-xl relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 opacity-60">
          <span>&copy; {new Date().getFullYear()} O Hermeneuta. Desenvolvido por P1n40 para a glória de Deus.</span>
          <div className="flex items-center gap-6 font-bold uppercase tracking-widest text-[10px]">
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
