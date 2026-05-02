import React from 'react';
import { Navigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Layout } from './Layout';
import { Button } from './ui/Button';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut, authAction } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-brand-secondary">
      <div className="animate-spin text-brand-primary">○</div>
    </div>
  );
  
  if (!user) return <Navigate to="/" />;
  
  const isAdminEmail = user?.email === 'escoladetradersead@gmail.com';
  
  if (profile && !profile.isApproved && !user.isGuest && !isAdminEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-secondary p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
            <Shield size={40} />
          </div>
          <h2 className="text-2xl font-bold font-serif">Aguardando Aprovação</h2>
          <p className="text-slate-500 leading-relaxed">
            Sua conta foi criada com sucesso, mas precisa ser aprovada por um administrador 
            antes que você possa acessar o sistema.
          </p>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-left space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status da conta</p>
            <p className="text-sm font-semibold text-slate-700">Pendente de aprovação</p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
          <p className="text-sm text-slate-400 italic">
            Por favor, contate seu mentor ou o administrador do curso.
          </p>
          <Button variant="outline" className="w-full" onClick={() => signOut()} loading={authAction === 'signOut'}>
            Sair e tentar outro login
          </Button>
        </div>
      </div>
    );
  }

  return <Layout>{children}</Layout>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!profile || profile.role !== 'admin') return <Navigate to="/dashboard" />;

  return <Layout>{children}</Layout>;
}
