import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Shield, 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  Mail, 
  Phone, 
  Search,
  UserCheck,
  Trash2,
  Edit2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { 
  getAllUsers, 
  updateUserRole, 
  approveUser,
  registerUserAccount,
  deleteUser,
  updateUserProfile
} from '../services/adminService';
import { UserProfile, UserRole } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('professor');
  const [newUser, setNewUser] = useState({ email: '', name: '', phone: '' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (role: UserRole) => {
    setEditingUser(null);
    setSelectedRole(role);
    setNewUser({ email: '', name: '', phone: '' });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserProfile) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setNewUser({ 
      email: user.email, 
      name: user.displayName || '', 
      phone: user.phone || '' 
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const fetchUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    setActionLoading(uid);
    try {
      await updateUserRole(uid, newRole);
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (uid: string) => {
    setActionLoading(uid);
    try {
      await approveUser(uid);
      setUsers(users.map(u => u.uid === uid ? { ...u, isApproved: true } : u));
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (uid: string) => {
    setActionLoading(uid);
    try {
      await deleteUser(uid);
      setUsers(users.filter(u => u.uid !== uid));
      setUserToDelete(null);
    } catch (error) {
      console.error(error);
      alert('Erro ao excluir usuário.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRegisterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      if (editingUser) {
        await updateUserProfile(editingUser.uid, {
          displayName: newUser.name,
          phone: newUser.phone,
          role: selectedRole
        });
      } else {
        await registerUserAccount({ ...newUser, role: selectedRole });
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setNewUser({ email: '', name: '', phone: '' });
      await fetchUsers();
    } catch (error: any) {
      console.error("Registration error:", error);
      setFormError('Erro ao processar: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      const d = typeof date.toDate === 'function' ? date.toDate() : new Date(date);
      return format(d, "dd 'de' MMM, yyyy", { locale: ptBR });
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-serif text-slate-900">Painel Administrativo</h1>
          <p className="text-slate-500">Gerencie usuários, acessos e permissões do sistema.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => openModal('student')}>
            <UserPlus size={18} />
            Cadastrar Aluno
          </Button>
          <Button onClick={() => openModal('professor')}>
            <Shield size={18} />
            Cadastrar Professor
          </Button>
          <Button variant="outline" onClick={() => openModal('monitor')}>
            <UserCheck size={18} />
            Cadastrar Monitor
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl bg-white border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium italic">Total de Usuários</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl bg-white border border-slate-200 text-brand-primary">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium italic">Professores</p>
              <p className="text-2xl font-bold">{users.filter(u => u.role === 'professor').length}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6 rounded-3xl bg-white border border-slate-200 text-amber-600">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
              <UserCheck size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium italic">Pendentes</p>
              <p className="text-2xl font-bold">{users.filter(u => !u.isApproved).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border-none text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Perfil / Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Cadastro</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                            {user.displayName?.charAt(0) || user.email.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{user.displayName || 'Sem nome'}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      className={`text-xs font-bold px-2 py-1 rounded-lg outline-none cursor-pointer border shadow-sm
                        ${user.role === 'admin' ? 'bg-red-50 text-red-600 border-red-100' : 
                          user.role === 'professor' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' : 
                          'bg-slate-100 text-slate-600 border-slate-200'}`}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                      disabled={actionLoading === user.uid}
                    >
                      <option value="student">Estudante / Mentorado</option>
                      <option value="professor">Professor / Mentor</option>
                      <option value="monitor">Monitor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {user.isApproved ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle size={12} />
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-wider">
                        <XCircle size={12} />
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!user.isApproved && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 px-3 text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                          onClick={() => handleApprove(user.uid)}
                          loading={actionLoading === user.uid}
                        >
                          Aprovar
                        </Button>
                      )}
                      
                      {user.email !== 'escoladetradersead@gmail.com' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-colors"
                            title="Editar Usuário"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setUserToDelete(user)}
                            disabled={actionLoading === user.uid}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Excluir Usuário"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-serif">
                {editingUser ? 'Editar Usuário' : `Cadastrar ${selectedRole === 'professor' ? 'Mentor' : 'Aluno'}`}
              </h2>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingUser(null);
                }} 
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleRegisterUser} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Nome Completo</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-primary/20"
                    placeholder="Ex: João da Silva"
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email do Google</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required
                    type="email"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-primary/20 ${
                      editingUser ? 'bg-slate-50/50 text-slate-400 cursor-not-allowed' : 'bg-slate-50 text-slate-900'
                    }`}
                    placeholder="usuario@gmail.com"
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    readOnly={!!editingUser}
                  />
                </div>
                {editingUser && (
                  <p className="text-[10px] text-slate-400 italic">O e-mail não pode ser alterado por segurança.</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Telefone / Contato</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-primary/20"
                    placeholder="(00) 00000-0000"
                    value={newUser.phone}
                    onChange={e => setNewUser({...newUser, phone: e.target.value})}
                  />
                </div>
              </div>
              {formError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {formError}
                </p>
              )}
              <div className="pt-4 flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                  }}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1" 
                  type="submit" 
                  loading={submitting}
                >
                  {editingUser ? 'Salvar Alterações' : 'Concluir Cadastro'}
                </Button>
              </div>
              <p className="text-[10px] text-slate-400 text-center italic leading-relaxed">
                Ao cadastrar um novo usuário por e-mail, ele terá acesso imediato e será vinculado automaticamente quando realizar o primeiro login com o Google.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <Trash2 size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-serif text-slate-900">Excluir Usuário?</h3>
                <p className="text-sm text-slate-500">
                  Tem certeza que deseja excluir <strong>{userToDelete.displayName || userToDelete.email}</strong>? Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setUserToDelete(null)}
                disabled={!!actionLoading}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white border-0"
                onClick={() => handleDelete(userToDelete.uid)}
                loading={actionLoading === userToDelete.uid}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
