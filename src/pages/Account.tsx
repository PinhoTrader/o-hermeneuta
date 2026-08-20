import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { motion } from 'framer-motion';
import { fade } from '../lib/motionVariants';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Mail, Calendar } from 'lucide-react';
import type { UserRole } from '../types';

const ROLE_LABELS: Record<UserRole, string> = {
  guest: 'Convidado',
  student: 'Estudante',
  professor: 'Professor',
  monitor: 'Monitor',
  contributor: 'Contribuidor',
  admin: 'Administrador',
};

const ROLE_TONES: Record<UserRole, 'professor' | 'admin' | 'neutral'> = {
  guest: 'neutral',
  student: 'neutral',
  professor: 'professor',
  monitor: 'neutral',
  contributor: 'neutral',
  admin: 'admin',
};

function formatCreatedAt(createdAt?: number) {
  if (!createdAt) return 'N/A';
  try {
    return format(new Date(createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return 'N/A';
  }
}

export default function Account() {
  const { user, profile } = useAuth();

  const displayName = profile?.displayName || user?.displayName || 'Usuário';
  const email = profile?.email || user?.email || '';
  const role = profile?.role || 'student';

  return (
    <motion.div {...fade(0.5)} className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold font-serif text-slate-900">Minha Conta</h1>
        <p className="text-slate-500 text-sm">Resumo dos dados da sua conta no Hermeneuta.</p>
      </div>

      <Card variant="solid" className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-2xl font-bold overflow-hidden shrink-0">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900">{displayName}</h2>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
              <Mail size={14} />
              {email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Papel</p>
            <Badge tone={ROLE_TONES[role]}>{ROLE_LABELS[role]}</Badge>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</p>
            <Badge tone={profile?.isApproved ? 'success' : 'warning'}>
              {profile?.isApproved ? 'Aprovado' : 'Pendente'}
            </Badge>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 sm:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Calendar size={12} />
              Cadastrado em
            </p>
            <p className="text-sm font-semibold text-slate-700">{formatCreatedAt(profile?.createdAt)}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
