import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { listUserStudies, updateStudy, deleteStudy } from '../services/studyService';
import { Study, StudyStatus } from '../types';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { motion } from 'framer-motion';
import { fade, fadeZoom } from '../lib/motionVariants';
import {
  Plus,
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Search,
  MoreVertical,
  ChevronRight,
  Printer,
  Download,
  ExternalLink,
  Edit2,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '../components/ui/Input';
import libraryShelf from '../assets/library-shelf.jpg';

type DashboardStatusFilter = 'all' | StudyStatus;

const STATUS_FILTERS: { value: DashboardStatusFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'draft', label: 'Em andamento' },
  { value: 'completed', label: 'Concluídos' },
];

export default function Dashboard() {
  const { user, signInWithGoogle } = useAuth();
  const { createNewStudy } = useStudy();
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingStudy, setEditingStudy] = useState<Study | null>(null);
  const [studyToDelete, setStudyToDelete] = useState<Study | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DashboardStatusFilter>('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    fetchStudiesList();
  }, [user]);

  const fetchStudiesList = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let localStudies: Study[] = [];
      if (user.isGuest) {
        // Load all guest studies from localStorage
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('guest_study_local_')) {
            const data = localStorage.getItem(key);
            if (data) localStudies.push(JSON.parse(data));
          }
        }
        setStudies(localStudies.sort((a, b) => b.updatedAt - a.updatedAt));
      } else {
        const data = await listUserStudies(user.uid);
        setStudies(data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudy = async () => {
    if (!editingStudy || !editTitle.trim()) return;
    setActionError(null);
    try {
      await updateStudy(editingStudy.id, { title: editTitle });
      setStudies(studies.map(s => s.id === editingStudy.id ? { ...s, title: editTitle } : s));
      setEditingStudy(null);
    } catch (error) {
      console.error(error);
      setActionError('Erro ao atualizar estudo. Tente novamente.');
    }
  };

  const handleDeleteStudy = async (id: string) => {
    setActionLoading(id);
    setActionError(null);
    try {
      if (id.startsWith('local_')) {
        localStorage.removeItem(`guest_study_${id}`);
      } else {
        await deleteStudy(id);
      }
      setStudies(studies.filter(s => s.id !== id));
      setMenuOpenId(null);
    } catch (error) {
      console.error(error);
      setActionError('Erro ao excluir estudo. Verifique sua conexao.');
    } finally {
      setActionLoading(null);
      setStudyToDelete(null);
    }
  };

  const escapeHtml = (value: unknown) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const handlePrint = (e: React.MouseEvent, study: Study) => {
    e.stopPropagation();
    // Simplified print logic
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${escapeHtml(study.title)} - Estudo Bíblico</title>
            <style>
              body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
              h1 { border-bottom: 2px solid #ccc; padding-bottom: 10px; }
              .section { margin-bottom: 30px; }
              .label { font-weight: bold; color: #333; display: block; margin-bottom: 5px; }
              .content { border-left: 3px solid #eee; padding-left: 15px; }
            </style>
          </head>
          <body>
            <h1>${escapeHtml(study.title)}</h1>
            <div class="section">
              <span class="label">Texto Bíblico:</span>
              <div class="content">${escapeHtml(study.bibleSelection ? study.bibleSelection.text : 'Não definido')}</div>
            </div>
            <div class="section">
              <span class="label">Observações:</span>
              <div class="content">${escapeHtml(study.observations || '')}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    setMenuOpenId(null);
  };

  const handleCreateStudy = async () => {
    if (!user) return;

    setIsCreating(true);
    try {
      const id = await createNewStudy('Novo Estudo');
      navigate(`/study/${id}`);
    } catch (error) {
      console.error(error);
      setIsCreating(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    try {
      const d = typeof date.toDate === 'function' ? date.toDate() : new Date(date);
      return format(d, "d 'de' MMMM", { locale: ptBR });
    } catch (e) {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin text-brand-primary">◌</div>
      </div>
    );
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredStudies = studies.filter((study) => {
    if (statusFilter !== 'all' && study.status !== statusFilter) return false;
    if (!normalizedQuery) return true;
    const reference = study.bibleSelection
      ? `${study.bibleSelection.book} ${study.bibleSelection.chapter}:${study.bibleSelection.verseStart}-${study.bibleSelection.verseEnd}`
      : '';
    return (
      study.title.toLowerCase().includes(normalizedQuery) ||
      reference.toLowerCase().includes(normalizedQuery)
    );
  });
  const noResultsMessage = normalizedQuery
    ? `Nenhum estudo encontrado para "${searchQuery.trim()}".`
    : 'Nenhum estudo encontrado com esse filtro.';

  return (
    <motion.div {...fade(0.7)} className="space-y-8 pb-32">
      <div className="relative h-[220px] rounded-3xl overflow-hidden">
        <img
          src={libraryShelf}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 to-slate-950/25" />
        <div className="relative h-full flex flex-col justify-end p-6 md:p-8">
          <h2 className="text-3xl font-bold font-serif text-white">Seus Estudos</h2>
          <p className="text-sm text-white/85 mt-1">
            Seu acervo de sermões e estudos — gerencie, pesquise e retome de onde parou.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="w-full sm:max-w-xs">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por título ou referência..."
            />
          </div>
          <div className="flex gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === filter.value
                    ? 'bg-brand-primary text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-primary/40'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCreateStudy} loading={isCreating}>
            <Plus size={18} />
            Novo Estudo
          </Button>
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {actionError}
        </div>
      )}

      {user?.isGuest && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center gap-3">
          <BookOpen size={20} className="shrink-0" />
          <p>
            Você está no <strong>Modo Convidado</strong>. Seus estudos não serão salvos permanentemente. 
            <button onClick={signInWithGoogle} className="ml-2 underline font-bold">Faça login com Google</button> para salvar seu progresso.
          </p>
        </div>
      )}

      {studies.length === 0 ? (
        <Card
          variant="glass"
          className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-dashed border-2 border-slate-300"
        >
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold font-serif text-slate-800">Nenhum estudo ainda</h3>
          <p className="text-slate-500 max-w-xs mt-2 text-sm">
            Você ainda não começou nenhum estudo bíblico. Clique no botão acima para começar seu primeiro projeto.
          </p>
        </Card>
      ) : filteredStudies.length === 0 ? (
        <Card
          variant="glass"
          className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-dashed border-2 border-slate-300"
        >
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold font-serif text-slate-800">Nenhum estudo encontrado</h3>
          <p className="text-slate-500 max-w-xs mt-2 text-sm">
            {noResultsMessage}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudies.map((study) => (
            <Card
              key={study.id}
              variant="glass"
              onClick={() => navigate(`/study/${study.id}`)}
              className="group p-6 rounded-2xl cursor-pointer hover:border-brand-primary active:scale-[0.98] transition-all relative"
            >
              {/* Progress indicator */}
              <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${study.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-brand-primary/10 text-brand-primary'}`}>
                  {study.status === 'completed' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                </div>
                
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId(menuOpenId === study.id ? null : study.id);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {menuOpenId === study.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setMenuOpenId(null)} 
                      />
                      <motion.div
                        {...fadeZoom(0.2)}
                        style={{ transformOrigin: 'top right' }}
                        className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20"
                      >
                        <button 
                          onClick={(e) => { e.stopPropagation(); navigate(`/study/${study.id}`); }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <ExternalLink size={14} className="text-slate-400" />
                          Abrir Estudo
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditingStudy(study);
                            setEditTitle(study.title);
                            setMenuOpenId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Edit2 size={14} className="text-slate-400" />
                          Editar Título
                        </button>
                        <button 
                          onClick={(e) => handlePrint(e, study)}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Printer size={14} className="text-slate-400" />
                          Imprimir Material
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionError('O download PDF requer um servidor de geração de documentos.');
                            setMenuOpenId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Download size={14} className="text-slate-400" />
                          Baixar Resumo
                        </button>
                        <div className="h-px bg-slate-100 my-1" />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setStudyToDelete(study);
                            setMenuOpenId(null);
                          }}
                          disabled={actionLoading === study.id}
                          className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                        >
                          {actionLoading === study.id ? (
                            <div className="animate-spin text-red-400">◌</div>
                          ) : (
                            <Trash2 size={14} />
                          )}
                          Excluir Estudo
                        </button>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold font-serif text-slate-800 mb-2 truncate group-hover:text-brand-primary transition-colors">
                {study.title}
              </h3>
              
              {study.bibleSelection ? (
                <p className="text-xs font-semibold text-brand-primary mb-4">
                  {study.bibleSelection.book} {study.bibleSelection.chapter}:{study.bibleSelection.verseStart}-{study.bibleSelection.verseEnd}
                </p>
              ) : (
                <p className="text-xs text-slate-400 mb-4 italic">Texto não selecionado</p>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  Última atualização: {formatDate(study.updatedAt)}
                </span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!studyToDelete}
        onClose={() => setStudyToDelete(null)}
        footer={
          <>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStudyToDelete(null)}
              disabled={!!actionLoading}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => studyToDelete && handleDeleteStudy(studyToDelete.id)}
              loading={actionLoading === studyToDelete?.id}
            >
              Excluir
            </Button>
          </>
        }
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <Trash2 size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-serif text-slate-900">Excluir Estudo?</h3>
            <p className="text-sm text-slate-500">
              Tem certeza que deseja excluir <strong>"{studyToDelete?.title}"</strong>? Esta ação não pode ser desfeita.
            </p>
          </div>
        </div>
      </Modal>

      {/* Edit Title Modal */}
      <Modal
        open={!!editingStudy}
        onClose={() => setEditingStudy(null)}
        title="Editar Estudo"
        footer={
          <>
            <Button variant="outline" className="flex-1" onClick={() => setEditingStudy(null)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleUpdateStudy}>Salvar Alterações</Button>
          </>
        }
      >
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Título do Estudo</label>
          <input
            className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-primary/20"
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            autoFocus
          />
        </div>
      </Modal>
    </motion.div>
  );
}
