import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LayoutDashboard, MessageSquare, BookOpen, ChevronRight, Menu, X, Shield, User as UserIcon, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { ChatOverlay } from './ChatOverlay';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const navItems = [
    { label: 'Meus Estudos', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Academia', path: '/academy', icon: GraduationCap, restricted: true },
    { label: 'Novo Estudo', path: '/new-study', icon: BookOpen },
    { label: 'Salas Virtuais', path: '/groups', icon: MessageSquare, restricted: true },
  ];

  if (profile?.role === 'admin') {
    navItems.push({ label: 'Admin', path: '/admin', icon: Shield });
  }

  const isApproved = profile?.isApproved || profile?.role === 'admin' || profile?.email === 'escoladetradersead@gmail.com';

  const filteredNavItems = navItems.filter(item => {
    if (item.restricted) return isApproved;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-brand-secondary">
      {/* Topbar */}
      <header className="h-16 border-b border-slate-200 bg-white/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 
              className="text-xl font-bold font-serif text-brand-primary cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/dashboard')}
            >
              O Hermeneuta
            </h1>
            
            <nav className="hidden md:flex items-center gap-6">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-brand-primary ${
                      isActive ? 'text-brand-primary' : 'text-slate-500'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    {profile?.role === 'professor' && (
                      <span className="text-[9px] px-1.5 bg-blue-100 text-blue-600 font-bold rounded uppercase">Professor</span>
                    )}
                    {profile?.role === 'admin' && (
                      <span className="text-[9px] px-1.5 bg-red-100 text-red-600 font-bold rounded uppercase">Administração</span>
                    )}
                    <span className="text-xs font-semibold text-slate-900">{profile?.displayName || user.displayName || 'Usuário'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{user.email}</span>
                </div>
                <button 
                  onClick={() => signOut()}
                  className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all rounded-full"
                  title="Sair"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Button size="sm" onClick={() => navigate('/')}>Entrar</Button>
            )}
            
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-16 inset-x-0 bg-white border-b border-slate-200 p-4 md:hidden flex flex-col gap-4 shadow-lg"
            >
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-secondary text-sm font-medium"
                  >
                    <Icon size={20} />
                    {item.label}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {children}
      </main>

      <ChatOverlay isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      {/* Floating Action Button for Groups/Classrooms/AI */}
      {user && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            className="fab-community" 
            size="lg"
            onClick={() => setIsChatOpen(true)}
            title="Salas Virtuais & Instrutor de IA"
          >
            <div className="relative">
              <MessageSquare size={28} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            </div>
          </Button>
        </div>
      )}
      <footer className="py-6 px-4 md:px-6 border-t border-slate-200 bg-white/30 text-center">
        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">
          © {new Date().getFullYear()} O Hermeneuta • Desenvolvido por <a href="https://github.com/P1n40" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">P1n40</a>
        </p>
        <p className="text-[9px] text-slate-400 mt-1">
          <a href="https://github.com/P1n40/o-hermeneuta" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary">Código Fonte no GitHub</a>
        </p>
      </footer>
    </div>
  );
}
