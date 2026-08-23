import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogOut, LayoutDashboard, MessageSquare, BookOpen, ChevronDown, Menu, X, Shield, User as UserIcon, GraduationCap, Settings as SettingsIcon, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { ChatOverlay } from './ChatOverlay';
import { isSuperAdminEmail } from '../config/superAdmin';
import { fadeZoom } from '../lib/motionVariants';
import logoIcon from '../assets/logo-icon.png';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems = [
    { label: 'Meus Estudos', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Academia', path: '/academy', icon: GraduationCap, restricted: true },
    { label: 'Novo Estudo', path: '/new-study', icon: BookOpen },
    { label: 'Salas Virtuais', path: '/groups', icon: MessageSquare, restricted: true },
  ];

  if (profile?.role === 'admin') {
    navItems.push({ label: 'Admin', path: '/admin', icon: Shield });
  }

  const isApproved = profile?.isApproved || profile?.role === 'admin' || isSuperAdminEmail(profile?.email);

  const filteredNavItems = navItems.filter(item => {
    if (item.restricted) return isApproved;
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-brand-secondary">
      {/* Topbar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/dashboard')}
            >
              <div className="w-8 h-8 bg-white flex items-center justify-center rounded-lg shadow-sm shrink-0">
                <img src={logoIcon} alt="O Hermeneuta" className="w-6 h-6 object-contain" />
              </div>
              <h1 className="text-xl font-bold font-serif text-white">
                O Hermeneuta
              </h1>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-white ${
                      isActive ? 'text-white' : 'text-white/65'
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
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-full border border-white/15 hover:bg-white/10 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center overflow-hidden shrink-0">
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={16} />
                    )}
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-tight">
                    <div className="flex items-center gap-1.5">
                      {profile?.role === 'professor' && <Badge tone="professor">Professor</Badge>}
                      {profile?.role === 'admin' && <Badge tone="admin">Administração</Badge>}
                      <span className="text-xs font-semibold text-white">{profile?.displayName || user.displayName || 'Usuário'}</span>
                    </div>
                    <span className="text-[10px] text-white/60">{user.email}</span>
                  </div>
                  <ChevronDown size={14} className="text-white/70" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                      <motion.div
                        {...fadeZoom(0.2)}
                        style={{ transformOrigin: 'top right' }}
                        className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-lg border border-slate-100 p-2 z-50"
                      >
                        <button
                          onClick={() => { navigate('/account'); setIsUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 text-left"
                        >
                          <UserIcon size={16} />
                          Minha Conta
                        </button>
                        <button
                          onClick={() => { navigate('/settings'); setIsUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 text-left"
                        >
                          <SettingsIcon size={16} />
                          Configurações
                        </button>
                        <button
                          onClick={() => { navigate('/edit-profile'); setIsUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 text-left"
                        >
                          <Edit3 size={16} />
                          Editar Perfil
                        </button>
                        <div className="h-px bg-slate-100 my-1" />
                        <button
                          onClick={() => { setIsUserMenuOpen(false); signOut(); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 text-left"
                        >
                          <LogOut size={16} />
                          Sair
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button size="sm" onClick={() => navigate('/')}>Entrar</Button>
            )}
            
            <button
              className="md:hidden p-2 text-white"
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
        <p className="text-[9px] text-slate-400 mt-1 flex items-center justify-center gap-3">
          <a href="https://github.com/P1n40/o-hermeneuta" target="_blank" rel="noopener noreferrer" className="hover:text-brand-primary">Código Fonte no GitHub</a>
          <span aria-hidden="true">•</span>
          <Link to="/termos" className="hover:text-brand-primary">Termos de Uso</Link>
          <span aria-hidden="true">•</span>
          <Link to="/privacidade" className="hover:text-brand-primary">Privacidade</Link>
        </p>
      </footer>
    </div>
  );
}
