import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { fade } from '../lib/motionVariants';
import { Edit3, LogOut } from 'lucide-react';

export default function Settings() {
  const { user, profile, signOut, authAction } = useAuth();
  const navigate = useNavigate();

  const displayName = profile?.displayName || user?.displayName || 'Usuário';
  const email = profile?.email || user?.email || '';

  return (
    <motion.div {...fade(0.5)} className="max-w-xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold font-serif text-slate-900">Configurações</h1>
        <p className="text-slate-500 text-sm">Gerencie sua conta no Hermeneuta.</p>
      </div>

      <Card variant="solid" className="p-8 space-y-6">
        <div>
          <p className="text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="text-xs text-slate-500">{email}</p>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="space-y-3">
          <Button variant="outline" className="w-full" onClick={() => navigate('/edit-profile')}>
            <Edit3 size={18} />
            Editar Perfil
          </Button>

          <Button
            variant="danger"
            className="w-full"
            onClick={() => signOut()}
            loading={authAction === 'signOut'}
          >
            <LogOut size={18} />
            Sair
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
