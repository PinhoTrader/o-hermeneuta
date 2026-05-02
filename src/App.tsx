import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Layout } from './components/Layout';
import { Button } from './components/ui/Button';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AcademyPage from './pages/AcademyPage';
import StudyController from './pages/StudyController';
import GroupsPage from './pages/GroupsPage';
import AdminPanel from './pages/AdminPanel';
import { Shield, BookOpen } from 'lucide-react';
import { auth } from './lib/firebase';
import React from 'react';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-brand-secondary">
      <div className="animate-spin text-brand-primary">◌</div>
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
          <p className="text-sm text-slate-400 italic">
            Por favor, contate seu mentor ou o administrador do curso.
          </p>
          <Button variant="outline" className="w-full" onClick={() => auth.signOut()}>
            Sair e tentar outro login
          </Button>
        </div>
      </div>
    );
  }

  return <Layout>{children}</Layout>;
}

// Admin Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!profile || profile.role !== 'admin') return <Navigate to="/dashboard" />;

  return <Layout>{children}</Layout>;
}

// New Study Creator Component
function NewStudyRoute() {
  const { createNewStudy } = useStudy();
  const navigate = useNavigate();
  const [title, setTitle] = React.useState('');
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || isCreating) return;

    setIsCreating(true);
    setError(null);
    try {
      const id = await createNewStudy(title);
      navigate(`/study/${id}`);
    } catch (err) {
      setError("Falha ao criar estudo. Tente novamente.");
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} />
          </div>
          <h2 className="text-2xl font-bold font-serif text-slate-900">Iniciar Novo Estudo</h2>
          <p className="text-slate-500 text-sm">Dê um nome ao seu projeto para começar a cavar as Escrituras.</p>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Título do Estudo</label>
            <input 
              type="text"
              autoFocus
              placeholder="Ex: Epístola aos Efésios - Cap 1"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isCreating}
            />
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1" 
              onClick={() => navigate('/dashboard')}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              loading={isCreating}
              disabled={!title.trim()}
            >
              Começar Estudo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StudyProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            <Route path="/academy" element={
              <ProtectedRoute>
                <AcademyPage />
              </ProtectedRoute>
            } />
            
            <Route path="/study/:studyId" element={
              <ProtectedRoute>
                <StudyController />
              </ProtectedRoute>
            } />

            <Route path="/new-study" element={
              <ProtectedRoute>
                <NewStudyRoute />
              </ProtectedRoute>
            } />

            <Route path="/groups" element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </BrowserRouter>
      </StudyProvider>
    </AuthProvider>
  );
}
