import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../services/adminService';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { fade } from '../lib/motionVariants';
import { ChevronLeft } from 'lucide-react';
import type { UserProfile } from '../types';

export default function EditProfile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [age, setAge] = useState(profile?.age != null ? String(profile.age) : '');
  const [denomination, setDenomination] = useState(profile?.denomination || '');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setFormError(null);
    setSaved(false);
    setSubmitting(true);
    try {
      const data: Partial<UserProfile> = {
        displayName: displayName.trim(),
        phone: phone.trim(),
        denomination: denomination.trim(),
      };
      const parsedAge = age.trim() ? Number.parseInt(age, 10) : NaN;
      if (Number.isFinite(parsedAge)) {
        data.age = parsedAge;
      }
      await updateUserProfile(user.uid, data);
      setSaved(true);
    } catch (error) {
      console.error(error);
      setFormError('Erro ao salvar as alterações. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div {...fade(0.5)} className="max-w-xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold font-serif text-slate-900">Editar Perfil</h1>
        <p className="text-slate-500 text-sm">Atualize seus dados pessoais.</p>
      </div>

      <Card variant="solid" className="p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Seu nome completo"
          />
          <Input
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(00) 00000-0000"
          />
          <Input
            label="Idade"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Ex: 32"
          />
          <Input
            label="Denominação"
            value={denomination}
            onChange={(e) => setDenomination(e.target.value)}
            placeholder="Ex: Batista, Presbiteriana..."
          />

          {formError && <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{formError}</p>}
          {saved && !formError && (
            <p className="text-xs text-brand-primary bg-brand-primary/5 p-2 rounded-lg">
              Perfil atualizado com sucesso.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/account')}>
              <ChevronLeft size={18} />
              Voltar
            </Button>
            <Button type="submit" className="flex-1" loading={submitting}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
}
