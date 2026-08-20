import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StudyProvider, useStudy } from './context/StudyContext';
import { ProtectedRoute, AdminRoute } from './components/AuthRoutes';
import { Button } from './components/ui/Button';
import React from 'react';

const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AcademyPage = React.lazy(() => import('./pages/AcademyPage'));
const StudyController = React.lazy(() => import('./pages/StudyController'));
const GroupsPage = React.lazy(() => import('./pages/GroupsPage'));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'));
const Account = React.lazy(() => import('./pages/Account'));
const Settings = React.lazy(() => import('./pages/Settings'));
const EditProfile = React.lazy(() => import('./pages/EditProfile'));

function PageFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-brand-secondary text-brand-primary">
      <div className="animate-spin">○</div>
    </div>
  );
}

function NewStudyRoute() {
  const { createNewStudy } = useStudy();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const startedRef = React.useRef(false);

  React.useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    (async () => {
      try {
        const id = await createNewStudy('Novo Estudo');
        navigate(`/study/${id}`, { replace: true });
      } catch {
        setError('Falha ao criar estudo. Tente novamente.');
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 max-w-sm">
          {error}
        </p>
        <Button variant="outline" onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="flex h-[60vh] items-center justify-center text-brand-primary">
      <div className="animate-spin">○</div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StudyProvider>
        <BrowserRouter>
          <React.Suspense fallback={<PageFallback />}>
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

              <Route path="/account" element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              } />

              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />

              <Route path="/edit-profile" element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              } />

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </React.Suspense>
        </BrowserRouter>
      </StudyProvider>
    </AuthProvider>
  );
}
