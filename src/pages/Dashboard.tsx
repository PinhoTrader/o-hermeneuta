import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStudy } from '../context/StudyContext';
import { listUserStudies, updateStudy, deleteStudy } from '../services/studyService';
import { Study } from '../types';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
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
  Trash2,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { user, signInWithGoogle } = useAuth();
  const { createNewStudy } = useStudy();
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newStudyTitle, setNewStudyTitle] = useState('');
  const [showNamingDialog, setShowNamingDialog] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingStudy, setEditingStudy] = useState<Study | null>(null);
  const [studyToDelete, setStudyToDelete] = useState<Study | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
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
    if (!newStudyTitle.trim()) {
      setShowNamingDialog(true);
      return;
    }
    
    setIsCreating(true);
    try {
      const id = await createNewStudy(newStudyTitle);
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

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-serif text-slate-900">Seus Estudos</h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie seu progresso hermenêutico e homilético.</p>
        </div>
        
        {!showNamingDialog ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowNamingDialog(true)}>
              <Plus size={18} />
              Novo Estudo
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4 duration-300">
            <input 
              type="text" 
              placeholder="Nome do seu estudo..." 
              autoFocus
              className="px-4 py-2 outline-none text-sm w-48 md:w-64"
              value={newStudyTitle}
              onChange={(e) => setNewStudyTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateStudy()}
            />
            <Button size="sm" onClick={handleCreateStudy} loading={isCreating} disabled={!newStudyTitle.trim()}>Criar</Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowNamingDialog(false); setNewStudyTitle(''); }}>
              Cancelar
            </Button>
          </div>
        )}
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
        <div className="flex flex-col items-center justify-center p-12 text-center glass-card rounded-3xl border-dashed border-2 border-slate-300">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold font-serif text-slate-800">Nenhum estudo ainda</h3>
          <p className="text-slate-500 max-w-xs mt-2 text-sm">
            Você ainda não começou nenhum estudo bíblico. Clique no botão acima para começar seu primeiro projeto.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studies.map((study) => (
            <div 
              key={study.id}
              onClick={() => navigate(`/study/${study.id}`)}
              className="group glass-card p-6 rounded-2xl cursor-pointer hover:border-brand-primary active:scale-[0.98] transition-all relative"
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
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-200">
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
                      </div>
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
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studyToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                <Trash2 size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-serif text-slate-900">Excluir Estudo?</h3>
                <p className="text-sm text-slate-500">
                  Tem certeza que deseja excluir <strong>"{studyToDelete.title}"</strong>? Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
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
                onClick={() => handleDeleteStudy(studyToDelete.id)}
                loading={actionLoading === studyToDelete.id}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Title Modal */}
      {editingStudy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-serif text-slate-900">Editar Estudo</h2>
              <button onClick={() => setEditingStudy(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Título do Estudo</label>
                <input 
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-brand-primary/20"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setEditingStudy(null)}>Cancelar</Button>
                <Button className="flex-1" onClick={handleUpdateStudy}>Salvar Alterações</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
