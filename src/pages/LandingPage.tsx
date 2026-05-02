import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, ShieldCheck, Search, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  const { signInWithGoogle, signInAsGuest, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      title: "Método Estruturado",
      desc: "Um guia passo a passo da observação à aplicação prática do texto bíblico.",
      icon: Search
    },
    {
      title: "Instrutor de IA",
      desc: "Feedback imediato e pedagógico para aprofundar suas análises hermenêuticas.",
      icon: Sparkles
    },
    {
      title: "Fidelidade Textual",
      desc: "Foco total na mensagem original e intenção do autor bíblico.",
      icon: ShieldCheck
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 overflow-hidden relative">
      {/* Background Image with optimized treatment */}
      <div 
        className="absolute inset-0 z-0 opacity-40 grayscale-[0.6] mix-blend-overlay scale-105"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1543191879-742cb35a3a4e?auto=format&fit=crop&q=80&w=2000')`,
          backgroundSize: 'cover',
          backgroundPosition: 'top'
        }}
      />
      
      {/* Decorative Gradients overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-slate-950/90 z-0" />
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-brand-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="p-6 md:px-12 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white flex items-center justify-center rounded-xl shadow-lg">
             <BookOpen className="text-brand-primary" size={24} />
          </div>
          <h1 className="font-serif text-xl font-bold tracking-tight text-white">O Hermeneuta</h1>
        </div>
        <Button variant="ghost" onClick={signInWithGoogle} className="text-slate-300 hover:text-white">Entrar</Button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 max-w-6xl mx-auto pt-12 pb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
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

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <Button 
              size="lg" 
              className="text-lg px-12 h-16 rounded-2xl shadow-2xl shadow-brand-primary/20 hover:scale-105 transition-transform"
              onClick={signInWithGoogle}
            >
              Começar Estudo Grátis
            </Button>
            <button 
              className="text-slate-400 hover:text-white font-semibold transition-colors flex items-center gap-2"
              onClick={() => signInAsGuest()}
            >
              Continuar como Convidado
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>

        {/* Highlight Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 text-left"
        >
          {features.map((f, i) => (
            <div key={i} className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-brand-primary/40 transition-all duration-500">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-brand-primary mb-8 group-hover:scale-110 transition-transform">
                <f.icon size={28} />
              </div>
              <h3 className="text-2xl font-bold font-serif mb-4 text-white uppercase tracking-tight">{f.title}</h3>
              <p className="text-slate-400 text-base leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-slate-500 text-xs border-t border-white/5 bg-black/40 backdrop-blur-xl relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 opacity-60">
           <span>&copy; {new Date().getFullYear()} O Hermeneuta. Desenvolvido por [P1n40](https://github.com/P1n40) para a glória de Deus.</span>
           <div className="flex items-center gap-6 font-bold uppercase tracking-widest text-[10px]">
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
           </div>
        </div>
      </footer>
    </div>
  );
}
